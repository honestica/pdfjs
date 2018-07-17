'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFName = require('../object/name');
var PDFObject = require('../object/object');
var PDFString = require('../object/string');
var PDFArray = require('../object/array');
var Base = require('./base');
var StringWidth = Base.StringWidth;

module.exports = function (_Base) {
  _inherits(AFMFont, _Base);

  function AFMFont(data) {
    _classCallCheck(this, AFMFont);

    var _this = _possibleConstructorReturn(this, (AFMFont.__proto__ || Object.getPrototypeOf(AFMFont)).call(this));

    _this._data = data;
    _this.lineGap = _this._data.fontBBox[3] - _this._data.fontBBox[1] - (_this._data.ascender - _this._data.descender);
    _this.parent = _this;
    return _this;
  }

  _createClass(AFMFont, [{
    key: 'instance',
    value: function instance() {
      return this;
    }
  }, {
    key: 'encode',
    value: function encode(str) {
      var encoded = '';
      for (var i = 0, len = str.length; i < len; ++i) {
        switch (str[i]) {
          case '\\':
            encoded += '\\\\';
            break;
          case '(':
            encoded += '\\(';
            break;
          case ')':
            encoded += '\\)';
            break;
          default:
            encoded += String.fromCharCode(this._charCodeFor(str[i]));
        }
      }

      return '(' + encoded + ')';
    }
  }, {
    key: '_charCodeFor',
    value: function _charCodeFor(c) {
      return c in UNICODE_TO_WIN1252 ? UNICODE_TO_WIN1252[c] : c.charCodeAt(0);
    }
  }, {
    key: 'stringWidth',
    value: function stringWidth(str, size) {
      var scale = size / 1000;
      var width = 0;
      var kerning = [];
      for (var i = 0, len = str.length; i < len; ++i) {
        var left = this._charCodeFor(str[i]);

        var advanceWidth = this._data.widths[left];
        if (advanceWidth) {
          width += advanceWidth;
        }

        if (str[i + 1] !== undefined && left in this._data.kerning) {
          var right = this._charCodeFor(str[i + 1]);
          var offset = this._data.kerning[left][right];
          if (offset !== undefined) {
            width += offset;
            kerning.push({ pos: i + 1, offset: -offset });
          }
        }
      }

      return new StringWidth(width * scale, kerning);
    }
  }, {
    key: 'lineHeight',
    value: function lineHeight(size, includeGap) {
      if (includeGap == null) {
        includeGap = false;
      }

      var gap = includeGap ? this.lineGap : 0;

      return (this._data.ascender - this._data.descender) * size / 1000;
    }
  }, {
    key: 'ascent',
    value: function ascent(size) {
      return this._data.ascender * size / 1000;
    }
  }, {
    key: 'descent',
    value: function descent(size) {
      return this._data.descender * size / 1000;
    }
  }, {
    key: 'underlinePosition',
    value: function underlinePosition(size) {
      return this._data.underlinePosition * size / 1000;
    }
  }, {
    key: 'underlineThickness',
    value: function underlineThickness(size) {
      return this._data.underlineThickness * size / 1000;
    }
  }, {
    key: 'write',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(doc, fontObj) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                fontObj.prop('Subtype', 'Type1');
                fontObj.prop('BaseFont', this._data.fontName);
                fontObj.prop('Encoding', 'WinAnsiEncoding');

                _context.next = 5;
                return doc._writeObject(fontObj);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function write(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return write;
    }()
  }]);

  return AFMFont;
}(Base);

// only the once different from ISO-8859-1 are relevant, see
// https://en.wikipedia.org/wiki/Windows-1252
var UNICODE_TO_WIN1252 = {
  '\u20AC': 128,
  '\u201A': 130,
  '\u0192': 131,
  '\u201E': 132,
  '\u2026': 133,
  '\u2020': 134,
  '\u2021': 135,
  '\u02C6': 136,
  '\u2030': 137,
  '\u0160': 138,
  '\u2039': 139,
  '\u0152': 140,
  '\u017D': 142,
  '\u2018': 145,
  '\u2019': 146,
  '\u201C': 147,
  '\u201D': 148,
  '\u2022': 149,
  '\u2013': 150,
  '\u2014': 151,
  '\u02DC': 152,
  '\u2122': 153,
  '\u0161': 154,
  '\u203A': 155,
  '\u0153': 156,
  '\u017E': 158,
  '\u0178': 159
};