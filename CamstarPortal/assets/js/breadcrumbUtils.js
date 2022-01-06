"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/breadcrumbUtils
 */
define(['app', 'js/eventBus', //
'js/aw.navigateBreadCrumbService', //
'js/appCtxService' //
], //
function (app, eventBus) {
  'use strict';

  var exports = {};
  var _navBreadcrumbSvc = null;
  var _appCtxService = null;
  var _stateService = null;
  /**
   * close popup on object selection inside chevron popup
   *
   * @return {Object} the data object
   */

  exports.updateBreadCrumbParamInUrl = function (data, id, dataProviderName, navigate) {
    // update the url and rebuild breadcrumbs
    var scopedObject = data.dataProviders[dataProviderName].selectedObjects[0];

    _navBreadcrumbSvc.buildBreadcrumbUrl(id, scopedObject.uid, navigate); // close the popup


    data.showPopup = false;

    _appCtxService.unRegisterCtx(id + 'Chevron');
  };
  /**
   * Toggle flag
   *
   * @param {Object} data object
   */


  exports.toggle = function (id, data, key, value, unRegister) {
    data[key] = value;

    if (unRegister) {
      _appCtxService.unRegisterCtx(id + 'Chevron');
    }

    if (key === 'loading' && !value) {
      eventBus.publish(id + 'settingChevronPopupPosition');
    }
  };

  exports.getBreadCrumbUidList = function (uid, d_uids) {
    if (!d_uids) {
      return [uid];
    }

    return [uid].concat(d_uids.split('^'));
  };

  exports.navigateToFolder = function (data, id, selectedObj, currentCrumb, uid, d_uids) {
    if (currentCrumb) {
      // Close the popup
      data.showPopup = false;
      currentCrumb.clicked = false;

      _appCtxService.unRegisterCtx(id + 'Chevron');

      var breadcrumbList = exports.getBreadCrumbUidList(uid, d_uids);
      var currentFolder = breadcrumbList.slice(-1)[0]; // If the opened crumb is for the current folder

      if (currentFolder === currentCrumb.scopedUid) {
        // Just select the item that was clicked
        _stateService.go('.', {
          s_uid: selectedObj.uid
        });
      } else {
        // Ensure that the scoped uid becomes the opened folder
        // And select the item
        var idx = breadcrumbList.indexOf(currentCrumb.scopedUid); // If scopeUid is not in list (it should always be in list) revert to just uid / s_uid
        // s_uid logic will remove it if not valid

        if (idx === -1) {
          _stateService.go('.', {
            s_uid: selectedObj.uid,
            d_uids: null
          });
        } else {
          var newBreadcrumbList = breadcrumbList.slice(0, idx + 1); // Drop uid

          newBreadcrumbList.shift();

          _stateService.go('.', {
            s_uid: selectedObj.uid,
            d_uids: newBreadcrumbList.join('^')
          });
        }
      }
    }
  };

  app.factory('breadcrumbUtils', //
  ['aw.navigateBreadCrumbService', 'appCtxService', '$state', //
  function (navigateBreadCrumbService, appCtxService, $state) {
    _navBreadcrumbSvc = navigateBreadCrumbService;
    _appCtxService = appCtxService;
    _stateService = $state;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'breadcrumbUtils'
  };
});