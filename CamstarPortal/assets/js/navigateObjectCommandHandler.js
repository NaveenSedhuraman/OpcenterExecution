"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 document
 */

/**
 * This is the command handler for navigate object command which is contributed to cell list. This handler provides
 * command visibility and execution logic.
 *
 * @module js/navigateObjectCommandHandler
 */
define([//
'app', //
'jquery', //
'lodash', //
'js/eventBus', //
'js/commandsMapService', //
'js/appCtxService', //
'js/adapterService'], //
function (app, $, _, eventBus) {
  'use strict';

  var exports = {};
  /**
   * Cached CommandsMapService
   */

  var _commandsMapSvc = null;
  /**
   * Cached Application Context Service
   */

  var _appCtxService = null;
  /**
   * Cached AdapterService
   */

  var _adapterSvc = null;
  /**
   * Set command context for show object dataset cell command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */

  function _setCommandContextIn(context, $scope) {
    if (_commandsMapSvc.isInstanceOf('Folder', context.modelType)) {
      $scope.cellCommandVisiblilty = true;
    } else {
      $scope.cellCommandVisiblilty = false;
    }
  }
  /**
   * Set command context for navigate object command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   */


  function _executeAction(context) {
    // Route the request and let appropriate listeners react to it
    var stateSvc = exports.getState();

    if (stateSvc) {
      if (context && context.uid) {
        var selectedObjUid = context.uid;
        var toParams = {};

        if (stateSvc && stateSvc.params) {
          var newD_uid = '';
          var d_uid = stateSvc.params.d_uids; // to support breadcrumb in native and GWT sub location

          var p_uid;

          var scopedObj = _appCtxService.getCtx('d_uidsChevron');

          if (scopedObj === undefined) {
            p_uid = stateSvc.params.p_uid;
          } else {
            p_uid = scopedObj.scopedUid;
          }

          var uid = stateSvc.params.uid; // remove p_uid and s_uid params

          toParams.p_uid = '';
          toParams.s_uid = ''; // Add the uid to new route params

          toParams.uid = uid;

          if (p_uid === uid) {
            // The root chevron is clicked
            newD_uid = selectedObjUid;
          } else {
            // Drilled folder chevron is selected
            if (d_uid) {
              // This command can be executed from cellist in Navigate sublocation or bread crumb widget
              // Check if the parent uid is part of d_uid and take appropriate action as per algo below:
              //  Case 1 :
              //    parent   uid = C
              //    modelObj uid = D
              //      d_uid      = A^B^C
              //      new d_uid  = A^B^C^D
              //  Case 2 :
              //    parent   uid = B
              //    modelObj uid = X
              //      d_uid      = A^B^C^D^E
              //      new d_uid  = A^B^X
              //
              //  Case 3 : User clicks on the navigate command multiple times in quick succession
              //    parent   uid = D
              //    modelObj uid = E
              //      d_uid      = A^B^C^D^E
              //      new d_uid  = A^B^C^D^E
              // build regex from the delimiter and split the d_uids
              var d_uidsArray = d_uid.split('^');

              for (var counter = 0; counter < d_uidsArray.length; counter++) {
                if (counter > 0) {
                  newD_uid += '^';
                }

                newD_uid += d_uidsArray[counter];

                if (d_uidsArray[counter] === p_uid) {
                  break;
                }
              } // selected obj uid can be already in d_uid if user has clicked the command in quick succession


              if (newD_uid.lastIndexOf(selectedObjUid) < 0) {
                newD_uid += '^';
                newD_uid += selectedObjUid;
              }
            } else {
              newD_uid = !p_uid || uid === p_uid ? selectedObjUid : p_uid + '^' + selectedObjUid;
            }
          }

          toParams.d_uids = newD_uid; // Set the last object as s_uid

          var d_uids = newD_uid.split('^');

          if (d_uids.length === 1 && !d_uids[0]) {
            // If empty string use uid instead
            toParams.s_uid = stateSvc.params.uid;
          } else {
            // Otherwise use final uid
            toParams.s_uid = d_uids.slice(-1)[0];
          }

          stateSvc.go(stateSvc.current.name, toParams);
          var eventData = {
            contextUid: context.uid
          };
          eventBus.publish('breadcrumb.update', eventData);
        }
      }
    }
  }
  /**
   * Set command context for navigate object command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */


  exports.setCommandContext = function (context, $scope) {
    if (context.type === 'Awp0XRTObjectSetRow') {
      var adaptedObjsPromise = _adapterSvc.getAdaptedObjects([$scope.vmo]);

      adaptedObjsPromise.then(function (adaptedObjs) {
        _setCommandContextIn(adaptedObjs[0], $scope);
      });
    } else {
      _setCommandContextIn(context, $scope);
    }
  };
  /**
   * Retrieve state information
   */


  exports.getState = function () {
    var state = null;

    var _injector = app.getInjector();

    if (_injector) {
      state = _injector.get('$state');
    }

    return state;
  };
  /**
   * Set command context for navigate object command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   */


  exports.execute = function (context) {
    if (context.type === 'Awp0XRTObjectSetRow') {
      var adaptedObjsPromise = _adapterSvc.getAdaptedObjects([context]);

      adaptedObjsPromise.then(function (adaptedObjs) {
        _executeAction(adaptedObjs[0]);
      });
    } else {
      _executeAction(context);
    }
  };
  /**
   * Navigate object command handler providing implementation for command visibility and execution in cell list based
   * off object type. This command is visible if the object type is 'Folder' and any of its derivatives.
   *
   * @memberof NgServices
   * @member navigateObjectCommandHandler
   */


  app.factory('navigateObjectCommandHandler', ['commandsMapService', 'appCtxService', 'adapterService', // //
  function (commandsMapSvc, appCtxService, adapterSvc) {
    _commandsMapSvc = commandsMapSvc;
    _appCtxService = appCtxService;
    _adapterSvc = adapterSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'navigateObjectCommandHandler'
  };
});