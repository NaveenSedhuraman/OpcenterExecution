"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Utility Service For list. This service takes the output from the SOA for display in the listbox.
 *
 * @module js/listBoxService
 */
define(['app', 'lodash', 'soa/kernel/clientDataModel', 'soa/kernel/clientMetaModel'], //
function (app, _) {
  'use strict';

  var exports = {};
  var _cdm = null;
  var _cmm = null;
  /**
   * Get ModelObjects from given array
   *
   * @return {ObjectArray} - Model Objects.
   */

  var _getModelObjects = function _getModelObjects(modelObjectsArray) {
    var modelObjects = [];

    for (var i in modelObjectsArray) {
      if (modelObjectsArray[i].uid) {
        modelObjects.push(_cdm.getObject(modelObjectsArray[i].uid));
      } else {
        modelObjects.push(modelObjectsArray[i]);
      }
    }

    return modelObjects;
  };
  /**
   * Return an empty ListModel object.
   *
   * @return {Object} - Empty ListModel object.
   */


  var _getEmptyListModel = function _getEmptyListModel() {
    return {
      propDisplayValue: '',
      propInternalValue: '',
      propDisplayDescription: '',
      hasChildren: false,
      children: {},
      sel: false
    };
  };
  /**
   * Given an array of objects to be represented in listbox, this function returns an array of ListModel objects for
   * consumption by the listbox widget.
   *
   * @param {ObjectArray} objArray - Array of objects
   * @param {String} path - If each object is a structure, then this is the path to the display string in each object;
   *            If each object represents a Model Object, then path is the Model Object property which holds the
   *            display value
   * @param {boolean} addEmpty1stItem - true if add empty item to head of list
   *
   * @return {ObjectArray} - Array of ListModel objects.
   */


  exports.createListModelObjects = function (objArray, path, addEmpty1stItem) {
    var listModels = [];
    var listModel = null;

    if (addEmpty1stItem) {
      listModel = _getEmptyListModel();
      listModels.push(listModel);
    }

    var modelObjects = _getModelObjects(objArray);

    _.forEach(modelObjects, function (modelObj) {
      var dobj = _.get(modelObj, path);

      var dispName;

      if (modelObj.props) {
        dispName = dobj.getDisplayValue();
      } else {
        dispName = dobj;
      }

      listModel = _getEmptyListModel();
      listModel.propDisplayValue = dispName;
      listModel.propInternalValue = modelObj;
      listModels.push(listModel);
    });

    return listModels;
  };
  /**
   * Given an array of Strings to be represented in listbox, this function returns an array of ListModel objects for
   * consumption by the listbox widget.
   *
   * @param {ObjectArray} strings - The Strings array
   *
   * @return {ObjectArray} - Array of ListModel objects.
   */


  exports.createListModelObjectsFromStrings = function (strings) {
    var listModels = [];

    _.forEach(strings, function (str) {
      var listModel = _getEmptyListModel();

      if (_cmm.containsType(str)) {
        var type = _cmm.getType(str);

        listModel.propDisplayValue = type.displayName;
        listModel.propInternalValue = type.name;
      } else {
        listModel.propDisplayValue = str;
        listModel.propInternalValue = str;
      }

      listModels.push(listModel);
    });

    return listModels;
  };
  /**
   * Utility service for converting static lists to array of ListModel objects for consumption by listbox widget.
   *
   * @member listBoxService
   * @memberof NgServices
   */


  app.factory('listBoxService', //
  ['soa_kernel_clientDataModel', 'soa_kernel_clientMetaModel', //
  function (cdm, cmm) {
    _cdm = cdm;
    _cmm = cmm;
    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which service
   * should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'listBoxService'
  };
});