"use strict";

var UserProfile =
/** @class */
function () {
  function UserProfile(profile) {
    this.Name = profile.username.dbValue;
    this.Password = {
      Value: profile.password.dbValue,
      IsEncrypted: false
    };
    this.Domain = profile.domain.dbValue;
    if (profile["options:language"]) this.Dictionary = profile["options:language"].dbValue;
    if (profile["options:timezone"] && typeof profile["options:timezone"].dbValue != "undefined") this.UTCOffset = profile["options:timezone"].dbValue;else {
      var dt = new Date();
      var offset = dt.getTimezoneOffset() * -1;
      this.UTCOffset = offset.toString();
    }
  }

  return UserProfile;
}();

var LoginService =
/** @class */
function () {
  function LoginService($http, $q, $window, appCtxSvc, msgSvc, statusSvc, cepPortalSvc) {
    this.$http = $http;
    this.$q = $q;
    this.$window = $window;
    this.appCtxSvc = appCtxSvc;
    this.msgSvc = msgSvc;
    this.statusSvc = statusSvc;
    this.cepPortalSvc = cepPortalSvc;
    this.portalUrl = './ApolloPortalService.svc/web/';
  }

  LoginService.prototype.login = function (request) {
    var _this = this;

    var loginUrl = this.portalUrl + 'Logon';
    this.statusSvc.showLoader();
    this.appCtxSvc.registerCtx('momDisableLogin', true);
    return this.$http.post(loginUrl, request, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(function (resp) {
      if (resp.data.LogonResult.IsSuccess) {
        return _this.initAfterLogin();
      } else {
        _this.appCtxSvc.updateCtx('momDisableLogin', false);

        _this.msgSvc.showError(resp.data.LogonResult.ExceptionData.Description);
      }
    }).catch(function (error) {
      _this.appCtxSvc.updateCtx('momDisableLogin', false);

      if (error.status == 405) _this.msgSvc.showError("Error 405: Login Server Down", error);else _this.msgSvc.showError("Error", error);
    });
  };

  LoginService.prototype.loginWithForm = function (data) {
    var userProfile = new UserProfile(data);
    var request = {
      domain: data.domain.dbValue,
      profile: userProfile
    };
    return this.login(request);
  };

  LoginService.prototype.logout = function () {
    var _this = this;

    var logoutUrl = this.portalUrl + 'Logout';
    return this.$http.post(logoutUrl, null, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(function (resp) {
      if (resp.data.LogoutResult.IsSuccess) {
        _this.$q.resolve(true);
      } else {
        _this.msgSvc.showError(resp.data.LogoutResult.ExceptionData.Description);
      }
    }).catch(function (error) {
      _this.msgSvc.showError("Error", error);
    });
  };

  LoginService.prototype.getLoginSettings = function (data) {
    var _this = this;

    var loginSettingsUrl = this.portalUrl + "GetLoginSettings";
    return this.$http.post(loginSettingsUrl, null, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(function (resp) {
      var result = resp.data.GetLoginSettingsResult;

      if (result) {
        if (result.domainSettingsField) {
          var domainVals = _this.populateListValues(result.domainSettingsField.domainsField);

          data.domainValues = domainVals;

          if (domainVals.dbValue.length > 0) {
            data.domain.emptyLOVEntry = false;
            data.domain.dbValue = domainVals.dbValue[0].propInternalValue;
            data.domain.uiValue = domainVals.dbValue[0].dispValue;
          }
        }

        if (result.languageSettingsField) {
          var languageVals = _this.populateListValues(result.languageSettingsField.languagesField);

          data.languageValues = languageVals;

          if (languageVals.dbValue.length > 0) {
            data.languageValues.dbValue.unshift({
              propDisplayValue: "",
              dispValue: "",
              propInternalValue: ""
            });
            data["options:language"].emptyLOVEntry = false;
            data["options:language"].dbValue = languageVals.dbValue[0].propInternalValue;
            data["options:language"].uiValue = languageVals.dbValue[0].dispValue;
          }
        }

        if (result.timeZoneSettingsField) {
          var timezoneVals = _this.populateTimeZoneValues(result.timeZoneSettingsField.timeZonesField);

          data.timezoneValues = timezoneVals;

          if (timezoneVals.dbValue.length > 0) {
            var dt = new Date();
            var clientOffset = dt.getTimezoneOffset() * -1;
            var defaultOffsetIndex = 0;
            timezoneVals.dbValue.forEach(function (element, index) {
              if (element.propInternalValue == clientOffset) {
                defaultOffsetIndex = index;
              }
            });
            data["options:timezone"].emptyLOVEntry = false;
            data["options:timezone"].dbValue = timezoneVals.dbValue[defaultOffsetIndex].propInternalValue;
            data["options:timezone"].uiValue = timezoneVals.dbValue[defaultOffsetIndex].dispValue;
          }
        }

        data.themeValues = _this.populateListValues(result.themeSettingsField.themesField);
        return data;
      }

      console.warn(resp.data.GetLoginSettingsResult.ExceptionData.Description);
      return _this.$q.reject();
    }, function (error) {
      return {};
    });
  };

  LoginService.prototype.initAfterLogin = function () {
    var _this = this;

    return this.cepPortalSvc.getApolloSettings().then(function () {
      return _this.cepPortalSvc.initialize().then(function () {
        _this.$window.location.href = _this.getSWACComponentLocation(); // remove local storage item

        localStorage.removeItem('displayMode');
        return _this.$q.resolve();
      });
    });
  };

  LoginService.prototype.getSWACComponentLocation = function () {
    var location = this.$window.location;
    var displayMode = localStorage.getItem('displayMode');
    if (displayMode == 'classic') return "./Default.aspx?apolloLink=true&mode=classic&theme=Camstar";
    if (displayMode == 'mobile' || this.isMobile()) return "./Default.aspx?apolloLink=true&mode=mobile"; //Apollo is default

    return location.origin + location.pathname + "#/screen/apollo";
  };

  LoginService.prototype.isMobile = function () {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return true;
    }

    return false;
  };

  LoginService.prototype.populateTimeZoneValues = function (valueList) {
    var resultListVal = {
      "type": "STRING",
      "dbValue": []
    };

    if (valueList && valueList.length > 0) {
      valueList.map(function (_a) {
        var nameField = _a.nameField,
            offsetField = _a.offsetField;
        var displayVal = "(GMT" + offsetField + ") " + nameField;
        var intValue = parseInt(offsetField.substring(0, offsetField.indexOf(':'))) * 60;
        resultListVal.dbValue.push({
          "propDisplayValue": displayVal,
          "dispValue": displayVal,
          "propInternalValue": intValue
        });
      });
    }

    return resultListVal;
  };

  LoginService.prototype.populateListValues = function (valueList) {
    var resultListVal = {
      "type": "STRING",
      "dbValue": []
    };

    if (valueList && valueList.length > 0) {
      valueList.map(function (_a) {
        var nameField = _a.nameField,
            offsetField = _a.offsetField;
        resultListVal.dbValue.push({
          "propDisplayValue": nameField,
          "dispValue": nameField,
          "propInternalValue": offsetField ? offsetField : nameField
        });
      });
    }

    return resultListVal;
  };

  LoginService.prototype.verifyLogon = function () {
    var _this = this;

    var verifyUrl = this.portalUrl + 'VerifyLogon';
    this.statusSvc.showLoader();
    return this.$http.post(verifyUrl, null, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Hash': window.location.hash
      }
    }).then(function (resp) {
      _this.statusSvc.hideLoader();

      return resp;
    });
  };

  return LoginService;
}();

define(['app', 'js/messagingService', 'js/statusService', 'js/cepPortalService'], function (app) {
  'use strict';

  app.factory('cepLoginService', ['$http', '$q', '$window', 'appCtxService', 'messagingService', 'statusService', 'cepPortalService', function ($http, $q, $window, appCtxSvc, msgSvc, statusSvc, cepPortalSvc) {
    return new LoginService($http, $q, $window, appCtxSvc, msgSvc, statusSvc, cepPortalSvc);
  }]);
  return {
    moduleServiceNameToInject: 'cepLoginService'
  };
});