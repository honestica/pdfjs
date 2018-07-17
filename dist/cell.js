'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Fragment = require('./fragment');
var util = require('./util');
var ops = require('./ops');

module.exports = function (_Fragment) {
  _inherits(Cell, _Fragment);

  function Cell(doc, parent, opts) {
    _classCallCheck(this, Cell);

    var _this = _possibleConstructorReturn(this, (Cell.__proto__ || Object.getPrototypeOf(Cell)).call(this, doc, parent));

    _this._pending = [];
    _this._firstPage = true;
    _this._firstRendered = false;
    _this._drawBorders = true;

    // create new cursor for cell context
    // const previousCursor = this._cursor
    _this._cursor = _this._cursor.clone();

    applyOpts.call(_this, opts);

    _this._previousStartX = _this._cursor.startX;
    if (_this.x) {
      _this._cursor.startX = _this.x;
    }

    // adjust cursor according to cell padding
    _this._cursor.startX += _this.paddingLeft;
    _this._cursor.width -= _this.paddingLeft + _this.paddingRight;
    _this._cursor.bottomOffset = _this.paddingBottom - _this.borderBottomWidth;

    _this._startRendering = null;
    return _this;
  }

  /// private API

  _createClass(Cell, [{
    key: '_pageBreak',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(level) {
        var _this2 = this;

        var renderHeight, actualHeight, contents, offset, idx, take;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                renderHeight = this._startY - this._cursor.bottom;
                actualHeight = this._startY - this._cursor.y;
                contents = void 0, offset = void 0;

                if (!(this._firstPage && renderHeight / this._doc.height <= .15)) {
                  _context2.next = 10;
                  break;
                }

                // move already rendered cell content to the next page if the current cell height does only
                // make up about 10% of the total page height
                idx = this._doc._contents.indexOf(this._bgLayerRef);
                take = this._endLayerRef ? this._doc._contents.indexOf(this._endLayerRef) - idx + 1 : this._doc._contents.length - idx;

                contents = this._doc._contents.splice(idx, take);
                offset = actualHeight - this.paddingTop + this.borderTopWidth;
                _context2.next = 14;
                break;

              case 10:
                // on page breaks, always draw background until the current bottom
                this._cursor.y = this._cursor.bottom - this.paddingBottom;

                // create background on each page break
                _context2.next = 13;
                return this._createBackground(!this._firstRendered, false);

              case 13:
                this._firstRendered = true;

              case 14:

                this._firstPage = false;

                if (!this._parent) {
                  _context2.next = 18;
                  break;
                }

                _context2.next = 18;
                return this._parent._pageBreak(level + 1, contents === undefined);

              case 18:

                // By pushing the following at the beginning of the cell's pending queue instead of executing
                // it directly, we ensure that is executed just before the cell's content continues rendering
                // on the next page - especially when cells are appended horizontally into rows.
                this._pending.unshift(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          // reset some cursor values
                          _this2._cursor.x = _this2._cursor.startX;
                          _this2._cursor.cursorOffset = 0;

                          if (!contents) {
                            _context.next = 13;
                            break;
                          }

                          _context.next = 5;
                          return _this2._doc._startContentObject();

                        case 5:
                          _context.next = 7;
                          return _this2._doc._write(ops.q() + ops.cm(1, 0, 0, 1, 0, _this2._cursor.y - _this2._startY));

                        case 7:
                          _this2._doc._contents.push.apply(_this2._doc._contents, contents);

                          _context.next = 10;
                          return _this2._doc._startContentObject();

                        case 10:
                          _context.next = 12;
                          return _this2._doc._write(ops.Q());

                        case 12:

                          _this2._bgLayerRef = null;

                        case 13:

                          _this2._startY = _this2._cursor.y;

                          if (offset > 0) {
                            _this2._cursor.y -= offset;
                          }

                          // apply padding after page break (but only to most inner cell)
                          if (level === 1) {
                            _this2._cursor.y -= _this2.paddingTop - _this2.borderTopWidth;
                            _this2._cursor.bottomOffset = _this2.paddingBottom - _this2.borderBottomWidth;
                          }

                          // TODO: is there a better way of achieving this?
                          if (_this2._pending.length === 0) {
                            _this2._cursor.y = _this2._startY;
                          }

                        case 17:
                        case 'end':
                          return _context.stop();
                      }
                    }
                  }, _callee, _this2);
                })));

              case 19:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _pageBreak(_x) {
        return _ref.apply(this, arguments);
      }

      return _pageBreak;
    }()
  }, {
    key: '_createBackground',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(hasTopBorder, hasBottomBorder) {
        var hasBorder, layer, bgLayerIndex, height, bottom, chunk, borderColor, borderWidth, x, y1, y2, _x4, _y, _y2, x1, x2, y, _x5, _x6, _y3;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // if there is no backgroundColor, it is not necessary to create the background layer
                hasBorder = this._drawBorders && (this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0);

                if (!(!this.backgroundColor && !hasBorder)) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt('return');

              case 3:
                _context3.next = 5;
                return this._doc._startContentObject(null, true);

              case 5:

                // put the background layer behind the cell
                layer = this._doc._contents.pop();
                bgLayerIndex = this._bgLayerRef ? this._doc._contents.indexOf(this._bgLayerRef) : 0;

                this._doc._contents.splice(bgLayerIndex, 0, layer);

                // calculate background height
                height = this._startY - this._cursor.y;
                bottom = this._cursor.bottom - this.paddingBottom + this.borderBottomWidth;

                if (this._startY - height < bottom) {
                  // if background height goes beyond bottom of document, trim it to the bottom
                  height = this._startY - bottom;
                }

                chunk = ops.q(); // save graphics state

                if (this.backgroundColor) {
                  // write background
                  chunk += ops.sc(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2]) // non-stroking color
                  + ops.re(this._cursor.startX - this.paddingLeft, this._startY - height, this.outerWidth, height) // rectangle
                  + ops.f(); // fill path
                }

                if (this._drawBorders) {
                  borderColor = null;
                  borderWidth = null;

                  // draw left border

                  if (this.borderLeftWidth > 0) {
                    if (!borderColor || !util.rgbEqual(borderColor, this.borderLeftColor)) {
                      chunk += ops.SC(this.borderLeftColor[0], this.borderLeftColor[1], this.borderLeftColor[2]); // stroking color
                      borderColor = this.borderLeftColor;
                    }

                    if (borderWidth !== this.borderLeftWidth) {
                      chunk += ops.w(this.borderLeftWidth); // line width
                      borderWidth = this.borderLeftWidth;
                    }

                    x = this._cursor.startX - this.paddingLeft + this.borderLeftWidth / 2;
                    y1 = this._startY;
                    y2 = this._startY - height;


                    chunk += ops.S(x, y1, 'm', x, y2, 'l'); // fill path
                  }

                  // draw right border
                  if (this.borderRightWidth > 0) {
                    if (!borderColor || !util.rgbEqual(borderColor, this.borderRightColor)) {
                      chunk += ops.SC(this.borderRightColor[0], this.borderRightColor[1], this.borderRightColor[2]); // stroking color
                      borderColor = this.borderRightColor;
                    }

                    if (borderWidth !== this.borderRightWidth) {
                      chunk += ops.w(this.borderRightWidth); // line width
                      borderWidth = this.borderRightWidth;
                    }

                    _x4 = this._cursor.startX - this.paddingLeft + this.outerWidth - this.borderRightWidth / 2;
                    _y = this._startY;
                    _y2 = this._startY - height;


                    chunk += ops.S(_x4, _y, 'm', _x4, _y2, 'l'); // fill path
                  }

                  // draw top border
                  if (hasTopBorder && this.borderTopWidth > 0) {
                    if (!borderColor || !util.rgbEqual(borderColor, this.borderTopColor)) {
                      chunk += ops.SC(this.borderTopColor[0], this.borderTopColor[1], this.borderTopColor[2]); // stroking color
                      borderColor = this.borderTopColor;
                    }

                    if (borderWidth !== this.borderTopWidth) {
                      chunk += ops.w(this.borderTopWidth); // line width
                      borderWidth = this.borderTopWidth;
                    }

                    x1 = this._cursor.startX - this.paddingLeft;
                    x2 = x1 + this.outerWidth;
                    y = this._startY - this.borderTopWidth / 2;


                    chunk += ops.S(x1, y, 'm', x2, y, 'l'); // fill path
                  }

                  // draw bottom border
                  if (hasBottomBorder && this.borderBottomWidth > 0) {
                    if (!borderColor || !util.rgbEqual(borderColor, this.borderBottomColor)) {
                      chunk += ops.SC(this.borderBottomColor[0], this.borderBottomColor[1], this.borderBottomColor[2]); // stroking color
                      borderColor = this.borderBottomColor;
                    }

                    if (borderWidth !== this.borderBottomWidth) {
                      chunk += ops.w(this.borderBottomWidth); // line width
                      borderWidth = this.borderBottomWidth;
                    }

                    _x5 = this._cursor.startX - this.paddingLeft;
                    _x6 = _x5 + this.outerWidth;
                    _y3 = this._startY - height + this.borderBottomWidth / 2;


                    chunk += ops.S(_x5, _y3, 'm', _x6, _y3, 'l'); // fill path
                  }
                }

                if (!(chunk.length > 0)) {
                  _context3.next = 18;
                  break;
                }

                chunk += ops.Q(); // restore graphics state
                _context3.next = 18;
                return this._doc._write(chunk);

              case 18:

                // for succeeding pages put background layers at index 0 (for bgLayerRef === null, index 0
                // will be used)
                this._bgLayerRef = null;

                // update startAt to take page break into account
                this._startY = this._cursor.startY;

              case 20:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _createBackground(_x2, _x3) {
        return _ref3.apply(this, arguments);
      }

      return _createBackground;
    }()
  }, {
    key: '_start',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this._doc._currentContent) {
                  _context4.next = 3;
                  break;
                }

                _context4.next = 3;
                return this._doc._startPage();

              case 3:

                if (this.y !== undefined) {
                  this._cursor.y = this.y;
                }

                this._startY = this._cursor.y;

                this._cursor.x = this._cursor.startX;
                this._cursor.y -= this.paddingTop;

                this.outerWidth = this._cursor.width + this.paddingLeft + this.paddingRight;

                // start a new content layer for cells
                // save the current layer ref, this will be used to place the background and border layer
                // after the cell has been rendered
                // Note: saving the index directly would  not work for nested rendering tasks
                _context4.next = 10;
                return this._doc._startContentObject(null, true);

              case 10:
                this._bgLayerRef = _context4.sent;

                if (this._ended) {
                  _context4.next = 14;
                  break;
                }

                _context4.next = 14;
                return new Promise(function (resolve) {
                  _this3._startRendering = resolve;
                });

              case 14:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _start() {
        return _ref4.apply(this, arguments);
      }

      return _start;
    }()
  }, {
    key: '_end',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                // apply bottom padding
                this._cursor.y -= this.paddingBottom;

                // create final createBackground
                _context5.next = 3;
                return this._createBackground(!this._firstRendered, true);

              case 3:

                // restore cursor
                this._cursor.x = this._previousStartX;

              case 4:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _end() {
        return _ref5.apply(this, arguments);
      }

      return _end;
    }()
  }, {
    key: 'end',
    value: function end() {
      if (this._startRendering) {
        this._startRendering();
      }
      return Fragment.prototype.end.call(this);
    }
  }]);

  return Cell;
}(Fragment);

function applyOpts(opts) {
  this.opts = opts;

  if ('width' in opts) {
    this._cursor.width = opts.width;
  }

  if ('x' in opts) {
    this.x = opts.x;
  }

  if ('y' in opts) {
    this.y = opts.y;
  }

  this.paddingTop = opts.paddingTop || opts.padding || 0;
  this.paddingRight = opts.paddingRight || opts.padding || 0;
  this.paddingBottom = opts.paddingBottom || opts.padding || 0;
  this.paddingLeft = opts.paddingLeft || opts.padding || 0;

  // background creation callback
  this.backgroundColor = util.colorToRgb(opts.backgroundColor);

  this.borderTopWidth = opts.borderTopWidth || opts.borderWidth || 0;
  this.borderTopColor = util.colorToRgb(opts.borderTopColor || opts.borderColor || 0x000000);

  this.borderRightWidth = opts.borderRightWidth || opts.borderWidth || 0;
  this.borderRightColor = util.colorToRgb(opts.borderRightColor || opts.borderColor || 0x000000);

  this.borderBottomWidth = opts.borderBottomWidth || opts.borderWidth || 0;
  this.borderBottomColor = util.colorToRgb(opts.borderBottomColor || opts.borderColor || 0x000000);

  this.borderLeftWidth = opts.borderLeftWidth || opts.borderWidth || 0;
  this.borderLeftColor = util.colorToRgb(opts.borderLeftColor || opts.borderColor || 0x000000);

  this.paddingTop += this.borderTopWidth;
  this.paddingRight += this.borderRightWidth;
  this.paddingBottom += this.borderBottomWidth;
  this.paddingLeft += this.borderLeftWidth;
}