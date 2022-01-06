"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This service is for exposing the native js data provider behavior. The module supports loading the module from GWT
 * and getting the native JS code invoked.
 *
 * @module js/uwDataProviderUtils
 */
define(['app', 'js/logger'], function (app, logger) {
  'use strict';

  var exports = {};
  /**
   * Native JS data adapter. This sits "between" the data provider and the consumer of that data. It acts as the api
   * mediator to request more data.
   *
   * @constructor
   */

  var NativeDataAdapter = function NativeDataAdapter() {
    var self = this; // members
    // sub structure/ references

    self.bindingCollection = {
      data: []
    }; // single data member as native array

    self.dataProvider = {
      moreRows: false
    };
    self.sortInfo = {}; // placeholder for future expansion

    self.filterInfo = {}; // placeholder for future expansion
    // operations

    self.reset = function () {
      logger.debug('Phase 0 - nativeDataAdapter reset');
    };

    self.dispose = function () {
      logger.debug('Phase 0 -  nativeDataAdapter dispose');
    };

    self.getFirstPage = function () {
      logger.debug('Phase 0 -  nativeDataAdapter getFirstPage');
    };

    self.getNextPage = function (skipcount, promise) {
      logger.debug('Phase 0 - nativeDataAdapter getNextPage()');

      if (self.dataProvider && self.dataProvider.getNextPage) {
        logger.debug('Phase 0 - nativeDataAdapter, invoke data source for next page'); // TODO - may need to come back here to push data into the bind collection
        // or to update counts & state here????    nested promise?

        self.dataProvider.getNextPage(skipcount, promise);
      } else {
        logger.debug('Phase 0 - nativeDataAdapter, no data source, resolve with empty');
        self.moreRows = false; // TODO - how else to identify no more data?

        if (self.bindingCollection && self.bindingCollection.data) {
          self.bindingCollection.data.length = 0; // clear
        }

        promise.resolve();
      }
    };

    self.getSortInfo = function () {
      return this.sortInfo;
    };

    self.getFilterInfo = function () {
      return this.filterInfo;
    };
  };
  /**
   * TODO
   *
   * @memberof NgServices
   * @member NativeDataAdapterService
   */


  app.factory('NativeDataAdapterService', function () {
    return new NativeDataAdapter();
  });
  /**
   * native JS implementation of the data provider. This is the paging based provider which can obtain more data from
   * a service as requested.
   */

  var NativePagingDataProvider = function NativePagingDataProvider() {
    var self = this; // members

    self.totalRowCount = 0;
    self.moreRows = true; // false;
    // sub structure/ references
    // operations

    self.dispose = function () {
      logger.debug('Phase 0 -  NativePagingDataProvider dispose');
    };

    self.getFirstPage = function () {
      logger.debug('Phase 0 -  NativePagingDataProvider getFirstPage');
    };

    self.getNextPage = function () {
      logger.debug('Phase 0 - NativePagingDataProvider getNextPage()');
    };
  };
  /**
   * TODO
   *
   * @memberof NgServices
   * @member NativePagingDataProviderService
   */


  app.factory('NativePagingDataProviderService', function () {
    return new NativePagingDataProvider();
  });
  /**
   * Native JS implementation of the data provider. This is the fixed size provider which knows the full set of data,
   * no paging needed/allowed.
   */

  var NativeFixedDataProvider = function NativeFixedDataProvider() {
    var self = this; // members

    self.totalRowCount = 0;
    self.moreRows = false;
    self.m_data = []; // sub structure/ references
    // operations

    self.dispose = function () {
      logger.debug('Phase 0 -  nativeFixedDataProvider dispose');
    }; // provide the native array of data contexts/entities to be added to the binding collection


    self.setObjects = function (list) {
      self.m_data = list;
      self.totalRowCount = list.length;
    };

    self.getFirstPage = function (promise) {
      logger.debug('Phase 0 -  nativeFixedDataProvider getFirstPage');
      promise.resolve(self.m_data);
    };

    self.getNextPage = function (skipcount, promise) {
      logger.debug('Phase 0 - nativeFixedDataProvider getNextPage()');
      promise.resolve([]); // no more data
    };
  };
  /**
   * TODO
   *
   * @memberof NgServices
   * @member NativeFixedDataProviderService
   */


  app.factory('NativeFixedDataProviderService', function () {
    return new NativeFixedDataProvider();
  });
  /**
   * TODO
   *
   * @return {NativeDataAdapter} TODO
   */

  exports.getDataAdapter = function () {
    return new NativeDataAdapter();
  };
  /**
   * TODO
   *
   * @return {NativePagingDataProvider} TODO
   */


  exports.getNativePagingDataProvider = function () {
    return new NativePagingDataProvider();
  };
  /**
   * TODO
   *
   * @return {NativeFixedDataProvider} TODO
   */


  exports.getFixedDataProvider = function () {
    return new NativeFixedDataProvider();
  };
  /**
   * @return TRUE
   */


  exports.isNativeDataAdapter = function (objectToTest) {
    return objectToTest instanceof NativeDataAdapter;
  };
  /**
   * @return TRUE
   */


  exports.isNativeFixedDataProvider = function (objectToTest) {
    return objectToTest instanceof NativeFixedDataProvider;
  };
  /**
   * @return TRUE
   */


  exports.isNativePagingDataProvider = function (objectToTest) {
    return objectToTest instanceof NativePagingDataProvider;
  };

  return exports;
});