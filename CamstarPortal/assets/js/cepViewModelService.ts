class ViewModelService {
    constructor(private configSvc:any,private apolloViewModelSvc:any) { }

    getViewModel(viewModelName:string) {
        return this.configSvc.getCfg(viewModelName);
    }

    updateViewModel(viewModelName:string, updatedViewModel:any) {
        return this.apolloViewModelSvc.populateViewModelPropertiesFromJson(updatedViewModel, null, null, true, viewModelName);
    }
}

define(['app', 'js/configurationService', 'js/viewModelService'], function (app) {
    'use strict';
    app.factory('cepViewModelService', ['configurationService', 'viewModelService', (configSvc, viewModelSvc) => new ViewModelService(configSvc, viewModelSvc)]);
    return {
        moduleServiceNameToInject: 'cepLabelService'
    };
});