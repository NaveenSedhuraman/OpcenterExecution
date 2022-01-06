"use strict";

var cepAuthenticator =
/** @class */
function () {
  function cepAuthenticator($q, $window, loginSvc, appCtxSvc, msgSvc, cepSwacSvc) {
    this.$q = $q;
    this.$window = $window;
    this.loginSvc = loginSvc;
    this.appCtxSvc = appCtxSvc;
    this.msgSvc = msgSvc;
    this.cepSwacSvc = cepSwacSvc;
    this.q = $q;
    this.window = $window;
  }

  cepAuthenticator.prototype.checkIfSessionAuthenticated = function () {
    var _this = this;

    this.appCtxSvc.updateCtx('commandLabels', true);
    this.appCtxSvc.updateCtx('toggleLabel', true);
    return this.loginSvc.verifyLogon().then(function (resp) {
      if (resp.data.VerifyLogonResult.IsSuccess) {
        // Proceed initialization on alive session
        _this.initializeRedirect();

        return _this.loginSvc.initAfterLogin();
      } else {
        console.warn(resp.data.VerifyLogonResult.ExceptionData.Description);
        return _this.q.reject();
      }
    });
  };

  cepAuthenticator.prototype.initializeRedirect = function () {
    var urlParams = window.location.search;

    if (urlParams) {
      localStorage.setItem('params', urlParams);
      var mode = this.getUrlParamVal('mode', urlParams);

      if (mode) {
        localStorage.setItem('displayMode', mode);
      }
    }
  };

  cepAuthenticator.prototype.authenticate = function () {
    //inits data for portal
    this.initializeData();
    this.window.location.href = this.window.location.origin + this.window.location.pathname + "#/login" + this.window.location.search;
    return this.q.resolve();
  };

  cepAuthenticator.prototype.postAuthInitialization = function () {
    return this.q.resolve();
  };

  cepAuthenticator.prototype.signOut = function () {
    var userProfileItem = {
      value: 'LOAD_CONFIRMLOGOUT'
    };
    this.cepSwacSvc.sendNavigateRouteToCEP(userProfileItem);
  };

  cepAuthenticator.prototype.setScope = function () {};

  cepAuthenticator.prototype.initializeData = function () {
    var urlParams = window.location.search;

    if (urlParams) {
      // set display mode in local storage since this method is called on route change            
      var mode = this.getUrlParamVal('mode', urlParams);
      if (mode) localStorage.setItem('displayMode', mode);
    }

    this.appCtxSvc.updateCtx('commandLabels', true);
    this.appCtxSvc.updateCtx('toggleLabel', true);
  };

  cepAuthenticator.prototype.getUrlParamVal = function (paramName, params) {
    var param = params.match(paramName + "=([^&?]+)");
    if (param) return param[1];
    return null;
  };

  return cepAuthenticator;
}();

define(['app', 'js/messagingService', 'js/cepLoginService'], function (app) {
  app.factory('cepAuthenticator', ['$q', '$window', 'cepLoginService', 'appCtxService', 'messagingService', 'cepSwacService', function ($q, $window, loginService, appCtxService, msgSvc, cepSwacSvc) {
    return new cepAuthenticator($q, $window, loginService, appCtxService, msgSvc, cepSwacSvc);
  }]);
  return {
    moduleServiceNameToInject: 'cepAuthenticator'
  };
});