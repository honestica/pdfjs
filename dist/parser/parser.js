'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Lexer = require('./lexer');
var PDF = require('../object');
var util = require('../util');

var Parser = function () {
  // ab ... ArrayBuffer
  function Parser(ab) {
    _classCallCheck(this, Parser);

    this.src = new Uint8Array(util.toArrayBuffer(ab));
  }

  _createClass(Parser, [{
    key: 'parse',
    value: function parse() {
      var index = lastIndexOf(this.src, 'startxref', 128);
      if (index === -1) {
        throw new Error('Invalid PDF: startxref not found');
      }

      index += 'startxref'.length;

      // skip whitespaces
      while (Lexer.isWhiteSpace(this.src[++index])) {}

      var str = '';
      while (this.src[index] >= 0x30 && this.src[index] <= 0x39) {
        // between 0 and 9
        str += String.fromCharCode(this.src[index++]);
      }

      var startXRef = parseInt(str, 10);

      if (isNaN(startXRef)) {
        throw new Error('Invalid PDF: startxref is not a number');
      }

      var lexer = new Lexer(this.src);
      lexer.shift(startXRef);

      this.xref = PDF.Xref.parse(null, lexer);
      this.trailer = this.xref.trailer || PDF.Trailer.parse(this.xref, lexer);

      var trailer = this.trailer;
      while (trailer.has('Prev')) {
        lexer.pos = trailer.get('Prev');
        var xref = PDF.Xref.parse(null, lexer);

        for (var i = 0; i < xref.objects.length; ++i) {
          var obj = xref.objects[i];
          if (obj && !this.xref.objects[i]) {
            this.xref.objects[i] = obj;
          }
        }

        trailer = xref.trailer || PDF.Trailer.parse(xref, lexer);
      }
    }
  }], [{
    key: 'addObjectsRecursive',
    value: function addObjectsRecursive(objects, value) {
      switch (true) {
        case value instanceof PDF.Reference:
          if (objects.indexOf(value.object) > -1) {
            break;
          }
          objects.push(value.object);
          Parser.addObjectsRecursive(objects, value.object);
          break;
        case value instanceof PDF.Object:
          Parser.addObjectsRecursive(objects, value.properties);
          Parser.addObjectsRecursive(objects, value.content);
          break;
        case value instanceof PDF.Dictionary:
          for (var key in value.dictionary) {
            Parser.addObjectsRecursive(objects, value.dictionary[key]);
          }
          break;
        case Array.isArray(value):
          value.forEach(function (item) {
            Parser.addObjectsRecursive(objects, item);
          });
          break;
      }
    }
  }]);

  return Parser;
}();

module.exports = Parser;

function lastIndexOf(src, key, step) {
  if (!step) step = 1024;
  var pos = src.length,
      index = -1;

  while (index === -1 && pos > 0) {
    pos -= step - key.length;
    index = find(src, key, Math.max(pos, 0), step, true);
  }

  return index;
}

function find(src, key, pos, limit, backwards) {
  if (pos + limit > src.length) {
    limit = src.length - pos;
  }

  var str = String.fromCharCode.apply(null, src.subarray(pos, pos + limit));
  var index = backwards ? str.lastIndexOf(key) : str.indexOf(key);
  if (index > -1) {
    index += pos;
  }
  return index;
}