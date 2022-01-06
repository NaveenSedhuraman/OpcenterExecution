class PortalService {
    constructor(private $http: INgHttp,
        private $q: INgQ,
        private appCtxSvc: IAppCtxService,
        private msgSvc: IMessageService,
        private propSvc: IPropertyService,
        private cepCommandSvc: ICepCommandService,
        private cepLabelSvc: ICepLabelService,
        private cepViewModelSvc: ICepViewModelService,
        private cepSwacSvc: ICepSwacService,
        private eventBus: IEventBus) {
        this.eventBus.subscribe('cep.header.update', function (header) {
            cepCommandSvc.setHeader(header.name, header.key);
            appCtxSvc.updateCtx('location.titles', { 'headerTitle': cepCommandSvc.headerTitle });
        });
        this.eventBus.subscribe('mom.swac.screen.loadEnd', function () {
            var urlParams = localStorage.getItem('params');
            if (urlParams) {
                localStorage.removeItem('params');
                cepSwacSvc.sendNavigateRouteToCEP({ value: 'REDIRECT_TO', params: urlParams });
            }
        });
    }

    initialize() {
            return this.initializePageList();             
    }

    initializePageList() {
        this.appCtxSvc.registerCtx(this.isPanelVisible, true);
        // app ctx to override home command
        this.appCtxSvc.registerCtx('cepCommandsOverride', true);
        let verifyUrl = this.portalUrl + 'GetMenuItems';

        return this.$http.post(verifyUrl, null, { withCredentials: false, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
            .then((resp) => {
                if (resp.data.GetMenuItemsResult.IsSuccess) {                    
                    var menuItems = resp.data.menuItems.map(item => {
                        return this.convertToProperty(item);
                    });
                    // call Portal API to initialize translated labels
                    return this.getTranslationLabels().then(() => {
                        // load line assignment header translations
                        this.cepViewModelSvc.getViewModel('i18n').then(i18nViewModel => {    
                            let viewModel = i18nViewModel;                       
                            viewModel = this.cepLabelSvc.getTranslatedViewModel('portalMessages', viewModel);
                            this.cepViewModelSvc.updateViewModel('i18n', viewModel).then(() => {
                                // load menu         
                                return this.cepCommandSvc.initializeMenu({ menu: menuItems }).then(result => {
                                    if (!result) {
                                        console.warn("Error: Menu Loading issue!");
                                        return this.$q.reject();
                                    }
                                    else
                                        return this.$q.resolve();
                                }); 
                            });          
                        });
                    });

                }
                else {
                    console.warn(resp.data.GetMenuItemsResult.ExceptionData.Description);
                    return this.$q.reject();
                }
            },
            (error) => {
                console.warn("Error: ", error);
                return this.$q.reject();
            });
    }

    getApolloSettings() {
        let getUrl = this.portalUrl + 'GetApolloSettings';
        return this.$http.post(getUrl, null, { withCredentials: false, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
            .then((resp) => {
                if (resp.data.GetApolloSettingsResult.IsSuccess) {
                    var result = resp.data.settings;
                    this.settings = {
                        operation: result.Operation,
                        resource: result.Resource,
                        workcenter: result.Workcenter,
                        workstation: result.Workstation,
                        portalStudioAccess: result.PortalStudioAccess                        
                    }
                    return this.settings;
                }
            },
            (error) => {
                console.warn("Error: ", error);
                return {};
            });
    }

    getTranslationLabels() {
        let translationUrl = this.portalUrl + 'GetApolloNavigationLabels';
        const labelsToTranslate = this.cepLabelSvc.getLabelsToTranslate();
        const labelsToSend = {
            "labelsToTranslate": labelsToTranslate
        };
        return this.$http.post(translationUrl, labelsToSend, { withCredentials: false, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
            .then((translatedLabels) => {
                const updatedLabels = translatedLabels.data.labelsToTranslate;
                return this.cepLabelSvc.initializeTranslations(updatedLabels);
            });
    }

    getPageList() {
        return this.$q.resolve(this.cepCommandSvc.getTopLevelMenuItems());
    }

    loadFilterTags() {
        this.cepSwacSvc.sendNavigateRouteToCEP({ value: "LOAD_FILTERTAGS" });
        this.closeSideNav();
    }

    loadLineAssignment() {
        this.cepSwacSvc.sendNavigateRouteToCEP({ value: "LOAD_LINEASSIGNMENT" });
        this.closeSideNav();
    }

    openPortalStudio() {
        if (this.settings.portalStudioAccess){
            let psVer = top["primaryVisualStudioVersion"];
            if( (<KeyboardEvent>event).ctrlKey === true) 
                psVer = psVer == 1 ? 2 : 1;
	
            window.location.href = psVer == 2 ?
                    ("PortalStudio/index.html?portalMode=Apollo&wcf="+escape(top["wcfUrl"])) :
                    "PortalStudio.aspx";
        }
        else {
            this.msgSvc.showError("The workspace is in CSI Mode, please activate another workspace to login and make changes.", null);
        }
    }

    getLineAssignment() {
        return this.settings;
    }

    updateLineAssignment(lineAssignment) {
        this.settings.operation = lineAssignment.operation;
        this.settings.resource = lineAssignment.resource;
        this.settings.workcenter = lineAssignment.workcenter;
        this.settings.workstation = lineAssignment.workstation;
        return lineAssignment;
    }

    selectItem(item: any) {
        if (!item.children.length) {
            this.cepSwacSvc.sendNavigateRouteToCEP(item);
            this.cepCommandSvc.addToOpenedMenuItem(item);
            this.closeSideNav();
        }
    }

    updateToplevelMenu(menu: string) {
        const isCommandItem = this.cepCommandSvc.selectTopMenu(menu);
        if (isCommandItem) {
            const commandItem = this.cepCommandSvc.getMenuItem(menu);
            if (commandItem) {
                this.selectItem(commandItem);
            }
        }
    }

    goToUserHomePage() {
        const homePage = this.appCtxSvc.getCtx('homePage');
        if (homePage) {
            this.updateToplevelMenu(homePage.propertyDisplayName);
        }
    }

    openUserProfile() {
        const userProfileItem = {
            value: 'LOAD_USERPROFILE'
        };
        this.cepSwacSvc.sendNavigateRouteToCEP(userProfileItem);
    }

    get settings(): ICepSettings {
        var settingsStr = localStorage.getItem('cep-settings');
        return JSON.parse(settingsStr);
    }
    set settings(value: ICepSettings) {
        var settingsStr = JSON.stringify(value);
        localStorage.setItem('cep-settings', settingsStr);
    }

    private closeSideNav() {
        this.eventBus.publish('awsidenav.openClose', {
            "id": "globalNavigationSideNav",
            "invokerId": "cmdViewPageMenu",
            "keepOthersOpen": true
        });
    }

    private convertToProperty(item: any) {
        var prop = this.prop('page', item.DisplayName, 'STRING', item.UIVirtualPageName, item.DisplayName, item.QueryString, item.ApolloIcon, item.IsHomePage);
        if (item.Children.length > 0) {
            prop.children = item.Children.map(it => {
                return this.convertToProperty(it);
            });
        }
        else {
            prop.children = [];
        }
        prop._data = item;
        return prop;
    }

    private prop(name, displayName, type, dbValue, uiValue, queryString, apolloIcon, isHomePage) {
        var displayValue = uiValue || dbValue;
        var prop = this.propSvc.createViewModelProperty(name, displayName, type, dbValue, [displayValue]);
        prop.apolloIcon = apolloIcon;
        prop.queryString = queryString;
        // register user configured home page and return
        if (isHomePage) {
            prop.isHomePage = isHomePage;
            this.appCtxSvc.registerCtx('homePage', prop);
        }

        prop.propApi = {};
        return prop;
    }

    private isPanelVisible = "isPageListPanelVisible";
    private portalUrl = './ApolloPortalService.svc/web/';
}

define(['app', 'js/eventBus', 'js/appCtxService', 'js/messagingService', 'js/uwPropertyService', 'js/cepCommandService', 'js/cepLabelService', 'js/cepViewModelService', 'js/cepSwacService'], function (app, eventBus) {
    'use strict';
    app.factory('cepPortalService', ['$http', '$q', 'appCtxService', 'messagingService', 'uwPropertyService', 'cepCommandService', 'cepLabelService', 'cepViewModelService', 'cepSwacService', ($http, $q, appCtxSvc, msgSvc, propSvc, cepCommandSvc, cepLabelSvc, cepViewModelSvc, cepSwacSvc) => new PortalService($http, $q, appCtxSvc, msgSvc, propSvc, cepCommandSvc, cepLabelSvc, cepViewModelSvc, cepSwacSvc, eventBus)]);
    return {
        moduleServiceNameToInject: 'cepPortalService'
    };
});
