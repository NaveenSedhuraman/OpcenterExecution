"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service handles setting or resetting the number and order of columns in a table.
 *
 * @module js/columnArrangeService
 */
define(['app', 'assert', 'lodash', 'js/declUtils', 'js/eventBus', //
'js/actionService', 'js/appCtxService', 'js/awColumnService'], //
function (app, assert, _, declUtils, eventBus) {
  'use strict';

  var _actionSvc;

  var _appCtxSvc;

  var _awColumnSvc;

  var _$q;

  var exports = {};
  /**
   * Arrange the table columns
   *
   * @param {Object} declViewModel - The DeclViewModel to execute the event within.
   * @param {Object} eventData - The event info containing the following properties:
   *
   * <pre>
   *  {String} arrangeType - Operation to perform 'reset', 'saveColumnAction' or 'saveColumnAndLoadAction'.
   *  {AwTableColumnInfoArray} columns - When type is a 'Column' action this array specifies the desired columns in the desired order.
   * </pre>
   *
   * @return {Promise} A promise which is resolved (with no data object being returned) when the operation
   *         specified in the 'eventData' has been performed.
   */

  exports.arrangeColumns = function (declViewModel, eventData) {
    declUtils.assertValidModel(declViewModel);
    var sourceGrid = declViewModel.grids[eventData.name]; // If grid id in model doesn't match the one in eventData, then just return doing nothing.
    // Because eventData.name itself is current grid id.

    if (!sourceGrid) {
      return _$q.resolve();
    }

    var gridsToArrange = {};
    gridsToArrange[eventData.name] = sourceGrid;

    if (eventData.objectSetUri) {
      _.forEach(declViewModel.grids, function (currentGrid, currentGridName) {
        var columnProvider = declViewModel.columnProviders[currentGrid.columnProvider];

        if (!gridsToArrange[currentGridName] && eventData.objectSetUri === columnProvider.objectSetUri) {
          gridsToArrange[currentGridName] = currentGrid;
        }
      });
    }

    _.forEach(gridsToArrange, function (declGrid) {
      var colProvider = declViewModel.columnProviders[declGrid.columnProvider];
      assert(colProvider, 'Invalid columnProvider');
      var dataProvider = declViewModel.dataProviders[declGrid.dataProvider];
      assert(dataProvider, 'Invalid dataProvider');
      var evaluationCtx;
      var arrangeType = eventData.arrangeType;

      if (dataProvider.columnConfig) {
        if (arrangeType === 'reset' && colProvider.resetColumnAction) {
          var resetColumnAction = declViewModel.getAction(colProvider.resetColumnAction);

          if (resetColumnAction) {
            evaluationCtx = {
              data: declViewModel,
              ctx: _appCtxSvc.ctx
            };
            var inputOpType = resetColumnAction.inputData.getOrResetUiConfigsIn && resetColumnAction.inputData.getOrResetUiConfigsIn[0] && resetColumnAction.inputData.getOrResetUiConfigsIn[0].columnConfigQueryInfos[0] && resetColumnAction.inputData.getOrResetUiConfigsIn[0].columnConfigQueryInfos[0].operationType; //typesForArrange stores typeNames of currently loaded objects. This parameter is used
            //in a query that fetches columns along with clientScopeUri, operationType etc.

            var inputTypesForArrange = dataProvider.columnConfig.typesForArrange;

            var postResetFunc = function postResetFunc() {
              _.forEach(dataProvider.resetColumnConfigs, function (config) {
                _.forEach(config.columnConfigurations, function (innerConfig) {
                  if (innerConfig.columnConfigId === dataProvider.columnConfig.columnConfigId) {
                    _.forEach(innerConfig.columns, function (col) {
                      // reset soa is still returning some fields on a propDesc
                      if (col.propDescriptor) {
                        col.displayName = col.propDescriptor.displayName;
                        col.name = col.propDescriptor.propertyName;
                        col.propertyName = col.propDescriptor.propertyName;
                        col.typeName = col.columnSrcType;
                      }
                    }); // there is a bug in tc10/11 where opType is not retured from the reset SOA
                    // work-around by assuming that it isn't changing


                    if (!innerConfig.operationType) {
                      innerConfig.operationType = inputOpType;
                    } //Restore typesForArrange when typesForArrange is not returned from the reset SOA.


                    if (!innerConfig.typesForArrange && inputTypesForArrange) {
                      innerConfig.typesForArrange = inputTypesForArrange;
                    }

                    dataProvider.columnConfig = innerConfig;
                    dataProvider.resetColumnConfigs = null;
                    return false;
                  }
                });
              });
            };

            if (resetColumnAction.deps) {
              return declUtils.loadDependentModule(resetColumnAction.deps, _$q, app.getInjector()).then(function (debModuleObj) {
                return _actionSvc.executeAction(declViewModel, resetColumnAction, evaluationCtx, debModuleObj).then(postResetFunc);
              });
            }

            return _actionSvc.executeAction(declViewModel, resetColumnAction, evaluationCtx, null).then(postResetFunc);
          }

          return _$q.reject('Invalid resetColumnAction specified: ' + colProvider.resetColumnAction);
        } else if (arrangeType === 'saveColumnAndLoadAction' || arrangeType === 'saveColumnAction') {
          // Make sure when 'saveColumnAction' is used, that ViewModel has defined one, otherwise use saveColumnAndLoadAction as default
          var saveActionByArrangeType = arrangeType === 'saveColumnAction' && colProvider.saveColumnAction ? colProvider.saveColumnAction : colProvider.saveColumnAndLoadAction;
          var saveColumnAction = declViewModel.getAction(saveActionByArrangeType);

          if (saveColumnAction) {
            var soaColumnInfos = [];
            var newCols = [];
            var index = 100;
            var staticFirstColumnName = ''; // Build a map for columns

            var columns = {};

            _.forEach(dataProvider.columnConfig.columns, function (col) {
              columns[col.propertyName] = col;
            }); // restore first column. this is necessary when updating cols from arrange panel since
            // static first col is not shown on that panel and needs to be added back in...


            if (declGrid.gridOptions.useStaticFirstCol) {
              var firstPropName = dataProvider.columnConfig.columns[0].propertyName;
              var newFirstPropName = eventData.columns[0].propertyName;

              if (newFirstPropName && newFirstPropName !== firstPropName && newFirstPropName !== 'icon') {
                var firstColumnInfo = _awColumnSvc.createSoaColumnInfo(dataProvider.columnConfig.columns[0], index);

                staticFirstColumnName = dataProvider.columnConfig.columns[0].propertyName; // TARGET_AW43
                // Soas need to be updated to allow new column def flags
                // Until then we have to manually remove isFilteringEnabled to avoid
                // schema validation failing and throwing errors
                // Remove this line when soa is updated

                delete firstColumnInfo.isFilteringEnabled;
                soaColumnInfos.push(firstColumnInfo);
                index += 100; // Find old column from map, clone new column, and update its values

                var column = columns[dataProvider.columnConfig.columns[0].propertyName];

                if (column) {
                  newCols.push(column);
                }
              }
            } // Update the column for sending via SOA


            _.forEach(eventData.columns, function (col) {
              // Before saving, remove the icon column and skip the already added static col
              if (col.name === 'icon' || col.name === staticFirstColumnName) {
                return;
              }

              var soaColumnInfo = _awColumnSvc.createSoaColumnInfo(col, index); // TARGET_AW43
              // Soas need to be updated to allow new column def flags
              // Until then we have to manually remove isFilteringEnabled to avoid
              // schema validation failing and throwing errors
              // Remove this line when soa is updated


              delete soaColumnInfo.isFilteringEnabled;
              soaColumnInfos.push(soaColumnInfo);
              index += 100; // Find column from map and update its values

              var column = columns[col.propertyName];

              if (column) {
                column.hiddenFlag = col.hiddenFlag;
                column.isFilteringEnabled = col.isFilteringEnabled;
                column.pixelWidth = col.pixelWidth;
                column.sortDirection = col.sortDirection;
                column.sortPriority = col.sortPriority;
                newCols.push(column);
              }
            });

            dataProvider.newColumns = soaColumnInfos;
            dataProvider.columnConfig.columns = newCols;
            evaluationCtx = {
              data: declViewModel,
              ctx: _appCtxSvc.ctx,
              eventData: eventData
            }; // Reset start index because we are replacing vmos with this data load

            dataProvider.startIndex = 0;

            if (saveColumnAction.deps) {
              return declUtils.loadDependentModule(saveColumnAction.deps, _$q, app.getInjector()).then(function (debModuleObj) {
                return _actionSvc.executeAction(declViewModel, saveColumnAction, evaluationCtx, debModuleObj).then(function (result) {
                  if (result.searchResultsJSON && !result.searchResults) {
                    result.searchResults = JSON.parse(result.searchResultsJSON);
                    delete result.searchResultsJSON;
                  }

                  if (result.searchResults) {
                    eventData = eventData ? eventData : {};
                    eventData.viewModelObjects = result.searchResults;
                    eventData.noResults = dataProvider.noResults;
                    eventData.totalFound = result.totalFound; // set incompleteTail to enable scrolling after vmo reset done by column config

                    if (result.totalLoaded < result.totalFound) {
                      _.last(eventData.viewModelObjects).incompleteTail = true;
                    } // Publish event


                    eventBus.publish(dataProvider.name + '.modelObjectsUpdated', eventData);
                  }

                  dataProvider.newColumns = null;
                });
              });
            }

            return _actionSvc.executeAction(declViewModel, saveColumnAction, evaluationCtx, null).then(function () {
              dataProvider.newColumns = null;
            });
          }

          return _$q.reject('Invalid saveColumnAction specified: ' + saveActionByArrangeType);
        }
      }
    });

    return _$q.resolve(null);
  };
  /**
   * Return the type names from search filter map
   *
   * @param {Object} searchFilterMap - Search Filter Map
   *
   * @return {StringArray} The type names array
   */


  exports.getTypeNames = function (searchFilterMap) {
    var typeNames = [];

    var filters = _.get(searchFilterMap, 'WorkspaceObject.object_type');

    if (!filters) {
      filters = _.get(searchFilterMap, 'SAVED_QUERY_RESULT_TYPES');
    }

    var hasSelectedFilters = false;

    if (_.isArray(filters)) {
      _.forEach(filters, function (searchFilter) {
        if (searchFilter.selected) {
          hasSelectedFilters = true;
        }
      });

      _.forEach(filters, function (searchFilter) {
        var addType = true;

        if (hasSelectedFilters && !searchFilter.selected) {
          addType = false;
        }

        if (addType) {
          var typeName = _.get(searchFilter, 'stringValue');

          if (typeNames.indexOf(typeName) < 0) {
            typeNames.push(typeName);
          }
        }
      });
    }

    if (typeNames.length === 0) {
      typeNames.push('WorkspaceObject');
    }

    var indexOfNone = typeNames.indexOf('$NONE');

    if (indexOfNone > 0) {
      typeNames.splice(indexOfNone, 1);
    }

    return typeNames;
  };

  exports.processArrangeSettings = function (dataProvider, gridId, gridOptions) {
    var cols = _.clone(dataProvider.cols); // internal gwt arrange panel blindly strips the first column assuming it is icon but when we are using a static
    // first column (tree / quickTable), we want to also strip the first prop column since that can't be rearranged.
    // so pre-emptively slice off the icon column... This fragile dependency should be re-worked when the native
    // arrange panel is written.


    if (gridOptions.useStaticFirstCol && cols[0].name === 'icon') {
      cols.splice(0, 1);
    }

    var grididSetting = {
      name: gridId,
      columnConfigId: dataProvider.columnConfig.columnConfigId,
      objectSetUri: dataProvider.objectSetUri,
      columns: cols,
      useStaticFirstCol: Boolean(gridOptions.useStaticFirstCol),
      showFirstColumn: true
    }; // If objectset arrange, we need the operationType, otherwise searchResponseInfo will be used in arrange.service

    if (dataProvider.objectSetUri) {
      grididSetting.operationType = dataProvider.columnConfig.operationType;
    }

    _appCtxSvc.registerCtx('ArrangeClientScopeUI', grididSetting);
  };
  /**
   * Register this service with AngularJS.
   *
   * @member columnArrangeService
   * @memberof NgServices
   */


  app.factory('columnArrangeService', //
  ['$q', 'actionService', 'appCtxService', 'awColumnService', //
  function ($q, actionSvc, appCtxSvc, awColumnSvc) {
    _appCtxSvc = appCtxSvc;
    _actionSvc = actionSvc;
    _awColumnSvc = awColumnSvc;
    _$q = $q;
    return exports;
  }]);
  /**
   * Return this service name as the 'moduleServiceNameToInject' property.
   */

  return {
    moduleServiceNameToInject: 'columnArrangeService'
  };
});