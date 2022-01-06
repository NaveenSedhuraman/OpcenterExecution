"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define document */

/**
 * Directive to display a file upload
 *
 * @module js/aw-file-upload.directive
 */
define(['app', 'lodash', 'jquery', 'js/eventBus', 'js/awFileNameUtils', 'js/viewModelService', 'js/appCtxService', 'js/on-file-change.directive', 'js/aw-button.directive', 'js/aw-i18n.directive', 'js/localeService'], function (app, _, $, eventBus, awFileNameUtils) {
  'use strict';
  /**
   * Directive to display a file upload.
   *
   * fileChangeAction: the action that will be performed when file changed. typeFilter: the file type filter in
   * file selection dialog. isRequired: boolean flag indicate whether the file input field is required or not.
   * formData: the form data to be post to server URL on form submit.
   *
   * @example <aw-file-upload file-change-action="validateFile" type-filter="image/..." is-required="true">...</aw-file-upload>
   *
   * @member aw-file-upload
   * @memberof NgElementDirectives
   */

  app.directive('awFileUpload', ['viewModelService', 'appCtxService', function (viewModelSvc, appCtxService) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        fileChangeAction: '@',
        typeFilter: '@',
        isRequired: '=?',
        formData: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-file-upload.directive.html',
      replace: true,
      controller: ['$scope', 'localeService', function ($scope, localeSvc) {
        var self = this; // eslint-disable-line no-invalid-this

        $scope.fileUploadBtnLabel = 'ChooseFile';
        $scope.noFileChosenText = 'NoFileChosen';
        localeSvc.getTextPromise('UIMessages').then(function (textBundle) {
          if (textBundle[$scope.fileUploadBtnLabel]) {
            $scope.fileUploadBtnLabel = textBundle[$scope.fileUploadBtnLabel];
          }

          if (textBundle[$scope.noFileChosenText]) {
            $scope.noFileChosenText = textBundle[$scope.noFileChosenText];
          }
        });
        self._frameTemplate = //
        '<iframe name=\'{formTarget}\' tabindex=\'-1\' style=\'position:absolute;width:0;height:0;border:0\'>#document<html><head></head><body></body></html></iframe>';
        var declViewModel = viewModelSvc.getViewModel($scope, true);

        $scope.updateFile = function (event) {
          var fileCtx = appCtxService.getCtx('HostedFileNameContext');

          if (fileCtx) {
            appCtxService.unRegisterCtx('HostedFileNameContext');
          }

          declViewModel.files = event.target.files;
          declViewModel.fileName = awFileNameUtils.getFileFromPath(event.target.value);
          declViewModel.fileNameNoExt = awFileNameUtils.getFileNameWithoutExtension(declViewModel.fileName);

          if ($scope.typeFilter) {
            var validFileExtensions = $scope.typeFilter.split(',');
            var fileExt = awFileNameUtils.getFileExtension(declViewModel.fileName);

            if (fileExt !== '') {
              fileExt = _.replace(fileExt, '.', '');
            }

            declViewModel.validFile = false;

            for (var ndx = 0; ndx < validFileExtensions.length; ndx++) {
              var validFileExt = validFileExtensions[ndx].trim();

              if (validFileExt !== null) {
                validFileExt = _.replace(validFileExt, '.', '');

                if (fileExt !== '' && fileExt.toLowerCase() === validFileExt.toLowerCase()) {
                  declViewModel.validFile = true;
                }
              }

              declViewModel.fileExt = fileExt;
            }
          } else {
            declViewModel.validFile = true;
          }

          if (!declViewModel.autoClicking) {
            $scope.$apply();
          }

          if (declViewModel.fileName !== '' && !declViewModel.validFile) {
            eventBus.publish('invalidFileSelected', {});
          } // call action when file selection changed


          if ($scope.fileChangeAction) {
            viewModelSvc.executeCommand(declViewModel, $scope.fileChangeAction, $scope);
          }
        }; // Attach a hidden iframe as the form target to avoid page redirection when submit form


        $scope.formTarget = 'FormPanel_' + app.getBaseUrlPath();

        var initFormTarget = function initFormTarget() {
          var formTargetFrameHtml = self._frameTemplate.replace('{formTarget}', $scope.formTarget);

          var dummy = document.createElement('div');
          dummy.innerHTML = formTargetFrameHtml;
          var formTargetFrame = dummy.firstChild;
          document.body.appendChild(formTargetFrame);
          return formTargetFrame;
        };

        var formTargetFrame = initFormTarget();
        var fileCtx = appCtxService.getCtx('HostedFileNameContext');
        var addObject = appCtxService.getCtx('addObject');

        if (fileCtx && addObject && addObject.showDataSetUploadPanel) {
          declViewModel.fileName = awFileNameUtils.getFileFromPath(fileCtx.filename);
          declViewModel.fileNameNoExt = awFileNameUtils.getFileNameWithoutExtension(declViewModel.fileName);
          var FileExt = awFileNameUtils.getFileExtension(declViewModel.fileName);

          if (FileExt !== '') {
            FileExt = _.replace(FileExt, '.', '');
          }

          declViewModel.fileExt = FileExt;

          if ($scope.fileChangeAction) {
            viewModelSvc.executeCommand(declViewModel, $scope.fileChangeAction, $scope);
          }

          viewModelSvc.executeCommand(declViewModel, 'initiateCreation', $scope);
        } else {
          declViewModel.fileName = null;
          declViewModel.fileNameNoExt = null;
          declViewModel.fileExt = null;
        }
        /**
         * Listen for DnD highlight/unhighlight event from dragAndDropService
         */


        var chooseOrDropFilesDragDropLsnr = eventBus.subscribe('dragDropEvent.highlight', function (eventData) {
          //   logger.info('=========DnD event captured in Choose File widget================');
          if (!_.isUndefined(eventData) && !_.isUndefined(eventData.targetElement) && eventData.targetElement.classList) {
            var event = eventData.event;
            var isHighlightFlag = eventData.isHighlightFlag;
            var target = eventData.targetElement;
            var isGlobalArea = eventData.isGlobalArea;

            if (target.classList.contains('aw-widgets-chooseordropfile')) {
              var chooseFileWidget = target.querySelector('.aw-file-upload-fileName');

              if (isHighlightFlag) {
                // on entering a valid cell item within a cellList, apply stlye as in LCS-148724
                chooseFileWidget.classList.add('aw-widgets-dropframe');
                chooseFileWidget.classList.add('aw-theme-dropframe');
              } else {
                chooseFileWidget.classList.remove('aw-theme-dropframe');
                chooseFileWidget.classList.remove('aw-widgets-dropframe');
              }
            } else if (target.classList.contains('aw-file-upload-fileName')) {
              if (isHighlightFlag) {
                // on entering a valid cell item within a cellList, apply stlye as in LCS-148724
                target.classList.add('aw-widgets-dropframe');
                target.classList.add('aw-theme-dropframe');
              } else {
                target.classList.remove('aw-theme-dropframe');
                target.classList.remove('aw-widgets-dropframe');
              }
            }
          }
        });
        $scope.$on('$destroy', function () {
          // Detach iframe when panel unloaded
          if (formTargetFrame) {
            formTargetFrame.onload = null;
            document.body.removeChild(formTargetFrame);
          }

          if (chooseOrDropFilesDragDropLsnr) {
            eventBus.unsubscribe(chooseOrDropFilesDragDropLsnr);
          }
        });
      }]
    };
  }]);
});