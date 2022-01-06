"use strict";

var LabelService =
/** @class */
function () {
  function LabelService(appCtxSvc) {
    this.appCtxSvc = appCtxSvc;
    this.commandLabels = {
      cmdLogin: {
        'LabelName': 'Lbl_Login',
        'LabelValue': 'Log In'
      },
      cmdLogout: {
        'LabelName': 'Banner_LogOff',
        'LabelValue': 'Log Out'
      },
      cmdPortalStudio: {
        'LabelName': 'Banner_Studio',
        'LabelValue': 'Studio'
      },
      cmdSettings: {
        'LabelName': 'Banner_Settings',
        'LabelValue': 'Settings'
      },
      momCmdUiSettings: {
        'LabelName': 'Banner_Settings',
        'LabelValue': 'Banner_Settings'
      },
      cmdHelp: {
        'LabelName': 'Banner_Help',
        'LabelValue': 'Help'
      },
      cmdUserProfile: {
        'LabelName': 'Lbl_UserProfilePage_Title',
        'LabelValue': 'View User Profile'
      },
      momCmdGoToHomePage: {
        'LabelName': 'HomePageLbl',
        'LabelValue': 'Home Page'
      },
      momCmdFullScreen: {
        'LabelName': 'Mom_FulScreenCommand',
        'LabelValue': 'Full Screen Mode'
      },
      momCmdExitFullScreen: {
        'LabelName': 'Mom_FulScreenCommandExit',
        'LabelValue': 'Exit Full Screen Mode'
      },
      momCmdToggleLabels: {
        'LabelName': 'Mom_Labels',
        'LabelValue': 'Command Labels'
      }
    };
    this.portalLabels = {
      resourceLbl: {
        'LabelName': 'Banner_ResourceWorkCell',
        'LabelValue': 'Resource/Work Cell'
      },
      workCenterLbl: {
        'LabelName': 'Banner_WorkCenter',
        'LabelValue': 'Workcenter'
      },
      operationLbl: {
        'LabelName': 'Banner_Operation',
        'LabelValue': 'Operation'
      },
      workstationLbl: {
        'LabelName': 'Banner_Workstation',
        'LabelValue': 'Workstation'
      },
      settingsLbl: {
        'LabelName': 'Banner_Settings',
        'LabelValue': 'Settings'
      },
      setLineAssignmentLbl: {
        'LabelName': 'Lbl_SetLineAssignment_Title',
        'LabelValue': 'Set Line Assignment'
      },
      filterTagsLbl: {
        'LabelName': 'Banner_SetFilterTags',
        'LabelValue': 'Filters'
      } // Banner_SetFilterTags

    };
  }

  LabelService.prototype.initializeTranslations = function (translatedLabels) {
    this.appCtxSvc.updateCtx('TranslatedLabels', translatedLabels);
  };

  LabelService.prototype.getTranslatedViewModel = function (modelName, viewModel) {
    var updatedLabels = this.getTranslatedLabels(modelName);
    var model = viewModel[modelName];

    if (model) {
      var keys = Object.keys(model);
      keys.forEach(function (k) {
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
  };

  LabelService.prototype.getLabelsToTranslate = function () {
    var labels = [];

    for (var _i = 0, _a = Object.entries(this.commandLabels); _i < _a.length; _i++) {
      var _b = _a[_i],
          key = _b[0],
          value = _b[1];
      labels.push(value);
    }

    for (var _c = 0, _d = Object.entries(this.portalLabels); _c < _d.length; _c++) {
      var _e = _d[_c],
          key = _e[0],
          value = _e[1];
      labels.push(value);
    }

    return labels;
  };

  LabelService.prototype.getCommandLabels = function () {
    return this.commandLabels;
  };

  LabelService.prototype.getTranslatedLabels = function (modelName) {
    var translatedLabels = this.appCtxSvc.getCtx('TranslatedLabels');
    var modelLabels;

    if (modelName === 'commands') {
      modelLabels = this.commandLabels;
    } else if (modelName === 'portalMessages') {
      modelLabels = this.portalLabels;
    }

    return this.updateLabels(modelLabels, translatedLabels);
  };

  LabelService.prototype.updateLabels = function (oldLabels, translatedLabels) {
    var newLabels = oldLabels;
    var labelKeys = Object.keys(newLabels);
    labelKeys.forEach(function (labelKey) {
      var label = translatedLabels.filter(function (key) {
        return newLabels[labelKey] && newLabels[labelKey]['LabelName'] === key.LabelName;
      });

      if (label && label.length) {
        newLabels[labelKey] = label[0].LabelValue;
      }
    });
    return newLabels;
  };

  return LabelService;
}();

define(['app', 'js/appCtxService'], function (app) {
  'use strict';

  app.factory('cepLabelService', ['appCtxService', function (appCtxSvc) {
    return new LabelService(appCtxSvc);
  }]);
  return {
    moduleServiceNameToInject: 'cepLabelService'
  };
});