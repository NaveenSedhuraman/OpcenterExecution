"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*global
 define
 */

/**
 * @module js/swac/swac-include.directive
 */
define(['app', 'js/eventBus', 'js/viewModelService', 'js/appCtxService', 'js/configurationService', 'js/swac/swac.directive'], function (app, eventBus) {
  'use strict';

  var cfgSrv = null;
  app.directive('swacInclude', ['viewModelService', 'appCtxService', 'configurationService', function (viewModelSvc, ctxService, confService) {
    cfgSrv = confService;
    return {
      restrict: 'E',
      scope: {
        name: '@',
        type: '@',
        settings: '=',
        source: '@',
        mapping: '=',
        noShow: '=',
        shareEvent: '=',
        shareCtx: '='
      },
      template: '<swac configuration="swacComponentConfiguration" on-ready-callback="onReadyCallback(cmp)" mapping="mapping" base-lib="baseLib" no-show="noShow" share-event="shareEvent"></swac>',
      controller: ['$scope', '$element', '$timeout', function (scope, element, $timeout) {
        var inSet = [];
        var cmpInstance = null;
        var localCtxDpcRep = {};
        var ctxNames = null;
        var inCtxSet = [];
        var contextUpdateSub = null;
        var contextRegisterSub = null;
        var onValueChangedClbk = null;
        var onAddedClbk = null;
        var onRemovedClbk = null;
        var shareCtx = scope.shareCtx;
        var componentInfo = {
          name: scope.name,
          type: scope.type || '',
          source: scope.source,
          parent: element[0].parentElement,
          settings: {
            width: '100%',
            height: '100%',
            flavor: 'ui'
          }
        };
        var SWACPermissions = {
          None: 0,
          Read: 1,
          Write: 2
        };
        /**
         * @returns {Array} list of ctx associated to the dpc
         * @param {string} dpcName name of dpc
         */

        function _findCtx(dpcName) {
          var retvalList = [];

          for (var ctx in localCtxDpcRep) {
            if (localCtxDpcRep[ctx].dpc === dpcName) {
              retvalList.push(ctx);
            }
          }

          return retvalList;
        }
        /**
         * 
         * @param {array} keyArray list of dpc node
         * @param {object} child child of the node
         * @param {string} rwtype dpc permission
         */


        function _createKeyArray(keyArray, child, rwtype) {
          if (child.list === undefined || child.list === null) {
            return;
          }

          for (var childKey = 0; childKey < child.list().length; childKey++) {
            var nodetmp = [];
            var size = 0;
            var son = child.open(child.list()[childKey]);

            if (son.list !== undefined) {
              nodetmp = [child.list()[childKey], []];
              size = keyArray.length;
              keyArray[size] = nodetmp;

              _createKeyArray(keyArray[size][1], child.open(child.list()[childKey]), rwtype);
            } else {
              nodetmp = [child.list()[childKey], 'helpstring', son.flags(), 'data type'];
              size = keyArray.length;
              keyArray[size] = nodetmp;
            }
          }
        }
        /**
         * 
         * @param {array} internalElement element to analyze
         * @param {string} key dpc Name
         * @param {array} keyList list of dpc key
         */


        function _manageTree(internalElement, key, keyList) {
          var i;
          var oldKey;

          for (i = 0; i < internalElement.length; i++) {
            if (internalElement[i][1] instanceof Array) {
              oldKey = key;
              key = (key === '' ? key : key + '.') + internalElement[i][0];

              _manageTree(internalElement[i][1], key, keyList);

              key = oldKey;
            } else {
              keyList.push({
                name: (key === '' ? key : key + '.') + internalElement[i][0],
                flags: internalElement[i][2]
              });
            }
          }
        }
        /**
         * 
         * @param {string} dpcName dpc name
         * @param {string} ctxName context Name
         * @param {number} flags dpc flags
         */


        function _manageCtxDpcInitialValue(dpcName, ctxName, flags) {
          if (cmpInstance.dpc.open(dpcName) && cmpInstance.dpc.open(dpcName).beginGet && flags & SWACPermissions.Read) {
            //eslint-disable-line no-bitwise
            cmpInstance.dpc.open(dpcName).beginGet().then(function (value) {
              if (typeof ctxService.getCtx(ctxName) === 'undefined') {
                $timeout(function () {
                  inSet.push(dpcName);
                  ctxService.registerCtx(ctxName, value);
                  inSet.splice(inSet.indexOf(dpcName), 1);
                });
              } else {
                $timeout(function () {
                  inSet.push(dpcName);
                  ctxService.updateCtx(ctxName, value);
                  inSet.splice(inSet.indexOf(dpcName), 1);
                });
              }
            });
          } else if (cmpInstance.dpc.open(dpcName) && cmpInstance.dpc.open(dpcName).beginSet && flags & SWACPermissions.Write) {
            //eslint-disable-line no-bitwise
            if (typeof ctxService.getCtx(ctxName) !== 'undefined') {
              inCtxSet.push(ctxName);
              cmpInstance.dpc.open(dpcName).beginSet(ctxService.getCtx(ctxName)).then(function () {
                inCtxSet.splice(inCtxSet.indexOf(ctxName), 1);
              });
            }
          }
        }
        /**
         * function that create/update context mapped onto dpcs
         */


        function _manageCtx() {
          var ctxPrefix = '';
          var keyArray = [];
          var dpcList = [];
          var key = '';
          var flags = SWACPermissions.None;

          _createKeyArray(keyArray, cmpInstance.dpc, 'RW');

          _manageTree(keyArray, key, dpcList);

          if (shareCtx) {
            if (typeof shareCtx === 'string' && shareCtx !== 'true') {
              ctxPrefix = shareCtx + '.';
            }

            dpcList.forEach(function (elem) {
              localCtxDpcRep[ctxPrefix + elem.name] = {
                dpc: elem.name,
                flags: elem.flags
              };

              _manageCtxDpcInitialValue(elem.name, ctxPrefix + elem.name, elem.flags);
            });
          }

          if (scope.mapping && scope.mapping.dpcMapping) {
            ctxNames = scope.mapping.dpcMapping;
            Object.keys(ctxNames).forEach(function (ctxName) {
              var dpcObj = ctxNames[ctxName];
              var dpcName = '';
              var normalized_flags = SWACPermissions.None;

              if (_typeof(dpcObj) === 'object') {
                dpcName = dpcObj.dpc;
              } else {
                dpcName = dpcObj;
              }

              for (var k in dpcList) {
                if (dpcList[k].name === dpcName) {
                  flags = dpcList[k].flags;
                  normalized_flags = flags;

                  if (flags & SWACPermissions.Read && flags & SWACPermissions.Write) {
                    //eslint-disable-line no-bitwise
                    if (dpcObj.initMode && typeof dpcObj.initMode === 'string') {
                      if (dpcObj.initMode.toLowerCase().indexOf('r') !== -1) {
                        flags = SWACPermissions.Read;
                      }

                      if (dpcObj.initMode.toLowerCase().indexOf('w') !== -1) {
                        flags = SWACPermissions.Write;
                      }
                    }
                  }

                  if (!dpcObj.initMode && dpcObj.denyFlags && typeof dpcObj.denyFlags === 'string') {
                    if (dpcObj.denyFlags.toLowerCase().indexOf('r') !== -1) {
                      flags ^= SWACPermissions.Read; //eslint-disable-line no-bitwise
                    }

                    if (dpcObj.denyFlags.toLowerCase().indexOf('w') !== -1) {
                      flags ^= SWACPermissions.Write; //eslint-disable-line no-bitwise
                    }

                    normalized_flags = flags;
                  }

                  break;
                }
              }

              _manageCtxDpcInitialValue(dpcName, ctxName, flags);

              localCtxDpcRep[ctxName] = {
                dpc: dpcName,
                flags: normalized_flags
              };
            });
          }
        }
        /**
         * function for update dpc
         * @param {object} data event param
         */


        function contextUpdateManagement(data) {
          if (typeof localCtxDpcRep[data.name] !== 'undefined' && inSet.indexOf(localCtxDpcRep[data.name].dpc) === -1) {
            var node = cmpInstance.dpc.open(localCtxDpcRep[data.name].dpc);

            if (localCtxDpcRep[data.name].flags & SWACPermissions.Write && node && typeof node.beginSet === 'function') {
              //eslint-disable-line no-bitwise
              if (inCtxSet.length > 0) {
                var ctxList = _findCtx(localCtxDpcRep[data.name].dpc);

                if (ctxList.length > 0) {
                  ctxList.forEach(function (ctxName) {
                    if (inCtxSet.indexOf(ctxName) > -1) {
                      inCtxSet.splice(inCtxSet.indexOf(ctxName), 1);
                    }
                  });
                }
              }

              if (inCtxSet.indexOf(data.name) === -1) {
                inCtxSet.push(data.name);
              }

              node.beginSet(data.value).then(function (valueObj) {
                if (valueObj.modified) {
                  $timeout(function () {
                    ctxService.updateCtx(data.name, valueObj.data);
                    inCtxSet.splice(inCtxSet.indexOf(data.name), 1);
                  });
                } else {
                  inCtxSet.splice(inCtxSet.indexOf(data.name), 1);
                }
              }, function () {
                node.beginGet().then(function (value) {
                  $timeout(function () {
                    ctxService.updateCtx(data.name, value);
                    inCtxSet.splice(inCtxSet.indexOf(data.name), 1);
                  });
                });
              });
            }
          }
        }

        contextRegisterSub = eventBus.subscribe('appCtx.register', function (data) {
          contextUpdateManagement(data);
        });
        contextUpdateSub = eventBus.subscribe('appCtx.update', function (data) {
          contextUpdateManagement(data);
        });
        scope.$on('$destroy', function () {
          if (contextUpdateSub) {
            eventBus.unsubscribe(contextUpdateSub);
          }

          if (contextRegisterSub) {
            eventBus.unsubscribe(contextRegisterSub);
          }

          if (onValueChangedClbk) {
            cmpInstance.dpc.onValueChanged.unsubscribe(onValueChangedClbk);
          }

          if (onAddedClbk) {
            cmpInstance.dpc.onAdded.unsubscribe(onAddedClbk);
          }

          if (onRemovedClbk) {
            cmpInstance.dpc.onRemoved.unsubscribe(onRemovedClbk);
          }
        });
        scope.$on('componentEvents', function (event, data) {
          eventBus.publish(data.name, data.data);
        });
        scope.$on('onReady', function (event, data) {
          eventBus.publish(data.name + '.onReady', data);
        });
        scope.$on('onCreated', function (event, data) {
          eventBus.publish(data.name + '.onCreated', data);
        });
        scope.$on('onFailure', function (event, data) {
          eventBus.publish(data.name + '.onFailure', data);
        });
        scope.$on('onRemoved', function (event, data) {
          eventBus.publish(data.name + '.onRemoved', data);
        });

        scope.onReadyCallback = function (cmp) {
          cmpInstance = cmp;
          cmpInstance._internal.iframe.style.position = 'relative';

          if (cmpInstance.dpc && cmpInstance.dpc.onValueChanged) {
            cmpInstance.dpc.onValueChanged.subscribe(onValueChangedClbk = function onValueChangedClbk(evt) {
              var ctxList = _findCtx(evt.data.key);

              if (ctxList.length > 0) {
                ctxList.forEach(function (ctxChangedName) {
                  if (inCtxSet.indexOf(ctxChangedName) === -1 && localCtxDpcRep[ctxChangedName].flags & SWACPermissions.Read && //eslint-disable-line no-bitwise
                  cmpInstance.dpc.open(evt.data.key) && cmpInstance.dpc.open(evt.data.key).beginGet) {
                    cmpInstance.dpc.open(evt.data.key).beginGet().then(function (value) {
                      $timeout(function () {
                        inSet.push(evt.data.key);
                        ctxService.updateCtx(ctxChangedName, value);
                        inSet.splice(inSet.indexOf(evt.data.key), 1);
                      });
                    });
                  }
                });
              }
            });
          }

          _manageCtx();

          cmpInstance.dpc.onAdded.subscribe(onAddedClbk = function onAddedClbk(evt) {
            if (evt.data.node === 'node') {
              return;
            }

            var dpcElem = cmpInstance.dpc.open(evt.data.key);

            if (!dpcElem) {
              return;
            }

            if (shareCtx) {
              var ctxPrefix = '';
              var flags = SWACPermissions.None;

              if (typeof shareCtx === 'string' && shareCtx !== 'true') {
                ctxPrefix = shareCtx + '.';
              }

              if (evt.data.flags & SWACPermissions.Write) {
                //eslint-disable-line no-bitwise
                flags = flags || SWACPermissions.Write;
              }

              if (evt.data.flags & SWACPermissions.Read) {
                //eslint-disable-line no-bitwise
                flags = flags || SWACPermissions.Read;
              }

              localCtxDpcRep[ctxPrefix + evt.data.key] = {
                dpc: evt.data.key,
                flags: flags
              };

              if (typeof ctxService.getCtx(ctxPrefix + evt.data.key) === 'undefined') {
                dpcElem.beginGet().then(function (value) {
                  if (typeof ctxService.getCtx(ctxPrefix + evt.data.key) === 'undefined') {
                    $timeout(function () {
                      inSet.push(evt.data.key);
                      ctxService.registerCtx(ctxPrefix + evt.data.key, value);
                      inSet.splice(inSet.indexOf(evt.data.key), 1);
                    });
                  } else {
                    $timeout(function () {
                      inSet.push(evt.data.key);
                      ctxService.updateCtx(ctxPrefix + evt.data.key, value);
                      inSet.splice(inSet.indexOf(evt.data.key), 1);
                    });
                  }
                });
              }
            }

            var ctxList = _findCtx(evt.data.key);

            if (ctxList.length > 0) {
              ctxList.forEach(function (ctxAddName) {
                var dpcObj = null;
                var denyFlags = SWACPermissions.None;
                localCtxDpcRep[ctxAddName].flags = dpcElem.flags();

                if (ctxNames && (dpcObj = ctxNames[ctxAddName])) {
                  if (_typeof(dpcObj) === 'object' && dpcObj.denyFlags) {
                    if (dpcObj.denyFlags.toLowerCase().indexOf('r') !== -1) {
                      denyFlags |= SWACPermissions.Read; //eslint-disable-line no-bitwise
                    }

                    if (dpcObj.denyFlags.toLowerCase().indexOf('w') !== -1) {
                      denyFlags |= SWACPermissions.Write; //eslint-disable-line no-bitwise
                    }

                    if (dpcElem.flags() & SWACPermissions.Read && denyFlags & SWACPermissions.Read) {
                      //eslint-disable-line no-bitwise
                      localCtxDpcRep[ctxAddName].flags ^= SWACPermissions.Read; //eslint-disable-line no-bitwise
                    }

                    if (dpcElem.flags() & SWACPermissions.Write && denyFlags & SWACPermissions.Write) {
                      //eslint-disable-line no-bitwise
                      localCtxDpcRep[ctxAddName].flags ^= SWACPermissions.Write; //eslint-disable-line no-bitwise
                    }
                  }
                }

                if (inCtxSet.indexOf(ctxAddName) === -1 && localCtxDpcRep[ctxAddName].flags & SWACPermissions.Read && dpcElem.beginGet) {
                  //eslint-disable-line no-bitwise
                  dpcElem.beginGet().then(function (value) {
                    if (typeof ctxService.getCtx(ctxAddName) === 'undefined') {
                      $timeout(function () {
                        inSet.push(evt.data.key);
                        ctxService.registerCtx(ctxAddName, value);
                        inSet.splice(inSet.indexOf(evt.data.key), 1);
                      });
                    } else {
                      $timeout(function () {
                        inSet.push(evt.data.key);
                        ctxService.updateCtx(ctxAddName, value);
                        inSet.splice(inSet.indexOf(evt.data.key), 1);
                      });
                    }
                  });
                }
              });
            }
          });
          cmpInstance.dpc.onRemoved.subscribe(onRemovedClbk = function onRemovedClbk(evt) {
            var ctxPrefix = '';

            var ctxList = _findCtx(evt.data.key);

            if (ctxList.length > 0) {
              if (shareCtx) {
                if (typeof shareCtx === 'string' && shareCtx !== 'true') {
                  ctxPrefix = shareCtx + '.';
                }
              }

              ctxList.forEach(function (ctxRemoveName) {
                if (ctxRemoveName && typeof ctxService.getCtx(ctxRemoveName) !== 'undefined') {
                  $timeout(function () {
                    ctxService.unRegisterCtx(ctxRemoveName);

                    if (ctxRemoveName === ctxPrefix + evt.data.key) {
                      delete localCtxDpcRep[ctxPrefix + evt.data.key];
                    }
                  });
                }
              });
            }
          });
        };

        if (scope.settings) {
          if (typeof scope.settings.width !== 'undefined') {
            componentInfo.settings.width = scope.settings.width;
          }

          if (typeof scope.settings.height !== 'undefined') {
            componentInfo.settings.height = scope.settings.height;
          }

          if (typeof scope.settings.top !== 'undefined') {
            componentInfo.settings.top = scope.settings.top;
          }

          if (typeof scope.settings.left !== 'undefined') {
            componentInfo.settings.left = scope.settings.left;
          }

          if (typeof scope.settings.flavor !== 'undefined') {
            componentInfo.settings.flavor = scope.settings.flavor;
          }
        }

        cfgSrv.getCfg('afx-swac-config').then(function (data) {
          var url = window.location.origin + window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/') + 1) + app.getBaseUrlPath() + '/lib/@swac/swac-base.js';
          scope.baseLib = data.baseLib || url;
          scope.swacComponentConfiguration = componentInfo;
        });
      }]
    };
  }]);
});