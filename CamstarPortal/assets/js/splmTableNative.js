"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This a name space reference to PL Table Native method.
 * _t.const  -> all constants (splmTableConstants.js)
 * _t.util   -> all utility methods (splmTableUtils.js)
 * _t.Cell   -> cell Renderer interface
 * _t.Trv    -> PL Table Traversal
 * _t.Editor -> PL Table Edit support logic
 * _t.Ctrl   -> PL Table DOM Controller
 * _t.MenuService - > PL Table Menu Service
 *
 * @module js/splmTableNative
 */
define([//
'js/splmTableEditor', 'js/splmTableDomController'], function (SPLMTableEditor, _t) {
  'use strict';

  _t.Editor = SPLMTableEditor;
  return _t;
});