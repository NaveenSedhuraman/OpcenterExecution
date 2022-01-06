class CepSwacService implements ICepSwacService {
    constructor(private momSwacSvc:IMomSwacService) { }

    sendNavigateRouteToCEP(navigateTo:{"value"}) {
        return this.momSwacSvc.navigateToUrl(navigateTo);
    }
}


define(['app', 'js/mom.swac.compatibility.service'], function (app) {
    'use strict';
    app.factory('cepSwacService', ['momSwacCompatibilityService', (momSwacSvc) => new CepSwacService(momSwacSvc)]);
    return {
        moduleServiceNameToInject: 'cpmCommandService'
    };
});