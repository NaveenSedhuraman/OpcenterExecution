"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/editHandlerService
 */
define(['app', 'js/eventBus', 'js/appCtxService'], function (app, eventBus) {
  'use strict';

  var exports = {};

  var _$q;

  var _appCtxSvc; // Map the context to the edit handler info


  var m_context2EditHandlerInfo = {};
  /** The last edit handler context activated */

  var m_activeEditHandlerContext = {};
  /**
   * Set the current edit handler
   *
   * @param {Object} handler - current edit handler
   * @param {Object} editHandlerContext - context
   */

  exports.setEditHandler = function (handler, editHandlerContext) {
    if (!handler || !editHandlerContext) {
      return;
    }

    var info = m_context2EditHandlerInfo[editHandlerContext];
    _appCtxSvc.ctx[editHandlerContext] = handler;

    if (!info || handler !== info.editHandler) {
      if (!info) {
        info = {};
      }

      info.editHandler = handler;
      info.enable = true;
      m_context2EditHandlerInfo[editHandlerContext] = info;

      if (handler.hasOwnProperty('hasWrapper')) {
        handler.addListener(this);
      }

      eventBus.publish('aw.setEditHandler', {});
    }
  };
  /**
   * Get the default edit handler
   *
   * @param {String} editHandlerContext - edit handler context
   * @return the default edit handler
   */


  exports.getEditHandler = function (editHandlerContext) {
    var info = m_context2EditHandlerInfo[editHandlerContext];

    if (!info) {
      return null;
    }

    return info.editHandler;
  };
  /**
   * Set the edit handler enabled/disabled
   *
   * @param enabled is enabled?
   * @param editHandlerContext is enabled?
   * @returns true if enabled changed, false otherwise
   */


  exports.setEditHandlerEnabled = function (enabled, editHandlerContext) {
    var info = m_context2EditHandlerInfo[editHandlerContext];

    if (info && info.enable !== enabled) {
      info.enable = enabled;
      m_context2EditHandlerInfo[editHandlerContext] = info;
      return true;
    }

    return false;
  };
  /**
   * Get the current state of the edit handler, enabled/disabled
   *
   * @return True if edit is enabled, False otherwise
   */


  exports.isEditEnabled = function (editHandlerContext) {
    var info = m_context2EditHandlerInfo[editHandlerContext];

    if (!info) {
      return false;
    }

    return info.enable;
  };
  /**
   * Remove an edit handler
   *
   * @param editHandlerContext context associated with the edit handler
   */


  exports.removeEditHandler = function (editHandlerContext) {
    _appCtxSvc.unRegisterCtx(editHandlerContext);

    var info = m_context2EditHandlerInfo[editHandlerContext];

    if (info && info.editHandler && info.editHandler.destroy) {
      info.editHandler.destroy();
    }

    delete m_context2EditHandlerInfo[editHandlerContext];
  };
  /**
   * Get all of the current edit handlers
   *
   * @return All of the current edit handlers
   */


  exports.getAllEditHandlers = function () {
    var editHandlers = [];

    for (var i in m_context2EditHandlerInfo) {
      var info = m_context2EditHandlerInfo[i];

      if (info && info.editHandler !== null) {
        editHandlers.push(info.editHandler);
      }
    }

    return editHandlers;
  };

  exports.setActiveEditHandlerContext = function (context) {
    m_activeEditHandlerContext = context;
  };

  exports.getActiveEditHandler = function () {
    if (m_context2EditHandlerInfo[m_activeEditHandlerContext] && m_context2EditHandlerInfo[m_activeEditHandlerContext].editHandler) {
      return m_context2EditHandlerInfo[m_activeEditHandlerContext].editHandler;
    }

    return null;
  };
  /**
   * Check for dirty edits
   *
   * @return {Object} with a boolean flag isDirty, TRUE if there is an activeEditHandler and dirty edits for it
   */


  exports.isDirty = function () {
    var activeEditHandler = exports.getActiveEditHandler();

    if (activeEditHandler && activeEditHandler.isNative) {
      return activeEditHandler.isDirty().then(function (isDirty) {
        return {
          isDirty: isDirty
        };
      });
    } else if (activeEditHandler) {
      return _$q.when({
        isDirty: activeEditHandler.isDirty()
      });
    }

    return _$q.when({
      isDirty: false
    });
  };
  /**
   * Check for edit in progress
   *
   * @return {Object} with a boolean flag editInProgress, TRUE if there is an activeEditHandler and edit in progress
   */


  exports.editInProgress = function () {
    var activeEditHandler = exports.getActiveEditHandler();

    if (activeEditHandler) {
      return {
        editInProgress: activeEditHandler.editInProgress()
      };
    }

    return {
      editInProgress: false
    };
  };
  /**
   * Start edits
   *
   * @return {Promise} A promise object
   */


  exports.startEdit = function () {
    var activeEditHandler = exports.getActiveEditHandler();

    if (activeEditHandler) {
      return activeEditHandler.startEdit();
    }

    return _$q.reject('No active EditHandler');
  };
  /**
   * Save edits
   *
   * @param {String} context - parameter for getting commandHandler
   * @return {Promise} A promise object
   */


  exports.saveEdits = function (context) {
    var activeEditHandler;

    if (context) {
      activeEditHandler = exports.getEditHandler(context);
    } else {
      activeEditHandler = exports.getActiveEditHandler();
    }

    if (activeEditHandler) {
      return activeEditHandler.saveEdits();
    }

    return _$q.reject('No active EditHandler');
  };
  /**
   * Perform the actions post Save Edit
   *
   * @param {Boolean} saveSuccess - Whether the save edit was successful or not
   */


  exports.saveEditsPostActions = function (saveSuccess) {
    var activeEditHandler = exports.getActiveEditHandler();

    if (activeEditHandler) {
      activeEditHandler.saveEditsPostActions(saveSuccess);
    }
  };
  /**
   * Cancel edits
   */


  exports.cancelEdits = function () {
    var activeEditHandler = exports.getActiveEditHandler();

    if (activeEditHandler) {
      activeEditHandler.cancelEdits();
    }
  };
  /**
   * Leave confirmation. Returns a promise that is resolved when it is ok to leave.
   */


  exports.leaveConfirmation = function () {
    var activeEditHandler = exports.getActiveEditHandler();

    if (activeEditHandler) {
      return _$q(function (resolve) {
        activeEditHandler.leaveConfirmation(resolve);
      });
    }

    return _$q.resolve();
  };

  app.factory('editHandlerService', ['$q', 'appCtxService', function ($q, appCtxSvc) {
    _$q = $q;
    _appCtxSvc = appCtxSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'editHandlerService'
  };
});