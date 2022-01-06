"use strict";

/* eslint-disable max-lines */
// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/**
 * This service manages the 'source' object information placed into 'localStorage' during drag-n-drop operations.
 *
 * @module js/dragAndDropService
 */
define(['app', 'angular', 'jquery', 'lodash', 'js/eventBus', 'js/browserUtils', 'js/declUtils', 'js/localStorage', 'js/logger', 'js/ngUtils', 'js/adapterService', 'js/configurationService', 'js/configurationService', 'soa/kernel/clientDataModel', 'soa/kernel/clientMetaModel', 'soa/kernel/soaService', 'soa/dataManagementService', 'js/messagingService', 'js/localeService', 'js/appCtxService'], function (app, ngModule, $, _, eventBus, browserUtils, declUtils, localStrg, logger, ngUtils) {
  'use strict';
  /**
   * Data formats to put the data in. It would be better to only use aw_interop_type here, but that isn't working
   * with Chrome.
   */

  var DATA_FORMATS = ['text/html', 'aw_interop_type'];
  /** Dataset type */

  var TYPE_NAME_DATASET = 'Dataset';
  /**
   * Cached references to AngularJS Services
   */

  var _defaultPasteHandler;

  var _pasteFileHandler;

  var _cdm;

  var _cmm;

  var _soaSvc;

  var _dms;

  var _appCtxSvc;

  var _$state;

  var _messagingSvc;

  var _localeSvc;

  var _adapterSvc;
  /**
   * {DOMElement} root container for the page.
   */


  var mainReference;
  /**
   * {Boolean} TRUE if the drag event should have it's 'dataTransfer' object set/maintained.
   */

  var _includeDataTransfer = true;
  /**
   * {Boolean} TRUE if various drag event activities should publish 'hosting' related events.
   */

  var _publishHostingEvents = false;
  /**
   * {Function} A callback used to create the 'InteropObjectRef' encodings necessary to communicate more complex
   * selection information via drag event data format properties.
   * <P>
   * Note: Until the hosting 'InteropObjectRefFactory' is converted from GWT to native JS we must rely on it for
   * conversion of IModelObjects to the special encoding used for communications of 'source' objects to the host.
   */

  var _createInteropObjectRefFn;
  /**
   * Temporary promise reference for loading of the configuration data. This is used to allow code to wait until
   * ready before doing work.
   *
   * @private
   */


  var _cfgLoadPromise;
  /**
   * <pre>
   * Greater Than 0 If some basic event activity should be logged.
   * Greater Than 1 If some more fine-grained event activity should be logged.
   * </pre>
   */


  var _debug_logEventActivity = 0;
  var urlAttributes = browserUtils.getUrlAttributes();

  if (urlAttributes.logDnDEventActivity !== undefined) {
    _debug_logEventActivity = 1;

    if (urlAttributes.logDnDEventActivity > 0) {
      _debug_logEventActivity = urlAttributes.logDnDEventActivity;
    }
  }
  /**
   * TRUE if the type that was not valid for a target is logged. This is very handy when debugging issues.
   */


  var m_debug_LogRejectedSourceType = false;
  /**
   * Map used to hold an unresolved {Promise} for a given 'evaluation key' *while* the async server call is being
   * made.
   * <P>
   * Note: This map prevents repeatedly calling the server for the same 'evaluation key'.
   * <P>
   * Note: The 'evaluation key' is formed by TargetUID + ValidSourceTypes + FileExtensions.
   */

  var m_mapKey2Promise = {};
  /**
   * Map used to hold the *result* of a previous async server call for a given 'evaluation key'.
   * <P>
   * Note: This map prevents repeatedly calling the server for the same 'evaluation key'.
   * <P>
   * Note: The 'evaluation key' is formed by TargetUID + ValidSourceTypes + FileExtensions.
   */

  var m_mapKey2Result = {};
  /**
   * TRUE if dragging files from the OS file should be allowed.
   */

  var m_supportingFileDrop = true;
  /**
   * Set used to hold an 'unresolved source type lookup key' *while( the async server call is being made.
   * <P>
   * Note: This map prevents repeatedly calling the server for the same 'unresolved source type lookup key'.
   * <P>
   * Note: The 'unresolved source type lookup key' is formed by a union of MissingSourceTypes.
   */

  var m_typeLookupInProgress = {}; //* **********************************************************************

  /**
   * Clear out any 'dragData' that may have been created by the last Drag-n-Drop operation.
   */

  var _clearCachedData = function _clearCachedData() {
    localStrg.publish('awDragData');
  };
  /**
   * @param {StringArray} validSourceTypes The 'sourceTypes' {@link JavaScriptObject} property from the
   *            pasteConfig for the given 'target' object type or its ancestor types up the hierarchy (or NULL if
   *            no match was found).
   *
   * @param {DOMElement} targetElement - The element the mouse is over when the event was fired.
   *
   * @returns {Object} A {@link Map} that relates 'source' types to the 1 or more possible relationship types that
   *         are valid for the 'owner' (i.e. 'target') {@link IModelObject}.
   */


  var _createSourceType2RelationsMap = function _createSourceType2RelationsMap(validSourceTypes, targetElement) {
    var sourceType2RelationsMap = {};
    var validSourceObjects = $(targetElement).data('validSourceTypes');

    for (var i = 0; i < validSourceTypes.length; i++) {
      var sourceType = validSourceTypes[i];
      var validSourceObj = validSourceObjects[sourceType];
      var relations = [];

      if (validSourceObj.relation) {
        relations.push(validSourceObj.relation);
      } else {
        relations.push('');
      }

      sourceType2RelationsMap[sourceType] = relations;
    }

    return sourceType2RelationsMap;
  };
  /**
   * Remove from selection any non-'target' object currently selected (like the ones we may have just pasted) so
   * that the 'target' can be cleanly selected later.
   *
   * @param {ViewModelObject} targetVMO - The 'target' ViewModelObject the 'source' ViewModelObject(s) are being
   *            dropped onto.
   *
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   */


  var _deselectAll = function _deselectAll(targetVMO, callbackAPIs) {
    callbackAPIs.clearSelectionFn(targetVMO);
  };
  /**
   * Synchronously create Datasets, upload the given JS Files and attach the files to the Datasets using the
   * correct relation types and the tickets used to upload the files.
   *
   * @param {Element} targetElement - The 'target' DOM Element being dropped onto.
   *
   * @param {ViewModelObject} targetVMO - The 'target' ViewModelObject being dropped onto.
   *
   * @param {ObjectArray} sourceFiles - The 'source' JS File objects being dropped.
   *
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   */


  var _deselectAllAndPasteSourceFiles = function _deselectAllAndPasteSourceFiles(targetElement, targetVMO, sourceFiles, callbackAPIs) {
    if (sourceFiles.length > 0) {
      _deselectAll(targetVMO, callbackAPIs);

      _pasteSourceFiles(targetElement, targetVMO, sourceFiles, callbackAPIs);
    }
  };
  /**
   * @param {Element} targetElement - The 'target' DOM Element being dropped onto.
   *
   * @param {ViewModelObject} targetVMO - The 'target' ViewModelObject being dropped onto.
   *
   * @param {IModelObjectArray} sourceObjects - The 'source' IModelObject(s) being dropped.
   *
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   */


  var _deselectAllAndPasteSourceObjects = function _deselectAllAndPasteSourceObjects(targetElement, targetVMO, sourceObjects, callbackAPIs) {
    if (sourceObjects.length > 0) {
      _deselectAll(targetVMO, callbackAPIs);

      _pasteSourceObjects(targetElement, targetVMO, sourceObjects, callbackAPIs);
    }
  };
  /**
   * Perform the actual 'drop' (paste) of the 'source' objects onto the given 'target'.
   *
   * @param {Element} targetElement - The 'target' DOM Element.
   *
   * @param {ObjectArray} sourceFiles - The array 'source' JS File objects to drop onto the 'target'.
   *
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   */


  var _dropFiles = function _dropFiles(targetElement, sourceFiles, callbackAPIs) {
    var targetVMOs = callbackAPIs.getElementViewModelObjectFn(targetElement);

    if (!targetVMOs || targetVMOs.length === 0) {
      var targetUID = $(targetElement).data('dropuid');

      if (targetUID) {
        targetVMOs = [];
        targetVMOs.push(exports.getTargetObjectByUid(targetUID));
      }
    }

    if (targetVMOs && targetVMOs.length !== 0) {
      if (_cmm.isInstanceOf('Awp0XRTObjectSetRow', targetVMOs[0].modelType)) {
        _adapterSvc.getAdaptedObjects(targetVMOs).then(function (adaptedObjs) {
          _deselectAllAndPasteSourceFiles(targetElement, adaptedObjs[0], sourceFiles, callbackAPIs);
        });
      } else {
        _deselectAllAndPasteSourceFiles(targetElement, targetVMOs[0], sourceFiles, callbackAPIs);
      }
    }

    _clearCachedData();
  };
  /**
   * @param {Element} targetElement - The 'target' DOM Element being dropped onto.
   *
   * @param {StringArray} sourceUIDs - The array of UIDs for the 'source' IModelObjects to drop onto the 'target'.
   *
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   */


  var _dropModelObjects = function _dropModelObjects(targetElement, sourceUIDs, callbackAPIs) {
    var targetVMOs = callbackAPIs.getElementViewModelObjectFn(targetElement);

    if (!targetVMOs || targetVMOs.length === 0) {
      var targetUID = $(targetElement).data('dropuid');

      if (targetUID) {
        targetVMOs = [];
        targetVMOs.push(exports.getTargetObjectByUid(targetUID));
      }
    }

    if (targetVMOs && targetVMOs.length !== 0) {
      if (_cmm.isInstanceOf('Awp0XRTObjectSetRow', targetVMOs[0].modelType)) {
        _adapterSvc.getAdaptedObjects(targetVMOs).then(function (adaptedObjs) {
          _dropModelObjectsInternal(targetElement, sourceUIDs, callbackAPIs, adaptedObjs);
        });
      } else {
        _dropModelObjectsInternal(targetElement, sourceUIDs, callbackAPIs, targetVMOs);
      }
    }
  };
  /**
   * Perform the actual 'drop' (paste) of the 'source' objects onto the given 'target'.
   *
   * @param {Element} targetElement - The 'target' DOM Element being dropped onto.
   *
   * @param {StringArray} sourceUIDs - The array of UIDs for the 'source' IModelObjects to drop onto the 'target'.
   *
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   *
   * @param {Object} targetVMOs - View model object of target.
   */


  var _dropModelObjectsInternal = function _dropModelObjectsInternal(targetElement, sourceUIDs, callbackAPIs, targetVMOs) {
    var sourceObjects = [];
    var missingSourceUIDs = [];
    /**
     * Attempt to locate the 'source' objects in this browser's CDM cache.
     * <P>
     * Note: When 'source' objects are being dragged from another browser they may not have been loaded into the
     * 'target' browser.
     */

    for (var i = 0; i < sourceUIDs.length; i++) {
      var sourceObject = _cdm.getObject(sourceUIDs[i]);

      if (sourceObject) {
        sourceObjects.push(sourceObject);
      } else {
        missingSourceUIDs.push(sourceUIDs[i]);
      }
    }
    /**
     * Check if NO 'source' objects are missing
     * <P>
     * If so: Process the past now
     */


    if (missingSourceUIDs.length === 0) {
      _deselectAllAndPasteSourceObjects(targetElement, targetVMOs[0], sourceObjects, callbackAPIs);

      _clearCachedData();
    } else {
      /**
       * Attempt to locate the missing 'source' objects on the server.
       */
      _dms.loadObjects(missingSourceUIDs, function () {
        /**
         * Attempt to locate the (formerly) missing 'targets' and add them to the list of 'source' objects
         * to drop on the 'target'
         */
        for (var j = 0; j < missingSourceUIDs.length; j++) {
          var sourceObject = _cdm.getObject(missingSourceUIDs[j]);

          if (sourceObject) {
            sourceObjects.push(sourceObject);
          } else {
            var sourceTypes = _getCachedSourceTypes();

            logger.warn('Unable to locate \'source\' IModelObject\' (not loaded yet): ' + missingSourceUIDs[j] + ' of type: ' + sourceTypes[0]);
          }
        }

        if (sourceObjects.length > 0) {
          _deselectAllAndPasteSourceObjects(targetElement, targetVMOs[0], sourceObjects, callbackAPIs);
        }

        _clearCachedData();
      });
    }
  };
  /**
   * Starting with the given DOM Element and walking up the DOM, look for the 1st DOM Element with the
   * 'containerId' property set.
   *
   * @param {Element} testElement - The element to start the search at.
   *
   * @return {Number} The ID of the 'parent' element that has the 'containerId' set on it (or NULL if no Element
   *         was found).
   */


  var _findContainerId = function _findContainerId(testElement) {
    var currElement = testElement;

    while (currElement) {
      var containerId = $(currElement).data('containerId');

      if (containerId) {
        return containerId.toString();
      }

      currElement = currElement.parentElement;
    }

    return null;
  };
  /**
   * When object drag is cancelled , this function returns true or else false
   *
   * @param {event} event - Drag event
   *
   * @return {bool}_isDragCancelFlag -  true or false
   */


  var _isDragCancelled = function _isDragCancelled(event) {
    var _isDragCancelFlag = false;

    if (event.x <= 0 || event.y <= 0) {
      _isDragCancelFlag = true;
    } else if (event.screenX <= 0 || event.screenY <= 0) {
      _isDragCancelFlag = true;
    } else {
      _isDragCancelFlag = false;
    }

    return _isDragCancelFlag;
  };
  /**
   * When object is dragged over a cell list container , this function returns true or else false
   *
   * @param {event} event - Drag event
   *
   * @return {Object} isTableFlag - flag to suggest if drag is within table container
   */


  var _isDragWithinCellListContainer = function _isDragWithinCellListContainer(event) {
    var isCellListContainerFlag = false;
    var cellListContainer = ngUtils.closestElement(event.target, '.aw-widgets-cellListContainer');

    if (_.isUndefined(cellListContainer) || cellListContainer === null) {
      isCellListContainerFlag = false;
    } else {
      isCellListContainerFlag = true;
    }

    return isCellListContainerFlag;
  };
  /**
   * When object is dragged over a table row border, this check ensures the drag cursor does not go back to 'Not allowed' because of global
   * dragenter event since table row border is an invalid drop target
   *
   * @param {event} event - Drag event
   *
   * @return {Object} isTableFlag - flag to suggest if drag is within table container
   */


  var _isDragWithinTableContainer = function _isDragWithinTableContainer(event) {
    var isTableFlag = false;
    var tableContainer = ngUtils.closestElement(event.target, '.ui-grid-row');

    if (_.isUndefined(tableContainer) || tableContainer === null) {
      if (event.target.classList.contains('ui-grid-row')) {
        isTableFlag = true;
      }
    } else {
      isTableFlag = true;
    }

    return isTableFlag;
  };
  /**
   * When object is dragged over the white area, this check ensures  dragenter, dragleave , dragover events on document do not trigger any action in turn giving
   * a flickering of highlight effect on the container
   *
   * @param {event} event - Drag event
   * @return {Object} bool - flag to suggest if drag is within an applicable and valid container
   */


  var _isDragWithinApplicableValidContainer = function _isDragWithinApplicableValidContainer(event) {
    var bool = false;
    var jqTarget = $(event.target);
    var jqContainer = jqTarget.closest('.ui-grid-row');

    if (jqContainer.length <= 0) {
      jqContainer = jqTarget.closest('.aw-widgets-cellListItem');

      if (jqContainer.length <= 0) {
        jqContainer = jqTarget.closest('.aw-widgets-droptable');

        if (jqContainer.length <= 0) {
          // this is when user just enters a cellListContainer from white area
          if (jqTarget[0].children.length > 0 && jqTarget[0].children[0].classList.contains('aw-widgets-cellListContainer')) {
            jqContainer = jqTarget[0].children;
          }
        }
      }
    }

    if (jqContainer && jqContainer.length > 0) {
      if (exports.isValidObjectToDrop(event, jqContainer[0])) {
        bool = true;
      }
    }

    return bool;
  };
  /**
   * @param {event} event - Dragover event
   *
   * @return {Object} targetElement - choose or drop file widget which do not require validation or
   *                                   'undefined' if not over Choose or Drop File widgets
   */


  var _isDragOverChooseOrDropFileContainer = function _isDragOverChooseOrDropFileContainer(event) {
    var targetElement;

    if (event.target.classList.contains('aw-widgets-chooseordropfile')) {
      targetElement = event.target;
    } else {
      var cfContainer = ngUtils.closestElement(event.target, '.aw-widgets-chooseordropfile');

      if (cfContainer) {
        targetElement = cfContainer;
      }
    }

    return targetElement;
  };
  /**
   * Starting with the 'target' of the given DragEvent and walking up the DOM, look for the 1st DOM Element with the
   * 'validSourceTypes' property set.
   *
   * @param {DragEvent} event - The event to start the search at.
   * @param {Bool} isCurrentTargetOverGlobalArea - is the dragged file over white/invalid area
   * @return {Element} The Element that has the 'validSourceTypes' property set on it (or NULL if no Element was
   *         found).
   */


  var _findDropTargetElement = function _findDropTargetElement(event, isCurrentTargetOverGlobalArea) {
    var targetElements = [];

    if (isCurrentTargetOverGlobalArea) {
      mainReference = document.body;
      targetElements = mainReference.querySelectorAll('.aw-widgets-droptable');
    } else {
      /**
       * Get the JQuery element for the event 'target' and look for common 'container' elements 'up' the DOM Tree.
       */
      var jqTarget = $(event.target);
      var jqContainer = jqTarget.closest('.ui-grid-row');

      if (jqContainer.length <= 0) {
        jqContainer = jqTarget.closest('.aw-widgets-cellListItem');

        if (jqContainer.length <= 0) {
          jqContainer = jqTarget.closest('.aw-widgets-droptable');
        }
      }

      var targetElement;

      if (jqContainer.length > 0) {
        targetElement = jqContainer.get(0);
      } else {
        targetElement = jqTarget.get(0);
      }

      targetElements.push(targetElement);
    }
    /**
     * Get the AngularJS element for the target 'container' element and try to find a {ViewModelObject} associated
     * with it.
     */


    if (targetElements) {
      _.forEach(targetElements, function (targetElement) {
        var ngTargetElement = ngModule.element(targetElement);
        var $scope = ngTargetElement.scope();
        var targetVMO = $scope && ($scope.vmo || $scope.item || $scope.row && $scope.row.entity || $scope.data && $scope.data.vmo) || targetElement.vmo || ngTargetElement.get(0).vmo;

        if (targetVMO) {
          if (_cmm.isInstanceOf('Awp0XRTObjectSetRow', targetVMO.modelType)) {
            _adapterSvc.getAdaptedObjects([targetVMO]).then(function (adaptedObjs) {
              _setValidSourceTypesOnTarget(targetElement, adaptedObjs[0]);
            });
          } else {
            _setValidSourceTypesOnTarget(targetElement, targetVMO);
          }
        }
      });
    }

    return targetElements;
  };
  /**
   * Check if we have NOT already stored the collection of 'valid' 'source' types this 'target' will accept.
   * <P>
   * If so: Get that collection now.
   *
   * @param {Element} targetElement - The 'target' DOM Element being dropped onto.
   * @param {ViewModelObject} targetVMO - View model object of target.
   */


  var _setValidSourceTypesOnTarget = function _setValidSourceTypesOnTarget(targetElement, targetVMO) {
    if (targetElement) {
      var jqElement = $(targetElement);
      var validSourceTypes = jqElement.data('validSourceTypes');

      if (!validSourceTypes && _defaultPasteHandler) {
        validSourceTypes = _defaultPasteHandler.getObjectValidSourceTypes(targetVMO);
        jqElement.data('validSourceTypes', validSourceTypes);
        jqElement.data('dropuid', targetVMO.uid);

        var containerId = _findContainerId(targetElement);

        if (containerId) {
          jqElement.data('containerId', containerId);
        }
      }
    }
  };
  /**
   * @return {Object} The Object that represents cached drag data set when the drag operation began.
   */


  var _getCachedDragData = function _getCachedDragData() {
    var dragDataJSON = localStrg.get('awDragData');

    if (dragDataJSON && dragDataJSON !== 'undefined') {
      return JSON.parse(dragDataJSON);
    }

    return null;
  };
  /**
   * @return {StringArray} An array of strings (placed into localStorage' at the start of a drag operation) that
   *         represent the types of 'source' objects being dragged (or NULL if no types were found).
   */


  var _getCachedSourceTypes = function _getCachedSourceTypes() {
    var dragDataJSON = localStrg.get('awDragData');

    if (dragDataJSON) {
      var dragData = JSON.parse(dragDataJSON);

      if (dragData.typeList) {
        return dragData.typeList;
      }
    }

    return null;
  };
  /**
   * @param {String} dataTransferItem - The 'dataTransfer' Item to extract from.
   * @return {String} The type code of the given
   */


  function _getDataTransferType(dataTransferItem) {
    var extensionIndex = dataTransferItem.lastIndexOf('/');

    if (extensionIndex >= 0) {
      return dataTransferItem.substring(extensionIndex + 1);
    }

    return ''; // $NON-NLS-1$
  }
  /**
   * @param {DragEvent} event - The DragEvent to extract the info from.
   *
   * @return {ObjectArray} Array of JS Files.
   */


  var _getDataTransferSourceFiles = function _getDataTransferSourceFiles(event) {
    return event.dataTransfer.files;
  };
  /**
   * Return the 'source' element from the given drag event. The name of the element in the event can vary
   * depending on the browser the client is running with.
   *
   * @param {DragEvent} event - The event to extract the 'source' element from.
   *
   * @return {Element} The DOM element considered the 'source' of the given drag event.
   */


  var _getEventSource = function _getEventSource(event) {
    if (event.srcElement) {
      return event.srcElement;
    }

    return event.target;
  };
  /**
   * Get the first child image element of the passed in element.
   *
   * @param {Element} sourceElement - element being dragged
   *
   * @return {Element} drag image element or returns passed in element if no image found.
   */


  var _getFirstChildImage = function _getFirstChildImage(sourceElement) {
    var image = $(sourceElement).find('img:first')[0];
    return image ? image : sourceElement;
  };
  /**
   * @param {String} uid - ID of the object to include in the URL.
   *
   * @return {String} The URL 'prefix' used to open an object in the 'show object' location of AW.
   */


  var _getShowObjectURL = function _getShowObjectURL(uid) {
    // Have to decode as ui-router returns encoded URL (which is then decoded again by browser)
    return window.decodeURIComponent(document.location.origin + document.location.pathname + _$state.href('com_siemens_splm_clientfx_tcui_xrt_showObject', {
      uid: uid
    }));
  };
  /**
   * Returns the correct element to be dragged
   *
   * @param {DragEvent} event - element being dragged
   * @param {int} count - number of objects being dragged
   *
   * @return {Element} The correct drag element
   */


  var _getDragElement = function _getDragElement(event, count) {
    var element;

    if (event.target.classList.contains('aw-widgets-cellListItemContainer')) {
      element = event.target.parentElement; // Cell element
    } else if (event.target.classList.contains('ui-grid-cell')) {
      var target = $(event.target);

      if (target.closest('.ui-grid-row').length > 0 && count === 1) {
        element = target.closest('.ui-grid-row').get(0); // Table element
      } else {
        element = event.target;
      }
    }

    return element;
  };
  /**
   * @param {DragEvent} event - element being dragged
   * @param {int} count - number of objects being dragged
   *
   * @return {Element} image element
   */


  var _getMultiDragImage = function _getMultiDragImage(event, count) {
    var targetImage = _getDragElement(event, count);

    var strWidth;
    var strHeight;
    var cloneImage = null;

    if (targetImage) {
      cloneImage = targetImage.cloneNode(true); // If cell, remove command icon/text

      if (targetImage.classList.contains('aw-widgets-cellListItem')) {
        // Keep the image from being duplicated at the top of the page
        targetImage.style.position = 'relative';
        strWidth = targetImage.offsetWidth - 50 + 'px';
        strHeight = targetImage.offsetHeight - 10 + 'px'; // Remove commands from image

        cloneImage.children[0].removeChild(cloneImage.children[0].children[1]); // Remove text from image

        var cloneImageText = cloneImage.getElementsByClassName('aw-widgets-cellListCellTitleBlock')[0].parentNode;

        for (var i = 1; i < cloneImageText.children.length; i++) {
          cloneImageText.removeChild(cloneImageText.children[i]);
          i--;
        }
      } else {
        // Else it is a row
        strWidth = '150px';
        strHeight = '100%';
      }

      cloneImage.id = 'dragCount';
      cloneImage.style.maxWidth = strWidth;
      cloneImage.style.minWidth = strWidth;
      cloneImage.style.maxHeight = strHeight;
      cloneImage.style.minHeight = strHeight;
      cloneImage.style.position = 'absolute';
      cloneImage.style.left = '0px';
      cloneImage.style.top = '0px';
      cloneImage.style.zIndex = '99';
      cloneImage.classList.add('aw-theme-multidragimage');
      cloneImage.classList.add('aw-widgets-multidragimage'); // the image that is dragged needs to be visible, so it is added to the existing node

      targetImage.children[0].appendChild(cloneImage); // create a second offset image

      var cloneImage2 = cloneImage.cloneNode(true);
      cloneImage2.style.left = '5px';
      cloneImage2.style.top = '5px'; // create a third offset image & append if necessary

      var cloneImage3 = cloneImage.cloneNode(true);
      cloneImage.appendChild(cloneImage2);

      if (count > 2) {
        cloneImage3.style.left = '10px';
        cloneImage3.style.top = '10px';
        cloneImage.appendChild(cloneImage3);
      }
    }

    return cloneImage;
  };
  /**
   * Returns the 'validSourceTypes' property on the 'target' element being dropped onto.
   *
   * @param {Element} targetElement - The Element that will be dropped onto (i.e. the data 'target').
   *
   * @return {StringArray} Array of valid 'sourceTypes' (or an empty array if no 'sourceTypes' are valid).
   */


  var _getValidSourceTypes = function _getValidSourceTypes(targetElement) {
    var validSourceTypes = $(targetElement).data('validSourceTypes');

    if (validSourceTypes) {
      return Object.keys(validSourceTypes);
    }

    return [];
  };
  /**
   * Use the given ViewModelObject to return a string description of it.
   *
   * @param {ViewModelObject} vmo - The ViewModelObject to query.
   *
   * @return {String} Description of given ViewModelObject (or it's UID if no other name is possible).
   */


  var _getViewModelObjectName = function _getViewModelObjectName(vmo) {
    if (vmo.props.object_string) {
      return vmo.props.object_string.displayValues[0];
    } else if (vmo.props.items_tag) {
      return vmo.props.items_tag.displayValues[0];
    } else if (vmo.props.object_name) {
      return vmo.props.object_name.displayValues[0];
    } else if (vmo.props.object_desc && vmo.props.object_desc.length > 0) {
      return vmo.props.object_desc.displayValues[0];
    } else if (vmo.props.job_name) {
      return vmo.props.job_name.displayValues[0];
    } else if (vmo.props.awp0CellProperties) {
      return vmo.props.awp0CellProperties.displayValues[0];
    }

    return vmo.uid;
  };
  /**
   * Check the user agent string to see if the browser is the NX embedded browser, the NX QT browser puts "ugraf"
   * in the user agent string.
   *
   * @return {boolean} true if NX browser false otherwise
   */


  var _isNxWebBrowser = function _isNxWebBrowser() {
    return navigator.userAgent.indexOf('ugraf') >= 0;
  };
  /**
   * @param {StringArray} validSourceTypes - Array of 'source' types this 'target' will accept.
   * @param {StringArray} sourceTypes - Arrays of 'source' types determined from the event's 'dataTransfer' being
   *            dragged.
   *
   * @return {Boolean} TRUE if ALL the given 'source' types are valid to drop onto the 'target' based on the given
   *         'validSourceTypes'.
   */


  var _isValidObjectToDropInternal = function _isValidObjectToDropInternal(validSourceTypes, sourceTypes) {
    /**
     * Check if we have anything to work with.
     */
    if (validSourceTypes && validSourceTypes.length > 0 && sourceTypes && sourceTypes.length > 0) {
      /**
       * Check if all the 'sources' matches at least one valid type for the 'target' Element.
       * <P>
       * If so: We will consider the drop of these 'sources' onto that 'target'.
       */
      for (var i = 0; i < sourceTypes.length; i++) {
        var sourceType = sourceTypes[i];
        var sourceTypeFound = null;
        /**
         * Consider each valid 'source' type the 'target' will accept.
         */

        for (var j = 0; j < validSourceTypes.length; j++) {
          var validSourceType = validSourceTypes[j];
          /**
           * Check for an exact match
           */

          if (sourceType === validSourceType) {
            sourceTypeFound = validSourceType;
            break;
          }
          /**
           * Get all the ancestor types for this 'source' type and see if one of them is valid for this
           * 'target'.
           */


          var sourceModelType = _cmm.getType(sourceType);

          if (sourceModelType) {
            var sourceTypeHeirarchy = sourceModelType.typeHierarchyArray;

            for (var k = 1; k < sourceTypeHeirarchy.length; k++) {
              if (sourceTypeHeirarchy[k] === validSourceType) {
                sourceTypeFound = validSourceType;
                break;
              }
            }
          } else {
            logger.warn('Unable to locate \'source\' type (not loaded yet?): ' + sourceType);
          }
        }
        /**
         * Check if NONE of the valid 'source' types apply.
         */


        if (!sourceTypeFound) {
          if (m_debug_LogRejectedSourceType) {
            logger.warn('This \'source\' type is not valid for the \'target\': ' + sourceType);
          }

          return false;
        }
      }

      return true;
    }

    return false;
  };
  /**
   * @param {Object} pasteInput - An Object that maps a unique 'relationType' to the array of 'source'
   *            IModelObjects that should be pasted onto the 'target' with that 'relationType'.
   *
   * @return {Promise} A Promise that will be 'resolved' or 'rejected' when the service is invoked and its
   *         response data is available.
   */


  var _pasteFiles = function _pasteFiles(pasteInput) {
    return _pasteFileHandler.pasteFilesWithHandler(pasteInput);
  };
  /**
   * Use the 'paste' operation command to perform the actual 'drop' onto the 'target'.
   *
   * @param {Element} targetElement - The 'target' DOM Element being dropped onto.
   * @param {ViewModelObject} targetVMO - The 'target' ViewModelObject being dropped onto.
   * @param {Array} sourceFiles - The 'source' JS File objects being dropped.
   * @param {FunctionArray} callbackAPIs - Callback functions used for various interaction reasons.
   */


  var _pasteSourceFiles = function _pasteSourceFiles(targetElement, targetVMO, sourceFiles, callbackAPIs) {
    /**
     * Create a map of unique 'relation' type to a list of objects that will be pasted with that 'relation'
     * type.
     */
    var validSourceTypes = _getValidSourceTypes(targetElement);

    if (!validSourceTypes || validSourceTypes.length === 0) {
      validSourceTypes = [];

      var sourceTypesObject = _defaultPasteHandler.getObjectValidSourceTypes(targetVMO);

      var sourceTypes = Object.keys(sourceTypesObject);

      for (var counter = 0; counter < sourceTypes.length; counter++) {
        var validSourceType = sourceTypes[counter];

        if (_cmm.containsType(validSourceType)) {
          validSourceTypes.push(validSourceType);
        }
      }
    }

    var sourceType2RelationMap = _createSourceType2RelationsMap(validSourceTypes, targetElement);

    var pasteRelation2SourceObjectsMap = {};

    for (var i = 0; i < sourceFiles.length; i++) {
      var sourceObject = sourceFiles[i];
      /**
       * Get all the ancestor types for this 'source' type and see if one of them is valid.
       * <P>
       * Note: For dropping files we look to see if the 'target' accepts a 'Dataset' since that is what will
       * ultimately be created.
       */

      var sourceModelType = _cmm.getType(TYPE_NAME_DATASET);

      if (sourceModelType) {
        var sourceTypeHeirarchy = sourceModelType.typeHierarchyArray;

        for (var j = 0; j < sourceTypeHeirarchy.length; j++) {
          var currSourceType = sourceTypeHeirarchy[j];
          var relationType = sourceType2RelationMap[currSourceType];

          if (relationType) {
            var sourceObjectsForType = pasteRelation2SourceObjectsMap[relationType];

            if (!sourceObjectsForType) {
              sourceObjectsForType = [];
              pasteRelation2SourceObjectsMap[relationType] = sourceObjectsForType;
            }

            sourceObjectsForType.push(sourceObject);
            break;
          }
        }
      } else {
        logger.warn('Unable to locate \'source\' type\' (not loaded yet?): ' + TYPE_NAME_DATASET);
      }
    }

    _scheduleSelectTarget(targetElement, targetVMO, callbackAPIs);
    /**
     * Paste 'sources' to 'target' for each unique 'relation' type.
     */


    var pasteInput = [];

    _.forEach(pasteRelation2SourceObjectsMap, function (value, key) {
      var curr = {};
      curr.targetObject = targetVMO;
      curr.relationType = key;
      curr.sourceObjects = value;
      pasteInput.push(curr);
    });

    var startTime = Date.now();

    _pasteFiles(pasteInput).then(function (result) {
      var stopTime = Date.now();
      var pasteInputJS = pasteInput;
      var sourceObjectsJS = result.sourceObjects; // var failureMessagesJS = result.failureMessages;

      if (_debug_logEventActivity > 1) {
        var durationMs = stopTime - startTime;
        var durationSec = durationMs / 1000.0; // var duration = NumberFormat.getFormat( "#,##0.00" ).format( durationSec );

        var duration = durationSec;
        logger.info('Time to process (' + sourceObjectsJS.length + ') files: ' + duration + 'sec');
      }

      var localTextBundle = _localeSvc.getLoadedText('dragAndDropMessages');
      /**
       * Based on passed parameters in return from create SOA post the correct success message to the user.
       */


      var droppedOnObject = pasteInputJS[0].targetObject.cellHeader1;

      if (!droppedOnObject) {
        droppedOnObject = pasteInputJS[0].targetObject.props.object_string.uiValues[0];
      }

      if (!droppedOnObject) {
        droppedOnObject = '???';
      }

      if (result.docCreated) {
        var dropCompletedDocumentMsg = localTextBundle.dropCompletedDocument;
        dropCompletedDocumentMsg = dropCompletedDocumentMsg.replace('{0}', result.docName);
        dropCompletedDocumentMsg = dropCompletedDocumentMsg.replace('{1}', droppedOnObject);
        dropCompletedDocumentMsg = dropCompletedDocumentMsg.replace('{2}', sourceObjectsJS.length);

        _messagingSvc.showInfo(dropCompletedDocumentMsg);
      } else {
        var dropCompletedMsg = localTextBundle.dropCompleted;
        dropCompletedMsg = dropCompletedMsg.replace('{0}', sourceObjectsJS.length);
        dropCompletedMsg = dropCompletedMsg.replace('{1}', droppedOnObject);

        _messagingSvc.showInfo(dropCompletedMsg);
      }
    }, function (ex) {
      logger.error('uploadFailures' + ex); //                MessageUtil.reportException( caught );
    });
  };
  /**
   * Use the 'paste' operation command to perform the actual 'drop' onto the 'target'.
   *
   * @param {Element} targetElement - The 'target' DOM Element being dropped onto.
   *
   * @param {ViewModelObject} targetVMO - The 'target' ViewModelObject being dropped onto.
   *
   * @param {IModelObjectArray} sourceObjects - The 'source' IModelObjects being dropped.
   *
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   */


  var _pasteSourceObjects = function _pasteSourceObjects(targetElement, targetVMO, sourceObjects, callbackAPIs) {
    /**
     * Create a map of unique 'relation' type to a list of objects that will be pasted with that 'relation'
     * type.
     */
    var validSourceTypes = _getValidSourceTypes(targetElement);

    if (!validSourceTypes || validSourceTypes.length === 0) {
      validSourceTypes = [];

      var sourceTypesObject = _defaultPasteHandler.getObjectValidSourceTypes(targetVMO);

      var sourceTypes = Object.keys(sourceTypesObject);

      for (var counter = 0; counter < sourceTypes.length; counter++) {
        var validSourceType = sourceTypes[counter];

        if (_cmm.containsType(validSourceType)) {
          validSourceTypes.push(validSourceType);
        }
      }
    }

    var sourceType2RelationMap = _createSourceType2RelationsMap(validSourceTypes, targetElement);

    var pasteRelation2SourceObjectsMap = {};

    for (var i = 0; i < sourceObjects.length; i++) {
      var sourceObject = sourceObjects[i];
      /**
       * Get all the ancestor types for this 'source' type and see if one of them is valid.
       */

      var sourceType = sourceObject.type;

      var sourceModelType = _cmm.getType(sourceType);

      if (sourceModelType) {
        var sourceTypeHeirarchy = sourceModelType.typeHierarchyArray;

        for (var j = 0; j < sourceTypeHeirarchy.length; j++) {
          var sourceParentType = sourceTypeHeirarchy[j];
          var relationType = sourceType2RelationMap[sourceParentType];

          if (relationType) {
            var sourceObjectsForType = pasteRelation2SourceObjectsMap[relationType];

            if (!sourceObjectsForType) {
              sourceObjectsForType = [];
              pasteRelation2SourceObjectsMap[relationType] = sourceObjectsForType;
            }

            sourceObjectsForType.push(sourceObject);
            break;
          }
        }
      } else {
        logger.warn('Unable to locate \'source\' type\' (not loaded yet?): ' + sourceType);
      }
    }

    _scheduleSelectTarget(targetElement, targetVMO, callbackAPIs);
    /**
     * Paste each unique 'relation' type.
     */


    var keys = Object.keys(pasteRelation2SourceObjectsMap);

    if (keys.length > 0) {
      var pasteInput = [];

      _.forEach(pasteRelation2SourceObjectsMap, function (value, key) {
        var jso = {};
        jso.targetObject = targetVMO;
        jso.relationType = key;
        jso.sourceObjects = value;
        pasteInput.push(jso);
      });

      exports.publishDropEvent(pasteInput);
    }
  };
  /**
   * Determine all the valid containers on the page . Check if the 'target'  is compatible with the 'source' types being dragged and,
   * if so, change drag effect to indicate if it is OK to drop on that 'target'.
   *
   * @param {DragEvent} event - DragEnter or DragOver event from global area
   * @return {Object} validHighlightableContainers - All valid applicable containers for highlighing
   */


  var getApplicableContainersFromGlobalArea = function getApplicableContainersFromGlobalArea(event) {
    var validHighlightableContainers = [];
    var isValid = false;

    var targetElements = _findDropTargetElement(event, true);

    if (targetElements) {
      _.forEach(targetElements, function (targetElement) {
        isValid = exports.isValidObjectToDrop(event, targetElement);

        if (isValid) {
          validHighlightableContainers.push(targetElement);
        }
      });
    }

    if (validHighlightableContainers.length === 0) {
      if (_debug_logEventActivity >= 1) {
        logger.info('No valid containers found on the entire page');
      }
    } else {
      if (_debug_logEventActivity >= 1) {
        logger.info(validHighlightableContainers.length + ' valid containers found , highlight in progress');
      }
    }

    return validHighlightableContainers;
  };
  /**
   * Set the type of drag-and-drop operation currently selected or sets the operation to a new type. The value
   * must be 'none', 'copy', 'link' or 'move'.
   *
   * @param {DragEvent} event - The DragEvent that holds the 'dataTransfer' property to set.
   * @param {String} value - The 'dropEffect' value to set .
   */


  var _setDropEffect = function _setDropEffect(event, value) {
    event.dataTransfer.dropEffect = value;
  };
  /**
   * Determine if the DragEvent is over a 'target' that is compatible with the 'source' types being dragged and,
   * if so, change drag effect to indicate if it is OK to drop on that 'target'.
   *
   * @param {DragEvent} event -
   * @param {boolean} isCurrentTargetOverGlobalArea - is the object drag over an invalid/white area
   */


  var _processDragOverInternal = function _processDragOverInternal(event, isCurrentTargetOverGlobalArea) {
    exports.processDragLeaveGlobal(event); // clearing all other highlights triggered due to file drag in global area

    if (isCurrentTargetOverGlobalArea) {
      var allHighlightableTargets = getApplicableContainersFromGlobalArea(event);

      if (!_isDragWithinTableContainer(event)) {
        _setDropEffect(event, 'none'); // when dragged object is on an invalid area, the dragged effect should be \'not allowed\'

      } else {
        _setDropEffect(event, 'copy');
      }

      event.stopPropagation();
      event.preventDefault();

      if (allHighlightableTargets) {
        _.forEach(allHighlightableTargets, function (targetElement) {
          eventBus.publish('dragDropEvent.highlight', {
            event: event,
            isGlobalArea: true,
            isHighlightFlag: true,
            targetElement: targetElement
          });
        });
      }
    } else {
      if (exports.isValidObjectToDrop(event)) {
        eventBus.publish('dragDropEvent.highlight', {
          event: event,
          isGlobalArea: false,
          isHighlightFlag: true,
          targetElement: _findDropTargetElement(event)[0]
        });

        _setDropEffect(event, 'copy'); // when dragged object is on a valid container, the dragged effect should be \'Copy\'


        event.stopPropagation();
        event.preventDefault();
      } else {
        // this ensures if the drop target is an applicable one however not a valid one , all the highlights are gone and a no drop cursor is shown
        _setDropEffect(event, 'none');

        event.dataTransfer.effectAllowed = 'none';
        event.stopPropagation();
        event.preventDefault();
      }
    }
  };
  /**
   * Once the last 'paste' is complete, select the 'target' object to show the results of the 'drop'. This should
   * cause the new 'sources' in that object.
   *
   * @param {DOMElement} targetElement - The element the mouse is over when the event was fired.
   * @param {ViewModelObject} targetVMO - The 'target' ViewModelObject being dropped onto.
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   */


  var _scheduleSelectTarget = function _scheduleSelectTarget(targetElement, targetVMO, callbackAPIs) {
    callbackAPIs.selectResultFn(targetElement, targetVMO);
  }; //* **************************************************************************
  //* **************************************************************************
  //* **************************************************************************
  //* **************************************************************************


  var exports = {};
  /**
   * Add the given map of 'dragData' name/value pairs to the 'dataTransfer' property of the given DragEvent.
   *
   * @param {DragEvent} event - The DragEvent to set the DragData on.
   * @param {Object} dragDataMap - Map of name/value pairs to add.
   */

  exports.addDragDataToDragEvent = function (event, dragDataMap) {
    if (_includeDataTransfer) {
      try {
        _.forEach(dragDataMap, function (value, name) {
          event.dataTransfer.setData(name, value);
        });
      } catch (ex) {
        // Current versions of Internet Explorer can only have types "Text" and "URL"
        _.forEach(dragDataMap, function (value, name) {
          // Only deal with the interop error from IE, to address DnD issue D-24972
          if (name === 'aw_interop_type') {
            event.dataTransfer.setData('text', value);
          }
        });
      }
    }
  };
  /**
   * @return {StringArray} An array of strings (placed into localStorage' at the start of a drag operation) that
   *         represent the UIDs of 'source' objects being dragged (or NULL if no types were found).
   */


  exports.getCachedSourceUids = function () {
    var dragDataJSON = localStrg.get('awDragData');

    if (dragDataJSON && dragDataJSON !== 'undefined') {
      var dragData = JSON.parse(dragDataJSON);

      if (dragData.uidList) {
        return dragData.uidList;
      }
    }

    return null;
  };
  /**
   * Check if <b>everything</b> in the 'dataTransfer' is valid to drop on the 'target'.
   * <P>
   * Note: There will be multiple things being dragged over. We should look at the type (Files, ModelObject,
   * Text). Do we have three handlers, or a smarter handler?
   * <P>
   * For a smarter handler, if this is a folder, it can take objects. This should only cause the drop indicator to
   * be shown for objects.
   *
   * @param {DragEvent} event - The event containing the details of the 'dataTransfer' and 'target' element to
   *            test.
   * @param {Object} targetElement - targetElement when object is over an invalid area . When drag is over a valid area,  targetElement
   *            is evaluated from event
   * @returns {Boolean} TRUE if something in the 'dataTransfer' is valid to drop on the 'target'.
   */


  exports.isValidObjectToDrop = function (event, targetElement) {
    // eslint-disable-line complexity

    /**
     * Find the DOM Element (potentially above the 'target' event's origin) where all the DnD information is
     * stored.
     */
    if (_.isUndefined(targetElement)) {
      targetElement = _findDropTargetElement(event)[0];
    }

    if (!targetElement) {
      return false;
    }

    if (targetElement.classList.contains('aw-widgets-chooseordropfile') && exports.dataTransferContainsFiles(event)) {
      return true;
    }
    /**
     * Check if we do NOT want to allow files from the OS to be dropped and the 'dataTransfer' contains at least
     * one file.
     */


    if (!m_supportingFileDrop && exports.dataTransferContainsFiles(event)) {
      return false;
    }
    /**
     * Check if the 'target' does not have information we need to process or that there are no 'source' objects
     * being dragged.
     * <P>
     * If so: No need to consider it as a valid drop (onto itself).
     */


    var targetUID = $(targetElement).data('dropuid');

    if (!targetUID || targetUID.length === 0) {
      return false;
    }
    /**
     * Make sure we have cached 'source' information to work with.
     */
    //            var sourceContainerId = null;


    var sourceUids = null;
    var sourceTypes = null;

    var sourceDragData = _getCachedDragData();

    if (sourceDragData) {
      //                sourceContainerId = sourceDragData.containerId;
      sourceUids = sourceDragData.uidList;
      sourceTypes = sourceDragData.typeList;
    }
    /**
     * Check if the 'target' is actually in the list of 'source' objects being dragged.
     * <P>
     * If so: No need to consider it as a valid drop (onto itself).
     */


    if (sourceUids && sourceUids.length > 0) {
      if (_.indexOf(sourceUids, targetUID) !== -1) {
        return false;
      }
    }
    /**
     * Get the types that are valid to drop on this 'target' and check if the current drag operation 'source'
     * contains at least one of that type.
     */


    var validSourceTypes = _getValidSourceTypes(targetElement);

    if (validSourceTypes && validSourceTypes.length > 0) {
      /**
       * Check if the only 'sources' are JS Files on the event.
       * <P>
       * If so: Build a list of 'source' types based on the file extensions.
       * <P>
       * If not: Use the IModelObject 'sources'
       */
      if ((!sourceTypes || sourceTypes.length === 0) && exports.dataTransferContainsFiles(event)) {
        /**
         * Get any file type information carried in the 'dataTransfer' property.
         * <P>
         * Check if there are NONE
         * <P>
         * If so: Then just assume the source is just one or more 'DataSet'.
         */
        var fileTypes = exports.getDataTransferFileTypes(event);

        if (fileTypes.length === 0) {
          fileTypes.push(TYPE_NAME_DATASET);
        }
        /**
         * Create key used to track status and remember the result of the validity test.
         */


        var sb = targetUID;

        for (var i = 0; i < validSourceTypes.length; i++) {
          sb += ',';
          sb += validSourceTypes[i];
        }

        for (var j = 0; j < fileTypes.length; j++) {
          sb += ',';
          sb += fileTypes[j];
        }

        var mapKey = sb;
        /**
         * Check if we already know the result from the last time we asked this question for the same
         * 'source' types and 'target'.
         */

        var result = m_mapKey2Result[mapKey];

        if (result) {
          return result.value;
        }

        var promise = m_mapKey2Promise[mapKey];

        if (!promise) {
          m_mapKey2Promise[mapKey] = exports.getDataTransferSourceTypes(targetUID, fileTypes).then(function (result2) {
            delete m_mapKey2Promise[mapKey];
            m_mapKey2Result[mapKey] = {
              value: result2 && result2.length > 0 && _isValidObjectToDropInternal(validSourceTypes, result2)
            };
          }, function () {
            delete m_mapKey2Promise[mapKey];
            m_mapKey2Result[mapKey] = {
              value: false
            };
          });
        }

        return false;
      }
      /**
       * Check if any of the valid 'source' types are NOT currently loaded.
       * <P>
       * Note: We need them loaded so we can walk their type hierarchy while looking for a match.
       */


      var missingSourceTypes = null;
      var availableSourceTypes = null;

      for (var ii = 0; ii < validSourceTypes.length; ii++) {
        var validSourceType = validSourceTypes[ii];

        if (!_cmm.containsType(validSourceType)) {
          if (!missingSourceTypes) {
            missingSourceTypes = [];
          }

          missingSourceTypes.push(validSourceType);
        } else {
          if (!availableSourceTypes) {
            availableSourceTypes = [];
          }

          availableSourceTypes.push(validSourceType);
        }
      }
      /**
       * Check if any 'source' types are missing (not loaded yet).
       * <P>
       * If available 'source' types is null and missing 'source' types is not null, Then: Return 'false' for
       * this drop but queue up a server request to get the type so that during further (future) dragging will
       * see the type as loaded.
       */


      if (!availableSourceTypes && missingSourceTypes) {
        var sb2 = targetUID;

        for (var jj = 0; jj < missingSourceTypes.length; jj++) {
          if (jj > 0) {
            sb2 += ',';
          }

          sb2 += missingSourceTypes[jj];
        }

        var key = sb2;

        if (!m_typeLookupInProgress[key]) {
          m_typeLookupInProgress[key] = key;

          _soaSvc.ensureModelTypesLoaded(missingSourceTypes).then(function () {
            /**
             * Nothing to do now other than removing the lookup placeholder. We just wanted to make sure
             * the type is loaded for the NEXT time we look for it.
             */
            delete m_typeLookupInProgress[key];
          }, function (err) {
            logger.error('Unable to get model types: ' + err);
          });
        }

        return false;
      }

      return _isValidObjectToDropInternal(availableSourceTypes, sourceTypes);
    }

    return false;
  };
  /**
   * Get map of data format to drag data based on the given 'source' IModelObjects.
   *
   * @param {ViewModelObjectArray} sourceVMOs - The 'source' ViewModelObjects being dragged.
   * @param {String} containerId - The ID of the UI 'container' of the 'source' objects.
   *
   * @return {Object} Map of DataTransfer property name/value pairs.
   */


  exports.getDragDataForSourceObjects = function (sourceVMOs, containerId) {
    /**
     * Create collections of data associated with the 'source' objects.
     */
    var uidList = [];
    var typeSet = {};
    var interopObjectRefs = [];
    var firstObjectUrl = '';
    var first = true;

    for (var i = 0; i < sourceVMOs.length; i++) {
      var modelObject = sourceVMOs[i];

      if (modelObject) {
        if (_cmm.isInstanceOf('Awp0XRTObjectSetRow', modelObject.modelType)) {
          var adaptedObjs = _adapterSvc.getAdaptedObjectsSync([modelObject]);

          modelObject = adaptedObjs[0];
        }
        /**
         * Grab the first uid from the list for the url and the type
         */


        if (first) {
          first = false;
          firstObjectUrl = _getShowObjectURL(modelObject.uid);
        }
        /**
         * Add the UID and type of this object into the collections
         */


        if (modelObject.uid) {
          uidList.push(modelObject.uid);
        }

        typeSet[modelObject.type] = modelObject.type;

        if (_createInteropObjectRefFn) {
          /**
           * Generate a hosting InteropObjectRef to be used by host applications (i.e. NX) for
           * interpreting this 'source' object.
           */
          var objRefArrayList = _createInteropObjectRefFn(modelObject);

          _.forEach(objRefArrayList, function (objRef) {
            interopObjectRefs.push(objRef);
          });
        } else {
          if (_debug_logEventActivity) {
            logger.warn('Unable to determine InteropObjectRef information due to missing callback function');
          }
        }
      }
    }

    var dragData = {
      'text/uri-list': firstObjectUrl,
      'text/plain': firstObjectUrl
    };
    /**
     * Include application interop references (if necessary)
     */

    if (interopObjectRefs.length > 0 && _includeDataTransfer) {
      /**
       * Create the JSON message for interop with host applications.
       */
      var dragDataInterop = {
        DragTargets: interopObjectRefs
      };
      var jsonString = JSON.stringify(dragDataInterop);
      /**
       * Add data for each data format
       * <P>
       * Note: Need multiple data formats right now to handle compatibility with different browsers.
       */

      for (var j = 0; j < DATA_FORMATS.length; j++) {
        dragData[DATA_FORMATS[j]] = jsonString;
      }
    }

    dragData['text/uri-list'] = firstObjectUrl;
    dragData['text/plain'] = firstObjectUrl;
    /**
     * Put the other formats onto the dataTransport
     * <P>
     * Note: We need the UIDs and types in the 'keys' (for checking while dragging since the values are not
     * available at that time) and the 'values' to be able to access the data without it being changed to lower
     * case by the browser itself.
     */

    var dragDataJSO = {};
    dragDataJSO.containerId = containerId;
    dragDataJSO.uidList = uidList;
    dragDataJSO.firstObjectUrl = firstObjectUrl;
    dragDataJSO.typeList = [];

    _.forEach(typeSet, function (type) {
      dragDataJSO.typeList.push(type);
    });

    localStrg.publish('awDragData', JSON.stringify(dragDataJSO));
    return dragData;
  };
  /**
   * Handle caching of DnD mapping data on the 'target' element's 'drop container' the 1st time we encounter the
   * 'target'.
   *
   * @param {DragEvent} event - The drag event with the 'target' to process.
   */


  exports.processDragEnd = function (event) {
    // eslint-disable-line no-unused-vars
    _clearCachedData();
  };
  /**
   * Handle caching of DnD mapping data on the 'target' element's 'drop container' the 1st time we encounter the
   * 'target'.
   *
   * @param {DragEvent} event - The drag event with the 'target' to process.
   *
   * @param {ViewModelObject} targetVMO - The ViewModelObject associated with the given event's 'target' DOM
   *            Element.
   */


  exports.processDragEnter = function (event, targetVMO) {
    /**
     * Look 'up' the DOM Element tree (starting at the given event's 'target') looking for the 1st 'droppable'
     * element (i.e. the 'drop container').
     */
    var currElement = _findDropTargetElement(event)[0];

    _setValidSourceTypesOnTarget(currElement, targetVMO);

    event.preventDefault();
  };
  /**
   * Remove Highlight from the drop area with CSS class(s) and prevent the 'default' behavior (which we assume to
   * be 'do not allow drop' for objects or 'load file into page' for files).
   *
   * @param {DragEvent} event -
   */


  exports.processDragLeave = function (event) {
    event.preventDefault();
  };
  /**
   * Remove Highlight when object drag is skipped or object dragged outside white/invalid area
   *
   * @param {DragEvent} event -
   */


  exports.processDragLeaveGlobal = function (event) {
    if (_.isUndefined(mainReference)) {
      mainReference = document.body;
    }

    var allHighlightedTargets = mainReference.querySelectorAll('.aw-theme-dropframe.aw-widgets-dropframe');

    if (allHighlightedTargets) {
      _.forEach(allHighlightedTargets, function (target) {
        eventBus.publish('dragDropEvent.highlight', {
          event: event,
          isGlobalArea: true,
          isHighlightFlag: false,
          targetElement: target
        });
      });
    }
  };
  /**
   * Determine if the DragEvent is over a white space on the page or on an applicable valid drop container
   * if so, change drag effect to indicate if it is OK to drop on that 'target'.
   *
   * @param {DragEvent} event -
   * @param {boolean} isCurrentTargetOverGlobalArea - is the object drag over an invalid/white area
   */


  exports.processDragOver = function (event, isCurrentTargetOverGlobalArea) {
    // If drag is over Choose File or Drop File container , unhighlight other highlighted containers, highlight this
    // container and set drop effect to 'Copy' ; these containers have a special css(in addition) to identify : 'aw-widgets-chooseordropfile'
    var chooseFileContainer = _isDragOverChooseOrDropFileContainer(event);

    if (chooseFileContainer) {
      // Adding listeners to Choose/Drop File type widgets which mandatorily should have 'aw-widgets-chooseordropfile' associated
      // along with 'aw-widgets-droptable' css class  to participate in highlight
      chooseFileContainer.addEventListener('dragover', function (event) {
        if (_debug_logEventActivity >= 1) {
          logger.info('----------FILE IS OVER CHOOSE/DROP FILE ZONE----------');
        }

        exports.processDragLeaveGlobal(event); // clear all the highlights

        if (!exports.dataTransferContainsFiles(event)) {
          _setDropEffect(event, 'none');

          event.stopPropagation();
        } else {
          eventBus.publish('dragDropEvent.highlight', {
            event: event,
            isGlobalArea: false,
            isHighlightFlag: true,
            targetElement: chooseFileContainer
          });

          _setDropEffect(event, 'copy');

          event.stopPropagation(); // required or else it hangs the page if file dragged over container for longer period of time.

          event.preventDefault();
        }
      });
      chooseFileContainer.addEventListener('dragleave', function (event) {
        if (_debug_logEventActivity >= 1) {
          logger.info('----------FILE IS LEAVING CHOOSE/DROP FILE ZONE----------');
        }

        _setDropEffect(event, 'none');

        exports.processDragLeaveGlobal(event);
        event.stopPropagation();
        event.preventDefault();
      });
      chooseFileContainer.addEventListener('drop', function (event) {
        if (_debug_logEventActivity >= 1) {
          logger.info('----------FILE IS DROPPED IN CHOOSE/DROP FILE ZONE----------');
        }

        _setDropEffect(event, 'none');

        exports.processDragLeaveGlobal(event);
        event.stopPropagation();
        event.preventDefault();
      });
    }

    var sourceUIDs = exports.getCachedSourceUids();
    var hasTCSessionData = _appCtxSvc && _appCtxSvc.ctx && !_.isUndefined(_appCtxSvc.ctx.tcSessionData);
    var missingSourceUIDs = null;

    if (sourceUIDs && _cdm) {
      /**
       * Attempt to locate the 'source' objects in this browser's CDM cache.
       * <P>
       * Note: When 'source' objects are being dragged from another browser they may not have been loaded into
       * the 'target' browser.
       */
      for (var i = 0; i < sourceUIDs.length; i++) {
        var sourceUID = sourceUIDs[i];

        var sourceObject = _cdm.getObject(sourceUID);

        if (!sourceObject) {
          if (!missingSourceUIDs) {
            missingSourceUIDs = [];
          }

          missingSourceUIDs.push(sourceUID);
        }
      }
    }

    if (isCurrentTargetOverGlobalArea) {
      if (!missingSourceUIDs) {
        _processDragOverInternal(event, true);
      } else {
        // Checking if valid TCSession exists before making loadObjects server call
        // This needs to be refactored later to remove TCSpecific code.
        if (hasTCSessionData) {
          _dms.loadObjects(missingSourceUIDs).then(function () {
            _processDragOverInternal(event, true);
          });
        } else {
          _processDragOverInternal(event, true);
        }
      }
    } else {
      if (!missingSourceUIDs) {
        _processDragOverInternal(event);
      } else {
        // Checking if valid TCSession exists before making loadObjects server call
        // This needs to be refactored later to remove TCSpecific code.
        if (hasTCSessionData) {
          _dms.loadObjects(missingSourceUIDs).then(function () {
            _processDragOverInternal(event);
          });
        } else {
          _processDragOverInternal(event);
        }
      }
    }
  };
  /**
   * @param {DragEvent} event - The drag event with the 'target' to process.
   *
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   */


  exports.processDrop = function (event, callbackAPIs) {
    event.stopPropagation();
    event.preventDefault();

    var targetElement = _findDropTargetElement(event)[0];

    if (!targetElement) {
      _clearCachedData();

      return;
    }

    eventBus.publish('dragDropEvent.highlight', {
      event: event,
      isGlobalArea: false,
      isHighlightFlag: false,
      targetElement: targetElement
    });
    var sourceUids = exports.getCachedSourceUids();

    if (sourceUids && sourceUids.length > 0) {
      _dropModelObjects(targetElement, sourceUids, callbackAPIs);
    } else {
      var sourceFiles = _getDataTransferSourceFiles(event);

      if (sourceFiles && sourceFiles.length > 0) {
        _dropFiles(targetElement, sourceFiles, callbackAPIs);
      } else {
        _clearCachedData();
      }
    }
  };
  /**
   * Set the current types of operations that are possible. Must be one of 'none', 'copy', 'copyLink', 'copyMove',
   * 'link', 'linkMove', 'move', 'all' or 'uninitialized'.
   *
   * @param {DragEvent} event - The DragEvent that holds the 'dataTransfer' property to set.
   *
   * @param {String} value - The 'effectAllowed' allowed value to set.
   */


  exports.setEffectAllowed = function (event, value) {
    try {
      event.dataTransfer.effectAllowed = value;
    } catch (ex) {// Do nothing
    }
  };
  /**
   * @param {Element} panelElement - The DOM element that is the overall container/frame for a collection of
   *            'source' and 'target' objects.
   *
   * @param {Object} callbackAPIs - Callback functions used for various reasons of interaction with the
   *            container/frame:
   *
   * @param {Object} dataProvider - DataProvider for the panelElement
   * <P>
   * getElementViewModelObjectFn: Used to query the 'source' or 'target' ViewModelObject(s) under any given
   * DragEvent.
   * <P>
   * clearSelectionFn: Used to clear all currently selected 'source' objects just before the drop operation is
   * performed.
   * <P>
   * selectResultFn: Used to select the 'target' when the drop operation is complete.
   */


  exports.setupDragAndDrop = function (panelElement, callbackAPIs, dataProvider) {
    var jqPanelElement = $(panelElement);
    /**
     * Set valid source types to the target drop element by retrieving from objectSetSource in data provider
     */

    var dropContainer = jqPanelElement.hasClass('aw-widgets-droptable') ? jqPanelElement : jqPanelElement.find('.aw-widgets-droptable');

    if (dropContainer) {
      var dropContScope = ngModule.element(dropContainer).scope();

      if (dropContScope) {
        var sourceType2RelationMap = {};
        var declViewModel = declUtils.findViewModel(dropContScope, false, null); // ui-grid uses scope.dataprovider and plTable uses scope.dataProvider

        var dropTableDataProvider = dataProvider || dropContScope.dataprovider || dropContScope.dataProvider;

        if (dropTableDataProvider && dropTableDataProvider.validSourceTypes) {
          var objectSetSources = dropTableDataProvider.validSourceTypes.split(',');

          _.forEach(objectSetSources, function (source) {
            var relationSources = source.split('.');
            var sourceType = relationSources[1];

            if (!sourceType2RelationMap[sourceType]) {
              sourceType2RelationMap[sourceType] = [];
              var relationObj = {
                relation: relationSources[0]
              };
              sourceType2RelationMap[sourceType] = relationObj;
            }
          });
        } else if (declViewModel && declViewModel.vmo) {
          // fetch valid source types from paste service for vmo inside decl view model
          if (_defaultPasteHandler) {
            sourceType2RelationMap = _defaultPasteHandler.getObjectValidSourceTypes(declViewModel.vmo);
          } else if (_cfgLoadPromise) {
            _cfgLoadPromise.then(function () {
              sourceType2RelationMap = _defaultPasteHandler.getObjectValidSourceTypes(declViewModel.vmo);
              dropContainer.data('validSourceTypes', sourceType2RelationMap);
            });
          }
        }

        dropContainer.data('validSourceTypes', sourceType2RelationMap);

        if (declViewModel && declViewModel.vmo) {
          // add the decl view model VMO as drop uid on the container
          dropContainer.data('dropuid', declViewModel.vmo.uid);
        }
      }
    }

    callbackAPIs.dragStartFn = function (event) {
      if (event) {
        /**
         * Determine some hosting related options at the start.
         */
        _includeDataTransfer = _appCtxSvc.ctx.aw_host_type !== 'ADOBE';
        _publishHostingEvents = _appCtxSvc.ctx.aw_hosting_enabled; // D-52947: Prevent issues when text is highlighted as drag starts. Event.target may be text.

        if (event.target.nodeName === '#text') {
          jqPanelElement.data('dragging', false);
          event.preventDefault();
        } else {
          if (_debug_logEventActivity >= 2) {
            logger.info('dragstart: ' + '\n' + JSON.stringify(event, null, 2));
          }

          if (_publishHostingEvents) {
            eventBus.publish('hosting.DragDropEvent', {
              type: 'dragstart',
              event: event
            });
          }

          var srcElement = _getEventSource(event);

          var sourceVMOs = callbackAPIs.getElementViewModelObjectFn(srcElement, false);

          if (sourceVMOs && sourceVMOs.length > 0) {
            if (_debug_logEventActivity >= 1) {
              logger.info('Source Item UID: ' + _getViewModelObjectName(sourceVMOs[0]));
            }

            $(panelElement).data('dragging', true);
            var containerId = jqPanelElement.data('containerId');

            if (!containerId) {
              containerId = Date.now();
              jqPanelElement.data('containerId', containerId);
            }

            var dragDataMap = exports.getDragDataForSourceObjects(sourceVMOs, containerId.toString());
            exports.addDragDataToDragEvent(event, dragDataMap);
            exports.updateDragImage(event, sourceVMOs.length);

            if (!_includeDataTransfer) {
              event.dataTransfer.clearData();
            }
          } else {
            // No data so there is no reason to let the object be dragged.
            jqPanelElement.data('dragging', false);
            event.preventDefault();
          }
        }
      }
    };

    callbackAPIs.dragEndFn = function (event) {
      if (event) {
        if (_debug_logEventActivity >= 2) {
          logger.info('dragend: ' + '\n' + JSON.stringify(event, null, 2));
        }

        var element = _getDragElement(event);

        if (element) {
          var dragImage = element.getElementsByClassName('aw-widgets-multidragimage')[0];

          if (dragImage) {
            element.style.position = '';
            dragImage.parentNode.removeChild(dragImage);
          }
        }

        if (_publishHostingEvents) {
          eventBus.publish('hosting.DragDropEvent', {
            type: 'dragend',
            event: event
          });
        }

        jqPanelElement.data('dragging', false);
      }
    };

    callbackAPIs.dragOverFn = function (event) {
      if (event) {
        if (_debug_logEventActivity >= 3) {
          logger.info('dragover: ' + '\n' + JSON.stringify(event, null, 2));
        }

        if (_publishHostingEvents) {
          eventBus.publish('hosting.DragDropEvent', {
            type: 'dragover',
            event: event
          });
        }

        exports.processDragOver(event);
      }
    };

    callbackAPIs.dragEnterFn = function (event) {
      if (event) {
        if (_debug_logEventActivity >= 2) {
          logger.info('dragenter: ' + '\n' + JSON.stringify(event, null, 2));
        }

        if (_publishHostingEvents) {
          eventBus.publish('hosting.DragDropEvent', {
            type: 'dragenter',
            event: event
          });
        }

        var target = _findDropTargetElement(event)[0];

        if (!target) {
          return;
        }

        if (exports.isValidObjectToDrop(event)) {
          var targetVMOs = callbackAPIs.getElementViewModelObjectFn(target, true);

          if (targetVMOs && targetVMOs.length > 0) {
            if (_debug_logEventActivity >= 1) {
              logger.info('Target Item Name: ' + _getViewModelObjectName(targetVMOs[0]));
            }

            var debounceProcessDragEnter = _.debounce(exports.processDragEnter, 100);

            debounceProcessDragEnter(event, targetVMOs[0]);
          }
        }
      }
    };

    callbackAPIs.dragLeaveFn = function (event) {
      if (event) {
        if (_debug_logEventActivity >= 2) {
          logger.info('dragleave: ' + '\n' + JSON.stringify(event, null, 2));
        }

        if (_publishHostingEvents) {
          eventBus.publish('hosting.DragDropEvent', {
            type: 'dragleave',
            event: event
          });
        }

        var debounceProcessDragLeave = _.debounce(exports.processDragLeave, 100);

        debounceProcessDragLeave(event);
      }
    };

    callbackAPIs.dropFn = function (event) {
      if (event) {
        if (_debug_logEventActivity >= 2) {
          logger.info('drop: ' + '\n' + JSON.stringify(event, null, 2));
        }

        if (_publishHostingEvents) {
          eventBus.publish('hosting.DragDropEvent', {
            type: 'drop',
            event: event
          });
        }

        jqPanelElement.data('dragging', false);
        exports.processDrop(event, callbackAPIs);
      }
    };

    panelElement.addEventListener('dragstart', callbackAPIs.dragStartFn);
    panelElement.addEventListener('dragend', callbackAPIs.dragEndFn);
    panelElement.addEventListener('dragover', callbackAPIs.dragOverFn);
    panelElement.addEventListener('dragenter', callbackAPIs.dragEnterFn);
    panelElement.addEventListener('dragleave', callbackAPIs.dragLeaveFn);
    panelElement.addEventListener('drop', callbackAPIs.dropFn);
  };

  exports.dragEnterEventOnGlobalWindow = function (event) {
    exports.processDragOver(event, true);
  };

  exports.dragOverEventOnGlobalWindow = function (event) {
    exports.processDragOver(event, true);
  };

  exports.dragLeaveEventOnGlobalWindow = function (event) {
    exports.processDragLeaveGlobal(event);

    if (exports.dataTransferContainsFiles(event)) {
      //
      _clearCachedData();
    }
  };

  exports.dragEndEventOnGlobalWindow = function (event) {
    exports.processDragLeaveGlobal(event);
  };
  /**
   * @param {Element} panelElement - The DOM element that is the overall container/frame for a collection of
   *            'source' and 'target' objects.
   *
   * @param {Object} callbackAPIs - Callback functions used for various interaction reasons.
   */


  exports.tearDownDragAndDrop = function (panelElement, callbackAPIs) {
    if (callbackAPIs.dragStartFn) {
      panelElement.removeEventListener('dragstart', callbackAPIs.dragStartFn);
      panelElement.removeEventListener('dragend', callbackAPIs.dragEndFn);
      panelElement.removeEventListener('dragover', callbackAPIs.dragOverFn);
      panelElement.removeEventListener('dragenter', callbackAPIs.dragEnterFn);
      panelElement.removeEventListener('dragleave', callbackAPIs.dragLeaveFn);
      panelElement.removeEventListener('drop', callbackAPIs.dropFn);
      callbackAPIs.dragStartFn = null;
      callbackAPIs.dragEndFn = null;
      callbackAPIs.dragOverFn = null;
      callbackAPIs.dragEnterFn = null;
      callbackAPIs.dragLeaveFn = null;
      callbackAPIs.dropFn = null;
    }
  };
  /**
   * Update the drag image for the DragEvent based on the number of objects being dragged.
   *
   * @param {DragEvent} event - The DragEvent to set the image on.
   *
   * @param {Number} count - The number of objects being dragged
   */


  exports.updateDragImage = function (event, count) {
    /**
     * Internet Explorer doesn't support setDragImage at all (and some 'hosts' do not want 'dataTransfer').
     * <P>
     * See: http://mereskin.github.io/dnd/
     */
    if (!browserUtils.isIE && _includeDataTransfer) {
      /**
       * The NX web browser (QT?) currently has a problem with child elements containing float elements. This
       * should be resolved after moving the list view to a flex display.
       */
      var dragImage;

      if (_isNxWebBrowser()) {
        dragImage = _getFirstChildImage(event.target);
      } else if (count > 1) {
        dragImage = _getMultiDragImage(event, count);
      } else {
        dragImage = _getDragElement(event, 1);
      }

      if (dragImage) {
        event.dataTransfer.setDragImage(dragImage, 0, 0);
      }
    }
  };
  /**
   * Return the target model object for given UID
   *
   * @param {String} uid - UID of the modelObject on which source objects are dragged
   * @return {Object} Modelobject on which source objects are dragged
   */


  exports.getTargetObjectByUid = function (uid) {
    return _cdm.getObject(uid);
  };
  /**
   * Return an array of viewModelObjects that contains all currently selected viewModelObjects if the given UID is
   * contained in the set of selected viewModelObjects.
   *
   * @param {Object} dataProvider - data provider
   * @param {String} dragUID - UID of the modelObject being dragged.
   * @return {Array} array of viewModelObjects that are being dragged.
   */


  exports.getSourceObjects = function (dataProvider, dragUID) {
    var sourceObjs = [];

    if (!dataProvider) {
      return sourceObjs;
    }

    var selectObjects = dataProvider.getSelectedObjects();
    /**
     * Check if the given UID is in the current set of selected objects.
     */

    var found = false;

    if (selectObjects && selectObjects.length > 0) {
      _.forEach(selectObjects, function (selObj) {
        if (selObj.uid === dragUID) {
          found = true;
          return false;
        }
      });
    }

    if (found) {
      sourceObjs = _.clone(selectObjects);
    }

    return sourceObjs;
  };
  /**
   * Look for support of the 'files' in the 'dataTranfer' area of the event.
   *
   * @param {DragEvent} event - The event to test.
   *
   * @return {boolean} TRUE if the 'files' property is found in the 'dataTransfer' property of the event.
   */


  exports.dataTransferContainsFiles = function (event) {
    if (event.dataTransfer) {
      var types = event.dataTransfer.types;

      for (var i = 0; i < types.length; ++i) {
        if (types[i] === 'Files') {
          return true;
        }
      }
    }

    return false;
  };
  /**
   * @param {DragEvent} event - The event to extract the files types from the 'dataTransfer' property.
   *
   * @return {StringArray} The set of unique file types.
   */


  exports.getDataTransferFileTypes = function (event) {
    var dtTypes = [];

    if (event.dataTransfer.items) {
      var itemObjs = event.dataTransfer.items;

      for (var i = 0; i < itemObjs.length; i++) {
        var fileExt = _getDataTransferType(itemObjs[i].type);

        if (fileExt && dtTypes.indexOf(fileExt) === -1) {
          dtTypes.push(fileExt);
        }
      }
    }

    return dtTypes;
  };
  /**
   * Returns underlying Object for the given 'source' type.
   *
   * @param {String} targetUID - The UID of the IModelObject that will be the dropped onto (i.e. the data
   *            'target').
   *
   * @param {StringArray} fileTypes - The array with the set of unique file types.
   *
   * @return {Promise} A Promise that will be 'resolved' or 'rejected' when the service is invoked and its
   *         response data is available.
   */


  exports.getDataTransferSourceTypes = function (targetUID, fileTypes) {
    var targetObject = _cdm.getObject(targetUID);

    var request = {
      parent: targetObject,
      fileExtensions: fileTypes
    };
    return _soaSvc.postUnchecked('Internal-AWS2-2015-10-DataManagement', 'getDatasetTypesWithDefaultRelation', request).then(function (response) {
      if (response.partialErrors || response.PartialErrors || response.ServiceData && response.ServiceData.partialErrors) {
        return [];
      }

      var dsTypes = [];
      var output = response.output;

      for (var i = 0; i < output.length; i++) {
        var dsInfos = output[i].datasetTypesWithDefaultRelInfo;

        for (var j = 0; j < dsInfos.length; j++) {
          var dsInfo = dsInfos[j];
          var dsUid = dsInfo.datasetType.uid;

          var dsType = _cdm.getObject(dsUid);

          var type = dsType.props.object_string.dbValues[0];
          dsTypes.push(type);
          break;
        }
      }

      return _soaSvc.ensureModelTypesLoaded(dsTypes).then(function () {
        return dsTypes;
      });
    }, function (e) {
      logger.trace(e);
      return [];
    });
  };
  /**
   * Set a callback function to use to encode 'source' objects in support of hosting.
   *
   * @param {Function} callBackFn - Function used to create InteropObjectRefs that are added to the information
   *            carried for 'source' objects in dragEvents.
   */


  exports.setCreateInteropObjectRef = function (callBackFn) {
    _createInteropObjectRefFn = callBackFn;
  };
  /**
   * Publish a 'drop' topic on the 'paste' channel of the Native JS 'eventBus' with the given data.
   *
   * @param {ObjectArray} pasteInput - An array of objects that maps a unique 'relationType' to the array of
   *            'sourceObjects' {@link IModelObject} s that should be pasted onto the 'targetObject' with that
   *            'relationType'.
   */


  exports.publishDropEvent = function (pasteInput) {
    eventBus.publishOnChannel({
      channel: 'paste',
      topic: 'drop',
      data: {
        pasteInput: pasteInput
      }
    });
  };
  /**
   * @param {Object} targetObject - The 'target' IModelObject to use when determining which 'source' types are
   *            potentially valid to be dropped upon it.
   *
   * @param {String} sourceType - The 'source' type to return the 'sourceTypeInfo' for.
   *
   * @return {Object} The 'sourceTypes' property from the 'pasteConfig' for the given 'target' object type or its
   *         ancestor types up the hierarchy (or NULL if no match was found).
   */


  exports.getValidSourceTypeInfo = function (targetObject, sourceType) {
    var sourceTypes = _defaultPasteHandler.getObjectValidSourceTypes(targetObject);

    if (sourceTypes) {
      var modelType = _cmm.getType(sourceType);

      if (modelType) {
        for (var i = 0; i < modelType.typeHierarchyArray.length; i++) {
          var type = modelType.typeHierarchyArray[i];

          if (sourceTypes[type]) {
            return sourceTypes[type];
          }
        }
      } else {
        logger.warn('The \'source\' ModelType is not currently loaded: ' + modelType);
      }
    }

    return null;
  }; // LCS-148724 , Adding listeners to global area i.e the area outside panelElement of setupDragAndDrop() function


  document.addEventListener('dragenter', function (event) {
    event.stopPropagation();
    event.preventDefault();

    if (!_isDragWithinApplicableValidContainer(event) || _isDragOverChooseOrDropFileContainer(event)) {
      // below check is to avoid global dragenter events in turn flickering highlight when within a table or list
      if (!_isDragWithinTableContainer(event) && !_isDragWithinCellListContainer(event)) {
        if (_debug_logEventActivity >= 1) {
          logger.info('GLOBAL DRAG ENTER EVENT, DRAG NOT WITHIN A TABLE, NOT ALLOWED cursor should be shown => tag name :' + event.target.tagName);
        }

        _setDropEffect(event, 'none'); // to avoid 'Copy' cursor feedback when file just enters the page


        exports.dragEnterEventOnGlobalWindow(event);
      } else {
        if (_debug_logEventActivity >= 1) {
          logger.info('GLOBAL DRAG ENTER EVENT, DRAG WITHIN A TABLE, COPY cursor should be shown => tag name :' + event.target.tagName);
        }

        _setDropEffect(event, 'copy');
      }
    }
  });
  document.addEventListener('dragover', function (event) {
    if (!_isDragWithinApplicableValidContainer(event) || _isDragOverChooseOrDropFileContainer(event)) {
      if (_debug_logEventActivity >= 1) {
        logger.info('GLOBAL DRAG OVER EVENT ');
      }

      exports.dragOverEventOnGlobalWindow(event);
    }
  });
  document.addEventListener('dragleave', function (event) {
    event.stopPropagation();
    event.preventDefault();

    if (_debug_logEventActivity >= 1) {
      logger.info('GLOBAL DRAG LEAVE EVENT, Object either dragged outside the global window OR over an applicable valid container on the page OR over an applicable invalid container on the page');
    }

    if (_isDragCancelled(event)) {
      exports.dragLeaveEventOnGlobalWindow(event);
    }
  });
  document.addEventListener('dragend', function (event) {
    if (_debug_logEventActivity >= 1) {
      logger.info('GLOBAL DRAG END EVENT ');
    }

    exports.dragEndEventOnGlobalWindow(event);
  });
  app.factory('dragAndDropService', ['$q', '$state', '$injector', 'soa_kernel_clientDataModel', 'soa_kernel_clientMetaModel', 'soa_kernel_soaService', 'soa_dataManagementService', 'configurationService', 'messagingService', 'localeService', 'appCtxService', 'adapterService', function ($q, $state, $injector, cdm, cmm, soaSvc, dms, cfgSvc, messagingSvc, localeService, appCtxSvc, adapterSvc) {
    _$state = $state;
    _cdm = cdm;
    _cmm = cmm;
    _soaSvc = soaSvc;
    _dms = dms;
    _messagingSvc = messagingSvc;
    _appCtxSvc = appCtxSvc;
    _localeSvc = localeService;
    _adapterSvc = adapterSvc; // The following check is to support Karma testing which invokes this multiple times.

    if (!_cfgLoadPromise && !(_defaultPasteHandler || _pasteFileHandler)) {
      _cfgLoadPromise = cfgSvc.getCfg('paste').then(function (pasteProvider) {
        if (pasteProvider.defaultPasteHandler) {
          return declUtils.loadDependentModule(pasteProvider.defaultPasteHandler.dep, $q, $injector).then(function (module) {
            _defaultPasteHandler = module;
            return pasteProvider;
          });
        }

        return pasteProvider;
      }).then(function (pasteProvider) {
        if (pasteProvider.defaultPasteFileHandler) {
          return declUtils.loadDependentModule(pasteProvider.defaultPasteFileHandler.dep, $q, $injector).then(function (module) {
            _pasteFileHandler = module;
            return pasteProvider;
          });
        }
      }).then(function () {
        _cfgLoadPromise = null;
      });
    }

    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating
   * which service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'dragAndDropService'
  };
});