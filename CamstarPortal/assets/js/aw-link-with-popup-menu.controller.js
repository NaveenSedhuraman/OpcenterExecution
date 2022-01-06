"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines controller for <aw-link-with-popup-menu> directive.
 *
 * @module js/aw-link-with-popup-menu.controller
 */
define(['app', 'js/eventBus', 'jquery', 'lodash', 'js/analyticsService', 'js/viewModelService'], function (app, eventBus, $, _, analyticsSvc) {
  'use strict';
  /**
   * Defines awLinkWithPopupMenu controller
   *
   * @member awLinkWithPopupMenuController
   * @memberof NgControllers
   */

  app.controller('awLinkWithPopupMenuController', ['$scope', '$element', '$timeout', 'viewModelService', function ($scope, $element, $timeout, viewModelSvc) {
    $scope.showPopupMenu = false;
    var declViewModel = viewModelSvc.getViewModel($scope, true);
    viewModelSvc.bindConditionStates(declViewModel, $scope);
    $scope.conditions = declViewModel.getConditionStates();
    var lovEntry = [];

    $scope.showLinkPopUp = function () {
      // eslint-disable-line no-unused-vars
      if (isEnableCaching()) {
        $scope.dataprovider.initialize($scope).then(function () {
          $scope.isLoading = false;
          $scope.showPopupMenu = false;
          showContent();
        }, function () {
          $scope.isLoading = false;
          $scope.showPopupMenu = false;
          showContent();
        });
        $scope.isLoading = true;
      }

      showContent(); // Log the Popup menu being shown.

      var sanLinkWithPopupMenu = {};
      sanLinkWithPopupMenu.sanAnalyticsType = 'Link With Popup Menu';
      sanLinkWithPopupMenu.sanCommandId = $scope.id;
      sanLinkWithPopupMenu.sanCommandTitle = 'Show Link Popup';
      analyticsSvc.logCommands(sanLinkWithPopupMenu);
    };

    var hideLinkPopUp = function hideLinkPopUp(event) {
      // check if we click on the same link , or if we selected an item
      if ($element.find(event.target).length > 0 && $element.find(event.target)[0] === event.target && event.target.localName !== 'li') {
        return;
      }

      event.stopPropagation(); // if this time the selected item isn't the same with the previous one,then close the popup

      if ($scope.showPopupMenu && event.target.innerText !== $scope.previousSelect) {
        var eventData = {
          property: $scope.prop,
          previousSelect: $scope.previousSelect,
          propScope: $scope
        }; // only if we select an item (and not the same with previous selected one), we publish the "awlinkPopup.selected" event

        if ($element.find(event.target).length > 0) {
          eventBus.publish('awlinkPopup.selected', eventData);
        }

        if ($scope.showPopupMenu) {
          $scope.$apply(function () {
            $scope.showPopupMenu = false;
          });
        }
      } // close the popup everytime even when selected option is unchanged


      eventBus.publish('awPopupWidget.close');
      $('body').off('mousedown', hideLinkPopUp);
    };

    var showContent = function showContent() {
      if ($scope.showPopupMenu === true) {
        return;
      }

      $scope.items = [];

      if ($scope.items.length === 0) {
        for (var i = 0; i < $scope.dataprovider.getLength(); i++) {
          var popObject = $scope.dataprovider.createPopupObject(i, $scope, $scope.dataprovider.json.dataProviderType);
          popObject.isSelected = false;

          if ($scope.prop.uiValue !== '' && $scope.prop.uiValue === popObject.listElementDisplayValue || $scope.prop.uiValue === '' && $scope.prop.propertyDisplayName === popObject.listElementDisplayValue) {
            popObject.isSelected = true;
          }

          $scope.items.push(popObject);
        }
      } // if nothing in dataProvider response, mark noResults equals to true


      if ($scope.items.length === 0) {
        var popLinkObject = $scope.dataprovider.createPopupObject(0, $scope);
        $scope.items.push(popLinkObject);
      }

      show();

      _.defer(function () {
        $element.find('.aw-base-scrollPanel').scroll(function () {
          $scope.handleScroll();
        });
      });
    };

    var show = function show() {
      $scope.showPopupMenu = true; // when the flag is already true, I want 'body' listen to "click" too.

      $timeout(function () {
        $('body').off('mousedown ', hideLinkPopUp).on('mousedown ', hideLinkPopUp);
      }, 200);
    };
    /**
     * Check if the response from the data provider need to cache or not
     *
     * @returns {boolean} if caching is enable ot not
     */


    var isEnableCaching = function isEnableCaching() {
      if ($scope.isCache === 'false' || $scope.dataprovider.viewModelCollection.getTotalObjectsFound() === 0) {
        return true;
      }

      return false;
    };

    $scope.closePopupMenu = function (event, item) {
      $scope.prevSelectedProp = $scope.prop;

      if ($scope.prop.uiValue !== '') {
        $scope.previousSelect = $scope.prop.uiValue;
      } else {
        $scope.previousSelect = $scope.prop.propertyDisplayName;
      }

      $('body').off('mousedown ', hideLinkPopUp).on('mousedown ', hideLinkPopUp); // if selected a different item,then do the validation

      if (item !== null && item !== undefined && item !== $scope.prop) {
        if ($scope.prop.uiValue !== '') {
          $scope.prop.uiValue = item.listElementDisplayValue;
        } else {
          $scope.prop.propertyDisplayName = item.listElementDisplayValue;
        }

        $scope.prop.dbValue = item.listElementObject;
      } // Log the Popup menu being shown.


      var sanLinkWithPopupMenu = {};
      sanLinkWithPopupMenu.sanAnalyticsType = 'Link With Popup Menu';
      sanLinkWithPopupMenu.sanCommandId = $scope.id;
      sanLinkWithPopupMenu.sanCommandTitle = 'Popup Menu Entry Selected';
      analyticsSvc.logCommands(sanLinkWithPopupMenu);
    }; // the index is the number which the scrollbar scrollTo which part.


    $scope.handleScroll = function () {
      if ($element.find('.aw-base-scrollPanel').length > 0) {
        $scope.scrollerElem = $element.find('.aw-base-scrollPanel')[0];
      } else {
        $element.find('.aw-widgets-cellListContainer').addClass('aw-base-scrollPanel');
        $scope.scrollerElem = $element.find('.aw-widgets-cellListContainer')[0];
      } // if scroll to the end and moreValuesExist equals true


      if ($scope.scrollerElem.scrollHeight - $scope.scrollerElem.scrollTop === $scope.scrollerElem.parentElement.scrollHeight && $scope.dataprovider.viewModelCollection.moreValuesExist) {
        $scope.dataprovider.someDataProviderSvc.getNextPage($scope.dataprovider.action, $scope.dataprovider.json, $scope).then(function (response) {
          for (var j = 0; j < response.totalFound; j++) {
            if ($scope.dataprovider.json.dataProviderType) {
              if ($scope.dataprovider.json.dataProviderType === 'TcLOV') {
                $scope.items.push(response.results[j].dispValue);
                lovEntry.push(response.results[j]);
              } else {
                $scope.items.push(response.results[j]);
              }
            }
          }
        });
        $scope.$apply();
      }
    };
  }]);
});