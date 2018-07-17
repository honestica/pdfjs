'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var endCell = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(row) {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            // apply bottom padding
            this._cursor.y -= this.paddingBottom;

            // decrease the counter of active cells
            row._columns--;

            // reset the parent property, to prevent endless recursion when the pageBreak handler of the
            // cell is called later on
            this._parent = null;

            // keep track of the ended cell
            row._endedCells.push(this);

            // if, last row has been ended, trigger page break manually to continue with other cells on
            // the next page

            if (!(row._columns > 0 && row._rotated === row._columns)) {
              _context5.next = 7;
              break;
            }

            _context5.next = 7;
            return row._pageBreak(2, row._insideBreak);

          case 7:

            // keep track of the ending y which is nearest to the page end
            if (row._endY === null || this._cursor.y < row._endY) {
              row._endY = this._cursor.y;
            }

            this._endLayerRef = this._doc._currentContent;

            // move to the next cell
            row._nextColumn();

          case 10:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function endCell(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Fragment = require('./fragment');
var util = require('./util');
var ops = require('./ops');
var Cell = require('./cell');

module.exports = function () {
  function Row(doc, parent, opts) {
    _classCallCheck(this, Row);

    Fragment.prototype._init.call(this, doc, parent);

    this.opts = opts;

    // use an own queue for pending operations
    this._pending = [];

    // keep track of the cells that have already been ended;
    // this is necessary to be able to still draw their background and finalize their rendering
    // once all cells are ended (scenario where not all cells span the same amount of pages)
    this._endedCells = [];

    // keep a count of not ended cells to adjust the rotation of cells on page breaks properly
    this._columns = 0;

    // when a page break occures inside a cell, the cells are rotated before an actual page
    // break is rendered; i.e., all cells of the row are rendered horizontally
    this._rotated = 0;

    // this is used to keep track of the starting y of the row to reset the cursor's y to
    // this value for each cell (since they are horizontally aligned)
    this._y = 0;

    // on each page the row is rendered on, the row keeps track of the maximal y (or minimum
    // in terms of PDF, because y 0 is on the bottom) a cell is rendered to to be able to align
    // the backgrounds of all cells
    this._endY = null;

    this._widths = [];
    this._topBorderWidth = 0;
    this._topBorderColor = 0x000000;
    this._bottomBorderWidth = 0;
    this._bottomBorderColor = 0x000000;
    this._borderVerticalWidths = [];
    this._borderVerticalColors = [];
    this._hasTopBorder = false;

    this._insideBreak = false;

    this._startRendering = null;
  }

  /// private API

  _createClass(Row, [{
    key: '_pageBreak',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(level, insideBreak) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, cell;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this._insideBreak = insideBreak;

                // the pending queue looks as follows: [ [cell1], [cell2], ..., [celln], endRow]
                // the currently rendered cell is at the head of the queue and therefore removed and
                // re-inserted at the second last position
                this._pending.splice(this._pending.length - 2, 0, this._pending.shift());

                // test whether we have rotated all cells of the row

                if (!(this._rotated < this._columns - 1)) {
                  _context.next = 7;
                  break;
                }

                this._rotated++;

                // move to the next cell
                this._nextColumn();
                _context.next = 42;
                break;

              case 7:
                // execute the pageBreak (rendering background, trigger retrospective page breaks, ...) of all
                // already ended cells manually
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 10;
                _iterator = this._endedCells[Symbol.iterator]();

              case 12:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 21;
                  break;
                }

                cell = _step.value;

                this._cursor.y = cell._cursor.bottom;
                _context.next = 17;
                return cell._pageBreak(level - 1);

              case 17:

                // pageBreak may add new callbacks to the cell's pending queue, which is however not anymore
                // contained in the document's queue, therefor add these callbacks to the row's queue
                while (cell._pending.length) {
                  this._pending.unshift(cell._pending.shift());
                }

              case 18:
                _iteratorNormalCompletion = true;
                _context.next = 12;
                break;

              case 21:
                _context.next = 27;
                break;

              case 23:
                _context.prev = 23;
                _context.t0 = _context['catch'](10);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 27:
                _context.prev = 27;
                _context.prev = 28;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 30:
                _context.prev = 30;

                if (!_didIteratorError) {
                  _context.next = 33;
                  break;
                }

                throw _iteratorError;

              case 33:
                return _context.finish(30);

              case 34:
                return _context.finish(27);

              case 35:
                _context.next = 37;
                return this._drawBorders(true, insideBreak);

              case 37:

                // reset the rotation
                this._rotated = 0;

                // execute an actual page break
                _context.next = 40;
                return this._parent._pageBreak(level + 1, insideBreak);

              case 40:

                // store starting y to be able to align all cells horizontally
                this._y = this._cursor.y;

                this._endY = null;

              case 42:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[10, 23, 27, 35], [28,, 30, 34]]);
      }));

      function _pageBreak(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return _pageBreak;
    }()
  }, {
    key: '_nextColumn',
    value: function _nextColumn() {
      // reset the current y back to the row start to align all cells horizontally
      this._cursor.y = this._y;
    }
  }, {
    key: '_start',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // save start y of the row to be able to align all cells horizontally
                this._y = this._cursor.y;

                // block execution until the row knows about all its cells, otherwise it is possible that the
                // rendering scheduler (_pending) removes this._pending before the cell's end got called

                if (this._ended) {
                  _context2.next = 4;
                  break;
                }

                _context2.next = 4;
                return new Promise(function (resolve) {
                  _this._startRendering = resolve;
                });

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _start() {
        return _ref2.apply(this, arguments);
      }

      return _start;
    }()
  }, {
    key: '_end',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, cell;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // the actual end logic of cells has been postponed until here where it is called manually
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context3.prev = 3;
                _iterator2 = this._endedCells[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context3.next = 13;
                  break;
                }

                cell = _step2.value;

                this._cursor.y = this._endY + cell.paddingBottom;
                _context3.next = 10;
                return Cell.prototype._end.call(cell);

              case 10:
                _iteratorNormalCompletion2 = true;
                _context3.next = 5;
                break;

              case 13:
                _context3.next = 19;
                break;

              case 15:
                _context3.prev = 15;
                _context3.t0 = _context3['catch'](3);
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
                _context3.next = 29;
                return this._drawBorders(false);

              case 29:

                // reset cursor
                this._cursor.x = this._cursor.startX;
                this._cursor.y = this._endY;

              case 31:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[3, 15, 19, 27], [20,, 22, 26]]);
      }));

      function _end() {
        return _ref3.apply(this, arguments);
      }

      return _end;
    }()
  }, {
    key: '_begin',
    value: function _begin(ctx) {
      Fragment.prototype._begin.call(this, ctx);
    }
  }, {
    key: '_drawBorders',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(isPageBreak, isInsideBreak) {
        var hasBorder, chunk, y1, y2, left, borderWidth, borderColor, i, len, bw, bc, x, totalWidth, x1, x2, y, _y;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(isPageBreak && !isInsideBreak)) {
                  _context4.next = 3;
                  break;
                }

                this._hasTopBorder = true;
                return _context4.abrupt('return');

              case 3:

                // draw border
                hasBorder = false;
                chunk = ops.q(); // save graphics state

                y1 = this._y;
                y2 = isPageBreak ? this._cursor.bottom : this._endY;
                left = this._cursor.startX;
                borderWidth = 0;
                borderColor = null;


                if (this._borderVerticalWidths) {
                  for (i = 0, len = this._borderVerticalWidths.length; i < len; ++i) {
                    // line width
                    bw = this._borderVerticalWidths[i];

                    if (bw > 0) {
                      if (borderWidth !== bw) {
                        chunk += ops.w(bw);
                        borderWidth = bw;
                      }

                      // stroking color
                      bc = this._borderVerticalColors[i];

                      if (!borderColor || !util.rgbEqual(borderColor, bc)) {
                        chunk += ops.SC(bc[0], bc[1], bc[2]);
                        borderColor = bc;
                      }

                      // fill path
                      x = left;

                      if (i === 0) {
                        x += bw / 2;
                      } else if (i === len - 1) {
                        x -= bw / 2;
                      }

                      chunk += ops.S(x, y1, 'm', x, y2, 'l');
                    }

                    left += this._widths[i];
                  }

                  hasBorder = true;
                }

                totalWidth = this._widths.reduce(function (lhs, rhs) {
                  return lhs + rhs;
                }, 0);
                x1 = this._cursor.startX;
                x2 = x1 + totalWidth;


                if (this._hasTopBorder && this._topBorderWidth > 0) {
                  this._hasTopBorder = false;

                  // line width
                  if (borderWidth !== this._topBorderWidth) {
                    chunk += ops.w(this._topBorderWidth);
                    borderWidth = this._topBorderWidth;
                  }

                  // stroking color
                  if (!borderColor || !util.rgbEqual(borderColor, this._topBorderColor)) {
                    chunk += ops.SC(this._topBorderColor[0], this._topBorderColor[1], this._topBorderColor[2]);
                    borderColor = this._topBorderColor;
                  }

                  // fill path
                  y = y1 - this._topBorderWidth / 2;

                  chunk += ops.S(x1, y, 'm', x2, y, 'l');

                  hasBorder = true;
                }

                if (!isPageBreak && this._bottomBorderWidth > 0) {
                  // line width
                  if (borderWidth !== this._bottomBorderWidth) {
                    chunk += ops.w(this._bottomBorderWidth);
                    borderWidth = this._bottomBorderWidth;
                  }

                  // stroking color
                  if (!borderColor || !util.rgbEqual(borderColor, this._bottomBorderColor)) {
                    chunk += ops.SC(this._bottomBorderColor[0], this._bottomBorderColor[1], this._bottomBorderColor[2]);
                    borderColor = this._bottomBorderColor;
                  }

                  // fill path
                  _y = y2 + this._bottomBorderWidth / 2;

                  chunk += ops.S(x1, _y, 'm', x2, _y, 'l');

                  hasBorder = true;
                }

                if (!hasBorder) {
                  _context4.next = 22;
                  break;
                }

                chunk += ops.Q(); // restore graphics state

                _context4.next = 20;
                return this._doc._startContentObject(null, true);

              case 20:
                _context4.next = 22;
                return this._doc._write(chunk);

              case 22:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _drawBorders(_x3, _x4) {
        return _ref4.apply(this, arguments);
      }

      return _drawBorders;
    }()

    /// public API

  }, {
    key: 'end',
    value: function end() {
      if (this._columns !== this._widths.length) {
        throw new Error('Cannot end row. Row has ' + (this._widths.length - this._columns) + ' columns (cells) missing');
      }

      if (this._startRendering) {
        this._startRendering();
      }
      return Fragment.prototype.end.call(this);
    }
  }, {
    key: 'cell',
    value: function cell(text, opts) {
      // normalize arguments
      if (text !== null && (typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object') {
        opts = text;
        text = undefined;
      }
      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }

      opts = Object.assign({}, this.opts, opts);

      // create cell and set cell's width according to row options
      var column = this._columns++;
      if (!(column in this._widths)) {
        throw new Error('row columns already exceeded, cannot create another cell');
      }

      if (opts.colspan > 1) {
        for (var i = column + 1, len = column + opts.colspan; i < len; ++i) {
          if (!(i in this._widths)) {
            throw new Error('row columns already exceeded, colspan to big');
          }

          this._widths[column] += this._widths[i];
        }

        this._widths.splice(column + 1, opts.colspan - 1);
        this._borderVerticalWidths.splice(column + 1, opts.colspan - 1);
      }

      // adjust cell padding to add enough space for borders
      if (this._borderVerticalWidths) {
        var borderWidthLeft = this._borderVerticalWidths[column];
        var borderWidthRight = this._borderVerticalWidths[column + 1];

        if (borderWidthLeft > 0) {
          if (column === 0) {
            // is first
            opts.borderLeftWidth = borderWidthLeft;
          } else {
            opts.borderLeftWidth = borderWidthLeft / 2;
          }
        }

        if (borderWidthRight > 0) {
          if (column === this._widths.length - 1) {
            // is last
            opts.borderRightWidth = borderWidthRight;
          } else {
            opts.borderRightWidth = borderWidthRight / 2;
          }
        }
      }

      if (this._hasTopBorder && this._topBorderWidth > 0) {
        opts.borderTopWidth = this._topBorderWidth;
      }

      if (this._bottomBorderWidth > 0) {
        opts.borderBottomWidth = this._bottomBorderWidth;
      }

      var ctx = new Cell(this._doc, this, Object.assign({}, opts, {
        width: this._widths[column]
      }));
      ctx._drawBorders = false;

      this._begin(ctx);

      // move the cell to the right by the width of each previous cell
      for (var _i = 0; _i < column; ++_i) {
        ctx._cursor.startX += this._widths[_i] || 0;
      }
      ctx._pending.push(function () {
        return ctx._start();
      });

      // override cell's end logic, which is also postponed until the row ends
      ctx._end = endCell.bind(ctx, this);

      this._pending.push(ctx._pending);

      if (typeof text === 'string' && text.length > 0) {
        ctx.text(text, opts);
      }

      return ctx;
    }
  }]);

  return Row;
}();