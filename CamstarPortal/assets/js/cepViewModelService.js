"use strict";

var ViewModelService =
/** @class */
function () {
  function ViewModelService(configSvc, apolloViewModelSvc) {
    this.configSvc = configSvc;
    this.apolloViewModelSvc = apolloViewModelSvc;
  }

  ViewModelService.prototype.getViewModel = function (viewModelName) {
    return this.configSvc.getCfg(viewModelName);
  };

  ViewModelService.prototype.updateViewModel = function (viewModelName, updatedViewModel) {
    return this.apolloViewModelSvc.populateViewModelPropertiesFromJson(updatedViewModel, null, null, true, viewModelName);
  };

  return ViewModelService;
}();

define(['app', 'js/configurationService', 'js/viewModelService'], function (app) {
  'use strict';

  app.factory('cepViewModelService', ['configurationService', 'viewModelService', function (configSvc, viewModelSvc) {
    return new ViewModelService(configSvc, viewModelSvc);
  }]);
  return {
    moduleServiceNameToInject: 'cepLabelService'
  };
});