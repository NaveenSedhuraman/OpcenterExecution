"use strict";

var PortalService =
/** @class */
function () {
  function PortalService($http, $q, appCtxSvc, msgSvc, propSvc, cepCommandSvc, cepLabelSvc, cepViewModelSvc, cepSwacSvc, eventBus) {
    this.$http = $http;
    this.$q = $q;
    this.appCtxSvc = appCtxSvc;
    this.msgSvc = msgSvc;
    this.propSvc = propSvc;
    this.cepCommandSvc = cepCommandSvc;
    this.cepLabelSvc = cepLabelSvc;
    this.cepViewModelSvc = cepViewModelSvc;
    this.cepSwacSvc = cepSwacSvc;
    this.eventBus = eventBus;
    this.isPanelVisible = "isPageListPanelVisible";
    this.portalUrl = './ApolloPortalService.svc/web/';
    this.eventBus.subscribe('cep.header.update', function (header) {
      cepCommandSvc.setHeader(header.name, header.key);
      appCtxSvc.updateCtx('location.titles', {
        'headerTitle': cepCommandSvc.headerTitle
      });
    });
    this.eventBus.subscribe('mom.swac.screen.loadEnd', function () {
      var urlParams = localStorage.getItem('params');

      if (urlParams) {
        localStorage.removeItem('params');
        cepSwacSvc.sendNavigateRouteToCEP({
          value: 'REDIRECT_TO',
          params: urlParams
        });
      }
    });
  }

  PortalService.prototype.initialize = function () {
    return this.initializePageList();
  };

  PortalService.prototype.initializePageList = function () {
    var _this = this;

    this.appCtxSvc.registerCtx(this.isPanelVisible, true); // app ctx to override home command

    this.appCtxSvc.registerCtx('cepCommandsOverride', true);
    var verifyUrl = this.portalUrl + 'GetMenuItems';
    return this.$http.post(verifyUrl, null, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(function (resp) {
      if (resp.data.GetMenuItemsResult.IsSuccess) {
        var menuItems = resp.data.menuItems.map(function (item) {
          return _this.convertToProperty(item);
        }); // call Portal API to initialize translated labels

        return _this.getTranslationLabels().then(function () {
          // load line assignment header translations
          _this.cepViewModelSvc.getViewModel('i18n').then(function (i18nViewModel) {
            var viewModel = i18nViewModel;
            viewModel = _this.cepLabelSvc.getTranslatedViewModel('portalMessages', viewModel);

            _this.cepViewModelSvc.updateViewModel('i18n', viewModel).then(function () {
              // load menu         
              return _this.cepCommandSvc.initializeMenu({
                menu: menuItems
              }).then(function (result) {
                if (!result) {
                  console.warn("Error: Menu Loading issue!");
                  return _this.$q.reject();
                } else return _this.$q.resolve();
              });
            });
          });
        });
      } else {
        console.warn(resp.data.GetMenuItemsResult.ExceptionData.Description);
        return _this.$q.reject();
      }
    }, function (error) {
      console.warn("Error: ", error);
      return _this.$q.reject();
    });
  };

  PortalService.prototype.getApolloSettings = function () {
    var _this = this;

    var getUrl = this.portalUrl + 'GetApolloSettings';
    return this.$http.post(getUrl, null, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(function (resp) {
      if (resp.data.GetApolloSettingsResult.IsSuccess) {
        var result = resp.data.settings;
        _this.settings = {
          operation: result.Operation,
          resource: result.Resource,
          workcenter: result.Workcenter,
          workstation: result.Workstation,
          portalStudioAccess: result.PortalStudioAccess
        };
        return _this.settings;
      }
    }, function (error) {
      console.warn("Error: ", error);
      return {};
    });
  };

  PortalService.prototype.getTranslationLabels = function () {
    var _this = this;

    var translationUrl = this.portalUrl + 'GetApolloNavigationLabels';
    var labelsToTranslate = this.cepLabelSvc.getLabelsToTranslate();
    var labelsToSend = {
      "labelsToTranslate": labelsToTranslate
    };
    return this.$http.post(translationUrl, labelsToSend, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(function (translatedLabels) {
      var updatedLabels = translatedLabels.data.labelsToTranslate;
      return _this.cepLabelSvc.initializeTranslations(updatedLabels);
    });
  };

  PortalService.prototype.getPageList = function () {
    return this.$q.resolve(this.cepCommandSvc.getTopLevelMenuItems());
  };

  PortalService.prototype.loadFilterTags = function () {
    this.cepSwacSvc.sendNavigateRouteToCEP({
      value: "LOAD_FILTERTAGS"
    });
    this.closeSideNav();
  };

  PortalService.prototype.loadLineAssignment = function () {
    this.cepSwacSvc.sendNavigateRouteToCEP({
      value: "LOAD_LINEASSIGNMENT"
    });
    this.closeSideNav();
  };

  PortalService.prototype.openPortalStudio = function () {
    if (this.settings.portalStudioAccess) {
      var psVer = top["primaryVisualStudioVersion"];
      if (event.ctrlKey === true) psVer = psVer == 1 ? 2 : 1;
      window.location.href = psVer == 2 ? "PortalStudio/index.html?portalMode=Apollo&wcf=" + escape(top["wcfUrl"]) : "PortalStudio.aspx";
    } else {
      this.msgSvc.showError("The workspace is in CSI Mode, please activate another workspace to login and make changes.", null);
    }
  };

  PortalService.prototype.getLineAssignment = function () {
    return this.settings;
  };

  PortalService.prototype.updateLineAssignment = function (lineAssignment) {
    this.settings.operation = lineAssignment.operation;
    this.settings.resource = lineAssignment.resource;
    this.settings.workcenter = lineAssignment.workcenter;
    this.settings.workstation = lineAssignment.workstation;
    return lineAssignment;
  };

  PortalService.prototype.selectItem = function (item) {
    if (!item.children.length) {
      this.cepSwacSvc.sendNavigateRouteToCEP(item);
      this.cepCommandSvc.addToOpenedMenuItem(item);
      this.closeSideNav();
    }
  };

  PortalService.prototype.updateToplevelMenu = function (menu) {
    var isCommandItem = this.cepCommandSvc.selectTopMenu(menu);

    if (isCommandItem) {
      var commandItem = this.cepCommandSvc.getMenuItem(menu);

      if (commandItem) {
        this.selectItem(commandItem);
      }
    }
  };

  PortalService.prototype.goToUserHomePage = function () {
    var homePage = this.appCtxSvc.getCtx('homePage');

    if (homePage) {
      this.updateToplevelMenu(homePage.propertyDisplayName);
    }
  };

  PortalService.prototype.openUserProfile = function () {
    var userProfileItem = {
      value: 'LOAD_USERPROFILE'
    };
    this.cepSwacSvc.sendNavigateRouteToCEP(userProfileItem);
  };

  Object.defineProperty(PortalService.prototype, "settings", {
    get: function get() {
      var settingsStr = localStorage.getItem('cep-settings');
      return JSON.parse(settingsStr);
    },
    set: function set(value) {
      var settingsStr = JSON.stringify(value);
      localStorage.setItem('cep-settings', settingsStr);
    },
    enumerable: false,
    configurable: true
  });

  PortalService.prototype.closeSideNav = function () {
    this.eventBus.publish('awsidenav.openClose', {
      "id": "globalNavigationSideNav",
      "invokerId": "cmdViewPageMenu",
      "keepOthersOpen": true
    });
  };

  PortalService.prototype.convertToProperty = function (item) {
    var _this = this;

    var prop = this.prop('page', item.DisplayName, 'STRING', item.UIVirtualPageName, item.DisplayName, item.QueryString, item.ApolloIcon, item.IsHomePage);

    if (item.Children.length > 0) {
      prop.children = item.Children.map(function (it) {
        return _this.convertToProperty(it);
      });
    } else {
      prop.children = [];
    }

    prop._data = item;
    return prop;
  };

  PortalService.prototype.prop = function (name, displayName, type, dbValue, uiValue, queryString, apolloIcon, isHomePage) {
    var displayValue = uiValue || dbValue;
    var prop = this.propSvc.createViewModelProperty(name, displayName, type, dbValue, [displayValue]);
    prop.apolloIcon = apolloIcon;
    prop.queryString = queryString; // register user configured home page and return

    if (isHomePage) {
      prop.isHomePage = isHomePage;
      this.appCtxSvc.registerCtx('homePage', prop);
    }

    prop.propApi = {};
    return prop;
  };

  return PortalService;
}();

define(['app', 'js/eventBus', 'js/appCtxService', 'js/messagingService', 'js/uwPropertyService', 'js/cepCommandService', 'js/cepLabelService', 'js/cepViewModelService', 'js/cepSwacService'], function (app, eventBus) {
  'use strict';

  app.factory('cepPortalService', ['$http', '$q', 'appCtxService', 'messagingService', 'uwPropertyService', 'cepCommandService', 'cepLabelService', 'cepViewModelService', 'cepSwacService', function ($http, $q, appCtxSvc, msgSvc, propSvc, cepCommandSvc, cepLabelSvc, cepViewModelSvc, cepSwacSvc) {
    return new PortalService($http, $q, appCtxSvc, msgSvc, propSvc, cepCommandSvc, cepLabelSvc, cepViewModelSvc, cepSwacSvc, eventBus);
  }]);
  return {
    moduleServiceNameToInject: 'cepPortalService'
  };
});