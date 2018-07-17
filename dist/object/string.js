'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFString = function () {
  function PDFString(str) {
    _classCallCheck(this, PDFString);

    this.str = str;
  }

  _createClass(PDFString, [{
    key: 'toHexString',
    value: function toHexString() {
      // convert to hex string
      var hex = '';
      for (var i = 0, len = this.str.length; i < len; ++i) {
        var h = (this.str.charCodeAt(i) - 31).toString(16);
        // left pad zeroes
        h = ('0000' + h).slice(-4);
        hex += h;
      }
      return '<' + hex + '>';
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '(' + this.str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)') + ')';
    }
  }], [{
    key: 'parse',
    value: function parse(xref, lexer, trial) {
      var literal = PDFString.parseLiteral(lexer, trial);
      var hex = literal === undefined && PDFString.parseHex(lexer, trial);

      if (!literal && !hex) {
        if (trial) {
          return undefined;
        }

        throw new Error('Invalid string');
      }

      return literal || hex;
    }
  }, {
    key: 'parseLiteral',
    value: function parseLiteral(lexer, trial) {
      if (lexer.getString(1) !== '(') {
        if (trial) {
          return undefined;
        }

        throw new Error('Invalid literal string');
      }

      lexer.shift(1);

      var str = '';

      var done = false;
      var open = 0;
      var c = void 0;
      while (!done && (c = lexer._nextCharCode()) >= 0) {
        switch (true) {
          case c === 0x28:
            // (
            open++;
            str += String.fromCharCode('(');
            break;
          case c === 0x29:
            // )
            if (open === 0) {
              done = true;
            } else {
              open--;
              str += String.fromCharCode(')');
            }
            break;
          case c === 0x5c:
            // \
            c = lexer._nextCharCode();
            switch (c) {
              case 0x6e:
                // \n
                str += '\n';
                break;
              case 0x72:
                // \r
                str += '\r';
                break;
              case 0x74:
                // \t
                str += '\t';
                break;
              case 0x62:
                // \b
                str += '\b';
                break;
              case 0x66:
                // \f
                str += '\f';
                break;
              case 0x28: // '('
              case 0x29: // ')'
              case 0x5c:
                // '\'
                str += String.fromCharCode(c);
                break;
              default:
                var hex = lexer.readString(3);
                str += String.fromCharCode(parseInt(hex, 16));
                break;
            }
            break;
          case 0x0d: // CR
          case 0x0a:
            // LF
            lexer.skipEOL(1);
            break;
          default:
            str += String.fromCharCode(c);
            break;
        }
      }

      return new PDFString(str);
    }
  }, {
    key: 'parseHex',
    value: function parseHex(lexer, trial) {
      if (lexer.getString(1) !== '<') {
        if (trial) {
          return undefined;
        }

        throw new Error('Invalid hex string');
      }

      lexer.shift(1);

      var str = '';

      var done = false;
      var digits = [];
      var addCharacter = function addCharacter(force) {
        if (digits.length !== 2) {
          if (digits.length === 1 && force) {
            digits.push('0');
          } else {
            return;
          }
        }

        str += String.fromCharCode(parseInt(digits.join(''), 16));
        digits.length = 0;
      };

      var c = void 0;
      while (!done && (c = lexer._nextCharCode()) >= 0) {
        switch (true) {
          case c === 0x3e:
            // >
            done = true;
            break;
          case c >= 0x30 && c <= 0x39: // 0 - 9
          case c >= 0x41 && c <= 0x5a: // A - B
          case c >= 0x61 && c <= 0x7a:
            // a - b
            digits.push(String.fromCharCode(c));
            addCharacter();
            break;
          case lexer.isWhiteSpace(c):
            break;
          default:
            lexer._warning('invalid character `' + String.fromCharCode(c) + '` in hex string');
            break;
        }
      }

      addCharacter(true);

      return new PDFString(str);
    }
  }]);

  return PDFString;
}();

module.exports = PDFString;