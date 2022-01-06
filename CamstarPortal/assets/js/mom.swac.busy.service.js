"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * This SWAC Service provides a way to show and hide a modal busy indicator from a SWAC Component.
 * @module "js/mom.swac.busy.service"
 * @name "MOM.UI.Busy"
 * @requires app
 * @requires js/eventBus
 */
define(['app', 'js/eventBus'], //
function (app, eventBus) {
  'use strict';

  var exports = {};
  /**
   * Shows a modal busy indicator.
   */

  exports.show = function () {
    eventBus.publish('modal.progress.start');
  };
  /**
   * Hides a modal busy indicator.
   */


  exports.hide = function () {
    eventBus.publish('modal.progress.end');
  };

  app.factory('momSwacBusyService', [function () {
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momSwacBusyService'
  };
});