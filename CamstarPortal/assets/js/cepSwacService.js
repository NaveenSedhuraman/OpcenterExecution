"use strict";

var CepSwacService =
/** @class */
function () {
  function CepSwacService(momSwacSvc) {
    this.momSwacSvc = momSwacSvc;
  }

  CepSwacService.prototype.sendNavigateRouteToCEP = function (navigateTo) {
    return this.momSwacSvc.navigateToUrl(navigateTo);
  };

  return CepSwacService;
}();

define(['app', 'js/mom.swac.compatibility.service'], function (app) {
  'use strict';

  app.factory('cepSwacService', ['momSwacCompatibilityService', function (momSwacSvc) {
    return new CepSwacService(momSwacSvc);
  }]);
  return {
    moduleServiceNameToInject: 'cpmCommandService'
  };
});