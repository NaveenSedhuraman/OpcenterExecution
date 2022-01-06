"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Service to fetch visual indicators
 *
 * @module js/visualIndicatorService
 */
define(['app', 'lodash', 'js/expressionParserUtils', 'js/configurationService', //
'js/iconService', 'js/commandsMapService', 'config/indicators'], //
function (app, _, expressionParserUtils, cfgSvc) {
  'use strict'; //  FIXME this should be loaded async but before the sync API below that uses it is called

  var _indicators = cfgSvc.getCfgCached('indicators');
  /**
   * This service returns visual indicators.
   *
   * @memberof NgServices
   * @member visualIndicatorService
   */


  app.service('visualIndicatorService', ['$sce', 'commandsMapService', 'iconService', function ($sce, commandsMapSvc, iconSvc) {
    var exports = {};
    /**
     * Returns the list of visual indicators.
     *
     * @param {vmo} vmo - viewModelObject.
     * @param {getModelObjCallBack} getModelObjCallBack - call back.
     * @return {Array} List of visual indicator objects
     */

    exports.getVisualIndicators = function (vmo, getModelObjCallBack) {
      var indicatorsArray = [];
      var vmPropVsVisualIndicatorInfo = {};

      _.forEach(_indicators, function (indicatorJson) {
        if (indicatorJson) {
          var modelTypes = indicatorJson.modelTypes;
          var conditions = indicatorJson.conditions;
          var isValid = false;

          if (_.isArray(modelTypes)) {
            _.forEach(modelTypes, function (modelType) {
              if (modelType) {
                isValid = commandsMapSvc.isInstanceOf(modelType, vmo.modelType);

                if (isValid) {
                  return false; // break
                }
              }
            });
          }

          if (indicatorJson.prop && indicatorJson.prop.names && _.isArray(indicatorJson.prop.names) && indicatorJson.prop.names.length > 0) {
            var verdictObj = exports.evaluatePropBasedCondition(indicatorJson.prop, vmo, indicatorJson.tooltip, getModelObjCallBack); // If value for target object matching prop condition, is not NULL, then
            // We have to ensure that all values are processed and if any of the value
            // is not processed, we have to chk if default indicator exist and use it as default
            // E.g. lets say we are processing release_status indicator and given VMO has
            // total 3 status ["Approved", "Pending", "Rejected"]. We get matching indicator for
            // "Approved" status however other there are no matching indicators for "Pending"/"Rejected"
            // So for "Pending" and "Rejected" we have to render default indicator chk if it exists
            // This example is taken for release_status but code here is generic and applies to
            // other cases as well.

            if (verdictObj.isDefaultIndicatorChkReqd) {
              // This will be true if prop is valid and has value.
              // We take first prop name because current props structure only supports single prop
              // sourcePropName - this captures source prop on VMO for which indicator needs
              // to be rendered e.g. release_status. Check if there is info for this prop
              var sourcePropName = indicatorJson.prop.names[0];

              if (vmPropVsVisualIndicatorInfo.hasOwnProperty(sourcePropName)) {
                if (verdictObj.hasIndicatorMatchedVal) {
                  // If indicator has matched to one of value, remove value that has matched from pendingValues list
                  var visualIndicatorInfoForProp = vmPropVsVisualIndicatorInfo[sourcePropName];
                  var index = -1;

                  for (var i = 0; i < visualIndicatorInfoForProp.pendingValues.length; i++) {
                    if (visualIndicatorInfoForProp.pendingValues[i].dbValue === verdictObj.matchingVal) {
                      index = i;
                      break;
                    }
                  }

                  if (index >= 0) {
                    visualIndicatorInfoForProp.pendingValues.splice(index, 1);
                  }
                }
              } else {
                // Add entry for sourceProp in vmPropVsVisualIndicatorInfo- so that we process
                // pendingValues only once
                if (verdictObj.alltargetObjUids) {
                  vmPropVsVisualIndicatorInfo[sourcePropName] = {
                    pendingValues: []
                  };
                  var tgtPropName = verdictObj.targetPropName;

                  if (!verdictObj.targetPropName) {
                    tgtPropName = 'object_string';
                  }

                  for (var i = 0; i < verdictObj.alltargetObjUids.length; i++) {
                    var refObj = getModelObjCallBack(verdictObj.alltargetObjUids[i]);
                    var pendingVal = {
                      dbValue: '',
                      uiValue: ''
                    };

                    for (var targetProp in tgtPropName) {
                      var tgtProp = tgtPropName[targetProp];
                      var prop = refObj.props[tgtProp];

                      if (prop && prop.dbValue) {
                        pendingVal.dbValue += prop.dbValue + '\n';
                        pendingVal.uiValue += prop.uiValue + '\n';
                      } else if (prop && prop.dbValues && prop.dbValues.length > 0) {
                        pendingVal.dbValue += prop.dbValues[0] + '\n';
                        pendingVal.uiValue += prop.uiValues[0] + '\n';
                      }
                    }

                    if (!verdictObj.hasIndicatorMatchedVal || verdictObj.hasIndicatorMatchedVal && pendingVal.dbValue !== verdictObj.matchingVal) {
                      vmPropVsVisualIndicatorInfo[sourcePropName].pendingValues.push(pendingVal);
                    }
                  }
                }
              }
            }

            if (verdictObj.hasIndicatorMatchedVal) {
              var indicator = exports.getIndicatorFromParams(indicatorJson, verdictObj.tooltip);
              indicatorsArray.push(indicator);
            }
          }

          if (isValid && conditions) {
            isValid = expressionParserUtils.evaluateConditions(conditions, vmo);
          }

          if (isValid && !indicatorJson.prop) {
            var indicator = exports.generateIndicator(vmo, indicatorJson);

            if (indicator && !_.isEqual(indicator.tooltip, '')) {
              indicatorsArray.push(indicator);
            }
          }
        }
      }); // Process all properties whose values need default visual indicator


      for (var prop in vmPropVsVisualIndicatorInfo) {
        var valuesForDefaultInd = vmPropVsVisualIndicatorInfo[prop].pendingValues;
        var indicatorJson = exports.getDefaultIndicator(prop, vmo);

        for (var i = 0; i < valuesForDefaultInd.length; i++) {
          var indicator = exports.getIndicatorFromParams(indicatorJson, valuesForDefaultInd[i].uiValue);
          indicatorsArray.push(indicator);
        }
      }

      return indicatorsArray;
    };
    /**
     * Gets the default indicator for a property
     *
     * @return {Object} Indicator object which is default for a given prop
     */


    exports.getDefaultIndicator = function (propName, obj) {
      var defaultIndicator = null;

      _.forEach(_indicators, function (indicatorJson) {
        if (indicatorJson) {
          var prop = indicatorJson.prop;

          if (prop && prop.names && _.isArray(prop.names) && prop.names.length > 0) {
            // If prop is defined correctly, see if it is valid to default for input propName
            if (prop.names.indexOf(propName) >= 0 && prop.conditions && _.isEmpty(prop.conditions)) {
              defaultIndicator = indicatorJson;
              return false;
            }
          }
        }
      });

      return defaultIndicator;
    };
    /**
     * Generates indicator object if tooltips are available for given view model object
     *
     * @return {Object} Indicator object which contains tooltip and icon
     */


    exports.generateIndicator = function (vmo, indicatorJson) {
      var indicator;

      if (vmo && indicatorJson && indicatorJson.tooltip) {
        var indicatorProps = indicatorJson.tooltip.propNames;

        if (_.isArray(indicatorProps)) {
          var finalTooltip = '';

          for (var indx = 0; indx < indicatorProps.length; indx++) {
            var tooltip = '';
            var propValues = [];
            var indicatorProp = indicatorProps[indx];

            if (indicatorProp && vmo.props.hasOwnProperty(indicatorProp)) {
              var vmProp = vmo.props[indicatorProp];

              if (vmProp) {
                propValues = vmProp.displayValues;
              }

              if (propValues && propValues.length > 0) {
                for (var i = 0; i < propValues.length; i++) {
                  var propValue = propValues[i];

                  if (propValue && propValue !== ' ') {
                    if (tooltip === '' && indicatorJson.tooltip.showPropDisplayName) {
                      tooltip = vmProp.propertyDisplayName + ': ';
                    }

                    if (i !== propValues.length - 1) {
                      tooltip += propValue + '\n';
                    } else {
                      tooltip += propValue;
                    }
                  }
                }

                if (finalTooltip === '') {
                  finalTooltip = tooltip;
                } else {
                  finalTooltip = finalTooltip + '\n' + tooltip;
                }
              }
            }
          }

          var indicatorType = indicatorJson.iconName;
          var icon = $sce.trustAsHtml(iconSvc.getIndicatorIcon(indicatorType));

          if (!icon) {
            // Show the missing image indicator if not found.
            icon = $sce.trustAsHtml(iconSvc.getTypeIcon('MissingImage'));
          }

          indicator = {
            tooltip: finalTooltip,
            // Sanitize the command icon
            image: icon
          };
        }
      }

      return indicator;
    };

    exports.isValidPropName = function (prop, obj) {
      var isValid = false;

      for (var index in prop.names) {
        var propName = prop.names[index];

        if (obj.props.hasOwnProperty(propName)) {
          isValid = true;
          break;
        }
      }

      return isValid;
    };
    /**
     * Evaluates prop based condition structure
     *
     * @return {Object} verdictObject containing indicator matching information
     * verdictObj
        {
            isDefaultIndicatorChkReqd:    if property is valid AND  has atleast one value
            targetPropName           :    condition prop name on the target object
            alltargetObjUids: []     :    All values for target reference object
            hasIndicatorMatchedVal   :    If input indicator has matched exact value
            matchingVal              :    What exact value indicator matched to e.g. "Approved"
            tooltip                  :   "localized(Approved)" # based on Display Name
        }
     */


    exports.evaluatePropBasedCondition = function (prop, obj, tooltip, getModelObjCallBack) {
      var verdictObj = {};

      if (prop.names && obj) {
        // If the type configured in json matches with the object which is being evaluated
        var isValid = exports.isValidPropName(prop, obj);

        if (isValid) {
          verdictObj.isDefaultIndicatorChkReqd = true;
          var propNames = prop.names;

          for (var index in propNames) {
            var propName = propNames[index];
            var vmoPropVal = obj.props[propName];

            if (vmoPropVal) {
              if (prop.conditions && !_.isEmpty(prop.conditions)) {
                verdictObj.hasIndicatorMatchedVal = expressionParserUtils.evaluateConditions(prop.conditions, obj);
                verdictObj.targetPropName = tooltip.propNames;

                if (verdictObj.hasIndicatorMatchedVal) {
                  verdictObj.tooltip = '';
                  verdictObj.matchingVal = '';
                  verdictObj.tooltipPref = tooltip; // matchingVal is used to compare Actual value in english specified in indicator.json
                  // tooltip is used to display message when indicator is hovered - It has to be localized value

                  var tooltipPropNames = tooltip.propNames;

                  for (var tooltipProp in tooltipPropNames) {
                    var tooltipPropName = tooltipPropNames[tooltipProp];
                    verdictObj.matchingVal += obj.props[tooltipPropName].dbValues[0] + '\n';
                    verdictObj.tooltip += obj.props[tooltipPropName].uiValues[0] + '\n';
                  }

                  break;
                }
              } else if (prop.type) {
                // it expects a property to have a OBJECT type of value only
                var refObjUid = null;

                if (vmoPropVal.dbValue && !_.isArray(vmoPropVal.dbValue)) {
                  refObjUid = vmoPropVal.dbValue;
                  var refObj = getModelObjCallBack(refObjUid);

                  if (refObj) {
                    var evaluatedVerdict = exports.evaluatePropBasedCondition(prop.type.prop, refObj, tooltip);
                    evaluatedVerdict.alltargetObjUids = [vmoPropVal.dbValue];
                    return evaluatedVerdict;
                  }
                } else if (vmoPropVal.dbValues && vmoPropVal.dbValues.length > 0) {
                  for (var index in vmoPropVal.dbValues) {
                    var refObj = getModelObjCallBack(vmoPropVal.dbValues[index]);

                    if (refObj) {
                      var evaluatedVerdict = exports.evaluatePropBasedCondition(prop.type.prop, refObj, tooltip);
                      evaluatedVerdict.alltargetObjUids = vmoPropVal.dbValues;

                      if (evaluatedVerdict.hasIndicatorMatchedVal) {
                        return evaluatedVerdict;
                      }

                      verdictObj = evaluatedVerdict;
                    }
                  }
                } else {
                  // There are no value in referenced object so default value check is not required
                  verdictObj.isDefaultIndicatorChkReqd = false;
                }
              }
            }
          }
        }
      }

      return verdictObj;
    };
    /**
     * API to get indicator based on parameters
     *
     * @param {Object} indicator
     */


    exports.getIndicatorFromParams = function (indicatorJson, tooltip) {
      var indicatorFile = null;

      if (indicatorJson !== null) {
        indicatorFile = indicatorJson.iconName;
      }

      var icon = $sce.trustAsHtml(iconSvc.getIndicatorIcon(indicatorFile));

      if (!icon || indicatorFile === null) {
        // Show the missing image indicator if not found.
        icon = $sce.trustAsHtml(iconSvc.getTypeIcon('MissingImage'));
      }

      return {
        tooltip: tooltip,
        // Sanitize the command icon
        image: icon
      };
    };
    /**
     * API to override generated indicators for testing only.
     *
     * @param {Object} indicatorsOverride
     */


    exports.setIndicators = function (indicatorsOverride) {
      _indicators = indicatorsOverride;
    };

    return exports;
  }]);
});