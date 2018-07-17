'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Lexer = function () {
  function Lexer(buf, outer) {
    _classCallCheck(this, Lexer);

    this.buf = buf;
    this.pos = 0;
    this.objects = Object.create(null);
    this._outer = outer;
  }

  _createClass(Lexer, [{
    key: 'read',
    value: function read(len) {
      var buf = this.buf.subarray(this.pos, this.pos + len);
      this.pos += len;
      return buf;
    }
  }, {
    key: 'getString',
    value: function getString(len) {
      return String.fromCharCode.apply(null, this.buf.subarray(this.pos, this.pos + len));
    }
  }, {
    key: 'readString',
    value: function readString(len) {
      var str = this.getString(len);
      this.pos += len;
      return str;
    }
  }, {
    key: 'skipEOL',
    value: function skipEOL(len, trial) {
      var before = this.pos;

      var done = false;
      var count = 0;
      while (!done && (!len || count < len)) {
        switch (this.buf[this.pos]) {
          case 0x0d:
            // CR
            if (this.buf[this.pos + 1] === 0x0a) {
              // CR LF
              this.pos++;
            }
          // falls through
          case 0x0a:
            // LF
            this.pos++;
            count++;
            break;
          default:
            done = true;
            break;
        }
      }

      if (!count || len && count < len) {
        if (!trial) {
          this._error('EOL expected but not found');
        }
        this.pos = before;
        return false;
      }

      return true;
    }
  }, {
    key: 'skipWhitespace',
    value: function skipWhitespace(len, trial) {
      var before = this.pos;

      var done = false;
      var count = 0;
      while (!done && (!len || count < len)) {
        if (Lexer.isWhiteSpace(this.buf[this.pos])) {
          this.pos++;
          count++;
        } else {
          done = true;
        }
      }

      if (!count || len && count < len) {
        if (!trial) {
          this._error('Whitespace expected but not found');
        }
        this.pos = before;
        return false;
      }

      return true;
    }
  }, {
    key: 'skipSpace',
    value: function skipSpace(len, trial) {
      var before = this.pos;

      var done = false;
      var count = 0;
      while (!done && (!len || count < len)) {
        if (this.buf[this.pos] === 0x20) {
          this.pos++;
          count++;
        } else {
          done = true;
        }
      }

      if (!count || len && count < len) {
        if (!trial) {
          this._error('Space expected but not found');
        }
        this.pos = before;
        return false;
      }

      return true;
    }
  }, {
    key: 'shift',
    value: function shift(offset) {
      this.pos += offset;
    }
  }, {
    key: '_nextCharCode',
    value: function _nextCharCode() {
      return this.buf[this.pos++];
    }
  }, {
    key: '_nextChar',
    value: function _nextChar() {
      return String.fromCharCode(this.buf[this.pos++]);
    }
  }, {
    key: '_error',
    value: function _error(err) {
      throw new Error(err);
    }
  }, {
    key: '_warning',
    value: function _warning(warning) {
      console.warn(warning);
    }

    // e.g. 123 43445 +17 −98 0 34.5 −3.62 +123.6 4. −.002 0.0

  }, {
    key: 'readNumber',
    value: function readNumber(trial) {
      var before = this.pos;

      var c = this._nextCharCode();
      var sign = 1;
      var isFloat = false;
      var str = '';

      switch (true) {
        case c === 0x2b:
          // '+'
          break;
        case c === 0x2d:
          // '-'
          sign = -1;
          break;
        case c === 0x2e:
          // '.'
          isFloat = true;
          str = '0.';
          break;
        case c < 0x30 || c > 0x39:
          // not a number
          if (!trial) {
            this._error('Invalid number: ' + String.fromCharCode(c));
          }
          this.pos = before;
          return undefined;
        default:
          str += String.fromCharCode(c);
          break;
      }

      var done = false;
      while (!done && (c = this._nextCharCode()) >= 0) {
        switch (true) {
          case c === 0x2e:
            // '.'
            if (isFloat) {
              done = true;
            } else {
              isFloat = true;
              str += '.';
            }
            break;
          case c >= 0x30 && c <= 0x39:
            // 0 - 9
            str += String.fromCharCode(c);
            break;
          default:
            done = true;
            break;
        }
      }

      this.pos--;

      var nr = isFloat ? parseFloat(str, 10) : parseInt(str, 10);
      return nr * sign;
    }
  }, {
    key: 'outer',
    get: function get() {
      return this._outer || this;
    }
  }], [{
    key: 'isWhiteSpace',
    value: function isWhiteSpace(c) {
      return c === 0x00 || // NULL
      c === 0x09 || // TAB
      c === 0x0A || // LF
      c === 0x0C || // FF
      c === 0x0D || // CR
      c === 0x20 // SP
      ;
    }
  }]);

  return Lexer;
}();

module.exports = Lexer;