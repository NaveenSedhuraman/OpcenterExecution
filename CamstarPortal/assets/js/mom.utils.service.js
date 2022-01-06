"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Copyright 2019 Siemens AG

/**
 * Provides a set of utility methods not currently available in Apollo.
 * @module "js/mom.utils.service"
 * @requires app
 * @requires js/eventBus
 * @requires js/logger
 * @requires lodash
 * @requires jquery
 * @requires js/uwPropertyService
 * @requires js/appCtxService
 * @requires "js/mom.breadcrumb.service"
 * @requires js/iconService
 */

/* eslint-disable valid-jsdoc */

/*global
 define
 */
define(['app', 'js/eventBus', 'js/logger', 'lodash', 'jquery', 'js/declUtils', 'js/jquery.noty.customized', 'js/mom.breadcrumb.service', 'js/uwPropertyService', 'js/appCtxService', 'js/iconService', 'js/actionService', 'js/configurationService'], //
function (app, eventBus, logger, _, $, declUtils, noty) {
  'use strict';

  var exports = {};

  var _appCtxSvc;

  var _uwPropertySvc;

  var _iconSvc;

  var _$state;

  var _$http;

  var _breadcrumb;

  var _$window;

  var _$q;

  var _$anchorScroll;

  var _$rootScope;

  var _$sce;

  var _actionSvc;

  var _cfgSvc;
  /**
   * Closes all currently-displayed messages.
   */


  exports.closeMessages = function () {
    noty.close();
  };

  exports._toggleEditing = function (enableEditing, object, editMap) {
    if (object && editMap) {
      Object.keys(editMap).forEach(function (key) {
        if (_typeof(_.get(object, key)) === 'object') {
          _.set(object, key + '.isEditable', enableEditing && Boolean(editMap[key]));
        }
      });
    }

    _appCtxSvc.updateCtx('editInProgress', enableEditing);

    return {
      object: object
    };
  };
  /**
   * Retrieves the full path to the specified type icon, i.e. "<assets\>/image/type<name\>48.svg".
   * @param {String} name The name of a valid type icon.
   */


  exports.typeIconPath = function (name) {
    return app.getBaseUrlPath() + '/image/type' + name + '48.svg';
  };
  /**
   * Retrieves the full path to the specified command icon, i.e. "<assets\>/image/cmd<name\>24.svg".
   * @param {String} name The name of a valid command icon.
   */


  exports.cmdIconPath = function (name) {
    return app.getBaseUrlPath() + '/image/cmd' + name + '24.svg';
  };
  /**
   * Retrieves the full SVG code of the specified indicator icon (located in <assets\>/image/indicator<name\>.svg). Useful to configure cell indicators.
   * @param {String} name The name of the indicator icon to load.
   */


  exports.indicatorIcon = function (name) {
    return _$sce.trustAsHtml(_iconSvc.getIndicatorIcon(name));
  };
  /**
   * Returns the full path to an image file in the <assets\>/image/ folder.
   * @param {String} path The partial path (i.e. within the <assets\>/image/ folder) to the image.
   */


  exports.imagePath = function (path) {
    return app.getBaseUrlPath() + '/image/' + path;
  };
  /**
   * Marks the properties of the specified object as editable, and sets the **editInProgress** context to **false**.
   * > **Tip** This method is also exposed as the **MomStartEditing** custom action. For more information on how to use it, see the [In-place Editing](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/in-place-editing) page on the MOM UI Wiki.
   * @param {Object} object The object to edit.
   * @param {Object.<String, Boolean>} editMap A dictionary containing the properties to be edited.
   */


  exports.startEditing = function (object, editMap) {
    return exports._toggleEditing(true, object, editMap);
  };
  /**
   * Marks the properties of the specified object as non-editable, and sets the **editInProgress** context to **false**.
   * > **Tip** This method is also exposed as the **MomCancelEditing** custom action. For more information on how to use it, see the [In-place Editing](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/in-place-editing) page on the MOM UI Wiki.
   * @param {Object} object An editable object.
   * @param {Object.<String, Boolean>} editMap A dictionary containing the properties not to be edited.
   */


  exports.cancelEditing = function (object, editMap) {
    return exports._toggleEditing(false, object, editMap);
  };
  /**
   * An object used to specify an editable/non-editable property via the [startTableEdit](#.startTableEdit) method.
   * @typedef {Object} EditingConfig
   * @property {String} propertyName The name of the property to mark as editable/non-editable.
   * @property {Boolean} isPropertyModifiable Specifies whether the property is modifiable (set to **false** to mark it as non-editable).
   * @property {Boolean} editable Specifies whether the property is editable (set to **false** to mark it as non-editable).
   */

  /**
   * Specifies which property of each object in **data** must be used as a unique identifier, and which properties to set as non-editable (all the other properties will be marked editable).
   * > **Note** You can use this method to edit data in a table, as described in [Apollo Tutorial #9](https://gitlab.industrysoftware.automation.siemens.com/Apollo/samples/Tutorial-9-Demonstrate_Editing_capabilities_for_aw-Table/).
   * > **Tip** This method is also exposed as the **MomStartTableEditing** custom action.
   * @param {Array.<Object>} data An array of objects to be edited.
   * @param {String} uid  The name of the property to use as unique identifier.
   * @param {Object.<String, EditingConfig>} props A dictionary of [EditingConfig](#~EditingConfig) objects, indicating which properties are not editable.
   */


  exports.startTableEditing = function (data, uid, props) {
    return data.map(function (item) {
      return {
        uid: item[uid],
        props: _.cloneDeep(props)
      };
    });
  };
  /**
   *
   * @param {UwDataProvider} dataProvider A reference to the dataProvder managing the items to select/deselect.
   * @param {String[]} ids An array of identifiers of the items to select/deselect.
   * @param {Object} [options={identifier: 'uid'}] An object exposing an **identifier** property, used to indicate which property of the element will be used to identify the element univocaly.
   */


  exports.select = function (dataProvider, ids, options) {
    if (!dataProvider) {
      return;
    }

    var opts = Object.assign({
      identifier: 'uid'
    }, options);
    var objects = dataProvider.viewModelCollection.loadedVMObjects.filter(function (item) {
      return ids.includes(_.get(item, opts.identifier));
    });
    dataProvider.selectionModel.setSelection(objects);
  };
  /**
   * An object used to define a new watcher through the [watch](#.watch) method.
   * @typedef {Object} WatcherConfig
   * @property {DeclViewModel} vm A reference to the viewModel on whose scope the expression will be evaluated.
   * If specified, the watcher will be deregistered automatically when the specified viewModel is destroyed.
   * @property {Object} env _(Ignored if **vm** is specified)_ An object containing properties that will be available in the execution context of the specified expression.
   * @property {String} name The name of the expression. This value will be used in the event name: `mom.<name>.onValueChanged`.
   * @property {String} expression The expression to evaluate (without surrounding curly brackets).
   * @property {String} deregisterOn _(Ignored if **vm** is specified)_ The name of an event that will de-register the watcher.
   * @property {Boolean} [collection=false] Set this to **true** if the result of the expression is an object or array.
   */

  /**
   * Creates a watcher that will trigger an event when the value of the specified expression changes.
   * > **Tip:** For more information on how to use this method, see the [Detecting value changes](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/detecting-value-changes) on the MOM UI Wiki.
   * @param {module:"js/mom.utils.service"~WatcherConfig} cfg A configuration object used to configure the watcher.
   */


  exports.watch = function (cfg) {
    if (!(cfg && cfg.name && cfg.expression && (cfg.vm || cfg.env && cfg.deregisterOn))) {
      logger.error('MOM UI - watch: Specify a valid watcher configuration object with name, expression, vm (or env, and deregisterOn) properties.');
      return;
    }

    var scope;

    if (cfg.env) {
      scope = _$rootScope.$new(true);
      Object.keys(cfg.env).forEach(function (key) {
        scope[key] = cfg.env[key];
      });
    } else {
      if (cfg.vm && cfg.vm._internal && cfg.vm._internal.origCtxNode) {
        scope = cfg.vm._internal.origCtxNode;
      } else {
        logger.error('MOM UI - watch: vm property contains an invalid viewModel reference.');
        return;
      }
    }

    var deregister;

    if (cfg.collection) {
      deregister = scope.$watchCollection(cfg.expression, function (newVal, oldVal) {
        eventBus.publish('mom.' + cfg.name + '.onValueChanged', {
          newVal: newVal,
          oldVal: oldVal
        });
      });
    } else {
      deregister = scope.$watch(cfg.expression, function (newVal, oldVal) {
        eventBus.publish('mom.' + cfg.name + '.onValueChanged', {
          newVal: newVal,
          oldVal: oldVal
        });
      });
    }

    if (cfg.deregisterOn) {
      eventBus.subscribe(cfg.deregisterOn, function () {
        deregister();
        scope.$destroy();
        logger.debug('MOM UI - De-registered watcher (additional scope): ', cfg.name);
      });
    }

    if (cfg.env) {
      logger.debug('MOM UI - Registered watcher (additional scope): ', cfg.name);
    } else if (cfg.vm) {
      logger.debug('MOM UI - Registered watcher (viewModel: ' + cfg.vm._internal.panelId + '): ', cfg.name);
    }
  };
  /**
   * Updates the list of currently-loaded items managed by a dataProvider with the specified collection.
   * > **Tip:** This method is also exposed as the **MomUpdateDataProvider** custom action.
   * @param {UwDataProvider} dataProvider A reference to the dataProvder.
   * @param {Object[]} collection The new collection of items to be passed to the dataProvider.
   * @param {Number} total The total number of items (not only the ones that have been loaded) managed by the dataProvider.
   * @returns {Object} An object containing the collection and the total values passed as input.
   */


  exports.updateDataProvider = function (dataProvider, collection, total) {
    dataProvider.update(collection, total);
    return {
      collection: collection,
      total: total
    };
  };
  /**
   * Returns the specified input data as output. This is useful in some cases to trigger dataParser/output mapping in viewModels, or as an
   * easy way to execute an expression on some data.
   * > **Tip:** This method is also exposed as the **MomGetInputData** custom action.
   * @async
   * @param {*} input The input data to return (it should be an object to be able to retrieve its properties in action **outputData**, see the example).
   * @returns {Promise<*>}
   * @example
   *  "setValues": {
   *      "actionType": "MomGetInputData",
   *      "inputData": {
   *          "input": {
   *              "total": "{{ctx.notesByState[ctx.state.params.status] || ctx.notesByState.total}}",
   *              "status": "{{ctx.state.params.status}}"
   *          }
   *      },
   *      "outputData": {
   *          "total.uiValue": "total",
   *          "status.uiValue": "status"
   *      }
   *  }
   */


  exports.getInputData = function (input) {
    return exports.promisify(input);
  };
  /**
   * An object representing the configuration of an HTTP request.
   * @typedef {Object} HttpRequest
   * @property {String} method The HTTP method (e.g. 'GET', 'POST', etc).
   * @property {String} url An absolute or relative URL of the resource that is being requested.
   * @property {Object.<String>} params A map of strings or objects which will be serialized and appended as GET parameters.
   * @property {String|Object} data Some data to be sent as the request message data.
   * @property {Object.<String>} headers A map of strings representing HTTP headers to send to the server.
   * @property {Boolean} withCredentials Whether to set the withCredentials flag on the underlying XHR object.
   */

  /**
   * An object representing an HTTP response.
   * @typedef {Object} HttpResponse
   * @property {module:"js/mom.utils.service"~HttpRequest} config The configuration object that was used to generate the request.
   * @property {String|Object} data The response body (if a JSON response is returned, it will be automatically transformed into the corresponding Object).
   * @property {Number} status The HTTP status code of the response.
   * @property {String} statusText The HTTP status text of the response.
   */

  /**
   * Executes an HTTP request with integrated logging and optionally triggering a progress indicator.
   * > **Tip:** This method is also exposed as the **MomHttpRequest** custom action.
   * > **Important:** By default, this method does not reject the Promise in case of HTTP errors.
   * @async
   * @param {module:"js/mom.utils.service"~HttpRequest} config The configuration of the HTTP request to execute.
   * @param {Object} [options={showModalIndicator: true, rejectOnError: true}] Additional options. The following options can be specified:
   *   * **showIndicator**: If set to **true**, a progress indicator will be displayed while the request is being executed.
   *   * **showModalIndicator**: If set to **true**, a modal progress indicator will be displayed while the request is being executed.
   *   * **rejectOnError**: If set to **true**, the method will reject the Promise in case of an HTTP error.
   * @returns {Promise<HttpResponse>} A promise wrapping an [HttpResponse](#~HttpResponse) object corresponding to the response of the request.
   */


  exports.httpRequest = function (config, options) {
    var opts = options || {}; // Managing each supported option to handle usage in custom actions (attributes generated from exprs are always strings)

    var showIndicator = opts.showIndicator && opts.showIndicator !== 'false';
    var showModalIndicator = opts.showModalIndicator === undefined || opts.showModalIndicator && opts.showModalIndicator !== 'false';
    var rejectOnError = opts.rejectOnError === undefined || opts.rejectOnError && opts.rejectOnError !== 'false';

    if (showModalIndicator) {
      eventBus.publish('modal.progress.start');
    } else if (showIndicator) {
      eventBus.publish('progress.start');
    }

    logger.trace("MOM UI - httpRequest:", config, options);
    return _$http(config).then(function (resp) {
      logger.trace("MOM UI - httpRequest Response:", resp);
      return resp;
    }).catch(function (err) {
      logger.error("MOM UI - httpRequest Error:", err);

      if (rejectOnError) {
        throw err;
      }

      return err;
    }).finally(function () {
      if (showModalIndicator) {
        eventBus.publish('modal.progress.end');
      } else if (showIndicator) {
        eventBus.publish('progress.end');
      }
    });
  };
  /**
   * Shortcut method to execute an HTTP GET request, equivalent to calling [httpRequest](#.httpRequest) with the following [HttpRequest](#~HttpRequest) properties pre-set:
   * * method: **GET**
   * * url: _url_
   *
   * > **Tip:** This method is also exposed as the **MomHttpGet** custom action.
   * @param {String} url The URL to request.
   * @param {module:"js/mom.utils.service"~HttpRequest} config See [httpRequest](#.httpRequest).
   * @param {Object} [options={showModalIndicator: true, rejectOnError: true}] See [httpRequest](#.httpRequest).
   * @returns {Promise<HttpResponse>} See [httpRequest](#.httpRequest).
   */


  exports.httpGet = function (url, config, options) {
    var cfg = config || {};
    cfg.method = 'GET';
    cfg.url = url;
    return exports.httpRequest(cfg, options);
  };
  /**
   * Shortcut method to execute an HTTP HEAD request, equivalent to calling [httpRequest](#.httpRequest) with the following [HttpRequest](#~HttpRequest) properties pre-set:
   * * method: **HEAD**
   * * url: _url_
   *
   * > **Tip:** This method is also exposed as the **MomHttpHead** custom action.
   * @param {String} url The URL to request.
   * @param {module:"js/mom.utils.service"~HttpRequest} config See [httpRequest](#.httpRequest).
   * @param {Object} [options={showModalIndicator: true, rejectOnError: true}] See [httpRequest](#.httpRequest).
   * @returns {Promise<HttpResponse>} See [httpRequest](#.httpRequest).
   */


  exports.httpHead = function (url, config, options) {
    var cfg = config || {};
    cfg.method = 'HEAD';
    cfg.url = url;
    return exports.httpRequest(cfg, options);
  };
  /**
   * Shortcut method to execute an HTTP DELETE request, equivalent to calling [httpRequest](#.httpRequest) with the following [HttpRequest](#~HttpRequest) properties pre-set:
   * * method: **DELETE**
   * * url: _url_
   *
   * > **Tip:** This method is also exposed as the **MomHttpDelete** custom action.
   * @param {String} url The URL to request.
   * @param {module:"js/mom.utils.service"~HttpRequest} config See [httpRequest](#.httpRequest).
   * @param {Object} [options={showModalIndicator: true, rejectOnError: true}] See [httpRequest](#.httpRequest).
   * @returns {Promise<HttpResponse>} See [httpRequest](#.httpRequest).
   */


  exports.httpDelete = function (url, config, options) {
    var cfg = config || {};
    cfg.method = 'DELETE';
    cfg.url = url;
    return exports.httpRequest(cfg, options);
  };
  /**
   * Shortcut method to execute an HTTP POST request, equivalent to calling [httpRequest](#.httpRequest) with the following [HttpRequest](#~HttpRequest) properties pre-set:
   * * method: **POST**
   * * data: _data_
   * * url: _url_
   *
   * > **Tip:** This method is also exposed as the **MomHttpPost** custom action.
   * @param {String} url The URL to request.
   * @param {Object} data The data to send along with the request.
   * @param {module:"js/mom.utils.service"~HttpRequest} config See [httpRequest](#.httpRequest).
   * @param {Object} [options={showModalIndicator: true, rejectOnError: true}] See [httpRequest](#.httpRequest).
   * @returns {Promise<HttpResponse>} See [httpRequest](#.httpRequest).
   */


  exports.httpPost = function (url, data, config, options) {
    var cfg = config || {};
    cfg.method = 'POST';
    cfg.url = url;
    cfg.data = data;
    return exports.httpRequest(cfg, options);
  };
  /**
   * Shortcut method to execute an HTTP PUT request, equivalent to calling [httpRequest](#.httpRequest) with the following [HttpRequest](#~HttpRequest) properties pre-set:
   * * method: **PUT**
   * * data: _data_
   * * url: _url_
   *
   * > **Tip:** This method is also exposed as the **MomHttpPut** custom action.
   * @param {String} url The URL to request.
   * @param {Object} data The data to send along with the request.
   * @param {module:"js/mom.utils.service"~HttpRequest} config See [httpRequest](#.httpRequest).
   * @param {Object} [options={showModalIndicator: true, rejectOnError: true}] See [httpRequest](#.httpRequest).
   * @returns {Promise<HttpResponse>} See [httpRequest](#.httpRequest).
   */


  exports.httpPut = function (url, data, config, options) {
    var cfg = config || {};
    cfg.method = 'PUT';
    cfg.url = url;
    cfg.data = data;
    return exports.httpRequest(cfg, options);
  };
  /**
   * Shortcut method to execute an HTTP PATCH request, equivalent to calling [httpRequest](#.httpRequest) with the following [HttpRequest](#~HttpRequest) properties pre-set:
   * * method: **PATCH**
   * * data: _data_
   * * url: _url_
   *
   * > **Tip:** This method is also exposed as the **MomHttpPatch** custom action.
   * @param {String} url The URL to request.
   * @param {Object} data The data to send along with the request.
   * @param {module:"js/mom.utils.service"~HttpRequest} config See [httpRequest](#.httpRequest).
   * @param {Object} [options={showModalIndicator: true, rejectOnError: true}] See [httpRequest](#.httpRequest).
   * @returns {Promise<HttpResponse>} See [httpRequest](#.httpRequest).
   */


  exports.httpPatch = function (url, data, config, options) {
    var cfg = config || {};
    cfg.method = 'PATCH';
    cfg.url = url;
    cfg.data = data;
    return exports.httpRequest(cfg, options);
  };
  /**
   * Sets the title of the current Location, displayed in the application header.
   * @param {String} title The Location title to set.
   */


  exports.setHeaderTitle = function (title) {
    _appCtxSvc.updateCtx('location.titles', {
      'headerTitle': title
    });
  };
  /**
   * Navigates to the home page state that was configured for the current site _or_ to the location specified in the
   * **momDefaultPage** context.
   *
   * The value of **momDefaultPage** can be:
   *
   * * An absolute URL starting with **http:**
   * * A path name starting with <b>/</b>
   * * An url fragment starting with **#**
   */


  exports.navigateToHomePage = function () {
    var homepage = _appCtxSvc.getCtx('momDefaultPage') || _appCtxSvc.getCtx('workspace.defaultPage');

    if (homepage.match(/^(#|https?:|\/)/)) {
      exports.redirect(homepage);
    } else {
      _$state.go(_appCtxSvc.getCtx('workspace.defaultPage'));
    }
  };
  /**
   * Navigates to the previous page in the browser history.
   */


  exports.navigateToPreviousPage = function () {
    _$window.history.back();
  };
  /**
   * Navigates to another state.
   * @param {String} state The ID of the state to navigate to.
   * @param {Object} [params={}] The parameters to pass to the state.
   * @param {Object} [options={}] Additional options. Currently the following properties are supported:
   * * **reload**: If set to **true**, forces the state to be reloaded even if not necessary (e.g. for a navigation to the current state).
   * * **notify**: If set to **false**, no internal events will be broadcasted when navigating to the new state.
   */


  exports.navigateTo = function (state, params, options) {
    _$state.go(state, params, options);
  };
  /**
   * Rebuilds the navigation breadcrumb.
   * > **Note:** Calling this method is typically not necessary, as the breadcrumb is built automatically based on your **states.json** configuration. For more information, see [Configuring the navigation breadcrumb](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/configuring-the-navigation-breadcrumb) on the MOM UI Wiki.
   */


  exports.breadcrumb = function () {
    return _breadcrumb.build();
  };
  /**
   * An object used to manage the navigation breadcrumb.
   * @typedef BreadcrumbProvider
   * @property {Crumb[]} crumbs An array of [Crumb](#~Crumb) objects representing the current navigation breadcrumb.
   * @property {Function} onSelect A function that will be executed to perform the navigation when a crumb is clicked. It takes a single [Crumb](#~Crumb) parameter.
   */

  /**
   * An object used to represent a single crumb used in the navigation breadcrumb.
   * @typedef Crumb
   * @property {String} title The title of the crumb.
   * @property {String} stateId The ID of the state associated to the crumb.
   * @property {Object} [params={}] The parameters to pass to the crumb state when a navigation is performed (i.e. the user clicks the crumb).
   */

  /**
   * Overrides the default breadcrumb configuration and recreates a breadcrumb containing the specified crumbs.
   * > **Note:** Use this method only if you need to override the default breadcrumb. By default, the navigation breadcrumb is built automatically based on your **states.json** configuration. For more information, see [Configuring the navigation breadcrumb](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/configuring-the-navigation-breadcrumb) on the MOM UI Wiki.
   * @param {Crumb[]} crumbs An array of [Crumb](#~Crumb) objects used to configure the breadcrumb.
   * @returns {BreadcrumbProvider} The [BreadcrumbProvider](#~BreadcrumbProvider) object used to manage the breadcrumb.
   */


  exports.setBreadcrumb = function (crumbs) {
    _breadcrumb.reset();

    crumbs.forEach(function (crumb) {
      _breadcrumb.addLocationCrumb({
        title: crumb.title,
        stateId: crumb.id || crumb.stateId,
        stateParams: crumb.params
      });
    });

    var updatedCrumbs = _breadcrumb.provider().crumbs;

    if (updatedCrumbs && updatedCrumbs.length > 0) {
      updatedCrumbs[0].primaryCrumb = true;
    }

    eventBus.publish('momNavigateBreadcrumb.reset', {
      crumbs: updatedCrumbs
    });
    return _breadcrumb.provider();
  };
  /**
   * Adds the specified title as selected item in the navigation breadcrumb.
   * > **Note:** Use this method only if you need to override the default breadcrumb. By default, the navigation breadcrumb is built automatically based on your **states.json** configuration. For more information, see [Configuring the navigation breadcrumb](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/configuring-the-navigation-breadcrumb) on the MOM UI Wiki.
   * @param {String} title The string to display as the last item of the breadcrumb (typically used to indicate an item selection).
   * @returns {BreadcrumbProvider} The [BreadcrumbProvider](#~BreadcrumbProvider)  object used to manage the breadcrumb.
   */


  exports.setBreadcrumbSelection = function (title) {
    _breadcrumb.setBreadcrumbSelection(title);

    return _breadcrumb.provider();
  };
  /**
   * Creates a ViewModelProperty object that can be used in most of Apollo input custom elements.
   * @param {String} name The identifier of the property.
   * @param {String} displayName The label of the property.
   * @param {String} type The type of the property. It can be one of the following:
   * * CHAR
   * * DATE
   * * DOUBLE
   * * FLOAT
   * * INTEGER
   * * BOOLEAN
   * * SHORT
   * * STRING
   * @param {*} [dbValue=undefined] The value of the property.
   * @param {String} [uiValue=String(dbValue)] The display value of the property.
   * > **IMPORTANT:** This value _must_ be a String, otherwise it will not be displayed.
   * @returns {ViewModelProperty} A valid ViewModelProperty object.
   */


  exports.prop = function (name, displayName, type, dbValue, uiValue) {
    var displayValue = uiValue || String(dbValue);

    var prop = _uwPropertySvc.createViewModelProperty(name, displayName, type, dbValue, [displayValue]);

    prop.propApi = {};
    return prop;
  };
  /**
   * Converts an object with properties set to simple values (String, Boolean, Number or Date) into an object containing the same property values but wrapped in ViewModelProperty objects.
   * Note that:
   * * The internal type of the ViewModelProperty objects is determined automatically based on the JavaScript type of the original value.
   * * The resulting ViewModelProperty objects will have a label set to the same value as their identifier.
   * * The resulting ViewModelProperty objects will have a uiValue set to their dbValue converted to a String.
   * @param {Object<String|Boolean|Number|Date>} obj An object containing the properties that need to be converted to ViewModelProperty objects.
   * @return {Object<ViewModelProperty>} An object whose properties are valid ViewModelProperty objects.
   */


  exports.propsObj = function (obj) {
    var result = {};

    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        var type;
        var value = obj[prop]; // 'CHAR', 'DATE', 'DOUBLE', 'FLOAT', 'INTEGER', 'BOOLEAN', 'SHORT', 'STRING', 'OBJECT'

        switch (_typeof(obj[prop])) {
          case 'string':
            type = 'STRING';
            break;

          case 'boolean':
            type = 'BOOLEAN';
            break;

          case 'number':
            if (obj[prop] % 1 === 0) {
              type = 'INTEGER';
            } else {
              type = 'DOUBLE';
            }

            break;

          case 'object':
            if (obj[prop] instanceof Date) {
              type = 'DATE';
              value = obj[prop].getTime();
            } else {
              // Arrays are not managed
              type = 'OBJECT';
            }

            break;

          default:
            break;
        }

        result[prop] = exports.prop(prop, prop, type, value);
      }
    }

    return result;
  };
  /**
   * Specifies the visibility of the command that displays command labels.
   * @param {Boolean} value Specifies whether the Toggle Command Labels command is disabled or not.
   */


  exports.setToggleCommandLabelsCommands = function (value) {
    _appCtxSvc.updateCtx('disableToggleCommandLabels', !value);
  };
  /**
   * Specifies whether command labels are displayed or not in the main SubLocation location command bars.
   * @param {Boolean} value Whether command labels are displayed or not.
   */


  exports.setCommandLabels = function (value) {
    _appCtxSvc.updateCtx('commandLabels', value); // Classic


    if (value) {
      // UX Refresh
      _appCtxSvc.registerCtx("toggleLabel", true);

      $('.locationPanel').addClass('aw-commands-showIconLabel');
    } else {
      _appCtxSvc.updateCtx("toggleLabel", false);

      $('.locationPanel').removeClass('aw-commands-showIconLabel');
    }
  };
  /**
   * Toggles whether command labels are displayed or not in the main SubLocation location command bars.
   */


  exports.toggleCommandLabels = function () {
    exports.setCommandLabels(!_appCtxSvc.getCtx('commandLabels'));
  };
  /**
   * Wraps the specified value into a Promise.
   * @param {*} value The value to transform into a Promise.
   * @returns {Promise<*>} The Promise containing the value specified as input.
   */


  exports.promisify = function (value) {
    return _$q(function (resolve) {
      resolve(value);
    });
  };
  /**
   * Redirects to screen corresponding to the specified URL fragment.
   * @param {String} url The URL fragment to redirect to.
   */


  exports.redirect = function (url) {
    _$window.location.href = url;
  };
  /**
   * An object used to configure the global navigation toolbar panel.
   * @typedef GlobalNavigationToolbar
   * @property {Boolean} showPanel Whether to display the panel open (true) or not (false).
   * @property {String} viewName The name of the view/viewModel to load in the navigation panel.
   * @property {Boolean} pinned Whether the navigation panel is pinned (true) or not (false).
   */

  /**
   * Activates the primary navigation panel to display a list of navigation links.
   *
   * > **Tip:** This method is also exposed as the **MomActivatePrimaryNavigationPanel** custom action.
   *
   * If you require more customization, you can provide a [GlobalNavigationToolbar](#~GlobalNavigationToolbar) object
   * as **cfg**. This object will be stored in the **globalNavigationToolbar** context.
   *
   * For the simplest usage, the **cfg** object hould only contain a **panel** property set to a unique identifier for the navigation panel, that will be stored in the **momPrimaryNavigationPanel** context. For more information, see the [Configuring primary navigation links](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/configuring-primary-navigation-links) on the MOM UI Wiki.
   * @param {Object} cfg The navigation panel configuration.
   * @deprecated This method is deprecated as of v0.41.0, and it no longer works with the current version of Apollo. Use the awsidenav.openClose event instead.
   *
   */


  exports.activatePrimaryNavigationPanel = function (cfg) {
    var toolbarPanelContext = {
      showPanel: cfg.showPanel !== false ? 'true' : 'false',
      viewName: cfg.viewName || 'momPrimaryNavigationPanel',
      pinned: cfg.pinned
    };

    _appCtxSvc.registerCtx('momPrimaryNavigationPanel', cfg.panel);

    _appCtxSvc.registerCtx('globalNavigationToolbar', toolbarPanelContext);
  };
  /**
   * An object used to configure a composite action.
   * @typedef {Object} CompositeActionConfig
   * @property {DeclViewModel} vm A reference to the viewModel of the action(s) to execute (only necessary for the first action executed).
   * @property {String} action The ID of an action to execute (configure either **action** or **actions**).
   * @property {String[]} actions An array containing the IDs of the actions to execute in parallel (configure either **action** or **actions**).
   * @property {CompositeActionConfig} success A [CompositeActionConfig](#~CompositeActionConfig) object determining the action(s) to execute on success, and optional actions to execute
   * in case of success or failure.
   * @property {CompositeActionConfig} failure A [CompositeActionConfig](#~CompositeActionConfig) object determining the action(s) to execute on failure, and optional actions to execute
   * in case of success or failure.
   *
   */

  /**
   * Executes a sequence of actions asynchronously.
   * > **Tip** This method is also exposed as the **MomCompositeAction** custom action.
   * > For more information on how to use it, see the [Configuring composite actions](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/Configuring-composite-actions) page on the MOM UI Wiki.
   * @param {CompositeActionConfig} cfg A [CompositeActionConfig](#~CompositeActionConfig) object determining the action(s) to execute, and optional actions to execute
   * in case of success or failure.
   * @returns {Promise<*>} An object containing the **value** and **values** properties, corresponding to the result(s) of the action(s) executed.
   */


  exports.compositeAction = function (cfg) {
    var localData = {
      data: cfg.vm,
      ctx: _appCtxSvc.ctx,
      result: cfg.result
    };

    var createCfg = function createCfg(key, cfg, results) {
      return {
        vm: cfg.vm,
        actions: cfg[key].actions || [cfg[key].action],
        success: cfg[key].success,
        failure: cfg[key].failure,
        result: results.length === 1 ? results[0] : results //value: results[ 0 ],
        //values: results

      };
    };

    var promises = [];
    cfg.actions = cfg.actions || [cfg.action];
    cfg.actions.forEach(function (actionId) {
      logger.info('MOM Composite Action - calling: ', actionId);
      var action = cfg.vm._internal.actions[actionId];
      var depModuleObj = null;

      if (action.deps) {
        promises.push(declUtils.loadDependentModule(action.deps, _$q, app.getInjector()).then(function (depModuleObj) {
          return _actionSvc.executeAction(cfg.vm, action, localData, depModuleObj);
        }));
      } else {
        promises.push(_actionSvc.executeAction(cfg.vm, action, localData, depModuleObj));
      }
    });
    return _$q.all(promises).then(function (results) {
      if (cfg.success) {
        var successCfg = createCfg('success', cfg, results);
        logger.info('MOM Composite Action - calling success action');
        return exports.compositeAction(successCfg);
      }

      logger.info('MOM Composite Action: success'); //return { values: results, value: results[ 0 ] };

      return results.length === 1 ? results[0] : results;
    }).catch(function (error) {
      var results = error.constructor === Array ? error : [error];

      if (cfg.failure) {
        var failureCfg = createCfg('failure', cfg, results);
        logger.info('MOM Composite Action - calling failure action');
        return exports.compositeAction(failureCfg);
      }

      logger.info('MOM Composite Action: failure'); //throw { values: results, value: results[ 0 ] };

      throw results.length === 1 ? results[0] : results;
    });
  };
  /**
   * Scrolls to the specify ID or name on the current view.
   * @param {String} id The ID to scroll to.
   */


  exports.scrollTo = function (id) {
    var el = document.getElementById(id);
    el = el || document.getElementsByName(id).length !== 0 && document.getElementsByName(id)[0];

    if (!el) {
      logger.warn('MOM UI - mom.utils.service#scrollTo: Unable to find element with ID or name "' + id + '"');
      return;
    }

    if (el.scrollIntoView) {
      el.scrollIntoView({
        behavior: "smooth",
        block: 'start'
      });
    } else {
      _$anchorScroll(id);
    }
  };
  /**
   * Retrieves the specified Apollo configuration file.
   * > **Tip** This method is also exposed as the **MomGetCfg** custom action.
   * @param {String} file The name of the JSON configuration file to retrieve, without extension.
   * @returns {Promise<*>} The contents of the configuration file.
   */


  exports.getCfg = function (file) {
    return _cfgSvc.getCfg(file);
  };
  /**
   * Updates the contents of the specified configuration file called **name** with the ones provided as **cfg** parameter,
   * and triggers the appropriate configuration update event.
   * @param {String} name The name of the configuration file to update (without extension).
   * @param {Object} cfg An object that will be merged with the existing configuration.
   */


  exports.updateConfiguration = function (name, cfg) {
    _cfgSvc.getCfg(name).then(function (cVM) {
      _.merge(cVM, cfg);

      eventBus.publish('configurationChange.' + name);
    });
  };
  /**
   * Updates the contents of the **commandsViewModel** configuration files with the ones provided as **cfg** parameter,
   * and triggers an application-wide command update.
   * @param {Object} cfg An object compatible with the **commandsViewModel** format.
   */


  exports.updateCommands = function (cfg) {
    return exports.updateConfiguration('commandsViewModel', cfg);
  };

  eventBus.subscribe('primaryWorkArea.selectionChangeEvent', function (data) {
    _appCtxSvc.updateCtx('momPrimarySelection', data.dataProvider.selectedObjects);

    _appCtxSvc.updateCtx('momSecondarySelection', []);
  });
  eventBus.subscribe('secondaryWorkArea.selectionChangeEvent', function (data) {
    _appCtxSvc.updateCtx('momSecondarySelection', data.dataProvider.selectedObjects);
  });
  eventBus.subscribe('appCtx.register', function (context) {
    if (context.name === 'ViewModeContext') {
      if (context.value && context.value.supportedViewModes) {
        _appCtxSvc.registerCtx('momSupportedViewModesList', Object.keys(context.value.supportedViewModes));
      }
    }
  });
  eventBus.subscribe('mom.commands.update', function (cfg) {
    exports.updateCommands(cfg);
  });
  app.factory('momUtilsService', ['appCtxService', 'uwPropertyService', 'iconService', '$state', '$http', 'momBreadcrumbService', '$window', '$q', '$anchorScroll', '$rootScope', '$sce', 'actionService', 'configurationService', function (appCtxService, uwPropertyService, iconService, $state, $http, breadcrumb, $window, $q, $anchorScroll, $rootScope, $sce, actionService, configurationService) {
    _appCtxSvc = appCtxService;
    _uwPropertySvc = uwPropertyService;
    _iconSvc = iconService;
    _$state = $state;
    _$http = $http;
    _breadcrumb = breadcrumb;
    _$window = $window;
    _$q = $q;
    _$anchorScroll = $anchorScroll;
    _$rootScope = $rootScope;
    _$sce = $sce;
    _actionSvc = actionService;
    _cfgSvc = configurationService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momUtilsService'
  };
});