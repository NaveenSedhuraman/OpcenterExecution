"use strict";

var StatusService =
/** @class */
function () {
  function StatusService(eventBus) {
    this.eventBus = eventBus;
    this.eventBus.subscribe('mom.swac.screen.loadStart', function () {
      eventBus.publish('modal.progress.start');
    });
    this.eventBus.subscribe('mom.swac.screen.loadEnd', function () {
      eventBus.publish('modal.progress.end');
    });
  }

  StatusService.prototype.showLoader = function () {
    this.eventBus.publish('modal.progress.start');
  };

  StatusService.prototype.hideLoader = function () {
    this.eventBus.publish('modal.progress.end');
  };

  return StatusService;
}();

define(['app', 'js/eventBus'], function (app, eventBus) {
  'use strict';

  app.factory('statusService', [function () {
    return new StatusService(eventBus);
  }]);
  return {
    moduleServiceNameToInject: 'statusService'
  };
});