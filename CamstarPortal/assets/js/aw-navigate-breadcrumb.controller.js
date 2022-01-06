"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 console,
 define,
 navigator
 */

/**
 * This represents bread crumb widget
 *
 * @module js/aw-navigate-breadcrumb.controller
 */
define(['app', 'angular', 'lodash', 'jquery', 'js/eventBus', 'js/logger', 'js/browserUtils', 'js/analyticsService', 'js/aw.navigateBreadCrumbService', 'js/viewModelService', 'js/appCtxService', 'js/panelContentService'], function (app, ngModule, _, $, eventBus, logger, browserUtils, analyticsSvc) {
  //
  'use strict';
  /**
   * @member awNavigateBreadcrumbController
   * @memberof NgControllers
   *
   * @return {Void}
   */

  app.controller('awNavigateBreadcrumbController', ['$scope', '$element', '$state', '$timeout', 'aw.navigateBreadCrumbService', 'viewModelService', 'appCtxService', 'panelContentService', function ($scope, $element, $state, $timeout, navigateBreadCrumbService, viewModelSvc, appCtxService, panelContentService) {
    var self = this;
    /**
     * {ObjectArray} Collection of eventBus subscription definitions to be un-subscribed from when
     * this controller's $scope is later destroyed.
     */

    var _eventBusSubDefs = [];
    /**
     * Function bound/unbound to/from window 'resize' events.
     */

    self.resizeHandler = function () {
      $scope.checkBreadcrumbOverflow();
    };

    if (!$scope.breadcrumbConfig.id) {
      $scope.breadcrumbConfig.id = 'wabc';
    } // default position for showing overflow icon


    if ($scope.breadcrumbConfig && !$scope.breadcrumbConfig.overflowIndex) {
      $scope.breadcrumbConfig.overflowIndex = 1;
    }

    var popuplist = '/html/defaultbreadcrumblist.html';

    if ($scope.breadcrumbConfig && $scope.breadcrumbConfig.popuplist) {
      popuplist = $scope.breadcrumbConfig.popuplist;
    }

    $scope.popuplist = app.getBaseUrlPath() + popuplist;
    $scope.isIE = browserUtils.isIE;
    $scope.compact = $scope.compact === 'true' ? 'true' : 'false';

    var checkForBreadcrumbDisplayNameChange = function checkForBreadcrumbDisplayNameChange(data) {
      if (data.modifiedObjects && data.modifiedObjects.length > 0) {
        var valueUpdated = false;
        data.modifiedObjects.forEach(function (mo) {
          if (!valueUpdated) {
            $scope.$evalAsync(function () {
              if ($scope.provider && $scope.provider.crumbs) {
                $scope.provider.crumbs.forEach(function (element) {
                  if (!valueUpdated) {
                    if (element.scopedUid && mo.props[$scope.breadcrumbConfig.displayProperty] && element.scopedUid === mo.uid) {
                      valueUpdated = breadcrumbValueUpdated(mo, element);
                    }
                  }
                });
              }
            });
          }
        });
      }
    };

    if ($scope.breadcrumbConfig && $scope.breadcrumbConfig.displayProperty) {
      // Add listener to check the change of object's property value ( which is shown in breadcrumb )
      _eventBusSubDefs.push(eventBus.subscribe('cdm.modified', function (data) {
        checkForBreadcrumbDisplayNameChange(data);
      }));
    }

    var breadcrumbValueUpdated = function breadcrumbValueUpdated(mo, element) {
      var objProp = mo.props[$scope.breadcrumbConfig.displayProperty];

      if (objProp && element.displayName !== objProp.uiValues[0]) {
        element.displayName = objProp.uiValues[0];
        return true;
      }

      return false;
    };

    if ($scope.breadcrumbConfig) {
      _eventBusSubDefs.push(eventBus.subscribe($scope.breadcrumbConfig.crumbDataProvider + '.modelObjectsUpdated', function (eventData) {
        $scope.provider.crumbs = eventData.viewModelObjects;
      }));

      if (!$scope.breadcrumbConfig.noUpdate) {
        _eventBusSubDefs.push(eventBus.subscribe('navigateBreadcrumb.refresh', function (bcId) {
          if (!bcId && $scope.breadcrumbConfig && $scope.breadcrumbConfig.id) {
            bcId = $scope.breadcrumbConfig.id;
          }

          if (bcId) {
            var promise = navigateBreadCrumbService.readUrlForCrumbs(bcId, true);
            promise.then(function (breadCrumbMap) {
              $scope.$evalAsync(function () {
                var crumbsList = [];
                $.each(breadCrumbMap, function (key, val) {
                  if (val && val.props.object_string && val.props.object_string.uiValues[0]) {
                    var crumb = navigateBreadCrumbService.generateCrumb(val.props.object_string.uiValues[0], true, false, key);
                    crumbsList.push(crumb);
                  } else {
                    logger.error('Cannot find object_string in modelObject');
                  }
                });

                if (crumbsList.length > 0) {
                  crumbsList[crumbsList.length - 1].showArrow = false;
                  crumbsList[crumbsList.length - 1].selectedCrumb = true;
                }

                if ($scope.provider) {
                  $scope.provider.crumbs = crumbsList;
                }
              });
            });
          }
        }));
      }
    } // use the .breadcrumbConfig.vm to pass value into the aw-include


    if ($scope.breadcrumbConfig && $scope.breadcrumbConfig.vm) {
      panelContentService.getViewModelById($scope.breadcrumbConfig.vm).then(function (declViewModel) {
        viewModelSvc.populateViewModelPropertiesFromJson(declViewModel.viewModel).then(function (customPanelViewModel) {
          viewModelSvc.setupLifeCycle($scope, customPanelViewModel);
          $scope.data = customPanelViewModel;
          eventBus.publish($scope.breadcrumbConfig.vm + '.contentLoaded', {
            scope: $scope
          }); // setting chevron data provider

          $scope.$evalAsync(function () {
            $scope.data.breadcrumbConfig = $scope.breadcrumbConfig;
            $scope.chevronDataProvider = $scope.data.dataProviders[$scope.breadcrumbConfig.chevronDataProvider];

            if ($scope.breadcrumbConfig.crumbDataProvider) {
              $scope.provider = $scope.data.dataProviders[$scope.breadcrumbConfig.crumbDataProvider];
            }
          });
        }, function () {
          logger.error('Failed to resolve declarative view model for navigation bread crumb');
        });
      });
    } // When a chevron in bread crumb is clicked


    $scope.onChevronClick = function (selectedCrumb, event) {
      if ($scope.chevronDataProvider) {
        // Determine if this chevron was at the middle or end of the breadcrumb and report to analytics
        var sanEvent = {
          sanAnalyticsType: 'Breadcrumb',
          sanCommandId: 'clickBreadcrumbChevron',
          sanCommandTitle: 'Click Breadcrumb Chevron'
        };

        if ($scope.provider.crumbs[$scope.provider.crumbs.length - 1].scopedUid === selectedCrumb.scopedUid) {
          sanEvent.sanCmdLocation = 'End';
        } else {
          sanEvent.sanCmdLocation = 'Middle';
        }

        analyticsSvc.logCommands(sanEvent);
        $scope.$evalAsync(function () {
          $scope.data.loading = true;
          $scope.chevronClickEvent = event;
          $scope.provider.crumbs.forEach(function (element) {
            element === selectedCrumb ? element.clicked = !element.clicked : element.clicked = false;
          });
          $scope.leftPosition = event.clientX;
          toggleCrumbPopUp(selectedCrumb);
          var currElement = ngModule.element(event.currentTarget.parentElement);
          currElement.scope().$broadcast('awPopupWidget.open', {
            popupUpLevelElement: ngModule.element(event.currentTarget.parentElement)
          });
        });
      }
    };

    _eventBusSubDefs.push(eventBus.subscribe($scope.breadcrumbConfig.id + 'settingChevronPopupPosition', function () {
      $scope.data.showPopup = true;
    }));

    var toggleCrumbPopUp = function toggleCrumbPopUp(selectedCrumb) {
      $scope.currentCrumb = selectedCrumb;

      if (selectedCrumb.clicked === false) {
        appCtxService.unRegisterCtx($scope.breadcrumbConfig.id + 'Chevron');
      } else if (selectedCrumb.clicked === true) {
        appCtxService.registerCtx($scope.breadcrumbConfig.id + 'Chevron', selectedCrumb);
        eventBus.publish($scope.breadcrumbConfig.id + '.chevronClicked', selectedCrumb);
      }
    }; // When a link in bread crumb is clicked


    $scope.setScopedCrumb = function (selectedCrumb) {
      // In some breadcrumbs there is a "label" crumb at the beginning that we should not count as the root crumb
      // The label crumb doesn't have a Uid so make sure the root crumb has one
      var rootIndex = $scope.provider.crumbs[0].hasOwnProperty('scopedUid') ? 0 : 1;
      var sanEvent = {
        sanAnalyticsType: 'Breadcrumb',
        sanCommandId: 'navigateBreadcrumb',
        sanCommandTitle: 'Navigate Breadcrumb'
      }; // Determine which crumb was clicked and report to analytics

      if ($scope.provider.crumbs[rootIndex].scopedUid === selectedCrumb.scopedUid) {
        sanEvent.sanCmdLocation = 'Root';
      } else if ($scope.provider.crumbs[$scope.provider.crumbs.length - 2].scopedUid === selectedCrumb.scopedUid) {
        sanEvent.sanCmdLocation = 'Parent';
      } else {
        sanEvent.sanCmdLocation = 'Middle';
      }

      analyticsSvc.logCommands(sanEvent); // close the pop-up if opened

      $scope.provider.crumbs.forEach(function (element) {
        element.clicked = false;
      });
      toggleCrumbPopUp(selectedCrumb);

      if (!$scope.breadcrumbConfig.noUpdate && !$scope.provider.onSelect) {
        var newCrumbs = [];

        for (var i = 0; i < $scope.provider.crumbs.length; i++) {
          var element = $scope.provider.crumbs;

          if (element[i].scopedUid) {
            if (element[i].scopedUid === selectedCrumb.scopedUid) {
              newCrumbs.push(element[i].scopedUid);
              break;
            } else {
              newCrumbs.push(element[i].scopedUid);
            }
          }
        }

        $state.params[$scope.breadcrumbConfig.id] = newCrumbs.join('^');
        $state.go('.', $state.params);
        appCtxService.registerCtx($scope.breadcrumbConfig.id + 'Link', selectedCrumb);
      }

      if (!$scope.provider.onSelect) {
        eventBus.publish($scope.breadcrumbConfig.vm + '.selectCrumb', selectedCrumb);
      } else {
        $scope.provider.onSelect(selectedCrumb);
      }
    };

    $scope.$on('$destroy', function () {
      _.forEach(_eventBusSubDefs, function (subDef) {
        eventBus.unsubscribe(subDef);
      });

      eventBus.publish($scope.breadcrumbConfig.id + '.destroy');
      appCtxService.unRegisterCtx($scope.breadcrumbConfig.id + 'Chevron');
      appCtxService.unRegisterCtx($scope.breadcrumbConfig.id + 'Link');
      $scope.breadcrumbConfig.id = null;
      $scope.breadcrumbConfig = null;
      $('body').off('click', $scope.hideChevronPopUp);

      if (self.crumbsTimeoutPromise) {
        $timeout.cancel(self.crumbsTimeoutPromise);
      }
    });

    $scope.hideChevronPopUp = function (event) {
      event.stopPropagation();
      var parent = event.target; // check for scrolling the content of popup

      if (parent && parent.className !== 'aw-layout-popup aw-layout-popupOverlay') {
        while (parent && parent.className !== 'aw-layout-popup aw-layout-popupOverlay' && parent.className !== 'aw-jswidget-controlArrow aw-jswidget-controlArrowRotateRight' && parent.className !== 'ng-scope aw-base-scrollPanel') {
          parent = parent.parentNode;
        } // clicked outside the body


        if (!parent) {
          // reset crumbs
          $scope.provider.crumbs.forEach(function (element) {
            element.clicked = false;
          }); // hide chevron popup

          $scope.data.showPopup = false;
          appCtxService.unRegisterCtx($scope.breadcrumbConfig.id + 'Chevron');
        } // another chevron is clicked to show popup OR something is selected inside chevron popup
        else if (parent && parent.className === 'ng-scope aw-base-scrollPanel') {
            // reset crumbs
            $scope.provider.crumbs.forEach(function (element) {
              element.clicked = false;
            });
            eventBus.publish('awPopupWidget.close', {});
          }
      }
    };
    /**
     * Called when a change is made in window size or the collection of crumbs. It sets which crumbs
     * are to be consider in the 'overflow' chevron.
     */


    $scope.checkBreadcrumbOverflow = function () {
      // overflow icon shown at the start of crumb i.e first position
      if ($scope.breadcrumbConfig && $scope.breadcrumbConfig.overflowIndex === 0) {
        $scope.overflowAtStart = true;
      }

      var bcWidth = 0;
      var crumbCount = 0;
      var doubleLeftIconWidth = 24; // default width of overflow icon

      $element.find('div.aw-layout-eachCrumb.ng-scope').each(function () {
        if (!$scope.provider.crumbs[crumbCount].width || $(this).width() > 0) {
          $scope.provider.crumbs[crumbCount].width = $(this).width();
        }

        crumbCount++;
      });

      if ($scope.provider && $scope.provider.crumbs) {
        $scope.provider.crumbs.forEach(function (element) {
          bcWidth += element.width;
        });
      }

      var workareaWidth = $element.parent().width();

      if (workareaWidth < bcWidth) {
        // if the overflow icon position is zero(i.e. at the start of crumbs) then overflow icon will take extra width.
        if ($scope.breadcrumbConfig && $scope.breadcrumbConfig.overflowIndex === 0) {
          workareaWidth -= doubleLeftIconWidth;
        }

        var crumbPopList = [];

        for (var i = 0; i < $scope.provider.crumbs.length; i++) {
          if (i === $scope.breadcrumbConfig.overflowIndex - 1) {
            $scope.provider.crumbs[i].overflowIconPosition = true;
          } else {
            $scope.provider.crumbs[i].overflowIconPosition = false;
          }
        } // recalculating the available width & breadcrumbWidth if overflow index is not at the start of breadcrumb


        for (var i = 0; i < $scope.breadcrumbConfig.overflowIndex; i++) {
          workareaWidth -= $scope.provider.crumbs[i].width;
          bcWidth -= $scope.provider.crumbs[i].width;
        }

        for (var i = $scope.breadcrumbConfig.overflowIndex; i < $scope.provider.crumbs.length; i++) {
          if (bcWidth > workareaWidth) {
            bcWidth -= $scope.provider.crumbs[i].width;
            crumbPopList.push($scope.provider.crumbs[i]);
            $scope.provider.crumbs[i].willOverflow = true;
          } else {
            $scope.provider.crumbs[i].willOverflow = false;
          }
        }

        $scope.provider.overflowCrumbList = crumbPopList;

        if ($scope.provider.overflowCrumbList.length) {
          $scope.showOverflowAtStart = true;
        }
      } else {
        // no overflow : form linear crumbs
        $scope.showOverflowAtStart = false;

        if (!_.isEmpty($scope.provider.crumbs)) {
          if (!_.isEmpty($scope.provider.overflowCrumbList)) {
            for (var i = 0; i < $scope.provider.overflowCrumbList.length; i++) {
              var crumbNdx = i + $scope.breadcrumbConfig.overflowIndex;

              if ($scope.provider.crumbs[crumbNdx]) {
                $scope.provider.crumbs[crumbNdx].willOverflow = false;
              }
            }

            $scope.provider.overflowCrumbList = [];
          } // overflow index is not at the start of crumbs


          if ($scope.breadcrumbConfig.overflowIndex && $scope.provider.crumbs.length >= $scope.breadcrumbConfig.overflowIndex) {
            $scope.provider.crumbs[$scope.breadcrumbConfig.overflowIndex - 1].overflowIconPosition = false;
          }
        }
      }
    };

    $scope.$on('windowResize', self.resizeHandler);

    $scope.onOverflowChevronClick = function (event) {
      $scope.$evalAsync(function () {
        var currElement = ngModule.element(event.currentTarget.parentElement);
        currElement.scope().$broadcast('awPopupWidget.open', {
          popupUpLevelElement: ngModule.element(event.currentTarget.parentElement)
        });
      });
    };

    $scope.$watch('data.showPopup', function _watchShowPopup(newValue, oldValue) {
      if (!(_.isNull(newValue) || _.isUndefined(newValue)) && newValue !== oldValue) {
        if (newValue === true) {
          $timeout(function () {
            $('body').on('click', $scope.hideChevronPopUp);
          }, 200);
        } else {
          $scope.chevronDataProvider.selectNone();
          $timeout(function () {
            $('body').off('click', $scope.hideChevronPopUp);
          }, 200);
        }
      }
    });
    $scope.$watch('provider.crumbs', function _watchProviderCrumbs(newValue, oldValue) {
      if (!(_.isNull(newValue) || _.isUndefined(newValue)) && newValue !== oldValue) {
        self.crumbsTimeoutPromise = $timeout(function () {
          // run this check only if the bread crumb is displayed
          if ($scope.breadcrumbConfig) {
            $scope.checkBreadcrumbOverflow();
          }
        }, 500);
      }
    });
  }]);
});