'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var opentype = require('opentype.js');

module.exports = function () {
  function FontSubset(font) {
    _classCallCheck(this, FontSubset);

    this.font = font;
    this.name = 'PDFJS+' + this.font.names.fontFamily.en;

    this.glyphs = {
      '0': this.font.charToGlyph(String.fromCharCode(0)), // notDef glyph
      '32': this.font.charToGlyph(String.fromCharCode(32)) // space
    };
    this.subset = { '0': 0, '32': 32 };
    this.mapping = { '0': 0, '32': 32 };
    this.pos = 33;
  }

  _createClass(FontSubset, [{
    key: 'use',
    value: function use(chars) {
      for (var i = 0, len = chars.length; i < len; ++i) {
        var code = chars.charCodeAt(i);
        if (code in this.mapping || code < 33) {
          continue;
        }

        var glyph = this.font.charToGlyph(chars[i]);

        this.subset[this.pos] = code;
        this.mapping[code] = this.pos;
        this.glyphs[this.pos] = glyph;

        this.pos++;
      }
    }
  }, {
    key: 'encode',
    value: function encode(str) {
      var codes = [];
      for (var i = 0, len = str.length; i < len; ++i) {
        codes.push(this.mapping[str.charCodeAt(i)]);
      }
      return String.fromCharCode.apply(String, codes);
    }
  }, {
    key: 'cmap',
    value: function cmap() {
      return this.subset;
    }
  }, {
    key: 'save',
    value: function save() {
      var glyphs = [];
      for (var pos in this.glyphs) {
        glyphs.push(this.glyphs[pos]);
      }
      var font = new opentype.Font({
        familyName: this.name,
        styleName: this.font.names.fontSubfamily.en,
        unitsPerEm: this.font.unitsPerEm,
        ascender: this.font.ascender,
        descender: this.font.descender,
        glyphs: glyphs
      });
      return font.toArrayBuffer();
    }
  }]);

  return FontSubset;
}();