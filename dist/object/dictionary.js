'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFName = require('./name');
var PDFValue = require('./value');

var PDFDictionary = function () {
  function PDFDictionary(dictionary) {
    _classCallCheck(this, PDFDictionary);

    this.dictionary = {};
    if (dictionary) {
      for (var key in dictionary) {
        this.add(key, dictionary[key]);
      }
    }
  }

  _createClass(PDFDictionary, [{
    key: 'add',
    value: function add(key, val) {
      if (typeof val === 'string') {
        val = new PDFName(val);
      }
      this.dictionary[new PDFName(key)] = val;
    }
  }, {
    key: 'set',
    value: function set(key, val) {
      this.add(key, val);
    }
  }, {
    key: 'has',
    value: function has(key) {
      return String(new PDFName(key)) in this.dictionary;
    }
  }, {
    key: 'get',
    value: function get(key) {
      return this.dictionary[new PDFName(key)];
    }
  }, {
    key: 'del',
    value: function del(key) {
      delete this.dictionary[new PDFName(key)];
    }
  }, {
    key: 'toString',
    value: function toString() {
      var str = '';
      for (var key in this.dictionary) {
        var val = this.dictionary[key];
        str += (key + ' ' + (val === null ? 'null' : val)).replace(/^/gm, '\t') + '\n';
      }
      return '<<\n' + str + '>>';
    }
  }, {
    key: 'length',
    get: function get() {
      var length = 0;
      for (var key in this.dictionary) {
        length++;
      }
      return length;
    }
  }], [{
    key: 'parse',
    value: function parse(xref, lexer, trial) {
      if (lexer.getString(2) !== '<<') {
        if (trial) {
          return undefined;
        }

        throw new Error('Invalid dictionary');
      }

      lexer.shift(2);
      lexer.skipWhitespace(null, true);

      var dictionary = new PDFDictionary();

      while (lexer.getString(2) !== '>>') {
        var key = PDFName.parse(xref, lexer);
        lexer.skipWhitespace(null, true);

        var value = PDFValue.parse(xref, lexer);
        dictionary.set(key, value);

        lexer.skipWhitespace(null, true);
      }

      lexer.shift(2);

      return dictionary;
    }
  }]);

  return PDFDictionary;
}();

module.exports = PDFDictionary;