'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Font = function () {
  function Font() {
    _classCallCheck(this, Font);
  }

  _createClass(Font, null, [{
    key: 'isFont',
    value: function isFont(font) {
      return font && font instanceof Font;
    }
  }]);

  return Font;
}();

var StringWidth = function () {
  function StringWidth(width, kerning) {
    _classCallCheck(this, StringWidth);

    this.width = width;
    this.kerning = kerning;
  }

  _createClass(StringWidth, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.width;
    }
  }]);

  return StringWidth;
}();

Font.StringWidth = StringWidth;
module.exports = Font;