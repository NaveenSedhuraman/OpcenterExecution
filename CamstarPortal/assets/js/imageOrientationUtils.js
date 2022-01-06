"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 DataView
 Uint8Array
 */

/**
 * @module js/imageOrientationUtils
 */
define(['app'], function (app) {
  'use strict';

  var exports = {};
  var _$q = null;

  var dataURItoBlob = function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;

    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    } // separate out the mime component


    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]; // write the bytes of the string to a typed array

    var ia = new Uint8Array(byteString.length);

    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {
      type: mimeString
    });
  };

  var arrayBufferToBase64 = function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;

    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  };

  var getImageInfo = function getImageInfo(tags, offset, little, file, view, fileArrayBuffer) {
    for (var i = 0; i < tags; i++) {
      if (view.getUint16(offset + i * 12, little) === 0x0112) {
        var base64 = 'data:' + file.type + ';base64,' + arrayBufferToBase64(fileArrayBuffer);
        return {
          orientation: view.getUint16(offset + i * 12 + 8, little),
          base64: base64
        };
      }
    }

    return null;
  };

  exports.correctFormFileOrientation = function (formData, formFileKey) {
    if (FormData.prototype.get !== undefined) {
      var file = formData.get(formFileKey);

      if (file && file.type === 'image/jpeg') {
        return exports.correctJPEGImageOrientation(file).then(function (result) {
          formData.set(formFileKey, result, file.name);
        });
      }
    }

    return _$q(function (resolve) {
      resolve();
    });
  };

  exports.correctJPEGImageOrientation = function (file) {
    return exports.getJPEGOrientation(file).then(function (result) {
      return exports.resetJPEGOrientation(result.base64, result.orientation, file.type).then(function (base64Image) {
        return dataURItoBlob(base64Image);
      });
    }).catch(function () {
      return file;
    });
  };

  exports.getJPEGOrientation = function (file) {
    return _$q(function (resolve, reject) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var result = e.target.result;

        try {
          var view = new DataView(result); // Ensure file is JPEG. JPEG files will start with binary value '0xFFD8'

          if (view.getUint16(0, false) !== 0xFFD8) {
            return reject();
          }

          var length = view.byteLength;
          var offset = 2;

          while (offset < length) {
            if (view.getUint16(offset + 2, false) <= 8) {
              return reject();
            }

            var marker = view.getUint16(offset, false);
            offset += 2;

            if (marker !== 0xFFE1 && (marker & 0xFF00) !== 0xFF00) {
              break;
            } else if (marker !== 0xFFE1) {
              offset += view.getUint16(offset, false);
              continue;
            } // 0xFFE1 - APP1 marker


            offset += 2; // check for 'Exif' in ascii string

            var exifAsciiString = view.getUint32(offset, false);

            if (exifAsciiString !== 0x45786966) {
              return reject();
            }

            offset += 6;
            var tiffByteOrder = view.getUint16(offset, false);
            var little = tiffByteOrder === 0x4949;
            offset += view.getUint32(offset + 4, little);
            var tags = view.getUint16(offset, little);
            offset += 2;
            var imageInfo = getImageInfo(tags, offset, little, file, view, result);

            if (imageInfo !== null) {
              return resolve(imageInfo);
            }
          }

          return reject();
        } catch (error) {
          return reject();
        }
      };

      reader.readAsArrayBuffer(file);
    });
  };

  exports.resetJPEGOrientation = function (base64, orientation, fileType) {
    return _$q(function (resolve, reject) {
      var img = new Image();

      img.onload = function () {
        var width = img.width;
        var height = img.height;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d'); // set proper canvas dimensions before transform & export

        if (4 < orientation && orientation < 9) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        } // transform context before drawing image


        switch (orientation) {
          case 2:
            ctx.transform(-1, 0, 0, 1, width, 0);
            break;

          case 3:
            ctx.transform(-1, 0, 0, -1, width, height);
            break;

          case 4:
            ctx.transform(1, 0, 0, -1, 0, height);
            break;

          case 5:
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;

          case 6:
            ctx.transform(0, 1, -1, 0, height, 0);
            break;

          case 7:
            ctx.transform(0, -1, -1, 0, height, width);
            break;

          case 8:
            ctx.transform(0, -1, 1, 0, 0, width);
            break;

          default:
            break;
        } // draw image


        ctx.drawImage(img, 0, 0); // export base64

        resolve(canvas.toDataURL(fileType));
      };

      img.onerror = function (e) {
        reject(e);
      };

      img.src = base64;
    });
  };

  app.factory('imageOrientationUtils', ['$q', function ($q) {
    _$q = $q;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'imageOrientationUtils'
  };
});