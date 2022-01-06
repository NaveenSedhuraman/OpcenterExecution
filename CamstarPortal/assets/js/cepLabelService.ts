class LabelService {
    constructor(private appCtxSvc: any) { }

    initializeTranslations(translatedLabels: { "LabelName", "LabelValue" }[]) {
        this.appCtxSvc.updateCtx('TranslatedLabels', translatedLabels);
    }

    getTranslatedViewModel(modelName: string, viewModel: any): any {
        const updatedLabels = this.getTranslatedLabels(modelName);
        const model = viewModel[modelName];
        if (model) {
            const keys = Object.keys(model);
            keys.forEach(k => {
                if (updatedLabels[k]) {
                    if (modelName == 'commands') {
                        model[k]['title'] = updatedLabels[k];
                    } else {
                        model[k] = updatedLabels[k];
                    }
                }
            });
            viewModel[modelName] = model;
        }
        return viewModel;
    }

    getLabelsToTranslate(): any[] {
        let labels = [];
        for(let [key, value] of Object.entries(this.commandLabels)) {
            labels.push(value);
        }
        for(let [key, value] of Object.entries(this.portalLabels)) {
            labels.push(value);
        }
        return labels;
    }

    getCommandLabels(): any {
        return this.commandLabels;
    }

    private getTranslatedLabels(modelName: string): any {
        const translatedLabels = this.appCtxSvc.getCtx('TranslatedLabels');
        let modelLabels;
        if (modelName === 'commands') {
            modelLabels = this.commandLabels;
        } else if (modelName === 'portalMessages') {
            modelLabels = this.portalLabels;
        }
        
        return this.updateLabels(modelLabels, translatedLabels);
    }

    private updateLabels(oldLabels: any, translatedLabels: { "LabelName", "LabelValue" }[]): any {
        const newLabels = oldLabels;
        const labelKeys = Object.keys(newLabels);
        labelKeys.forEach(labelKey => {
            const label = translatedLabels.filter(key => newLabels[labelKey] && newLabels[labelKey]['LabelName'] === key.LabelName);
            if (label && label.length) {
                newLabels[labelKey] = label[0].LabelValue;
            }
        });
        return newLabels;
    }

    private commandLabels = {
        cmdLogin: { 'LabelName': 'Lbl_Login', 'LabelValue': 'Log In' }, // Lbl_Login
        cmdLogout: { 'LabelName': 'Banner_LogOff', 'LabelValue': 'Log Out' }, // Banner_LogOff,                
        cmdPortalStudio: { 'LabelName': 'Banner_Studio', 'LabelValue': 'Studio' }, //Banner_Studio
        cmdSettings: { 'LabelName': 'Banner_Settings', 'LabelValue': 'Settings' }, //Banner_Settings
        momCmdUiSettings: { 'LabelName': 'Banner_Settings', 'LabelValue': 'Banner_Settings' }, //Banner_Settings
        cmdHelp: { 'LabelName': 'Banner_Help', 'LabelValue': 'Help' }, //Banner_Help
        cmdUserProfile: { 'LabelName': 'Lbl_UserProfilePage_Title', 'LabelValue': 'View User Profile' }, // Lbl_UserProfilePage_Title
        momCmdGoToHomePage: { 'LabelName': 'HomePageLbl', 'LabelValue': 'Home Page' }, //MenuItem_Home
        momCmdFullScreen: { 'LabelName': 'Mom_FulScreenCommand', 'LabelValue': 'Full Screen Mode' },
        momCmdExitFullScreen: { 'LabelName': 'Mom_FulScreenCommandExit', 'LabelValue': 'Exit Full Screen Mode' },
        momCmdToggleLabels: { 'LabelName': 'Mom_Labels', 'LabelValue': 'Command Labels' },       
    };

    private portalLabels = {
        resourceLbl: { 'LabelName': 'Banner_ResourceWorkCell', 'LabelValue': 'Resource/Work Cell' }, //Banner_ResourceWorkCell
        workCenterLbl: { 'LabelName': 'Banner_WorkCenter', 'LabelValue': 'Workcenter' }, //Banner_WorkCenter
        operationLbl: { 'LabelName': 'Banner_Operation', 'LabelValue': 'Operation' }, //Banner_Operation
        workstationLbl: { 'LabelName': 'Banner_Workstation', 'LabelValue': 'Workstation' }, //Banner_Workstation 
        settingsLbl: { 'LabelName': 'Banner_Settings', 'LabelValue': 'Settings' }, //Banner_Settings      
        setLineAssignmentLbl: { 'LabelName': 'Lbl_SetLineAssignment_Title', 'LabelValue': 'Set Line Assignment' }, //Lbl_SetLineAssignment_Title
        filterTagsLbl: { 'LabelName': 'Banner_SetFilterTags', 'LabelValue': 'Filters' } // Banner_SetFilterTags
    };
}

define(['app', 'js/appCtxService'], function (app) {
    'use strict';
    app.factory('cepLabelService', ['appCtxService', (appCtxSvc) => new LabelService(appCtxSvc)]);
    return {
        moduleServiceNameToInject: 'cepLabelService'
    };
});