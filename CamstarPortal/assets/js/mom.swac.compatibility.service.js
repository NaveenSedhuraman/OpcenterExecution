"use strict";

// Copyright 2019 Siemens AG

/*global
 define,
 window
 */

/**
 * Register all SWAC services and retrieves all SWAC interfaces necessary to manage MOM SWAC Screens.
 *
 * More specifically, the following services will be registered via the  [init](#.init) method:
 *
 * * {@link module:"MOM.UI.Busy"|MOM.UI.Busy}
 * * {@link module:"MOM.UI.Confirmation"|MOM.UI.Confirmation}
 * * {@link module:"MOM.UI.Error"|MOM.UI.Error}
 * * {@link module:"MOM.UI.Warning"|MOM.UI.Warning}
 * * {@link module:"MOM.UI.EventBus"|MOM.UI.EventBus}
 * * {@link module:"MOM.UI.I18n"|MOM.UI.I18n}
 * * {@link module:"MOM.UI.Navigation"|MOM.UI.Navigation}
 * * {@link module:"MOM.UI.Notification"|MOM.UI.Notification}
 * * {@link module:"MOM.UI.Theme"|MOM.UI.Theme}
 *
 * Additionally, the following SWAC Interfaces are used by this service:
 *
 * * {@link external:"MOM.UI.Localizable"|MOM.UI.Localizable}
 * * {@link external:"MOM.UI.Navigable"|MOM.UI.Navigable}
 * * {@link external:"MOM.UI.Themable"|MOM.UI.Themable}
 *
 * > **Tip** For more information on how to use this service, see the following pages on the MOM UI Wiki:
 * >
 * > * [SWAC Compatibility Module](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/swac-compatibility-module)
 * > * [How to use the SWAC Compatibility Module](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/how-to-use-the-swac-compatibility-module)
 * @module "js/mom.swac.compatibility.service"
 * @requires app
 * @requires js/eventBus
 * @requires js/logger
 * @requires @swac/container
 * @requires js/mom.swac.eventBus.service
 * @requires js/configurationService
 * @requires js/appCtxService
 * @requires js/mom.utils.service
 * @requires js/mom.swac.error.service
 * @requires js/mom.swac.warning.service 
 * @requires js/mom.swac.theme.service
 * @requires js/mom.swac.i18n.service
 * @requires js/mom.swac.busy.service
 * @requires js/mom.swac.navigation.service
 * @requires js/mom.swac.confirmation.service
 * @requires js/mom.swac.notification.service
 */

/**
 * SWAC Interface used to set and retrieve the theme of a SWAC Screen.
 * @external "MOM.UI.Themable"
 */

/**
 * Retrieves the current theme of the SWAC Screen.
 * @function external:"MOM.UI.Themable"#getTheme
 * @returns {Promise<String>} The ID of the current theme used by the SWAC Screen wrapped in a Promise.
 *
 */

/**
 * Sets the theme of the SWAC Screen
 * @function external:"MOM.UI.Themable"#setTheme
 * @param {String} theme The ID of the theme.
 * @returns {Promise} A promise fulfilled if the operation was successful.
 */

/**
 * SWAC Interface used to set and retrieve the locale of a SWAC Screen.
 * @external "MOM.UI.Localizable"
 */

/**
 * Retrieves the current locale of the SWAC Screen.
 * @function external:"MOM.UI.Localizable"#getLocale
 * @returns {Promise<String>} The ID of the current locale used by the SWAC Screen wrapped in a Promise.
 *
 */

/**
 * Sets the locale of the SWAC Screen
 * @function external:"MOM.UI.Localizable"#setLocale
 * @param {String} locale The ID of the locale, e.g. **en_US**.
 * @returns {Promise} A promise fulfilled if the operation was successful.
 */

/**
 * SWAC Interface used to set and retrieve the location (SWAC Component URL) of a SWAC Screen.
 * @external "MOM.UI.Navigable"
 */

/**
 * Retrieves the absolute URL of the SWAC Screen.
 * @function external:"MOM.UI.Navigable"#getLocation
 * @returns {Promise<String>} The absolute URL of the SWAC Screen wrapped in a Promise.
 *
 */

/**
 * Sets the URL of the SWAC Screen, forcing a new SWAC Screen to be loaded.
 * @function external:"MOM.UI.Navigable"#navigateTo
 * @param {String} screen The full absolute URL of a valid SWAC Screen to display.
 * @returns {Promise} A promise fulfilled if the operation was successful.
 */
define(['app', 'js/eventBus', 'js/logger', '@swac/container', 'js/mom.swac.eventBus.service', 'js/browserUtils', 'js/configurationService', 'js/appCtxService', 'js/mom.utils.service', 'js/mom.swac.error.service', 'js/mom.swac.warning.service', 'js/mom.swac.theme.service', 'js/mom.swac.i18n.service', 'js/mom.swac.busy.service', 'js/mom.swac.navigation.service', 'js/mom.swac.confirmation.service', 'js/mom.swac.notification.service'], function (app, eventBus, logger, SWACKit, SwacEventBus, browserUtils) {
  'use strict';

  var exports = {
    component: null,
    // the current exports.SWAC Screen Component
    initialized: false,
    SWAC: new SWACKit()
  };

  var _momUtilsService;

  var _$q;

  var _configurationService;

  var _appCtxService;

  var _swacBusyService;

  var _swacConfirmationService;

  var _swacErrorService;

  var _swacWarningService;

  var _swacI18nService;

  var _swacNavigationService;

  var _swacNotificationService;

  var _swacThemeService;

  var momSwacScreens = browserUtils.getUrlAttributes().momSwacScreens;

  exports._registerServices = function () {
    //eslint-disable-line valid-jsdoc, require-jsdoc
    exports.SWAC.Services.register('MOM.UI.Error', _swacErrorService);
    exports.SWAC.Services.register('MOM.UI.Warning', _swacWarningService);
    exports.SWAC.Services.register('MOM.UI.Theme', _swacThemeService);
    exports.SWAC.Services.register('MOM.UI.I18n', _swacI18nService);
    exports.SWAC.Services.register('MOM.UI.Busy', _swacBusyService);
    exports.SWAC.Services.register('MOM.UI.Navigation', _swacNavigationService);
    exports.SWAC.Services.register('MOM.UI.Confirmation', _swacConfirmationService);
    exports.SWAC.Services.register('MOM.UI.Context', _appCtxService);
    exports.SWAC.Services.register('MOM.UI.EventBus', new SwacEventBus());
    exports.SWAC.Services.register('MOM.UI.Notification', _swacNotificationService);
  };

  exports._registerComponent = function (event) {
    var name = event.data.name;
    exports.component = exports.SWAC.Container.get({
      name: name
    });
  };

  exports._dispatchEvent = function (event) {
    document.querySelector('iframe[name="' + exports.component.name() + '"]').dispatchEvent(event);
  };

  exports._registerMouseEvents = function () {
    exports.component.onMouseEvents.subscribe(exports._dispatchEvent, ['click', 'doubleclick', 'mousedown', 'mouseup']);
  };

  exports._unregisterMouseEvents = function () {
    exports.component.onMouseEvents.unsubscribe(exports._dispatchEvent);
  };

  exports._cleanup = function () {
    exports._unregisterMouseEvents();
  };

  exports._showComponent = function () {
    logger.info('Component ready: ' + exports.component.name());

    var themePromise = exports._setTheme();

    var localePromise = exports._setLocale();

    var swacStatePromise = exports._initializeSwacState();

    exports.SWAC.Container.onRemoved.subscribe(exports._cleanup);

    exports._registerMouseEvents();

    _$q.all([themePromise, localePromise, swacStatePromise]).then(function () {
      exports.component.beginShow(true);
    }, function () {
      //expect all interfaces tobe present, but show the component even if one or more interfaces are missing
      exports.component.beginShow(true);
    });
  };

  exports._initializeComponent = function () {
    //eslint-disable-line valid-jsdoc, require-jsdoc
    exports.SWAC.Container.onCreated.subscribe(function (event) {
      logger.info('Component created: ' + event.data.name);

      exports._registerComponent(event);

      exports.component.onReady.subscribe(function () {
        exports._showComponent();

        eventBus.publish('mom.swac.screen.loadEnd', {
          name: event.data.name
        });
      });
    }); //adjust component theme when container theme changes

    eventBus.subscribe('ThemeChangeEvent', function () {
      exports._setTheme(exports.component);
    });
  };

  exports._setTheme = function () {
    //eslint-disable-line valid-jsdoc, require-jsdoc
    var defer = _$q.defer();

    if (exports.component.interfaces.has('MOM.UI.Themable')) {
      exports.component.interfaces.beginGet('MOM.UI.Themable').then(function (interf) {
        return interf.getTheme().then(function (theme) {
          interf.setTheme(theme).then(function () {
            defer.resolve();
          });
        }, function (error) {
          logger.warn(error);
        });
      }, function (reason) {
        logger.warn(reason);
      });
    }

    return defer.promise;
  };

  exports._setLocale = function () {
    //eslint-disable-line valid-jsdoc, require-jsdoc
    var defer = _$q.defer();

    if (exports.component.interfaces.has('MOM.UI.Localizable')) {
      exports.component.interfaces.beginGet('MOM.UI.Localizable').then(function (interf) {
        return interf.getLocale().then(function (locale) {
          interf.setLocale(locale).then(function () {
            defer.resolve();
          });
        }, function (error) {
          logger.warn(error);
        });
      }, function (reason) {
        logger.warn(reason);
      });
    }

    return defer.promise;
  };

  exports._initializeSwacState = function () {
    //eslint-disable-line valid-jsdoc, require-jsdoc
    var defer = _$q.defer();

    _configurationService.getCfg(momSwacScreens || 'mom-swac-screens').then(function (cfg) {
      var state = cfg.screens[exports.component.name()];

      if (cfg.componentUrl) {
        if (exports.component.interfaces.has('MOM.UI.Navigable')) {
          exports.component.interfaces.beginGet('MOM.UI.Navigable').then(function (interf) {
            return interf.navigateToState(state);
          }, function (reason) {
            logger.warn(reason);
          });
        }
      }
    });

    return defer.promise;
  };
  /**
   * Navigates to a SWAC Screen defined in the **mom-swac-screen.json** file specifying its ID.
   *
   * Note that:
   *
   * * If the specified screen is part of the currently-loaded SWAC Screen component, the navigation will be delegated to the current component.
   * * If the specified screen belongs to another SWAC Screen component, the new component will be loaded.
   *
   * A screen is considered to be part of the current component if its URL (up to the fragment) matches the URL of the current component.
   *
   * @param {String} screen The ID of the SWAC Screen to navigate to.
   */


  exports.navigateTo = function (screen) {
    _configurationService.getCfg(momSwacScreens || 'mom-swac-screens').then(function (cfg) {
      var currUrl = cfg.screens[exports.component.name()];
      var newUrl = cfg.screens[screen];

      var navigateToComponent = function navigateToComponent(notify) {
        _momUtilsService.navigateTo('momSwacSublocation', {
          screen: screen
        }, {
          notify: notify,
          reload: notify
        });
      };

      var navigateTo = function navigateTo(url) {
        //eslint-disable-line valid-jsdoc, require-jsdoc
        var defer = _$q.defer();

        if (exports.component.interfaces.has('MOM.UI.Navigable')) {
          exports.component.interfaces.beginGet('MOM.UI.Navigable').then(function (interf) {
            return interf.navigateTo(url);
          }, function (reason) {
            logger.warn(reason);
          });
        }

        return defer.promise;
      };

      if (currUrl.match(newUrl.replace(/#.+$/, ''))) {
        // Update container fragment
        navigateToComponent(false); // Navigate internally

        navigateTo(newUrl);
      } else {
        navigateToComponent(true);
      }
    });
  };
  /**
   * Navigates to a SWAC Screen accessible at the specified **url**.
   * @param {String} url The URL of the SWAC Screen to navigate to.
   */


  exports.navigateToUrl = function (url) {
    if (exports.component.interfaces.has('MOM.UI.Navigable')) {
      exports.component.interfaces.beginGet('MOM.UI.Navigable').then(function (interf) {
        return interf.navigateTo(url).then(function () {
          _$q.defer().resolve();
        }, function (error) {
          logger.warn(error);
        });
      }, function (reason) {
        logger.warn(reason);
      });
    } else {
      logger.warn("Mom.UI.Navigable is not defined. Unable to call navigateToUrl method.");
    }
  };
  /**
   * Navigates to a SWAC Screen accessible at the specified **state**.
   *
   * > **Note:** This method should only be used when there is no need to specify an URL for a new SWAC component when performing internal navigation within the same component.
   * @param {String} state The state name of the SWAC Screen to navigate to.
   */


  exports.navigateToState = function (state) {
    _configurationService.getCfg(momSwacScreens || 'mom-swac-screens').then(function (cfg) {
      var newState = cfg.screens[state];

      var navigateToComponent = function navigateToComponent(notify) {
        _momUtilsService.navigateTo('momSwacSublocation', {
          screen: state
        }, {
          notify: notify,
          reload: notify
        });
      };

      var navigateToState = function navigateToState(state) {
        //eslint-disable-line valid-jsdoc, require-jsdoc
        var defer = _$q.defer();

        if (exports.component.interfaces.has('MOM.UI.Navigable')) {
          exports.component.interfaces.beginGet('MOM.UI.Navigable').then(function (interf) {
            return interf.navigateToState(state);
          }, function (reason) {
            logger.warn(reason);
          });
        }

        return defer.promise;
      };

      navigateToComponent(false);
      navigateToState(newState);
    });
  };
  /**
   * Initializes all the MOM SWAC Services and the SWAC Screen Component to display on the page.
   */


  exports.init = function () {
    if (!exports.initialized) {
      exports._registerServices();

      exports._initializeComponent();

      exports.initialized = true;
    }
  };

  app.factory('momSwacCompatibilityService', ['$q', 'configurationService', 'appCtxService', 'momUtilsService', 'momSwacErrorService', 'momSwacWarningService', 'momSwacThemeService', 'momSwacI18nService', 'momSwacBusyService', 'momSwacNavigationService', 'momSwacConfirmationService', 'momSwacNotificationService', function ($q, configurationService, appCtxService, momUtilsService, swacErrorService, swacWarningService, swacThemeService, swacI18nService, swacBusyService, swacNavigationService, swacConfirmationService, swacNotificationService) {
    _$q = $q;
    _configurationService = configurationService;
    _momUtilsService = momUtilsService;
    _swacErrorService = swacErrorService;
    _swacWarningService = swacWarningService;
    _swacThemeService = swacThemeService;
    _swacI18nService = swacI18nService;
    _swacBusyService = swacBusyService;
    _swacNavigationService = swacNavigationService;
    _swacConfirmationService = swacConfirmationService;
    _appCtxService = appCtxService;
    _swacNotificationService = swacNotificationService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momSwacCompatibilityService'
  };
});