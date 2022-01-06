"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * native impl for sessionContextService. This is native impl for the GWT component. This is core AW framework so it's
 * TC agnostic
 *
 * @module js/sessionContext.service
 */
define([//
'app', //
'js/eventBus', //
//
'soa/kernel/clientDataModel' //
], function (app, eventBus) {
  'use strict';

  var exports = {};
  /**
   * module reference to client data model
   */

  var _cdm = null;
  /**
   * The ID used for identification of this client D-30368 This value must be kept in sync in all instances where it
   * is used. See defect if change is required.
   */

  var _clientID = 'ActiveWorkspaceClient';
  /**
   * The client version string - This value must match what is defined for clientVersion in web.xml.
   */

  var _clientVersion = '10000.1.2';
  /**
   * constant declaration
   */

  var SESSION_DISCRIMINATOR_NOTSET = 'session_discriminator_notset';
  /**
   * The client session discriminator
   */

  var _clientSessionDiscriminator = SESSION_DISCRIMINATOR_NOTSET;
  /**
   * The user name of the authenticated user
   *
   * @return {String} user name if available else USER_NAME_NOTSET
   */

  exports.getUserName = function () {
    var userSession = _cdm.getUserSession();

    var usrName = '';

    if (userSession && userSession.props && userSession.props.user_id) {
      usrName = userSession.props.user_id.getDisplayValue();
    }

    return usrName;
  };
  /**
   * The current role of the logged in user
   *
   * @return {String} current role of the user if available else USER_ROLE_NOTSET
   */


  exports.getUserRole = function () {
    var userSession = _cdm.getUserSession();

    var role = '';

    if (userSession && userSession.props && userSession.props.role_name) {
      role = userSession.props.role_name.getDisplayValue();
    }

    return role;
  };
  /**
   * The current group of the logged in user
   *
   * @return {String} current group of the user if available else USER_GROUP_NOTSET
   */


  exports.getUserGroup = function () {
    var userSession = _cdm.getUserSession();

    var grp = '';

    if (userSession && userSession.props && userSession.props.group_name) {
      grp = userSession.props.group_name.getDisplayValue();
    }

    return grp;
  };
  /**
   * locale of the logged in user if available else USER_LOCALE_NOTSET
   *
   * @return {String} locale
   */


  exports.getUserLocale = function () {
    var userSession = _cdm.getUserSession();

    var locale = '';

    if (userSession && userSession.props && userSession.props.fnd0locale) {
      locale = userSession.props.fnd0locale.getDisplayValue();
    }

    return locale;
  };
  /**
   * Client session discriminator
   *
   * @return {String} clientSessionDiscriminator (if set)
   */


  exports.getSessionDiscriminator = function () {
    return _clientSessionDiscriminator;
  };
  /**
   * Set client session discriminator
   *
   * @param {String} val - The session discriminator
   */


  exports.setSessionDiscriminator = function (val) {
    _clientSessionDiscriminator = val;
  };
  /**
   * Client identifier for this client
   *
   * @return {String} clientID
   */


  exports.getClientID = function () {
    return _clientID;
  };
  /**
   * Client version string
   *
   * @return {String} clientVersion
   */


  exports.getClientVersion = function () {
    return _clientVersion;
  };
  /**
   * Definition for the service.
   *
   * @member SessionContextService
   * @memberof NgServices
   *
   * @param {soa_kernel_clientDataModel} cdm - Service to use.
   *
   * @returns {SessionContextService} Reference to service API Object.
   */


  app.factory('SessionContextService', [//
  'soa_kernel_clientDataModel', //
  function (cdm) {
    _cdm = cdm; // the session.updated event may include a new discriminator value
    // if there, pick up and modify the context member.

    eventBus.subscribe('session.updated', function (data) {
      if (data && data.sessionDiscriminator) {
        _clientSessionDiscriminator = data.sessionDiscriminator;
      }
    });
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'SessionContextService'
  };
});