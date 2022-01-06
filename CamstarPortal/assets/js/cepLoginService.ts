class UserProfile {
    constructor(profile) {
        this.Name = profile.username.dbValue;
        this.Password = {
            Value: profile.password.dbValue,
            IsEncrypted: false
        };
        this.Domain = profile.domain.dbValue;
        if (profile["options:language"])
            this.Dictionary = profile["options:language"].dbValue;

        if (profile["options:timezone"] && typeof profile["options:timezone"].dbValue != "undefined")
            this.UTCOffset = profile["options:timezone"].dbValue;
        else {
            var dt = new Date();
            var offset = dt.getTimezoneOffset() * -1;
            this.UTCOffset = offset.toString();
        } 
    }

    Name: string;
    Password: any;
    Domain: string;
    UTCOffset: string;
    Dictionary: string;
}

class LoginService {
    constructor(
        private $http: INgHttp,
        private $q: INgQ,
        private $window: any,
        private appCtxSvc: any,
        private msgSvc: any,
        private statusSvc: any,
        private cepPortalSvc: any) { }


    login(request) {
        let loginUrl = this.portalUrl + 'Logon';
        this.statusSvc.showLoader();
        this.appCtxSvc.registerCtx('momDisableLogin', true);
        return this.$http.post(loginUrl, request, { withCredentials: false, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
            .then(resp => {
                if (resp.data.LogonResult.IsSuccess) {
                    return this.initAfterLogin();                   
                }
                else {
                    this.appCtxSvc.updateCtx('momDisableLogin', false);
                    this.msgSvc.showError(resp.data.LogonResult.ExceptionData.Description);
                }
            })
            .catch((error) => {
                this.appCtxSvc.updateCtx('momDisableLogin', false);
                if (error.status == 405)
                    this.msgSvc.showError("Error 405: Login Server Down", error);
                else
                    this.msgSvc.showError("Error", error);
            });
    }

    loginWithForm(data) {
        let userProfile = new UserProfile(data);
        let request = {
            domain: data.domain.dbValue,
            profile: userProfile,
        }
        return this.login(request);
    }
    logout() {
        let logoutUrl = this.portalUrl + 'Logout';
        return this.$http.post(logoutUrl, null, { withCredentials: false, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
            .then(resp => {
                if (resp.data.LogoutResult.IsSuccess) {
                    this.$q.resolve(true);
                }
                else {
                    this.msgSvc.showError(resp.data.LogoutResult.ExceptionData.Description);
                }
            })
            .catch(error => {
                this.msgSvc.showError("Error", error);
            })
    }
    getLoginSettings(data: any) {
        let loginSettingsUrl = this.portalUrl + "GetLoginSettings";
        return this.$http.post(loginSettingsUrl, null, { withCredentials: false, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
            .then((resp) => {
                let result = resp.data.GetLoginSettingsResult;
                if (result) {
                    if(result.domainSettingsField) {
                        let domainVals = this.populateListValues(result.domainSettingsField.domainsField);
                        data.domainValues = domainVals;
                        if(domainVals.dbValue.length > 0) {
                            data.domain.emptyLOVEntry = false;
                            data.domain.dbValue = domainVals.dbValue[0].propInternalValue;
                            data.domain.uiValue = domainVals.dbValue[0].dispValue;
                        }
                    }
                    if(result.languageSettingsField) {
                        let languageVals = this.populateListValues(result.languageSettingsField.languagesField);
                        data.languageValues = languageVals; 
                        if(languageVals.dbValue.length > 0) {
                            data.languageValues.dbValue.unshift({propDisplayValue: "", dispValue: "", propInternalValue: ""});

                            data["options:language"].emptyLOVEntry = false;
                            data["options:language"].dbValue = languageVals.dbValue[0].propInternalValue;
                            data["options:language"].uiValue = languageVals.dbValue[0].dispValue;
                        }
                    }
                    if(result.timeZoneSettingsField) {
                        let timezoneVals = this.populateTimeZoneValues(result.timeZoneSettingsField.timeZonesField);
                        data.timezoneValues = timezoneVals;
                        if(timezoneVals.dbValue.length > 0) {
                            var dt = new Date();
                            var clientOffset = (dt.getTimezoneOffset() * -1);
                            var defaultOffsetIndex = 0;

                            timezoneVals.dbValue.forEach((element, index) => {
                                if (element.propInternalValue == clientOffset) {
                                    defaultOffsetIndex = index;
                                }
                            });

                            data["options:timezone"].emptyLOVEntry = false;
                            data["options:timezone"].dbValue = timezoneVals.dbValue[defaultOffsetIndex].propInternalValue;
                            data["options:timezone"].uiValue = timezoneVals.dbValue[defaultOffsetIndex].dispValue; 
                        }
                    }
                    data.themeValues = this.populateListValues(result.themeSettingsField.themesField);
                    return data;
                }
                console.warn(resp.data.GetLoginSettingsResult.ExceptionData.Description);
                return this.$q.reject();
            },
                (error) => {
                    return {};
                })
    }

    public initAfterLogin(){
        return this.cepPortalSvc.getApolloSettings().then(() => {
            return this.cepPortalSvc.initialize().then(() => {
                this.$window.location.href = this.getSWACComponentLocation();
                // remove local storage item
                localStorage.removeItem('displayMode');
                return this.$q.resolve();
            });
        });                        

    }

    private getSWACComponentLocation(): string {
        let location = this.$window.location;
        const displayMode = localStorage.getItem('displayMode');
        if (displayMode == 'classic') 
            return "./Default.aspx?apolloLink=true&mode=classic&theme=Camstar"; 
        if (displayMode == 'mobile' || this.isMobile())
            return "./Default.aspx?apolloLink=true&mode=mobile";
        //Apollo is default
        return location.origin + location.pathname + "#/screen/apollo";
    }

    private isMobile(): boolean {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }

    private populateTimeZoneValues(valueList: any) {
        let resultListVal = {
            "type": "STRING",
            "dbValue": []
        }
        if(valueList && valueList.length > 0) {
            valueList.map(({ nameField, offsetField }) => {
                let displayVal = `(GMT${offsetField}) ${nameField}`;
                let intValue = parseInt(offsetField.substring(0, offsetField.indexOf(':'))) * 60;
                resultListVal.dbValue.push(
                    {
                        "propDisplayValue": displayVal,
                        "dispValue": displayVal,
                        "propInternalValue": intValue
                    }
                )
            });
        }
        return resultListVal;
    }
    private populateListValues(valueList: any) {
        let resultListVal = {
            "type": "STRING",
            "dbValue": []
        }
        if(valueList && valueList.length > 0) {
            valueList.map(({ nameField, offsetField }) => {
                resultListVal.dbValue.push(
                    {
                        "propDisplayValue": nameField,
                        "dispValue": nameField,
                        "propInternalValue": offsetField ? offsetField : nameField
                    }
                )
            });
        }
        return resultListVal;
    }

    verifyLogon() {
        let verifyUrl = this.portalUrl + 'VerifyLogon';
        this.statusSvc.showLoader();
        return this.$http.post(verifyUrl, null, { withCredentials: false, headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json', 
                'Hash': window.location.hash
             }})
            .then((resp) => {
                this.statusSvc.hideLoader();
                return resp;
            });
    }
    private portalUrl = './ApolloPortalService.svc/web/';
}


define(['app', 'js/messagingService', 'js/statusService', 'js/cepPortalService'], function (app) {
    'use strict';
    app.factory('cepLoginService', ['$http', '$q', '$window', 'appCtxService', 'messagingService', 'statusService', 'cepPortalService',
        ($http, $q, $window, appCtxSvc, msgSvc, statusSvc, cepPortalSvc) => new LoginService($http, $q, $window, appCtxSvc, msgSvc, statusSvc, cepPortalSvc)]);
    return {
        moduleServiceNameToInject: 'cepLoginService'
    };
});
