"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Service to fetch extended type icons Requires typeIconsRegistry.json definition at each module level.
 *
 * @module js/typeIconsRegistryService
 */
define(['app', 'lodash', 'js/expressionParserUtils', 'js/configurationService', 'js/adapterService', //
'soa/kernel/clientMetaModel', 'soa/kernel/clientDataModel', 'config/typeIconsRegistry'], //
function (app, _, expressionParserUtils, cfgSvc) {
  'use strict';
  /**
   * This service returns extended type icons
   *
   * @memberof NgServices
   * @member typeIconsRegistryService
   */

  app.service('typeIconsRegistryService', ['soa_kernel_clientMetaModel', 'soa_kernel_clientDataModel', 'adapterService', function (cmm, cdm, adapterService) {
    //  FIXME this should be loaded async but before the sync API below that uses it is called
    var _typeIconsRegistry = cfgSvc.getCfgCached('typeIconsRegistry');

    var self = this;
    /**
     * Returns the custom icon registered against current vmo
     *
     * @return {String} Name of icon to be used against current vmo
     */

    self.isObjOfAnyTypeNames = function (type, modelType) {
      var isValid = false;

      _.forEach(type.names, function (typeName) {
        // If the type is purely a client view model object
        if (type.isClientViewModelObject === true && modelType === typeName) {
          isValid = true;
        } else {
          isValid = cmm.isInstanceOf(typeName, modelType);
        }

        if (isValid) {
          return false;
        }
      });

      return isValid;
    };

    self.getIconForType = function (type, obj) {
      if (type.names && obj && obj.modelType) {
        // If the type configured in json matches with the object which is being evaluated
        var isValid = self.isObjOfAnyTypeNames(type, obj.modelType);

        if (isValid) {
          /* -
           * If its a valid sub type,( in order)
           *     1. check if a icon file name has been associated
           *     2. if a property has been mentioned
           *     3. If a condition has been mentioned to evaluate the property
           *     4. If a nested type has been mentioned for a property
          -*/
          if (type.iconFileName) {
            return type.iconFileName + '.svg';
          } else if (type.prop && type.prop.names) {
            var prop = type.prop;
            var propNames = prop.names;
            var conditionVerdict = false;

            for (var index in propNames) {
              var propName = propNames[index];
              var vmoPropVal = obj.props[propName];

              if (vmoPropVal) {
                if (prop.conditions && prop.iconFileName) {
                  conditionVerdict = expressionParserUtils.evaluateConditions(prop.conditions, obj);

                  if (!conditionVerdict) {
                    break;
                  }
                } else if (prop.type) {
                  // it expects a property to have a OBJECT type of value only
                  var refObjUid = null;

                  if (vmoPropVal.dbValue) {
                    refObjUid = vmoPropVal.dbValue;
                  } else if (vmoPropVal.dbValues && vmoPropVal.dbValues.length > 0) {
                    refObjUid = vmoPropVal.dbValues[0];
                  }

                  var isType = cmm.isTypeUid(refObjUid);

                  if (isType) {
                    var typeObj = cmm.getType(refObjUid);

                    if (typeObj) {
                      return cmm.getTypeIconFileName(typeObj);
                    }
                  } else {
                    var refObj = cdm.getObject(refObjUid);

                    if (refObj) {
                      return self.getIconForType(prop.type, refObj);
                    }
                  }
                }
              } else {// this means property is not loaded in client
              }
            }

            if (prop.conditions && prop.iconFileName) {
              if (conditionVerdict) {
                return prop.iconFileName + '.svg';
              }
            }
          } else {
            return cmm.getTypeIconFileName(obj.modelType);
          }
        }
      }

      return null;
    };
    /**
     * Returns the custom thumbnail current vmo based on thumbnail configuration
     *
     * @return {Object} vmo containing the thumbnail information
     */


    self.getVmoForThumbnail = function (type, obj) {
      if (type.names && obj && obj.modelType) {
        // If the type configured in json matches with the object which is being evaluated
        var isValid = self.isObjOfAnyTypeNames(type, obj.modelType);

        if (isValid) {
          if (type.prop && type.prop.names) {
            var prop = type.prop;
            var propNames = prop.names;

            for (var index in propNames) {
              var propName = propNames[index];
              var vmoPropVal = obj.props[propName];

              if (vmoPropVal) {
                if (prop.type) {
                  // it expects a property to have a OBJECT type of value only
                  var refObjUid = null;

                  if (vmoPropVal.dbValue) {
                    refObjUid = vmoPropVal.dbValue;
                  } else if (vmoPropVal.dbValues && vmoPropVal.dbValues.length > 0) {
                    refObjUid = vmoPropVal.dbValues[0];
                  }

                  var isType = cmm.isTypeUid(refObjUid);

                  if (isType) {// invalid case
                  } else {
                    var refObj = cdm.getObject(refObjUid);

                    if (refObj) {
                      return self.getVmoForThumbnail(prop.type, refObj);
                    }
                  }
                }
              } else {// this means property is not loaded in client
              }
            }
          } else {
            return obj;
          }
        }
      }

      return null;
    };
    /**
     * Returns the custom thumbnail registered against current vmo
     *
     * @return {Object} vmo on which thumbnail information is present
     */


    self.getCustomVmoForThumbnail = function (vmo) {
      var customVmo = null;

      if (vmo && vmo.modelType) {
        _.forEach(_typeIconsRegistry, function (typeObj) {
          if (typeObj && typeObj.thumbnail) {
            customVmo = self.getVmoForThumbnail(typeObj.thumbnail, vmo);

            if (customVmo) {
              return false; // break
            }
          }
        });
      }

      return customVmo;
    };
    /**
     * Returns the custom icon registered against current vmo
     *
     * @return {String} Name of icon to be used against current vmo
     */


    self.getCustomIcon = function (vmo) {
      var finalTypeIconFileName = null;
      var finalPriority = -1;

      if (vmo && vmo.modelType) {
        _.forEach(_typeIconsRegistry, function (typeObj) {
          if (typeObj && typeObj.type) {
            var currPriority = typeObj.priority ? typeObj.priority : 1;
            var currTypeIconName = null;
            /**
             *
             * Case #1: If object does not need adapting, adaptedObj will be same as baseObj, icons too
             *
             * Case #2: If someone has defined icons for both base object (Ex: ItemRevision) and adaptable object (Ex: Awp0XRTObjectset in SWA)
             * then icons for adaptedObj and baseObj should be the same. Unreasonable to ask for different icon in PWA and SWA, correct?
             *
             * Case #3: No icon definitions have been declared, icons will be set to their default
             *
             */

            var adaptedObj = adapterService.getAdaptedObjectsSync([vmo])[0];
            var adaptedIcon = self.getIconForType(typeObj.type, adaptedObj);
            var baseIcon = self.getIconForType(typeObj.type, vmo);

            if (adaptedIcon) {
              currTypeIconName = adaptedIcon;
              currPriority = typeObj.priority ? typeObj.priority : currPriority + 1;
            } else {
              currTypeIconName = baseIcon;
            }

            if (currTypeIconName && currPriority > finalPriority) {
              finalPriority = currPriority;
              finalTypeIconFileName = currTypeIconName;
            }
          }
        });
      }

      return finalTypeIconFileName;
    };

    return self;
  }]);
});