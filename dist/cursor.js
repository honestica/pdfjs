'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cursor = function () {
  function Cursor(width, height, x, y) {
    _classCallCheck(this, Cursor);

    this.width = width;
    this.height = height;
    if (x !== undefined) {
      this.startX = this.x = x;
    }
    if (y !== undefined) {
      this.startY = this.y = y;
      this._bottom = this.y - this.height;
    }
    this.bottomOffset = 0;
  }

  /// public API

  _createClass(Cursor, [{
    key: 'reset',
    value: function reset() {
      this.x = this.startX;
      this.y = this.startY;
    }
  }, {
    key: 'doesFit',
    value: function doesFit(height) {
      return this.y - height > this.bottom;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new ClonedCursor(this);
    }
  }, {
    key: 'bottom',
    get: function get() {
      return this._bottom + this.bottomOffset;
    }
  }]);

  return Cursor;
}();

// A ClonedCursor has its own `width`, `height`, `bottom`, `startX` and `startY`, but shares
// `x` and `y` with all other Cursors and ClonedCursors.


var ClonedCursor = function (_Cursor) {
  _inherits(ClonedCursor, _Cursor);

  function ClonedCursor(cursor) {
    _classCallCheck(this, ClonedCursor);

    var _this = _possibleConstructorReturn(this, (ClonedCursor.__proto__ || Object.getPrototypeOf(ClonedCursor)).call(this, cursor.width, cursor.height));

    _this.startX = cursor.startX;
    _this.startY = cursor.startY;
    _this.bottomOffset = 0;
    _this._root = cursor._root || cursor;
    return _this;
  }

  /// public API

  _createClass(ClonedCursor, [{
    key: 'bottom',
    get: function get() {
      return this._root.bottom + this.bottomOffset;
    }
  }, {
    key: 'x',
    get: function get() {
      return this._root.x;
    },
    set: function set(val) {
      if (val < 0) {
        console.warn('set cursor.x to negative value');
      }
      this._root.x = val;
    }
  }, {
    key: 'y',
    get: function get() {
      return this._root.y;
    },
    set: function set(val) {
      if (val < 0) {
        console.warn('set cursor.y to negative value');
      }
      this._root.y = val;
    }
  }]);

  return ClonedCursor;
}(Cursor);

module.exports = Cursor;