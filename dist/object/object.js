'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFDictionary = require('./dictionary');
var PDFReference = require('./reference');
var PDFValue = require('./value');

var PDFObject = function () {
  function PDFObject(type) {
    _classCallCheck(this, PDFObject);

    this.id = null;
    this.rev = 0;
    this.properties = new PDFDictionary();
    this.reference = new PDFReference(this);
    this.content = null;

    if (type) {
      this.prop('Type', type);
    }

    // TODO: still necessary?
    // used to have obj.object API for both indirect and direct objects
    //   this.object = this
  }

  _createClass(PDFObject, [{
    key: 'prop',
    value: function prop(key, val) {
      this.properties.add(key, val);
    }
  }, {
    key: 'toReference',
    value: function toReference() {
      return this.reference;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.id.toString() + ' ' + this.rev + ' obj\n' + (this.properties.length ? this.properties.toString() + '\n' : '') + (this.content !== null ? this.content.toString() + '\n' : '') + 'endobj';
    }
  }], [{
    key: 'parse',
    value: function parse(xref, lexer, trial) {
      var before = lexer.pos;

      var id = lexer.readNumber(trial);
      if (id === undefined && !trial) {
        throw new Error('Invalid object');
      }
      lexer.skipSpace(1, trial);
      var generation = lexer.readNumber(trial);
      if (generation === undefined && !trial) {
        throw new Error('Invalid object');
      }

      lexer.skipSpace(1, trial);
      if (lexer.getString(3) !== 'obj') {
        if (trial) {
          lexer.pos = before;
          return undefined;
        }

        throw new Error('Invalid object');
      }

      lexer.shift(3);

      lexer.skipEOL(1);
      lexer.skipWhitespace(null, true);

      var obj = PDFObject.parseInner(xref, lexer);

      lexer.skipWhitespace(null, true);

      if (lexer.readString(3) !== 'end') {
        throw new Error('Invalid object: `end` not found');
      }

      return obj;
    }
  }, {
    key: 'parseInner',
    value: function parseInner(xref, lexer) {
      var value = PDFValue.parse(xref, lexer, true);
      if (value === undefined) {
        throw new Error('Empty object');
      }

      lexer.skipWhitespace(null, true);

      var obj = new PDFObject();
      if (value instanceof PDFDictionary) {
        obj.properties = value;

        if (lexer.getString(6) === 'stream') {
          lexer.shift(6);
          lexer.skipEOL(1);

          var length = obj.properties.get('Length');
          if (length === undefined) {
            throw new Error('Invalid Stream: no length specified');
          }

          if ((typeof length === 'undefined' ? 'undefined' : _typeof(length)) === 'object') {
            var pos = lexer.pos;
            length = length.object.content;
            lexer.pos = pos;
          }

          var PDFStream = require('./stream'); // lazy load, cause circular referecnes
          var stream = new PDFStream(obj);
          stream.content = lexer.read(length);
          lexer.skipEOL(1, true);

          if (lexer.readString(9) !== 'endstream') {
            throw new Error('Invalid stream: `endstream` not found');
          }

          lexer.skipEOL(1);
        }
      } else {
        obj.content = value;
      }

      return obj;
    }
  }]);

  return PDFObject;
}();

module.exports = PDFObject;