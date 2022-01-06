class cepAuthenticator {
    constructor(private $q: any, private $window: any, private loginSvc: any, private appCtxSvc: any, private msgSvc: any, private cepSwacSvc: any) {
        this.q = $q;
        this.window = $window;
    }

    checkIfSessionAuthenticated() {
        this.appCtxSvc.updateCtx('commandLabels', true);
        this.appCtxSvc.updateCtx('toggleLabel', true)        

        return this.loginSvc.verifyLogon()
            .then(resp => {
                if (resp.data.VerifyLogonResult.IsSuccess) {
                    // Proceed initialization on alive session
                    this.initializeRedirect();                                                                        
                    return this.loginSvc.initAfterLogin();
                }
                else {
                    console.warn(resp.data.VerifyLogonResult.ExceptionData.Description);
                    return this.q.reject();
                }
            });
    }

    private initializeRedirect() {
        let urlParams = window.location.search;
        if (urlParams) {
            localStorage.setItem('params', urlParams);
            var mode = this.getUrlParamVal('mode', urlParams);         
            if (mode) {
                localStorage.setItem('displayMode', mode)
            }
        }
    }

    authenticate() {
        //inits data for portal
        this.initializeData();

        this.window.location.href = this.window.location.origin + this.window.location.pathname + "#/login" + this.window.location.search;
        return this.q.resolve();
    }

    postAuthInitialization() {
        return this.q.resolve();
    }

    signOut() {
        const userProfileItem = {
            value: 'LOAD_CONFIRMLOGOUT'
        };
        this.cepSwacSvc.sendNavigateRouteToCEP(userProfileItem);
    }

    setScope() {
    }

    private initializeData() {
        let urlParams = window.location.search;
        if (urlParams) {
            // set display mode in local storage since this method is called on route change            
            var mode = this.getUrlParamVal('mode', urlParams);
            if (mode)
                localStorage.setItem('displayMode', mode);
        }
        this.appCtxSvc.updateCtx('commandLabels', true);
        this.appCtxSvc.updateCtx('toggleLabel', true);
    }

    private getUrlParamVal(paramName: string, params: string) {
        let param = params.match(paramName + "=([^&?]+)");
        if (param)
            return param[1];
        return null;
    }

    private q: any;
    private window: any;
}

define(['app', 'js/messagingService', 'js/cepLoginService'], function (app) {
    app.factory('cepAuthenticator', ['$q', '$window', 'cepLoginService', 'appCtxService', 'messagingService', 'cepSwacService',
        ($q, $window, loginService, appCtxService, msgSvc, cepSwacSvc) => new cepAuthenticator($q, $window, loginService, appCtxService, msgSvc, cepSwacSvc)]);
    return {
        moduleServiceNameToInject: 'cepAuthenticator'
    };
});