'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Fragment = require('./fragment');
var util = require('./util');
var ops = require('./ops');
var PDF = require('./object');

module.exports = function () {
  function Table(doc, parent, opts) {
    _classCallCheck(this, Table);

    Fragment.prototype._init.call(this, doc, parent);

    this._cursor = this._cursor.clone();
    if ('width' in opts) {
      this._cursor.width = opts.width;
    }

    this._rowCount = 0;
    this.widths = [];

    applyOpts.call(this, opts);

    if (this.borderVerticalWidths) {
      this._cursor.width -= this.borderVerticalWidths[0] / 2;
      this._cursor.startX += this.borderVerticalWidths[0] / 2;
      this._cursor.width -= this.borderVerticalWidths[this.borderVerticalWidths.length - 1] / 2;
    }

    // distribute remaining width among *-columns
    var remainingWidth = this._cursor.width;
    var distribute = [];

    for (var i in this.widths) {
      var w = this.widths[i];
      if (!w || w === '*') {
        distribute.push(i);
      } else {
        remainingWidth -= w;
      }
    }

    if (distribute.length > 0) {
      var _w = remainingWidth / distribute.length;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = distribute[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _i = _step.value;

          this.widths[_i] = _w;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    this._header = null;
  }

  /// private API

  _createClass(Table, [{
    key: '_pageBreak',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(level, insideBreak) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return Fragment.prototype._pageBreak.call(this, level);

              case 2:
                if (insideBreak) {
                  _context.next = 5;
                  break;
                }

                _context.next = 5;
                return this._renderHeader(true);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _pageBreak(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return _pageBreak;
    }()
  }, {
    key: '_end',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return Fragment.prototype._end.call(this);

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _end() {
        return _ref2.apply(this, arguments);
      }

      return _end;
    }()
  }, {
    key: '_begin',
    value: function _begin(ctx) {
      Fragment.prototype._begin.call(this, ctx);
    }
  }, {
    key: '_renderHeader',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(isPageBreak) {
        var chunk, offset, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, obj, alias;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this._header) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt('return');

              case 2:
                if (this._doc._currentContent) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 5;
                return this._doc._startPage();

              case 5:
                chunk = '';
                offset = this._cursor.y - this._header.startedAtY;


                if (isPageBreak && offset !== 0) {
                  // offset header to the top
                  chunk += ops.q() + ops.cm(1, 0, 0, 1, 0, offset);
                }

                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context3.prev = 11;
                for (_iterator2 = this._header._objects[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  obj = _step2.value;
                  alias = new PDF.Name('TH' + obj.id);

                  this._doc._currentContent._xobjects[alias] = obj.toReference();
                  chunk += ops.Do(alias);
                }

                _context3.next = 19;
                break;

              case 15:
                _context3.prev = 15;
                _context3.t0 = _context3['catch'](11);
                _didIteratorError2 = true;
                _iteratorError2 = _context3.t0;

              case 19:
                _context3.prev = 19;
                _context3.prev = 20;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 22:
                _context3.prev = 22;

                if (!_didIteratorError2) {
                  _context3.next = 25;
                  break;
                }

                throw _iteratorError2;

              case 25:
                return _context3.finish(22);

              case 26:
                return _context3.finish(19);

              case 27:
                this._cursor.y -= this._header.height;

                if (isPageBreak && offset !== 0) {
                  chunk += ops.Q();
                }

                _context3.next = 31;
                return this._doc._write(chunk);

              case 31:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[11, 15, 19, 27], [20,, 22, 26]]);
      }));

      function _renderHeader(_x3) {
        return _ref3.apply(this, arguments);
      }

      return _renderHeader;
    }()
  }, {
    key: '_row',
    value: function _row(opts, isHeader) {
      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }

      opts = Object.assign({
        font: this._doc.defaultFont,
        fontSize: this._doc.defaultFontSize,
        color: this._doc.defaultColor,
        lineHeight: this._doc.defaultLineHeight
      }, this.opts, opts);

      // whitelist
      opts = {
        padding: opts.padding,
        paddingLeft: opts.paddingLeft,
        paddingRight: opts.paddingRight,
        paddingTop: opts.paddingTop,
        paddingBottom: opts.paddingBottom,
        backgroundColor: opts.backgroundColor,
        font: opts.font,
        fontSize: opts.fontSize,
        color: opts.color,
        lineHeight: opts.lineHeight
      };

      var Row = isHeader ? require('./tableheader') : require('./row');
      var ctx = new Row(this._doc, this, opts);
      this._begin(ctx);

      ctx._widths = this.widths.slice();
      ctx._borderVerticalWidths = this.borderVerticalWidths && this.borderVerticalWidths.slice();
      ctx._borderVerticalColors = this.borderVerticalColors && this.borderVerticalColors.slice();

      if (this.borderHorizontalWidths) {
        ctx._topBorderWidth = this.borderHorizontalWidths(this._rowCount);
        ctx._topBorderColor = util.colorToRgb(this.borderHorizontalColors(this._rowCount));

        if (!isHeader) {
          ctx._bottomBorderWidth = this.borderHorizontalWidths(this._rowCount + 1);
          ctx._bottomBorderColor = util.colorToRgb(this.borderHorizontalColors(this._rowCount + 1));
        }

        ctx._hasTopBorder = this._rowCount === (this._header ? 1 : 0);
      }

      ctx._pending.push(function () {
        return ctx._start();
      });
      this._pending.push(ctx._pending);

      this._rowCount++;

      return ctx;
    }

    /// public API

  }, {
    key: 'end',
    value: function end() {
      return Fragment.prototype.end.call(this);
    }
  }, {
    key: 'row',
    value: function row(opts) {
      return this._row(opts, false);
    }
  }, {
    key: 'header',
    value: function header(opts) {
      var _this = this;

      var ctx = this._row(opts, true);
      this._header = ctx;
      this._pending.push(function () {
        return _this._renderHeader();
      });
      return ctx;
    }
  }]);

  return Table;
}();

function applyOpts(opts) {
  this.opts = opts;

  // opts.width
  if ('widths' in opts && Array.isArray(opts.widths)) {
    this.widths = opts.widths;
  } else {
    throw new TypeError('widths (array) option is required for tables');
  }

  // opts.borderVerticalWidths
  this.borderVerticalWidths = null;
  if (opts.borderVerticalWidths) {
    if (!Array.isArray(opts.borderVerticalWidths)) {
      throw new TypeError('borderVerticalWidths must be an array');
    }

    if (opts.borderVerticalWidths.length !== this.widths.length + 1) {
      throw new TypeError('wrong borderVerticalWidths length (expected ' + (this.widths.length + 1) + '; got ' + opts.borderVerticalWidths.length + ')');
    }

    this.borderVerticalWidths = opts.borderVerticalWidths;
  }
  // opts.borderVerticalWidth
  else if (typeof opts.borderVerticalWidth === 'number') {
      this.borderVerticalWidths = [];
      for (var i = 0; i <= this.widths.length; ++i) {
        this.borderVerticalWidths.push(opts.borderVerticalWidth);
      }
    }

  // opts.borderVerticalColors
  this.borderVerticalColors = null;
  if (opts.borderVerticalColors) {
    if (!Array.isArray(opts.borderVerticalColors)) {
      throw new TypeError('borderVerticalColors must be an array');
    }

    if (opts.borderVerticalColors.length !== this.widths.length + 1) {
      throw new TypeError('wrong borderVerticalColors length (expected ' + (this.widths.length + 1) + '; got ' + opts.borderVerticalColors.length + ')');
    }

    this.borderVerticalColors = opts.borderVerticalColors.map(function (c) {
      return util.colorToRgb(c);
    });
  }
  // opts.borderVerticalColor
  else if (typeof opts.borderVerticalColor === 'number') {
      this.borderVerticalColors = [];
      var color = util.colorToRgb(opts.borderVerticalColor);
      for (var _i2 = 0; _i2 <= this.widths.length; ++_i2) {
        this.borderVerticalColors.push(color);
      }
    }

  // opts.borderHorizontalWidths
  this.borderHorizontalWidths = null;
  if (opts.borderHorizontalWidths) {
    if (typeof opts.borderHorizontalWidths !== 'function') {
      throw new TypeError('borderHorizontalWidths must be a function');
    }

    this.borderHorizontalWidths = opts.borderHorizontalWidths;
  }
  // opts.borderHorizontalWidth
  else if (typeof opts.borderHorizontalWidth === 'number') {
      this.borderHorizontalWidths = function () {
        return opts.borderHorizontalWidth;
      };
    }

  // opts.borderHorizontalColors
  this.borderHorizontalColors = null;
  if (opts.borderHorizontalColors) {
    if (typeof opts.borderHorizontalColors !== 'function') {
      throw new TypeError('borderHorizontalColors must be a function');
    }

    this.borderHorizontalColors = opts.borderHorizontalColors;
  }
  // opts.borderHorizontalColor
  else if (typeof opts.borderHorizontalColor === 'number') {
      this.borderHorizontalColors = function () {
        return opts.borderHorizontalColor;
      };
    }

  // opts.borderWidth
  var borderWidth = opts.borderWidth || 0;
  if (borderWidth > 0) {
    if (!this.borderVerticalWidths) {
      this.borderVerticalWidths = [];
      for (var _i3 = 0; _i3 <= this.widths.length; ++_i3) {
        this.borderVerticalWidths.push(borderWidth);
      }
    }

    if (!this.borderHorizontalWidths) {
      this.borderHorizontalWidths = function () {
        return borderWidth;
      };
    }
  }

  // opts.borderColor
  var borderColor = opts.borderColor || 0x000000;
  if (!this.borderVerticalColors) {
    this.borderVerticalColors = [];
    for (var _i4 = 0; _i4 <= this.widths.length; ++_i4) {
      this.borderVerticalColors.push(util.colorToRgb(borderColor));
    }
  }

  if (!this.borderHorizontalColors) {
    this.borderHorizontalColors = function () {
      return borderColor;
    };
  }
}