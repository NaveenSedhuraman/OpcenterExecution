"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/*
global
define
require
*/

/**
 * This directive is used to show code of different languages.
 *
 * @module js/aw-source-editor.directive
 * @param {string} content - content to show on Source editor
 * @param {string} config - config for the Source editor
 * @param {string} filePath - file path of item to show on Source editor
 * @example <aw-source-editor src="data.src" config="data.config"></aw-source-editor>
 */
define(['app', 'js/eventBus', 'lodash', 'js/sourceEditor.service'], function (app, eventBus, _) {
  'use strict';
  /**
   * Display example .
   *
   * @example <aw-source-editor name="data.name" content=""data.editor.data" config="data.config"></aw-source-editor>
   * @example <aw-source-editor name="data.name" file-path="{{filePath}}"></aw-source-editor>
   *
   * @memberof NgDirectives
   * @member aw-source-editor
   */

  app.directive('awSourceEditor', //
  ['$http', 'sourceEditorService', function ($http, sourceEditorSvc) {
    return {
      restrict: 'E',
      scope: {
        name: '@',
        content: '=?',
        config: '<?',
        filePath: '@?'
      },
      link: function link($scope, $element) {
        var elem = $element[0];
        var name = $scope.name;
        var defaultConfig = {
          language: 'text',
          readOnly: false,
          wordWrap: 'off',
          lineNumbers: 'on',
          automaticLayout: false,
          minimap: {}
        };
        var fileTypeLanguageMap = {
          js: 'javascript',
          txt: 'text',
          ts: 'typescript'
        };

        var config = _.defaults($scope.config, defaultConfig);

        var initSourceEditor = function initSourceEditor(name, elem, config, editorContent) {
          config.value = config.language === 'json' && _.isObject(editorContent) ? JSON.stringify(editorContent, null, 4) : editorContent;
          elem.style.height = config.height ? config.height + 'px' : 'inherit';
          elem.style.width = config.width ? config.width + 'px' : 'inherit';
          var sourceEditor = sourceEditorSvc.createSourceEditor(name, elem, config);

          if (config.theme) {
            sourceEditorSvc.setTheme(config.theme);
          }

          var updateContent = _.debounce(function () {
            var contentString = sourceEditor.getValue();

            if (config.language === 'json') {
              try {
                JSON.parse(contentString);
              } catch (error) {
                eventBus.publish('sourceEditor.invalidContent', {
                  name: name
                });
              }
            }

            $scope.$evalAsync(function () {
              $scope.content = config.language === 'json' ? JSON.parse(contentString) : contentString;
              eventBus.publish('sourceEditor.contentChanged', {
                name: name,
                content: $scope.content
              });
            });
          }, 250);

          sourceEditor.onDidChangeModelContent(function () {
            updateContent();
          });
          sourceEditor.onDidBlurEditorText(function () {
            eventBus.publish('sourceEditor.contentBlur', {
              name: name,
              content: sourceEditor.getValue()
            });
          });

          if ($scope.content !== undefined) {
            $scope.$watch('content', function (newvalue) {
              newvalue = config.language === 'json' && _.isObject(newvalue) ? JSON.stringify(newvalue, null, 4) : newvalue;

              if (sourceEditor.getValue() !== newvalue && newvalue !== undefined) {
                sourceEditor.setValue(newvalue);
              }
            });
          } else {
            $scope.$watch('filePath', function (newValue, oldValue) {
              if (newValue !== oldValue) {
                $http.get(newValue, {
                  cache: true
                }).then(function (source) {
                  var fileType = newValue.split('.').pop();
                  var language = fileTypeLanguageMap[fileType.toLowerCase()] !== undefined ? fileTypeLanguageMap[fileType] : fileType;

                  if (language) {
                    config.language = language;
                    sourceEditorSvc.setLanguage(name, language);
                  }

                  var value = fileType === 'json' ? JSON.stringify(source.data, null, 4) : source.data;
                  sourceEditor.setValue(value);
                });
              }

              eventBus.publish('sourceEditor.filePathChanged', {
                name: name,
                filePath: newValue
              });
            });
          }
        };

        if (name) {
          if ($scope.content !== undefined) {
            $scope.$evalAsync(initSourceEditor(name, elem, config, $scope.content));
          } else if ($scope.filePath !== undefined) {
            $http.get($scope.filePath, {
              cache: true
            }).then(function (source) {
              var fileType = $scope.filePath.split('.').pop();
              config.language = fileTypeLanguageMap[fileType.toLowerCase()] !== undefined ? fileTypeLanguageMap[fileType] : fileType;
              $scope.$evalAsync(initSourceEditor(name, elem, config, source.data));
            });
          }

          $scope.$on('$destroy', function () {
            sourceEditorSvc.removeSourceEditor(name);
          });
        }
      }
    };
  }]);
});