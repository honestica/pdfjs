'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFValue = require('./value');

var PDFArray = function () {
  function PDFArray(array) {
    _classCallCheck(this, PDFArray);

    if (!array) {
      array = [];
    }

    array.toString = function () {
      return '[' + this.map(function (item) {
        return String(item);
      }).join(' ') + ']';
    };

    return array;
  }

  _createClass(PDFArray, null, [{
    key: 'parse',
    value: function parse(xref, lexer, trial) {
      if (lexer.getString(1) !== '[') {
        if (trial) {
          return undefined;
        }

        throw new Error('Invalid array');
      }

      lexer.shift(1);
      lexer.skipWhitespace(null, true);

      var values = [];

      while (lexer.getString(1) !== ']') {
        values.push(PDFValue.parse(xref, lexer));
        lexer.skipWhitespace(null, true);
      }

      lexer.shift(1);

      return new PDFArray(values);
    }
  }]);

  return PDFArray;
}();

module.exports = PDFArray;