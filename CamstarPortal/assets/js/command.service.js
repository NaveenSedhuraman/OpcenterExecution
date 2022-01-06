"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines {@link NgServices.commandService} which manages commands.
 *
 * @module js/command.service
 *
 * @namespace commandService
 */
define([//
'app', //
'angular', //
'lodash', //
'js/eventBus', //
'js/logger', //
//
'js/contribution.service', //
'soa/preferenceService', //
'js/workspaceService'], function (app, ngModule, _, eventBus, logger) {
  'use strict';
  /**
   * Command service to manage commands.
   *
   * @member commandService
   * @memberOf NgServices
   *
   * @param {$q} $q - Service to use.
   * @param {contributionService} contributionService - Contribution service
   * @param {soa_preferenceService} preferenceService - Contribution service
   * @param {$rootScope} $rootScope - Contribution service
   */

  app.service('commandService', ['$q', 'contributionService', 'soa_preferenceService', '$rootScope', 'workspaceService', function ($q, contributionService, preferenceService, $rootScope, workSvc) {
    var self = this; // eslint-disable-line no-invalid-this

    /**
     * Temporary execution scope. If the caller doesn't pass any scope, create a temporary scope. The scope will
     * be destroyed in next execution
     */

    var commandExecutionScope = null;
    /**
     * Get the command overlays for the commands matching the given inputs. Calls the getCommands method on each
     * contributed provider and then return the aggregate result.
     *
     * @function _getCommandsInternal
     * @private
     * @memberOf NgServices.commandService
     * @param {String} commandAreaNameToken - Command area name token, eg. Navigation, Onestep, etc
     * @param {Object} context - Additional context to use in command evaluation
     *
     * @returns {Promise} A promise containing the array of command overlays
     */

    var _getCommandsInternal = function _getCommandsInternal(commandAreaNameToken, context) {
      // Get all of the command providers
      return contributionService.require('command-provider').then(function (providers) {
        // Explicitly order providers - later can override previous
        providers.sort(function (p1, p2) {
          return p1.priority - p2.priority;
        }); // Send a provider a promise that it will resolve with an array of commands
        // Merge all of the promises into a single promise with $q.all

        return $q.all(providers.map(function (provider) {
          var deferred = $q.defer();
          provider.getCommands(commandAreaNameToken, context, deferred);
          return deferred.promise;
        }));
      }) //
      .then(_.flatten) //
      .then(function (commands) {
        var workspaceCommands = self.filterWorkspaceCommands(commands); // Sort the commands based on relativeTo / priority

        var sortedCommands = self.sortCommands(workspaceCommands);
        return self.filterHiddenCommands(sortedCommands);
      });
    };
    /**
     * Filter commands that were hidden by preference
     *
     * @param {List<Command>} commands Command list to filter
     * @returns {Promise<List<Command>>} Filtered list of commands
     */


    self.filterHiddenCommands = function (commands) {
      return preferenceService.getStringValues('AWC_HiddenCommands').then(function (hiddenCommandIds) {
        // If hidden commands have been defined, then filter them out.
        return commands.filter(function (el) {
          if (hiddenCommandIds) {
            return hiddenCommandIds.indexOf(el.commandId) < 0;
          }

          return true;
        });
      });
    };
    /**
     * Filter commands base on the workspace defination commands
     *
     * @param {List<Command>} commands Command list to filter
     * @returns {Promise<List<Command>>} Filtered list of workspace commands
     */


    self.filterWorkspaceCommands = function (commands) {
      return workSvc.getActiveWorkspaceCommands(commands);
    };
    /**
     * Get the command overlays for the commands matching the given inputs. Calls the getCommands method on each
     * contributed provider and then return the aggregate result.
     *
     * @function getCommands
     * @memberOf NgServices.commandService
     * @param {String} commandAreaNameTokens - Comma separated list of command area name tokens, eg. Navigation, Onestep, etc
     * @param {Object} context - Additional context to use in command evaluation
     *
     * @return {Promise} A promise containing the array of command overlays
     */


    self.getCommands = function (commandAreaNameTokens, context) {
      return $q.all(commandAreaNameTokens.split(',').map(function (commandAreaNameToken) {
        // only one view model per scope -> only one command anchor per scope -> need to create inherited scope
        var childContext = context.$new(); // condition service does not support property inheritance because it does _.assign so have to manually extend

        childContext.commandContext = context.commandContext;
        return _getCommandsInternal(commandAreaNameToken, childContext);
      })).then(_.flatten);
    };
    /**
     * Get the command for the command with the given commandId. If multiple providers return a command only the
     * first is returned.
     *
     * @function getCommand
     * @memberOf NgServices.commandService
     * @param {String} commandId - Command id
     * @param {Object} context - Additional context to use in command evaluation
     * @return {Promise} A promise containing the command
     */


    self.getCommand = function (commandId, context) {
      // Get all of the command providers
      return contributionService.require('command-provider').then(function (providers) {
        // Send a provider a promise that it will resolve with an array of commands
        // Merge all of the promises into a single promise with $q.all
        providers.sort(function (provider1, provider2) {
          return provider2.priority - provider1.priority;
        });
        return $q.all(providers.map(function (provider) {
          var deferred = $q.defer();
          provider.getCommand(commandId, context, deferred);
          return deferred.promise;
        }));
      }) // Remove null commands
      .then(function (commands) {
        return commands.filter(function (command) {
          return command;
        }).map(function (cmd) {
          if (cmd.callbackApi.unbind) {
            cmd.callbackApi.unbind();
          }

          return cmd;
        })[0];
      });
    };
    /**
     * Sort the commands based on relativeTo and priority. Priority is automatically assigned if not set.
     *
     * @function sortCommands
     * @memberOf NgServices.commandService
     * @param {Object[]} commands - commands
     * @return {Object[]} Sorted array of command objects
     */


    self.sortCommands = function (commands) {
      // Assign a priority to any commands that don't have one (keep original ordering)
      commands.map(function (cmd, idx) {
        if (!cmd.hasOwnProperty('priority')) {
          cmd.priority = idx;
        }
      }); // Split based on whether placement is relative or absolute

      var p = _.partition(commands, function (cmd) {
        return cmd.relativeTo;
      });

      var priorityCommands = p[1]; // Sort the commands with only priority

      priorityCommands = _.sortBy(priorityCommands, 'priority'); // Group the relative commands by the relativeTo property

      var allRelativeCmds = _.groupBy(p[0], 'relativeTo'); // And get the initial list of all relativeTo options


      var allRelativeCmdOptions = Object.keys(allRelativeCmds); // Insert a list of relative commands into the priority sorted list

      var insertRelativeCommands = function insertRelativeCommands(relativeCmds, cmdId) {
        // Split into before / after based on negative / positive priority
        var p2 = _.partition(relativeCmds, function (cmd) {
          return cmd.priority > 0;
        });

        var afterCmds = _.sortBy(p2[0], 'priority');

        var beforeCmds = _.sortBy(p2[1], 'priority'); // Try to find the relativeTo target in the sorted list


        var idx = _.findIndex(priorityCommands, {
          commandId: cmdId
        });

        if (idx > -1) {
          // If it's found splice the before / after into the list
          priorityCommands.splice.apply(priorityCommands, [idx, 0].concat(beforeCmds));
          idx = _.findIndex(priorityCommands, {
            commandId: cmdId
          });
          priorityCommands.splice.apply(priorityCommands, [idx + 1, 0].concat(afterCmds)); // And remove it from the grouped commands

          delete allRelativeCmds[cmdId];
        }
      }; // Loop over each of the relativeTo groups and insert into the array.
      // This is necessary to support relativeTo a command that is relativeTo another command
      // Limited to number of unique relativeTo properties (anything left means the relativeTo target was not found)


      for (var i = 0; i < allRelativeCmdOptions.length && Object.keys(allRelativeCmds).length > 0; i++) {
        _.map(allRelativeCmds, insertRelativeCommands);
      } // If the relative command was not found just push to the end


      if (Object.keys(allRelativeCmds).length > 0) {
        _.map(allRelativeCmds, function (relativeCmds, cmdId) {
          // And complain
          logger.debug('Unable to find relative command ', cmdId, 'inserting at end');
          priorityCommands = priorityCommands.concat(relativeCmds);
        });
      } // Return the custom sorted array.


      return priorityCommands;
    };
    /**
     * Execute a command with the given arguments
     *
     * @function executeCommand
     * @memberof commandService
     *
     * @param {String} commandId - Command id
     *
     * @param {String|String[]} commandArgs - (Optional) (Deprecated) Command arguments. Should only be used for GWT commands.
     *
     * @param {Object} context - (Optional) Context to execute the command in. Required for zero compile commands.
     *
     * @param {Object} commandContext - (Optional) (Deprecated) Additional data to set into context. Should not be used.
     *
     * @returns {Promise} Resolved when the command execution is complete.
     */


    self.executeCommand = function (commandId, commandArgs, context, commandContext) {
      if (commandExecutionScope) {
        commandExecutionScope.$destroy();
        commandExecutionScope = null;
      } // View model service will "hijack" any scope provided and make lots of changes
      // So instead provide it with an inherited scope it can do what it wants with


      var executionScope = null;

      if (context) {
        executionScope = context.$new();
      } else {
        executionScope = $rootScope.$new();
        commandExecutionScope = executionScope;
        executionScope.commandContext = executionScope.commandContext || {};

        _.assign(executionScope.commandContext, commandContext);

        executionScope.commandContext.commandArgs = commandArgs;
      }

      return self.getCommand(commandId, executionScope).then(function (overlay) {
        return overlay.callbackApi.execute();
      });
    };
  }]);
});