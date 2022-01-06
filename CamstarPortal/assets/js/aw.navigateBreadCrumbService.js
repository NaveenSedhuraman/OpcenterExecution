"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines {@link NgServices.aw.navigateBreadCrumbService} which provides the data for navigation bread crumb from url.
 *
 * @module js/aw.navigateBreadCrumbService
 */
define(['app', 'lodash', 'jquery', 'js/eventBus', 'js/logger', 'soa/kernel/clientDataModel', 'soa/dataManagementService', 'js/appCtxService', 'js/localeService'], function (app, _, $, eventBus, logger) {
  'use strict';

  var exports = {};

  var _selectionCountLabel;

  var _dataCountLabel;
  /**
   * Service to manage navigate bread crumb
   *
   * @class commandService
   * @param contributionService {Object} - Contribution service
   * @memberOf NgServices
   */


  app.service('aw.navigateBreadCrumbService', ['soa_kernel_clientDataModel', 'soa_dataManagementService', '$state', '$q', 'appCtxService', 'localeService', function (cdm, dms, $state, $q, appCtxService, localeService) {
    // Load title async
    localeService.getTextPromise('XRTMessages').then(function (xrtMessages) {
      _selectionCountLabel = xrtMessages.selectionCountLabel;
      _dataCountLabel = xrtMessages.dataCount;
    });
    /**
     * Build Skeleton for bread crumb
     *
     * @param {Object|null} provider - bread crumb provider
     * @return {Object} provider
     */

    exports.buildBreadcrumbProviderSkeleton = function (provider) {
      if (!provider) {
        provider = {
          crumbs: [],
          clear: function clear() {
            exports.setCrumbs([]);
          },
          onSelect: function onSelect(crumb) {
            exports.addOrRemoveCrumb(crumb.internalName);
          }
        };
      }

      return provider;
    };
    /**
     * read url and build the model object crumb list
     *
     * @param {String} breadcrumbId - bread crumb ID
     * @return {Object} promise
     */


    exports.readUrlForCrumbs = function (breadcrumbId, readSelection) {
      var modelObjectList = {};
      var absentModelObjectData = []; // filter it out with URL params

      var bcParams = $state.params[breadcrumbId];
      var selId;

      if (readSelection) {
        selId = $state.params.s_uid;
      }

      if (bcParams) {
        var docId = bcParams.split('^');

        if (selId) {
          docId.push(selId);
        } // this is for d_uids


        if (docId && docId.length) {
          docId.forEach(function (element) {
            modelObjectList[element] = '';
          });
        }

        $.each(modelObjectList, function (key) {
          var modelObject = cdm.getObject(key);

          if (modelObject) {
            modelObjectList[modelObject.uid] = modelObject;
          } else {
            absentModelObjectData.push(key);
          }
        });

        if (absentModelObjectData && absentModelObjectData.length) {
          return dms.loadObjects(absentModelObjectData).then(function (serviceData) {
            for (var i = 0; i < absentModelObjectData.length; i++) {
              var modelObject = serviceData.modelObjects[absentModelObjectData[i]];
              modelObjectList[absentModelObjectData[i]] = modelObject;
            }

            return modelObjectList;
          }, function () {
            logger.error('SOA error :: cannot load objects.');
          });
        }
      }

      return $q.resolve(modelObjectList);
    };
    /**
     * form a crumb
     *
     * @function generateCrumb
     * @memberOf NgServices
     * @param {String} displayName - display name
     * @param {Boolean} showChevron - show chevron?
     * @param {Boolean} selected - selected?
     * @param {String} selectedUid - selected UID
     * @return {Object} crumb
     */


    exports.generateCrumb = function (displayName, showChevron, selected, selectedUid) {
      return {
        displayName: displayName,
        showArrow: showChevron,
        selectedCrumb: selected,
        scopedUid: selectedUid,
        clicked: false
      };
    };
    /**
     * build default crumbs
     *
     * @function buildDefaultCrumbs
     * @memberOf NgServices
     * @param {Object} breadCrumbMap - bread crumb map
     * @return {Object} crumbsList
     */


    exports.buildDefaultCrumbs = function (breadCrumbMap) {
      var crumbsList = [];
      $.each(breadCrumbMap, function (key, val) {
        var crumb = exports.generateCrumb(val, true, false, key);
        crumbsList.push(crumb);
      });

      if (crumbsList.length > 0) {
        crumbsList[crumbsList.length - 1].showArrow = false;
        crumbsList[crumbsList.length - 1].selectedCrumb = true;
      }

      return crumbsList;
    };
    /**
     * build the bread crumb url
     *
     * @function buildBreadcrumbUrl
     * @memberOf NgServices
     * @param {String} bcId
     * @param {String} selectedUid
     * @param {Boolean} navigate
     * @param {Boolean} selected
     */


    exports.buildBreadcrumbUrl = function (bcId, selectedUid, navigate) {
      var bcParams = $state.params[bcId];
      var selParams;

      if (navigate) {
        if (bcParams) {
          if (selectedUid !== null) {
            bcParams = bcParams.split('|')[0];

            if (bcParams.indexOf(selectedUid) !== -1) {
              bcParams = bcParams.split(selectedUid)[0] + selectedUid;
            } else {
              var clickedChevronContext = appCtxService.getCtx(bcId + 'Chevron');
              var parentUid = clickedChevronContext.scopedUid;

              if (bcParams.indexOf(parentUid) !== -1) {
                bcParams = bcParams.split(parentUid)[0] + parentUid + '^' + selectedUid;
              }
            }
          }
        } else {
          var selectedModelObj = appCtxService.getCtx('selected');

          if (selectedModelObj) {
            bcParams = selectedModelObj.uid;
          }
        }

        $state.params[bcId] = bcParams;
      } else {
        var clickedChevronContext = appCtxService.getCtx(bcId + 'Chevron');

        if (clickedChevronContext) {
          var parentUid = clickedChevronContext.scopedUid;

          if (bcParams.indexOf(parentUid) !== -1) {
            bcParams = bcParams.split(parentUid)[0] + parentUid;
          }

          $state.params[bcId] = bcParams;
        } // if some object is already selected, and we selected some diff. object


        selParams = $state.params.s_uid = selectedUid;
      }

      if (bcParams || selParams) {
        $state.go('.', $state.params);
        eventBus.publish('navigateBreadcrumb.refresh', bcId);
      }
    };
    /**
     * Retrive base crumb
     *
     * @param {Number} totalFound - total number of objects found
     * @param {Object[]} selectedObjects - array of selected objects
     * @param {Boolean} pwaMultiSelectEnabled - primary workarea multi selection enabled/disabled
     * @return {Object} base bread crumb
     */


    exports.getBaseCrumb = function (totalFound, selectedObjects, pwaMultiSelectEnabled) {
      var newBreadcrumb = {
        clicked: false,
        selectedCrumb: true,
        showArrow: false
      };

      if (pwaMultiSelectEnabled) {
        newBreadcrumb.displayName = _selectionCountLabel.format(selectedObjects.length, _dataCountLabel.format(totalFound));
      } else {
        // simple count otherwise
        newBreadcrumb.displayName = _dataCountLabel.format(totalFound);
      }

      return newBreadcrumb;
    };
    /**
     * Retrive primary crumb
     *
     * @return {Object} primary crumb object
     */


    exports.getPrimaryCrumb = function () {
      var obj = cdm.getObject($state.params.uid);
      return {
        clicked: false,
        displayName: obj.props.object_string.uiValues[0],
        scopedUid: obj.uid,
        selectedCrumb: false,
        showArrow: true,
        primaryCrumb: true
      };
    };
    /**
     * Ensures object string property loaded
     *
     * @param {String[]} uidsToLoad - array of uids to load
     * @return {Promise} A promise is return which resolves after 'object_string' properties are loaded
     */


    exports.ensureObjectString = function (uidsToLoad) {
      if (!exports.ensureObjectString.loadPromise) {
        // One at most will trigger server call
        exports.ensureObjectString.loadPromise = dms.loadObjects(uidsToLoad).then(function () {
          return dms.getProperties(uidsToLoad, ['object_string']);
        }).then(function () {
          exports.ensureObjectString.loadPromise = null;
        });
      }

      return exports.ensureObjectString.loadPromise;
    };
    /**
     * Sublocation specific override to build breadcrumb
     *
     * @function buildNavigateBreadcrumb
     * @memberOf NgControllers.NativeSubLocationCtrl
     *
     * @param {String} totalFound - Total number of results in PWA
     * @param {Object[]} selectedObjects - Selected objects
     * @return {Object} bread crumb provider
     */


    exports.buildNavigateBreadcrumb = function (totalFound, selectedObjects) {
      var pwaSelectionInfo = appCtxService.getCtx('pwaSelectionInfo'); // If total found is not set show loading message

      var baseCrumb;

      if (totalFound === undefined) {
        baseCrumb = {
          clicked: false,
          selectedCrumb: true,
          showArrow: false
        };
        localeService.getLocalizedText('UIMessages', 'loadingMsg').then(function (msg) {
          baseCrumb.displayName = msg;
        });
        return {
          crumbs: [baseCrumb]
        };
      }

      baseCrumb = exports.getBaseCrumb(totalFound, selectedObjects, pwaSelectionInfo.multiSelectEnabled);
      var provider = {
        crumbs: [exports.getPrimaryCrumb()]
      };
      var missingObjectCrumbs = [];

      if ($state.params.d_uids) {
        provider.crumbs = provider.crumbs.concat($state.params.d_uids.split('^').map(function (uid) {
          var crumb = {
            clicked: false,
            displayName: uid,
            scopedUid: uid,
            selectedCrumb: false,
            showArrow: true
          };
          var obj = cdm.getObject(uid);

          if (obj && obj.props.object_string) {
            crumb.displayName = obj.props.object_string.uiValues[0];
          } else {
            missingObjectCrumbs.push(crumb);
          }

          return crumb;
        }));
      }

      if (pwaSelectionInfo.currentSelectedCount === 1) {
        var vmo = selectedObjects[0];
        var crumb = {
          clicked: false,
          displayName: vmo.props.object_string ? vmo.props.object_string.uiValues[0] : vmo.uid,
          scopedUid: vmo.uid,
          selectedCrumb: false,
          showArrow: true
        };
        provider.crumbs.push(crumb);
      } // Get the object_string


      exports.ensureObjectString(missingObjectCrumbs.map(function (crumb) {
        return crumb.scopedUid;
      }).filter(function (uid) {
        return uid;
      })) //
      .then(function () {
        // Update with the actual string title instead of uid
        missingObjectCrumbs.map(function (crumb) {
          var obj = cdm.getObject(crumb.scopedUid);

          if (obj && obj.props.object_string) {
            crumb.displayName = obj.props.object_string.uiValues[0];
          }
        });
      });
      var lastCrumb = provider.crumbs[provider.crumbs.length - 1];
      var lastObj = cdm.getObject(lastCrumb.scopedUid); // Don't show last crumb as link

      lastCrumb.selectedCrumb = true; // If the last object is not a folder leave the arrow

      if (!lastObj || lastObj.modelType.typeHierarchyArray.indexOf('Folder') === -1) {
        lastCrumb.showArrow = false;
      }

      if (baseCrumb && baseCrumb.displayName) {
        var d_uids = $state.params.d_uids;
        var currentFolderUid = $state.params.uid;

        if (d_uids) {
          var d_uidsArray = d_uids.split('^');

          if (d_uidsArray.length > 0) {
            currentFolderUid = _.last(d_uidsArray);
          }
        }

        if (provider.crumbs.length >= 2) {
          if (lastCrumb.showArrow && lastCrumb.scopedUid === currentFolderUid) {
            lastCrumb.objectsCountDisplay = ' (' + baseCrumb.displayName + ')';
          } else {
            var secondLastCrumb = provider.crumbs[provider.crumbs.length - 2];

            if (secondLastCrumb.showArrow && secondLastCrumb.scopedUid === currentFolderUid) {
              secondLastCrumb.objectsCountDisplay = ' (' + baseCrumb.displayName + ')';
            }
          }
        } else {
          lastCrumb.objectsCountDisplay = ' (' + baseCrumb.displayName + ')';
        }
      }

      return provider;
    };
    /**
     * Functionality to trigger after selecting bread crumb
     *
     * @param {Object} crumb - selected bread crumb object
     */


    exports.onSelectCrumb = function (crumb) {
      if ($state.params.d_uids) {
        var d_uids = $state.params.d_uids.split('^');
        var uidIdx = d_uids.indexOf(crumb.scopedUid);
        var d_uidsParam = uidIdx !== -1 ? d_uids.slice(0, uidIdx + 1).join('^') : null;
        var s_uidParam = d_uidsParam ? d_uids.slice(0, uidIdx + 1).slice(-1)[0] : $state.params.uid;
        $state.go('.', {
          d_uids: d_uidsParam,
          s_uid: s_uidParam
        });
      }
    };

    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'aw.navigateBreadCrumbService'
  };
});