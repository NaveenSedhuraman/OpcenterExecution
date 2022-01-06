"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines the {@link NgControllers.RedirectCtrl}
 * @module js/aw.redirect.controller
 */
define(['app'], function (app) {
  'use strict';
  /**
   * Redirect controller.
   *
   * @class RedirectCtrl
   * @memberOf NgControllers
   */

  app.controller('RedirectCtrl', ['$state', function RedirectController($state) {
    $state.go($state.current.data.to, $state.current.data.toParams, $state.current.data.options);
  }]);
});