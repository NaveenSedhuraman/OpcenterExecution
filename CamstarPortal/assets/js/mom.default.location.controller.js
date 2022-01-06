"use strict";

// Copyright 2019 Siemens AG

/* global define */

/**
 * Defines the controller that should be used for all MOM Location states.
 *
 * @module js/mom.default.location.controller
 */
define(['app', 'lodash', 'angular', 'js/eventBus', 'js/appCtxService', 'js/aw-showobject-page.directive', 'js/aw.default.location.controller', 'js/mom-header-content.directive', 'js/mom-modal-overlay.directive', 'js/mom.utils.service', 'js/configurationService'], function (app, _, ngModule, eventBus) {
  'use strict';

  app.controller('MomDefaultLocationCtrl', ['$rootScope', '$scope', '$state', '$controller', 'appCtxService', 'momUtilsService', 'configurationService', function ($rootScope, $scope, $state, $controller, appCtxSvc, utils, cfgSvc) {
    var ctrl = this; //eslint-disable-line consistent-this, no-invalid-this
    // Disable standard theme command switch

    appCtxSvc.registerCtx('changeThemeDisabled', true); // Set global navigation panels WIDE by default

    appCtxSvc.registerCtx('awSidenavConfig', {
      "avatarPanel": {
        "width": "WIDE"
      }
    });
    ngModule.extend(ctrl, $controller('DefaultLocationCtrl', {
      $scope: $scope
    }));
    var tpl = $state.current.templateUrl;

    var setHeaderViewModel = function setHeaderViewModel(value) {
      var momPageEntity = value || {};
      var iconType = momPageEntity.type;
      var headerViewModel;

      if (momPageEntity.type) {
        headerViewModel = {
          type: iconType,
          props: {},
          typeIconURL: utils.typeIconPath(iconType)
        };
      }

      $scope.headerViewModel = headerViewModel;
    }; // Programmatically add aw-commands-showIconLabel class to the #main-view
    // In this way, labels will be displayed in the global navigation as well.


    var toggleCommandLabels = function toggleCommandLabels(value) {
      var mainView = document.getElementById('main-view');

      if (mainView) {
        if (value) {
          mainView.classList.add('aw-commands-showIconLabel');
        } else {
          mainView.classList.remove('aw-commands-showIconLabel');
        }
      }
    };

    if ($state.current.data) {
      setHeaderViewModel($state.current.data.momPageEntity);
      appCtxSvc.registerCtx('momPageEntity', $state.current.data.momPageEntity);
    }

    var ctxSubscription = eventBus.subscribe("appCtx.*", function (data) {
      if (data.name === 'momPageEntity') {
        setHeaderViewModel(data.value);
      } else if (data.name === 'locationContext' && data.value && data.value['ActiveWorkspace:SubLocation']) {
        // Make sure the correct subLocation tab is selected.
        var subLocation = data.value['ActiveWorkspace:SubLocation'];
        var tabToSelect = $scope.subLocationTabs.find(function (tab) {
          return tab.state === subLocation;
        });

        if (tabToSelect) {
          if (!tabToSelect.selectedTab) {
            $scope.$broadcast('NgTabSelectionUpdate', tabToSelect);
          }
        }
      } else if (data.name === 'commandLabels') {
        toggleCommandLabels(data.value);
      }
    });
    $scope.$on('$destroy', function () {
      eventBus.unsubscribe(ctxSubscription);
    });
    var labels = appCtxSvc.getCtx('toggleLabel');
    toggleCommandLabels(labels);

    if (tpl.match(/\/mom.home.sublocation.html$/)) {
      $scope.locationPanelStyle = labels ? 'locationPanel aw-commands-showIconLabel mom-home-location' : 'locationPanel mom-home-location';
      appCtxSvc.registerCtx('momDetails', false);
    } else if (tpl.match(/\/mom.swac.sublocation.html$/)) {
      $scope.locationPanelStyle = labels ? 'locationPanel aw-commands-showIconLabel mom-swac-container' : 'locationPanel mom-swac-container';
    } else if (tpl.match(/\/mom.details.sublocation.html$/)) {
      $scope.locationPanelStyle = labels ? 'locationPanel aw-commands-showIconLabel' : 'locationPanel';
      appCtxSvc.registerCtx('momDetails', true);
    } else {
      $scope.locationPanelStyle = labels ? 'locationPanel aw-commands-showIconLabel' : 'locationPanel';
      appCtxSvc.registerCtx('momDetails', false);
    }

    cfgSvc.getCfg('versionConstants').then(function (constants) {
      if (constants && constants.afx && constants.afx.version) {
        $scope.locationPanelStyle += ' afx-' + constants.afx.version;
      }
    });
  }]);
});