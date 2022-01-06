"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * A minimal service used by the MOM Login Component. For more information on how to use this component, see the [MOM Login Component](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/mom-login-component) page of the MOM UI Kit Wiki.
 * @module "js/mom.login.component.service"
 */
define(['app', 'lodash', 'js/messagingService', 'js/appCtxService'], //
function (app, _) {
  'use strict';

  var exports = {};

  var _msgSvc;

  var _appCtxService;
  /**
   * Resets the Login Component by re-initializing it using existing or new data.
   * @param {Object} data The data of the current ViewModel where the MOM Login Component is being used.
   * @param {Object} newData A subset of the ViewModel data that needs to be changed to reset the MOM Login Component.
   * @returns {Object} The updated ViewModel data.
   */


  exports.reset = function (data, newData) {
    _.merge(data, newData); // Manage option properties


    _.filter(_.keys(data), function (key) {
      return key.match(/^options:/);
    }).forEach(function (key) {
      data.options = data.options ? data.options : {};
      data.requiredOptions = data.requiredOptions ? data.requiredOptions : {};
      var prop = key.replace(/^options:/, '');

      if (data[key].isRequired) {
        data.requiredOptions[prop] = data[key];
      } else {
        data.options[prop] = data[key];
      }
    }); // Store ViewModel in context so that it can also be used in commandsViewModel.json


    _appCtxService.updateCtx('momLoginComponentData', data);

    if (data && data.message && data.message.messageText) {
      _msgSvc.reportNotyMessage(data, {
        msg: data.message
      }, 'msg').then(function () {
        delete data.message;
      });
    }

    return data;
  };

  exports._cloneObjectProperty = function (obj, property) {
    var result = {};
    result[property] = _.cloneDeep(_.get(obj, property));
    return result;
  };

  exports._updateOptions = function (data) {
    if (!data.options) {
      return;
    }

    Object.keys(data.options).forEach(function (key) {
      data['options:' + key] = data.options[key];
    });
  };

  app.factory('momLoginComponentService', ['messagingService', 'appCtxService', function (msgSvc, appCtxService) {
    _msgSvc = msgSvc;
    _appCtxService = appCtxService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momLoginComponentService'
  };
});