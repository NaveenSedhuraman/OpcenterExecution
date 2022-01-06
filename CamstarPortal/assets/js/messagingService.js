"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This module is part of declarative UI framework and provides service related to displaying notifications.
 *
 * @module js/messagingService
 *
 * @publishedApolloService
 */
define(['app', 'lodash', 'js/declUtils', 'js/parsingUtils', 'js/logger', 'js/NotyModule', 'js/appCtxService', 'js/conditionService'], function (app, _, declUtils, parsingUtils, logger) {
  'use strict';

  var _notySvc = null;
  var _appCtxSvc = null;
  var _$q = null;
  var _conditionSvc = null;
  var exports = {};
  /**
   * Get localized text
   *
   * @param {Object} messageContext - The context object (e.g. a 'declViewModel') that holds the text string map to
   *            search within.
   *
   * @param {String} interpolationString - The string to search.
   *
   * @return {String} Interpolated string.
   * @ignore
   */

  exports.getLocalizedTextForInterpolationString = function (messageContext, interpolationString) {
    var textPath = parsingUtils.getStringBetweenDoubleMustaches(interpolationString);

    if (textPath === interpolationString) {
      return interpolationString;
    }

    return _.get(messageContext, textPath);
  };
  /**
   * Evaluate message with its parameters
   *
   * @param {String} messageString - The message String.
   *
   * @param {String} messageParams - The message parameters.
   *
   * @param {Object} messageContext - The context object (e.g. a 'declViewModel') that holds the text string map to
   *            search within.
   *
   * @return {String} Result string after applying passed parameters.
   */


  exports.applyMessageParams = function (messageString, messageParams, messageContext) {
    var placeHolders = messageString.match(/\{[0-9]*\}/g);
    var resultString = messageString;

    if (placeHolders) {
      for (var i in placeHolders) {
        if (placeHolders.hasOwnProperty(i)) {
          var placeHolder = placeHolders[i];
          var index = placeHolder;
          index = _.trimStart(index, '{');
          index = _.trimEnd(index, '}');
          var key = parsingUtils.getStringBetweenDoubleMustaches(messageParams[index]);

          var replacementString = _.get(messageContext, key);

          resultString = resultString.replace(placeHolder, replacementString);
        }
      }
    }

    return resultString;
  };
  /**
   * Evaluate message with its parameters
   *
   * @param {String} messageString - The message String.
   *
   * @param {String} messageParams - The message parameters.
   *
   * @return {String} Result string after applying passed parameters.
   */


  exports.applyMessageParamsWithoutContext = function (messageString, messageParams) {
    var placeHolders = messageString.match(/\{[0-9]*\}/g);
    var resultString = messageString;

    if (placeHolders) {
      for (var i in placeHolders) {
        if (placeHolders.hasOwnProperty(i)) {
          var placeHolder = placeHolders[i];
          var replacementString = messageParams[i];
          resultString = resultString.replace(placeHolder, replacementString);
        }
      }
    }

    return resultString;
  };
  /**
   * Evaluate message data
   *
   * @param {String} messageString - The message String.
   *
   * @param {String} messageParams - The message parameters.
   *
   * @param {String} messageData - The message data.
   *
   * @param {Object} messageContext - The context object (e.g. a 'declViewModel') that holds the text string map to
   *            search within.
   *
   * @return {Object} Result object after applying passed parameters.
   * @ignore
   */


  exports.applyMessageData = function (messageString, messageParams, messageData, messageContext) {
    if (messageData) {
      for (var key in messageData) {
        if (messageData[key]) {
          var parseKey = parsingUtils.getStringBetweenDoubleMustaches(messageData[key]);

          var replacementString = _.get(messageContext, parseKey);

          messageData[key] = replacementString;
        }
      }

      messageData.context = messageContext;
      messageData.params = messageParams;
    }

    return messageData;
  };
  /**
   * Report a message using 'NotyJS' API.
   *
   * @param {Object} messageDefn - message definition
   *
   * @param {String} localizedMessage - localizedMessage
   *
   * @param {Object} deferred - promise object
   *
   * @param {DeclViewModel} declViewModel - The 'declViewModel' context object that holds the text string map to
   *            search within.
   *
   * @param {Object} parentScope - The scope of the parent
   *
   * @param {Object} messageData - message data object
   */


  var _reportNotyMessageInternal = function _reportNotyMessageInternal(messageDefn, localizedMessage, deferred, declViewModel, parentScope, messageData) {
    var $injector = app.getInjector().get('$injector');

    if (messageDefn.messageType === 'INFO') {
      exports.showInfo(localizedMessage, messageData);
      deferred.resolve();
    } else if (messageDefn.messageType === 'WARNING') {
      var buttonsArr = [];

      if (messageDefn.navigationOptions) {
        _.forEach(messageDefn.navigationOptions, function (navOption) {
          var button = {};
          button.addClass = 'btn btn-notify';
          button.text = exports.getLocalizedTextForInterpolationString(declViewModel, navOption.text);

          button.onClick = function ($noty) {
            $noty.close();

            if ($injector && navOption.action) {
              /**
               * @param {ModuleObject} viewModelSvc - A reference to the 'viewModelService' module's API.
               */
              $injector.invoke(['viewModelService', function (viewModelSvc) {
                viewModelSvc.executeCommand(declViewModel, navOption.action, parentScope);
                deferred.resolve();
              }]);
            } else {
              deferred.resolve();
            }
          };

          buttonsArr.push(button);
        });
      }

      _notySvc.showWarning(localizedMessage, buttonsArr, messageData);
    } else if (messageDefn.messageType === 'ERROR') {
      exports.showError(localizedMessage, messageData);
      deferred.resolve();
    }
  };
  /**
   * Report a message using 'NotyJS' API.
   *
   * @param {DeclViewModel} declViewModel - The 'declViewModel' context object that holds the text string map to
   *            search within.
   *
   * @param {Object} messageList - Structure containing action messages.
   *
   * @param {String} notyMessage - The action message.
   *
   * @param {Object} parentScope - The scope of the parent
   * @ignore
   */


  exports.reportNotyMessage = function (declViewModel, messageList, notyMessage, parentScope) {
    if (parentScope) {
      declUtils.assertValidModelAndDataCtxNode(declViewModel, parentScope);
    } else {
      declUtils.assertValidModel(declViewModel);
    }

    var deferred = _$q.defer();

    var messageDefn = _.get(messageList, notyMessage);

    if (messageDefn && messageDefn.messageType) {
      var context = {
        data: declViewModel,
        ctx: _appCtxSvc.ctx
      };

      if (messageDefn.expression) {
        var expr = {};

        _.forEach(messageDefn.expression, function (expression, key) {
          expr[key] = _conditionSvc.parseExpression(declViewModel, expression, context);
        });

        context.expression = expr;
      }

      var localizedMessage = null;

      if (messageDefn.messageText) {
        localizedMessage = exports.getLocalizedTextForInterpolationString(declViewModel, messageDefn.messageText);
        localizedMessage = exports.applyMessageParams(localizedMessage, messageDefn.messageTextParams, context);

        _reportNotyMessageInternal(messageDefn, localizedMessage, deferred, declViewModel, parentScope);
      } else if (messageDefn.messageKey) {
        var messageData = exports.applyMessageData(localizedMessage, messageDefn.messageTextParams, messageDefn.messageData, context);
        messageData.isCustomElem = true;
        localizedMessage = '<aw-include name="' + messageDefn.messageKey + '" sub-panel-context="subPanelContext"></aw-include>';

        _reportNotyMessageInternal(messageDefn, localizedMessage, deferred, declViewModel, parentScope, messageData);
      } else {
        // Invalid usage of message
        deferred.reject();
      }

      declViewModel.getToken().addAction(messageDefn);
      deferred.promise.then(function () {
        declViewModel.getToken().removeAction(messageDefn);
      }).catch(function () {
        declViewModel.getToken().removeAction(messageDefn);
      });
    }

    return deferred.promise;
  };
  /**
   * Show error message in notification.
   *
   * @param {String} message - error message to show.
   */


  exports.showError = function (message, messageData) {
    logger.error(message);

    _notySvc.showError(message, messageData);
  };
  /**
   * Show informational message in notification.
   *
   * @param {String} message - Informational message to show.
   */


  exports.showInfo = function (message, messageData) {
    logger.info(message);

    _notySvc.showInfo(message, messageData);
  };
  /**
   * Show warning message in notification.
   *
   * @param {String} message - Warning message to show.
   */


  exports.showWarning = function (message, messageData) {
    logger.warn(message);

    _notySvc.showWarning(message, messageData);
  };
  /**
   * Get SOA error message from error object
   *
   * @param {String} errorJSO - JavaScript Object exception
   *
   * @return {String} message error message to be displayed.
   * @ignore
   */


  exports.getSOAErrorMessage = function (errorJSO) {
    if (errorJSO.message) {
      return errorJSO.message;
    }

    var partialErrors = null;

    if (errorJSO.partialErrors) {
      partialErrors = errorJSO.partialErrors;
    } else if (errorJSO.cause && errorJSO.cause.partialErrors) {
      partialErrors = errorJSO.cause.partialErrors;
    }

    errorJSO.message = '';

    if (partialErrors) {
      for (var ii = 0; ii < partialErrors.length; ii++) {
        var errorValues = partialErrors[ii].errorValues;

        if (errorValues) {
          for (var jj = 0; jj < errorValues.length; jj++) {
            if (errorValues[jj].message) {
              if (errorJSO.message.length > 0) {
                errorJSO.message += '\n';
              }

              errorJSO.message += errorValues[jj].message;
            }
          }
        }
      }
    }

    return errorJSO.message;
  };
  /**
   * The service to display noty messages.
   *
   * @member messagingService
   * @memberof NgServices
   */


  app.factory('messagingService', //
  ['notyService', 'appCtxService', '$q', 'conditionService', //
  function (notyService, appCtxSvc, $q, conditionSvc) {
    _notySvc = notyService;
    _appCtxSvc = appCtxSvc;
    _$q = $q;
    _conditionSvc = conditionSvc;
    return exports;
  }]);
});