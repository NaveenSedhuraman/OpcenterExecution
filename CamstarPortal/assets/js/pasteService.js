"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 requirejs,
 */

/**
 * This service is used to manage the configuration of the paste operation.
 *
 * Please refer {@link https://gitlab.industrysoftware.automation.siemens.com/Apollo/afx/wikis/solution#solution-configuration-for-paste-handling|Solution configuration for paste handling}
 *
 * @module js/pasteService
 *
 * @publishedApolloService
 *
 */
define([//
'app', //
'lodash', //
'js/logger', //
'js/eventBus', //
//
'js/configurationService', //
'js/appCtxService', //
'js/adapterService', 'js/localeService', 'js/messagingService'], function (app, _, logger, eventBus) {
  'use strict';
  /**
   * Cached reference to '$q' service.
   */

  var _$q;
  /**
   * This object represents the union of all module level 'paste.json' configurations for the current AW
   * application.
   *
   * Content & Structure of the 'paste.json' file located:<BR>
   * WAR: <war_root>\assets\config\paste.json <BR>
   * Kit: <dev_root>\out\kit\tcawframework_aws2stage.zip\stage\repo\gwt\tc-aw-framework\module.json
   *
   * The 'paste.json' module is used during Drag-and-Drop operations to specify which types of objects
   * being dragged (i.e. the 'source' types) are valid to drop onto a specific type object (i.e. the 'target'
   * type). If no source/target match is found, the drop will not be allowed and the user will see the 'drop not
   * allowed' symbol for their cursor.
   * <P>
   * The most specific type in an object's type hierarchy is used. <BR>
   * There is no inheritance between properties in this file.
   * <P>
   * Each '(sourceType)' section must specify the name of the 'handler' function to call to perform the actual
   * paste operation.
   * <P>
   * All 'source' object types must be valid for a specific 'target' before the drop will be allowed.
   *
   * Note 1: This mapping only applies for dropping 'source' objects onto a single 'target' object. When dropping
   * into an 'objectSet' of an XRT stylesheet, the relation information in the 'source' attribute of the
   * 'objectSet' is used.
   *
   *
   * The JSON object generically is structured as:
   *
   * <pre>
   * {
   *     targetTypes : {
   *          '(targetType_X)': {
   *              sourceTypes: {
   *                  '(sourceType_Y)': {
   *                      handler: '(pasteHandlerFunction_Z)'
   *                      deps: '(fileNameWithPathToJSfileContainingpasteHandlerFunction_Z)'
   *                      relation: '(relation_R)'
   *                      datasetInfos: {
   *                          extensions: [ '(extension_F)', '(extension_G)' ],
   *                          datasetType: '(datsettype_H)',
   *                          fileFormat: '(fileformat_J)',
   *                          referenceName: '(namedReferenceName)'
   *                      }
   *                  }
   *                  ...
   *              }
   *          }
   *          ...
   *     }
   * }
   * </pre>
   *
   * Example: The following specifies that:<BR>
   * a) any 'target' of type 'Folder' should use the 'customPasteHandler' defined in the JS file
   * 'js/pasteHandlers.js' when items of type 'ItemRevision' are pasted on them
   * <P>
   * b) any 'target' of type 'WorkspaceObject' should use the 'tcDefaultPasteHandler' with default relations when
   * items of type 'ItemRevision' or 'DocumentRevision' are pasted on them.
   * <P>
   * c) any 'target' of type 'DocumentRevision' should use the 'defaultFilePasteHandler' specifying the
   * 'TC_Attaches' relations (and other datasetInfo properties) when objects of type 'Dataset' are pasted on them.
   *
   * <pre>
   * {
   *     targetTypes: {
   *       'Folder': {
   *             sourceTypes: {
   *                 'ItemRevision': {
   *                     handler: 'customPasteHandler'
   *                     deps: 'js/pasteHandlers'
   *                 }
   *             }
   *         },
   *         'WorkspaceObject': {
   *             sourceTypes: {
   *                 'ItemRevision': {
   *                     handler: 'defaultFilePasteHandler'
   *                 },
   *                 'DocumentRevision': {
   *                     handler: 'defaultFilePasteHandler'
   *                 }
   *             }
   *         },
   *         'DocumentRevision': {
   *             sourceTypes: {
   *                 'Dataset': {
   *                     handler: 'defaultFilePasteHandler',
   *                     relation: 'TC_Attaches',
   *                     datasetInfos: [ {
   *                         extensions: [ 'jpeg', 'jpg' ],
   *                         datasetType: 'JPEG',
   *                         fileFormat: 'BINARY',
   *                         referenceName: 'JPEG_Reference'
   *                     }, {
   *                         extensions: [ 'gif', 'svg' ],
   *                         datasetType: 'Image',
   *                         fileFormat: 'BINARY',
   *                         referenceName: 'Image'
   *                     } ]
   *                 }
   *             }
   *         }
   *     }
   * }
   * </pre>
   */


  var _pasteConfig;

  var _appCtxService;

  var _adapterSvc = null;
  var _localeSvc = null;
  var _messagingSvc = null;
  /**
   * ############################################################<BR>
   * Define the public functions exposed by this module.<BR>
   * ############################################################<BR>
   * @ignore
   */

  var exports = {};
  /**
   * To Paste objects with single relationType
   *
   * This would
   * 1. use bestTargetFitFinder function to find the best possible Target Fit for the given target object by reading the paste configuration.
   * 2. use bestSourceFitFinder function to find the best possible Source Fit for the given source object by reading the paste configuration.
   * 3. Invoke the configured pasteHandler for the target + source type combination.
   * 4. If no suitable target + source type combination for paste handler is found then (configured) default paste handler is invoked.
   *
   * @param {Object} targetObject - The 'target' Object for the paste.
   * @param {Array} sourceObjects - Array of 'source' Objects to paste onto the 'target' Object.
   * @param {String} relationType - Relation type name
   *
   * @returns {Promise} This promise will be 'resolved' or 'rejected' when the service is invoked and its response
   *          data is available.
   */

  exports.execute = function (targetObject, sourceObjects, relationType) {
    var queue = {};
    var defaultPasteHandlerConfiguration = app.getInjector().get('defaultPasteHandlerConfiguration');

    if (defaultPasteHandlerConfiguration === '{{defaultPasteHandlerConfiguration}}') {
      var error = 'Missing configuration \'defaultPasteHandlerConfiguration\' in solution configuration.' + //
      ' It should have below format: \n ' + //
      '"defaultPasteHandlerConfiguration":{\n\t\t "bestTargetFitFinder":"<bestTargetFitFinderFunctionName>",\n\t\t "bestSourceFitFinder":"<bestSourceFitFinderFunctionName>",' + '\n\t\t "pasteHandler":"<pasteHandlerFunctionName>",\n\t\t "deps":"<dependentFilePath>"\n\t\t }\'';
      logger.error(error);
      return _$q.reject(error);
    }

    return _$q(function (resolve, reject) {
      requirejs([defaultPasteHandlerConfiguration.deps], function (defaultPasteHandlerModule) {
        var defaultPasteHandler = defaultPasteHandlerModule;

        if (defaultPasteHandlerModule && defaultPasteHandlerModule.moduleServiceNameToInject) {
          defaultPasteHandler = app.getInjector().get(defaultPasteHandlerModule.moduleServiceNameToInject);
        }

        _.forEach(sourceObjects, function (sourceObject) {
          var handlerFunctionName = null;
          var depFileName = null;
          var targetTypeConfig = defaultPasteHandler[defaultPasteHandlerConfiguration.bestTargetFitFinder](targetObject);

          if (targetTypeConfig) {
            var sourceTypeConfig = defaultPasteHandler[defaultPasteHandlerConfiguration.bestSourceFitFinder](targetTypeConfig.sourceTypes, sourceObject);

            if (sourceTypeConfig) {
              handlerFunctionName = sourceTypeConfig.handler;
              depFileName = sourceTypeConfig.deps; // Get the dependent file name from the config.
            }
          }

          if (!handlerFunctionName) {
            handlerFunctionName = defaultPasteHandlerConfiguration.pasteHandler;
            depFileName = defaultPasteHandlerConfiguration.deps;
            logger.warn('No configured paste handler found for source object: \'' + sourceObject + '\' when target object: \'' + targetObject + '\'' + '\n' + //
            'RelationType: \'' + relationType + '\'' + '\n' + //
            '...Assuming default handler');
          }

          if (!queue.hasOwnProperty(handlerFunctionName)) {
            queue[handlerFunctionName] = {};
          }

          if (!queue[handlerFunctionName].hasOwnProperty('sourceObjs')) {
            queue[handlerFunctionName].sourceObjs = [];
          }

          if (!queue[handlerFunctionName].hasOwnProperty('deps')) {
            queue[handlerFunctionName].deps = '';
          }

          queue[handlerFunctionName].sourceObjs.push(sourceObject);

          if (depFileName) {
            queue[handlerFunctionName].deps = depFileName.trim();
          }
        });
        /**
         * Loop for each unique 'handler' and build up a promise chain.
         */


        _.forEach(queue, function (queuedSrcObjInfo, handlerFunctionName) {
          var depFileToLoad = queuedSrcObjInfo.deps;

          if (depFileToLoad) {
            // Load the file first and then invoke the handler
            requirejs([depFileToLoad], function (depModule) {
              var depFileContainingHandler = depModule;

              if (depModule && depModule.moduleServiceNameToInject) {
                depFileContainingHandler = app.getInjector().get(depModule.moduleServiceNameToInject);
              }

              var handlerFunction = depFileContainingHandler[handlerFunctionName];

              if (!handlerFunction) {
                var error = 'Unknown paste handler function: ' + handlerFunctionName + ' in the file:' + depFileToLoad;
                logger.error(error);
                reject(error);
              } else {
                resolve(_invokeHandlerFunction(handlerFunction, targetObject, queuedSrcObjInfo.sourceObjs, relationType));
              }
            });
          } else {
            var error = 'Unknown paste handler function: ' + handlerFunctionName;
            logger.error(error);
            reject(error);
          }
        });
      });
    });
  };
  /**
   * To Paste objects with different relationTypes
   * Same as {@link module:js/pasteService.execute|execute} except that this executes with multiple source object + relation types for a single target object.
   *
   * @param {Object} targetObject - the target object to paste the source objects to
   * @param {Object} relationTypeToSources - an object of key/value: relationType/array-of-sourceObjects
   *
   * @returns {Promise} Resolved when all processing is complete.
   */


  exports.executeWithMultipleRelations = function (targetObject, relationTypeToSources) {
    var allPromises = [];

    _.forOwn(relationTypeToSources, function (sourceObjects, relationType) {
      allPromises.push(exports.execute(targetObject, sourceObjects, relationType));
    });

    return _$q.all(allPromises);
  };
  /**
   * Gets all of the available targetTypes configured in paste.json files from different modules.
   *
   * @return {Object} The 'targetTypes' from the 'pasteConfig'
   */


  exports.getTargetTypes = function () {
    return _pasteConfig ? _pasteConfig.targetTypes : {};
  };
  /**
   * @param {Object} targetObject - The 'target' IModelObject to use when determining which 'source' types are
   *            potentially valid to be dropped upon it.
   * @return {Object|null} The 'sourceTypes' property from the 'pasteConfig' for the given 'target' object type or its
   *         ancestor types up the hierarchy (or NULL if no match was found).
   */


  exports.getObjectValidSourceTypes = function (targetObject) {
    if (targetObject && targetObject.modelType && targetObject.modelType.typeHierarchyArray) {
      var typeHier = targetObject.modelType.typeHierarchyArray;
      /**
       * Starting at the 'target' object's actual type, try to find a matching 'targetType' property in the
       * 'pasteConfig'. If an exact match is not found, try the super type of the 'target' up its hierarchy tree. Stop
       * looking when the 1st one (i.e. the 'closest' one) is found.
       */

      var targetTypes = exports.getTargetTypes();

      for (var ii = 0; ii < typeHier.length; ii++) {
        var typeName = typeHier[ii];

        if (targetTypes[typeName]) {
          return targetTypes[typeName].sourceTypes;
        }
      }
    }

    return null;
  };
  /**
   * Invokes the handler function. Check if this is the 1st link in the promise chain.<BR>
   * If so: Get the top-level promise from the 1st handler.<BR>
   * If not: Add the next handler's promise as the next link in the promise chain.
   *
   * @param {Function} handlerFunction - file path
   * @param {Object} targetObject - this is the object on which a drop is performed
   * @param {Array} queuedSourceObjects - these are the objects which are dragged
   * @param {String} relationType - the relation to create
   *
   * @returns {Promise} Resolved when all processing is complete.
   */


  function _invokeHandlerFunction(handlerFunction, targetObject, queuedSourceObjects, relationType) {
    return handlerFunction(targetObject, queuedSourceObjects, relationType);
  }
  /**
   * Update the 'selectedModelTypeRelations' on the appCtx for the one step Paste command.
   *
   * @param {Object} eventData - event data information with name and value of changes
   */


  function changeValidSourceTypesForSelected(eventData) {
    if (eventData.name === 'mselected' && eventData.value && eventData.value.length === 1) {
      var objectValidSourceTypes = exports.getObjectValidSourceTypes(eventData.value[0]);
      objectValidSourceTypes = objectValidSourceTypes || {};

      _appCtxService.registerCtx('selectedModelTypeRelations', Object.keys(objectValidSourceTypes));
    }
  }
  /**
   * Get underlying BO for view model objects
   *
   * @param {Array} viewModelObjects - view model objects to adapt
   * @return {input} adapted object
   */


  exports.adaptedInput = function (viewModelObjects) {
    if (viewModelObjects) {
      var objectsToAdapt = _.isArray(viewModelObjects) ? viewModelObjects : [viewModelObjects];
      return _adapterSvc.getAdaptedObjectsSync(objectsToAdapt);
    }

    return [];
  };
  /**
   * create Success Message For DND
   *
   * @return success message
   */


  function createSuccessMessageForDND(sourceObjects, targetObject) {
    _localeSvc.getTextPromise('ZeroCompileCommandMessages').then(function (textBundle) {
      var pasteSuccessMessage = {
        messageText: '',
        messageTextParams: []
      };

      if (sourceObjects.length > 1) {
        pasteSuccessMessage.messageText = textBundle.pasteMultipleSuccessMessage;
        pasteSuccessMessage.messageTextParams = [sourceObjects.length, targetObject.props.object_string.uiValues[0]];
      } else {
        pasteSuccessMessage.messageText = textBundle.pasteSuccessMessage;
        pasteSuccessMessage.messageTextParams = [sourceObjects[0].props.object_string.uiValues[0], targetObject.props.object_string.uiValues[0]];
      }

      var messageText = _messagingSvc.applyMessageParamsWithoutContext(pasteSuccessMessage.messageText, pasteSuccessMessage.messageTextParams);

      _messagingSvc.showInfo(messageText);
    });
  }
  /**
   * create Failure Message For DND
   *
   * @return failure message
   */


  function createFailureMessageForDND(errorReason) {
    _localeSvc.getTextPromise('ZeroCompileCommandMessages').then(function (textBundle) {
      var pasteFailureMessage = textBundle.pasteFailureMessage;
      var errorText = pasteFailureMessage + ':';

      _.forEach(errorReason.message.split(/\n/g), function (messageLine) {
        errorText = errorText + '<br>' + messageLine;
      });

      _messagingSvc.showInfo(errorText);
    });
  }
  /**
   * @memberof NgServices
   * @member pasteService
   *
   * @param {$q} $q - Service to use.
   * @param {configurationService} cfgSvc - Service to use.
   * @param {appCtxService} appCtxService - Service to use.
   * @param {adapterService} adapterSvc - Service to use.
   *
   * @returns {pasteService} Reference to service API Object.
   */


  app.factory('pasteService', [//
  '$q', //
  'configurationService', //
  'appCtxService', //
  'adapterService', //
  'localeService', //
  'messagingService', //
  function ($q, cfgSvc, appCtxService, adapterSvc, localeSvc, messagingSvc) {
    _$q = $q;
    _appCtxService = appCtxService;
    _adapterSvc = adapterSvc;
    _localeSvc = localeSvc;
    _messagingSvc = messagingSvc;
    cfgSvc.getCfg('paste').then(function (pasteConfig) {
      _pasteConfig = pasteConfig;
    });
    eventBus.subscribe('appCtx.register', changeValidSourceTypesForSelected);
    eventBus.subscribePostal({
      channel: 'paste',
      topic: 'drop',
      callback: function callback(eventData) {
        if (eventData && eventData.pasteInput) {
          _.forEach(eventData.pasteInput, function (pasteInput) {
            var targetObject = pasteInput.targetObject;
            var relationType = pasteInput.relationType;
            var sourceObjects = pasteInput.sourceObjects;
            exports.execute(targetObject, sourceObjects, relationType).then(function () {
              var eventData = {
                relatedModified: [targetObject],
                refreshLocationFlag: false,
                createdObjects: sourceObjects
              };
              eventBus.publish('cdm.relatedModified', eventData);

              var adaptedSourceObjects = _adapterSvc.getAdaptedObjectsSync(sourceObjects);

              createSuccessMessageForDND(adaptedSourceObjects, targetObject);
            }, function (reason) {
              createFailureMessageForDND(reason);
            });
          });
        }
      }
    });
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating
   * which service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'pasteService'
  };
});