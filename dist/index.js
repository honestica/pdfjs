'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('./util');

exports.Document = require('./document');
exports.Font = require('./font/otf');

var PDFImage = require('./image/pdf');
var JPEGImage = require('./image/jpeg');

exports.Image = function Image(b) {
  _classCallCheck(this, Image);

  var src = util.toArrayBuffer(b);

  switch (determineType(src)) {
    case 'pdf':
      return new PDFImage(src);
    case 'jpeg':
      return new JPEGImage(src);
    default:
      throw new TypeError('Unsupported image type');
  }
};

function determineType(buffer) {
  var pdf = String.fromCharCode.apply(null, new Uint8Array(buffer, 0, 5));
  if (pdf === '%PDF-') {
    return 'pdf';
  }

  var view = new DataView(buffer);
  if (view.getUint8(0) === 0xff || view.getUint8(1) === 0xd8) {
    return 'jpeg';
  }

  return null;
}

exports.ExternalDocument = require('./external');

exports.mm = 0.0393700787 * 72;
exports.cm = exports.mm * 10;