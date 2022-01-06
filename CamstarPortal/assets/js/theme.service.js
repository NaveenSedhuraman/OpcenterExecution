"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines {@link themeService} which manages themes.
 *
 * @module js/theme.service
 */
define(['app', 'angular', 'js/eventBus', 'js/appCtxService', 'js/configurationService', 'js/localStorage'], function (app, ngModule, eventBus) {
  'use strict';
  /**
   * Theme service to manage themes
   *
   * @class themeService
   * @memberOf NgServices
   */

  app.service('themeService', ['appCtxService', 'configurationService', 'localStorage', function (appCtxService, configurationService, localStorage) {
    var self = this;
    /**
     * The theme link element
     */

    var themeLink = null;
    /**
     * Theme context
     */

    var themeContext = 'theme';
    /**
     * Initialize the theme service
     */

    self.init = function () {
      if (!themeLink) {
        themeLink = document.createElement('link');
        themeLink.type = 'text/css';
        themeLink.rel = 'stylesheet';
        themeLink.id = 'theme';
        ngModule.element('head').append(themeLink);
        localStorage.subscribe(themeContext, function (event) {
          self.setTheme(event.newValue);
        });
      }

      self.setInitialTheme();
    };
    /**
     * Set the theme to the theme in local storage or the default theme
     */


    self.setInitialTheme = function () {
      var localTheme = self.getLocalStorageTheme();

      if (localTheme) {
        self.setTheme(localTheme);
      } else {
        self.getDefaultTheme().then(self.setTheme);
      }
    };
    /**
     * Get the current theme from local storage
     *
     * @return {String} The theme in local storage
     */


    self.getLocalStorageTheme = function () {
      return localStorage.get(themeContext);
    };
    /**
     * Get the default theme defined by the workspace
     *
     * @param newTheme {String} - The new theme
     *
     * @return {String} The default workspace theme
     */


    self.getDefaultTheme = function () {
      return configurationService.getCfg('solutionDef').then(function (solutionDef) {
        return solutionDef.defaultTheme ? solutionDef.defaultTheme : 'ui-lightTheme';
      });
    };
    /**
     * Set the current theme
     *
     * @example themeService.setTheme( 'ui-lightTheme' )
     *
     * @param newTheme {String} - The new theme
     */


    self.setTheme = function (newTheme) {
      if (self.getTheme() !== newTheme) {
        themeLink.href = app.getBaseUrlPath() + '/' + newTheme + '.css';
        appCtxService.registerCtx(themeContext, newTheme);
        localStorage.publish(themeContext, newTheme);
        eventBus.publish('ThemeChangeEvent', {
          theme: newTheme
        });
      }
    };
    /**
     * Get the current theme
     *
     * @return {String} The current theme
     */


    self.getTheme = function () {
      return appCtxService.getCtx(themeContext);
    };
  }]);
  return {
    moduleServiceNameToInject: 'themeService'
  };
});