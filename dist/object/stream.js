'use strict';

// page 60
// Filters: page 65

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFObject = require('./object');

module.exports = function () {
  function PDFStream(object) {
    _classCallCheck(this, PDFStream);

    if (!object) {
      object = new PDFObject();
    }

    object.content = this;
    this.object = object;
    this.content = '';
  }

  // slice(begin, end) {
  //   this.content = this.content.slice(begin, end)
  //   this.object.prop('Length', this.content.length - 1)
  // }

  _createClass(PDFStream, [{
    key: 'writeLine',
    value: function writeLine(str) {
      this.content += str + '\n';
      this.object.prop('Length', this.content.length - 1);
    }
  }, {
    key: 'toReference',
    value: function toReference() {
      return this.object.toReference();
    }
  }, {
    key: 'toString',
    value: function toString() {
      var content = this.content;
      if (content instanceof Uint8Array) {
        content = uint8ToString(content) + '\n';
      }

      return 'stream\n' + content + 'endstream';
    }
  }]);

  return PDFStream;
}();

// source: http://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
function uint8ToString(u8a) {
  var CHUNK_SZ = 0x8000;
  var c = [];
  for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
  }
  return c.join('');
}