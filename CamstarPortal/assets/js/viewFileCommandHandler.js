"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 document
 */

/**
 * This is the command handler for view file command
 *
 * @module js/viewFileCommandHandler
 */
define(['app', 'js/fmsUtils', //
'js/commandsMapService', 'js/localeService', 'js/messagingService', 'soa/kernel/clientDataModel', 'soa/fileManagementService'], //
function (app, fmsUtils) {
  'use strict';

  var exports = {};
  /**
   * Cached CommandsMapService
   */

  var _commandsMapSvc = null;
  /**
   * Cached locale service
   */

  var _localeSvc = null;
  /**
   * Cached messaging service
   */

  var _msgSvc = null;
  /**
   * Cached client data model service
   */

  var _cdm = null;
  /**
   * Cached file management service
   */

  var _fmsSvc = null;

  var showNoFileMessage = function showNoFileMessage() {
    _localeSvc.getTextPromise().then(function (localTextBundle) {
      _msgSvc.showInfo(localTextBundle.NO_FILE_TO_DOWNLOAD_TEXT);
    });
  };

  var processReadTicketResponse = function processReadTicketResponse(readFileTicketsResponse) {
    var originalFileName = null;

    if (readFileTicketsResponse && readFileTicketsResponse.tickets && readFileTicketsResponse.tickets.length > 1) {
      var imanFileArray = readFileTicketsResponse.tickets[0];

      if (imanFileArray && imanFileArray.length > 0) {
        var imanFileObj = _cdm.getObject(imanFileArray[0].uid);

        if (imanFileObj.props) {
          originalFileName = imanFileObj.props.original_file_name.uiValues[0];
          originalFileName.replace(' ', '_');
        }
      }

      var ticketsArray = readFileTicketsResponse.tickets[1]; // 1st element is array of iman file while 2nd element is array of tickets

      if (ticketsArray && ticketsArray.length > 0) {
        fmsUtils.openFile(ticketsArray[0], originalFileName);
      } else {
        showNoFileMessage();
      }
    } else {
      showNoFileMessage();
    }
  };
  /**
   * Set command context for show object cell command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */


  exports.setCommandContext = function (context, $scope) {
    if (!_commandsMapSvc.isInstanceOf('Dataset', context.modelType)) {
      $scope.cellCommandVisiblilty = true;
    } else {
      $scope.cellCommandVisiblilty = false;
    }
  };
  /**
   * Initialize the command handler service
   *
   */


  exports.init = function () {// no-op
  };
  /**
   * Execute the command.
   * <P>
   * The command context should be setup before calling isVisible, isEnabled and execute.
   *
   * @param {ViewModelObject} vmo - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   */


  exports.execute = function (vmo) {
    var props = null;

    if (vmo.props) {
      props = vmo.props;
    } else if (vmo.properties) {
      props = vmo.properties;
    }

    if (props) {
      var imanFiles = props.ref_list;

      if (imanFiles && imanFiles.dbValues.length > 0) {
        var imanFileUid = imanFiles.dbValues[0]; // process only first file uid

        var imanFileModelObject = _cdm.getObject(imanFileUid);

        var files = [imanFileModelObject];

        var promise = _fmsSvc.getFileReadTickets(files);

        promise.then(function (readFileTicketsResponse) {
          processReadTicketResponse(readFileTicketsResponse);
        });
      } else {
        showNoFileMessage();
      }
    }
  };
  /**
   * Show object command handler service which sets the visibility of the command in cell list based off object type.
   * This command is visible for all the object types except 'Dataset' and 'Folder'.
   *
   * @memberof NgServices
   * @member viewFileCommandHandler
   */


  app.factory('viewFileCommandHandler', ['commandsMapService', 'localeService', 'messagingService', 'soa_kernel_clientDataModel', 'soa_fileManagementService', //
  function (commandsMapSvc, localeSvc, msgSvc, cdm, fmsSvc) {
    _commandsMapSvc = commandsMapSvc;
    _localeSvc = localeSvc;
    _msgSvc = msgSvc;
    _cdm = cdm;
    _fmsSvc = fmsSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'viewFileCommandHandler'
  };
});