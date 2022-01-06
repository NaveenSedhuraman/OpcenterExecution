"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/awLayoutService
 */
define(['app', 'lodash', 'js/eventBus', 'js/logger', 'js/viewModelService', 'js/panelContentService'], function (app, _, eventBus, logger) {
  'use strict';
  /**
   * This service provides methods required by the <aw-layout> element and is used for loading View Models (JSON files
   * loaded by viewModelService.js) and then to trigger the loading of the associated View (HTML files loaded by
   * AngularJS ng-include directive).
   *
   * It also provides event handlers required to implement the 'when' attribute.
   *
   * @memberof NgServices
   * @member awLayoutService
   *
   * @param {$http} $http - Service to use.
   * @param {viewModelService} viewModelSvc - Service to use.
   * @param {panelContentService} panelContentSvc - Service to use.
   */

  app.service('awLayoutService', ['$http', 'viewModelService', 'panelContentService', function ($http, viewModelSvc, panelContentSvc) {
    var self = this; // eslint-disable-line no-invalid-this
    // Data for all <aw-layout> elements in the DOM

    self.layoutElementDataList = []; // Event Bus Definitions - used to un-subscribe to events when all layout elements are removed

    self.layoutNameChangeEventDef = null;
    self.splitterUpdateEventDef = null; // Constants: class names, file paths and event bus topic names

    self.constants = {
      layoutIncludeClassName: 'aw-layout-include',
      nameChangeEventName: 'aw-layout-name-change',
      splitterUpdateEventName: 'aw-splitter-update',
      testModeFolderName: 'layouts'
    }; // List of named 'when' conditions and test function names for that type of condition
    // Condition names for containerWidthTest must match names in self.containerWidthTest
    // Condition names for cssMediaQueryTest must match names in class: layoutCSSMediaQueries
    //
    // These are only examples implementations. A project to define the set of supported
    // out-of-the-box conditions and enhancements to the View Model to support responsive
    // layouts is needed to defined that actual implementation of 'when' conditions.

    self.namedCondtionTable = {
      large: 'containerWidthTest',
      medium: 'containerWidthTest',
      small: 'containerWidthTest',
      phone: 'cssMediaQueryTest',
      tablet: 'cssMediaQueryTest',
      desktop: 'cssMediaQueryTest'
    }; // List of test function names and associated functions

    self.responsiveTestFunctionTable = {
      containerWidthTest: function containerWidthTest(conditionName, layoutElementData) {
        return self.containerWidthTest(conditionName, layoutElementData);
      },
      cssMediaQueryTest: function cssMediaQueryTest(conditionName) {
        return self.cssMediumQueryTest(conditionName);
      }
    }; // Value returned by the CSS Media Query Element
    // See CSS definition for class:layoutCSSMediaQueries

    self.cssMediaQueryValue = null; // Test Mode Flag (used by the Layout Elements Test Page)
    // When in test mode the View and View Model files are found in the
    // Test Harness layouts folder.

    self.testModeFlag = false;
    /**
     * Add Layout Element
     *
     * Process the 'when' attribute and establish the first layout to display for a given <aw-layout> element.
     * Add the element to the list of managed <aw-layout> elements. Also, if needed initialize Even Bus
     * handlers.
     *
     * @param {object} $scope - AngularJS scope for this <aw-layout> element
     * @param {object} elements - AngularJS/JQuery scoping elements for this element
     * @param {string} name - View / view model name
     * @param {string} when - When condition
     */

    self.addLayoutElement = function ($scope, elements, name, when) {
      // Initialize Event Handlers for All <aw-layout> elements
      if (self.layoutNameChangeEventDef === null) {
        self.layoutNameChangeEventDef = eventBus.subscribe(self.constants.nameChangeEventName, function (eventData) {
          self.nameChangeEventHandler(eventData);
        });
        self.splitterUpdateEventDef = eventBus.subscribe(self.constants.splitterUpdateEventName, function (eventData) {
          self.splitterUpdateEventHandler(eventData);
        });
        $scope.$on('windowResize', self.windowResizeEventHandler);
      } // Set the common media query value shared by all layout elements


      self.cssMediaQueryValue = self.getCssMediaQueryValue();
      var defaultLayoutName = name;

      if (!defaultLayoutName) {
        self.reportError('<aw-layout> element is missing the required "name" attribute');
        defaultLayoutName = 'undefined';
      } // Parse the 'when' attribute and produce an array of: { conditionName, layoutName }


      var whenConditionList = self.parseWhenAttribute(when); // Add this element to the list of managed <aw-layout> elements
      // and load the initial View Model and View for the element

      var layoutElementData = {
        scope: $scope,
        elements: elements,
        parentContainer: elements[0].parentElement,
        whenConditionList: whenConditionList,
        defaultLayoutName: defaultLayoutName,
        currentLayoutName: 'not-set-yet',
        viewModelURL: 'not-set-yet'
      };
      self.layoutElementDataList.push(layoutElementData);
      self.updateLayoutElement(layoutElementData);
    };
    /**
     * Remove Layout Element
     *
     * Remove layout elements that no longer exist in the current layout.
     *
     * @param {object} elements - AngularJS/JQuery scoping elements for this element
     */


    self.removeLayoutElement = function (elements) {
      var layoutElement = elements[0];
      var found = false;

      _.forEach(self.layoutElementDataList, function (layoutElementData, key) {
        if (layoutElementData.elements[0] === layoutElement) {
          self.layoutElementDataList.splice(key, 1);
          found = true; // If there are no more layout elements in the DOM then un-subscribe to the events

          if (self.layoutElementDataList.length < 1) {
            eventBus.unsubscribe(self.layoutNameChangeEventDef);
            eventBus.unsubscribe(self.splitterUpdateEventDef);
            self.layoutNameChangeEventDef = null;
            self.splitterUpdateEventDef = null;
          }

          return false; // return false to break out of forEach
        }
      }); // Element not found


      if (!found) {
        self.reportError('request to remove an <aw-layout> element could not find the element');
      }
    };
    /**
     * Window Resize Event Handler
     *
     * Refresh the value of the CSS Media Query and update all layout elements.
     */


    self.windowResizeEventHandler = function () {
      self.cssMediaQueryValue = self.getCssMediaQueryValue();
      self.updateAllLayoutElements();
    };
    /**
     * Get Media Query Vales
     *
     * Method to return the current layout CSS Media Query value.
     *
     * @return {String} value obtain from CSS Media Queries
     */


    self.getCssMediaQueryValue = function () {
      var value = null;
      var queryElement = document.querySelector('.layoutCSSMediaQueries');

      if (queryElement) {
        var queryStyle = window.getComputedStyle(queryElement, ':before');
        var queryValue = queryStyle.getPropertyValue('content'); // Some browsers return the value in quotes - so remove any quotes

        value = queryValue.replace(/'/g, '');
      }

      return value;
    };
    /**
     * Splitter Update Event Handler
     *
     * Process 'when' conditions for all <aw-layout> elements to select layouts based on current CSS Media Query
     * values and area sizes.
     *
     * @param {object} eventData - object containing the elements that the splitter has updated. A structure of
     *            the form: { splitter, area1, area2 }
     */


    self.splitterUpdateEventHandler = function () {
      // Note that to take advantage of the fact that area1 and area2 have been
      // updated we would have to scan the DOM structure from those starting points
      // to find all <aw-layout> elements in those branches. Just checking all
      // <aw-layout> elements is probably faster.
      self.updateAllLayoutElements();
    };
    /**
     * Name Change Event Handler
     *
     * Update the default name for the given <aw-layout> element and possibly switch the layout to the new
     * default based on the 'when' conditions.
     *
     * @param {object} eventData - structure of the form: { layoutElement, newLayoutName }
     */


    self.nameChangeEventHandler = function (eventData) {
      var layoutElement = eventData.layoutElement;
      var newLayoutName = eventData.newLayoutName;
      var found = false; // Find the given layout element and update its default layout name
      // and then possibly update the selected layout for the element

      _.forEach(self.layoutElementDataList, function (layoutElementData) {
        if (layoutElementData.elements[0] === layoutElement) {
          found = true;

          if (layoutElementData.defaultLayoutName !== newLayoutName) {
            layoutElementData.defaultLayoutName = newLayoutName;
            self.updateLayoutElement(layoutElementData);
          }

          return false; // return false to break out of forEach
        }
      }); // Element Not Found


      if (!found) {
        self.reportError('<aw-layout> name change event did not find requested layout element');
      }
    };
    /**
     * Update All Layout Elements
     *
     * Scan the list of layout elements and check their 'when' conditions using the current Media Query Value
     * and container area sizes/positions
     */


    self.updateAllLayoutElements = function () {
      _.forEach(self.layoutElementDataList, function (layoutElementData) {
        self.updateLayoutElement(layoutElementData);
      });
    };
    /**
     * Update Layout Element
     *
     * Update the given <aw-layout> element based on its 'when' conditions using the current Media Query Value
     * and container area sizes/positions. When needed this will load the associated View Model and View for the
     * selected layout.
     *
     * @param {object} layoutElementData - Structure for a <aw-layout> element (see addLayoutElement)
     */


    self.updateLayoutElement = function (layoutElementData) {
      // Scan the 'when' conditions and select the current layout name
      var layoutName = self.getConditionalLayoutName(layoutElementData); // If the layout name has change then load the View Model & View for the selected layout

      if (layoutName !== layoutElementData.currentLayoutName) {
        layoutElementData.currentLayoutName = layoutName;
        layoutElementData.viewModelURL = 'not-set-yet';
        self.loadAssociatedViewModelAndView(layoutElementData);
      }
    };
    /**
     * Load Associated View Model and View
     *
     * Load the current View Model and then the associated View
     *
     * @param {object} layoutElementData - Structure for a <aw-layout> element (see addLayoutElement)
     */


    self.loadAssociatedViewModelAndView = function (layoutElementData) {
      if (!layoutElementData.currentLayoutName) {
        return;
      }

      var viewURL;
      var viewModelURL;
      var promise;

      if (self.testModeFlag) {
        var path = '/' + self.constants.testModeFolderName + '/';
        viewModelURL = path + layoutElementData.currentLayoutName + '.json';
        viewURL = path + layoutElementData.currentLayoutName + '.html';
        promise = $http.get(viewURL, {
          cache: true
        }).then(function (viewResponse) {
          var viewAndViewModelResponse = {};
          viewAndViewModelResponse.view = viewResponse.data;
          return $http.get(viewModelURL, {
            cache: true
          }).then(function (viewModelResp) {
            viewAndViewModelResponse.viewModel = viewModelResp.viewModel;
            return viewAndViewModelResponse;
          });
        });
      } else {
        promise = panelContentSvc.getPanelContent(layoutElementData.currentLayoutName);
        viewModelURL = app.getBaseUrlPath() + '/viewmodel/' + layoutElementData.currentLayoutName + 'ViewModel.json';
        viewURL = app.getBaseUrlPath() + '/html/' + layoutElementData.currentLayoutName + 'View.html';
      }

      layoutElementData.viewModelURL = viewModelURL;
      promise.then(function (viewModelJson) {
        viewModelSvc.populateViewModelPropertiesFromJson(viewModelJson.viewModel, false).then(function (declViewModel) {
          // Successful View Model Load
          viewModelSvc.setupLifeCycle(layoutElementData.scope, declViewModel); // Set the view name to trigger the ng-include directive to load the HTML
          // This will load the View associated with the View Model that just loaded.

          layoutElementData.scope.layoutViewName = viewModelJson.viewUrl || viewURL;
          layoutElementData.scope.currentLayoutName = layoutElementData.currentLayoutName;
        }, function () {
          // This layout does not have an associated view model
          layoutElementData.viewModelURL = 'not-found'; // The View Model did not load but we still need to load the view
          // Set the view name to trigger the ng-include directive to load the HTML

          layoutElementData.scope.layoutViewName = viewURL;
          layoutElementData.scope.currentLayoutName = layoutElementData.currentLayoutName;
        });
      });
    };
    /**
     * Parse When Attribute
     *
     * Parse an <aw-layout> 'when' attribute and return an array of structures of the form: { conditionName,
     * layoutName }. If the attribute is not defined then return null.
     *
     * @param {string} whenAttribute - 'when' attribute as defined in the <aw-layout> element
     * @return {array} - array of structures { conditionName, layoutName }
     */


    self.parseWhenAttribute = function (whenAttribute) {
      if (!whenAttribute) {
        return null;
      }

      var whenConditionList = []; // Remove return characters and spaces

      var cleanString = whenAttribute.replace(/(\r\n|\n|\r)/gm, '');
      cleanString = cleanString.replace(/\s/g, ''); // The when list is of the form:
      // conditionName1:layoutName1, conditionsName2:layoutName2, ...

      var whenList = cleanString.split(',');

      if (whenList.length < 1) {
        return null;
      }

      _.forEach(whenList, function (whenEntry) {
        var nameSplit = whenEntry.split(':');

        if (nameSplit.length === 2) {
          if (nameSplit[0].length < 1) {
            self.reportError('layout condition name is missing for: ' + whenEntry);
          } else if (nameSplit[1].length < 1) {
            self.reportError('layout name is missing for: ' + whenEntry);
          } else {
            whenConditionList.push({
              conditionName: nameSplit[0],
              layoutName: nameSplit[1]
            });
          }
        } else {
          self.reportError('invalid when format: ' + whenEntry);
        }
      });

      return whenConditionList;
    };
    /**
     * Get Conditional Layout Name
     *
     * Based on the 'when' conditions and current responsive values, return the layout name associated with the
     * first true condition, or return the default layout name
     *
     * @param {object} layoutElementData - Structure for a <aw-layout> element (see addLayoutElement)
     *
     * @return {String} Layout Name.
     */


    self.getConditionalLayoutName = function (layoutElementData) {
      var defaultLayoutName = layoutElementData.defaultLayoutName;

      if (layoutElementData.whenConditionList === null) {
        return defaultLayoutName;
      }

      var whenConditionList = layoutElementData.whenConditionList;
      var layoutName = null;

      _.forEach(whenConditionList, function (whenCondition) {
        var conditionName = whenCondition.conditionName;

        if (self.conditionIsTrue(conditionName, layoutElementData)) {
          layoutName = whenCondition.layoutName;
          return false; // Return false to break out of forEach
        }
      }); // Return the found layout name or the default


      return layoutName ? layoutName : defaultLayoutName;
    };
    /**
     * Condition Is True
     *
     * For a given named condition execute the associated condition test and return the resulting boolean value.
     *
     * @param {string} conditionName - the named condition as given in the 'when' attribute
     * @param {object} layoutElementData - Structure for a <aw-layout> element (see addLayoutElement)
     *
     * @return {boolean} - true when the named condition is true
     */


    self.conditionIsTrue = function (conditionName, layoutElementData) {
      var testFunctionName = self.namedCondtionTable[conditionName];

      if (!testFunctionName) {
        self.reportError('invalid when condition name: ' + conditionName);
        return false;
      }

      var testFunction = self.responsiveTestFunctionTable[testFunctionName];

      if (!testFunctionName) {
        self.reportError('invalid test function name: ' + testFunctionName);
        return false;
      }

      return testFunction(conditionName, layoutElementData);
    };
    /**
     * Container Width Test
     *
     * Test the current container size against a set of breakpoints and return true if the container width is
     * greater than the breakpoint for the given named condition
     *
     * @param {string} conditionName - the named condition as given in the 'when' attribute
     * @param {object} layoutElementData - Structure for a <aw-layout> element (see addLayoutElement)
     *
     * @return {boolean} - true when the named condition is true
     */


    self.containerWidthTest = function (conditionName, layoutElementData) {
      // Breakpoints are defined for the container width in px
      var layoutBreakpoints = {
        large: 1500,
        medium: 1000,
        small: 500
      };
      var breakPointValue = layoutBreakpoints[conditionName];
      var testValue = layoutElementData.parentContainer.clientWidth;

      if (!breakPointValue) {
        self.reportError('invalid condition name: ' + conditionName);
        return false;
      }

      return testValue > breakPointValue;
    };
    /**
     * CSS Media Query Test
     *
     * @param {string} conditionName - the named condition as given in the 'when' attribute
     *
     * @return {boolean} - true when the named condition is true
     */


    self.cssMediumQueryTest = function (conditionName) {
      if (!self.cssMediaQueryValue) {
        self.reportError('CSS Media Query element is missing for aw-layout elements');
      }

      return conditionName === self.cssMediaQueryValue;
    };
    /**
     * Report a usage error.
     *
     * @param {string} errorMessage - error to report.
     */


    self.reportError = function (errorMessage) {
      // alert('awLayoutService:' + errorMessage);
      logger.warn('awLayoutService:' + errorMessage);
    };
  }]);
});