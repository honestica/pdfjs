'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cursor = require('./cursor');
var ops = require('./ops');
var util = require('./util');
var renderImage = require('./image/render');

var ALREADY_ENDED_ERROR = new Error('already ended');

module.exports = function () {
  function Fragment(doc, parent) {
    _classCallCheck(this, Fragment);

    this._init(doc, parent);
  }

  /// private API

  _createClass(Fragment, [{
    key: '_init',
    value: function _init(doc, parent) {
      this._doc = doc;
      this._parent = parent;
      this._cursor = parent._cursor;
      this._ended = false;
      this._current = null;

      this._pending = parent._pending;
    }
  }, {
    key: '_pageBreak',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(level) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this._parent) {
                  _context.next = 3;
                  break;
                }

                _context.next = 3;
                return this._parent._pageBreak(level + 1);

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _pageBreak(_x) {
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
      if (this._ended) {
        throw ALREADY_ENDED_ERROR;
      }

      if (this._current) {
        this._current.end();
      }

      this._current = ctx;
    }
  }, {
    key: '_opts',
    value: function _opts(opts) {
      if (this.opts) {
        // inherit font options
        return Object.assign({
          font: this.opts.font,
          fontSize: this.opts.fontSize,
          color: this.opts.color,
          lineHeight: this.opts.lineHeight
        }, opts);
      } else {
        return opts;
      }
    }

    /// public API

  }, {
    key: 'end',
    value: function end() {
      var _this = this;

      if (this._ended) {
        throw ALREADY_ENDED_ERROR;
      }

      if (this._current) {
        this._current.end();
        this._current = null;
      }

      this._ended = true;
      this._pending.push(function () {
        return _this._end();
      });
    }
  }, {
    key: 'text',
    value: function text(_text, opts) {
      if (_text !== null && (typeof _text === 'undefined' ? 'undefined' : _typeof(_text)) === 'object') {
        opts = _text;
        _text = undefined;
      }

      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }

      var Text = require('./text');
      var ctx = new Text(this._doc, this, this._opts(opts));
      this._begin(ctx);

      ctx._pending.push(function () {
        return ctx._start();
      });

      if (typeof _text === 'string' && _text.length > 0) {
        ctx.add(_text);
      }

      return ctx;
    }
  }, {
    key: 'cell',
    value: function cell(text, opts) {
      if (text !== null && (typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object') {
        opts = text;
        text = undefined;
      }
      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }

      var Cell = require('./cell');
      var ctx = new Cell(this._doc, this, this._opts(opts));
      this._begin(ctx);

      ctx._pending.push(function () {
        return ctx._start();
      });
      this._pending.push(ctx._pending);

      if (typeof text === 'string' && text.length > 0) {
        ctx.text(text, opts);
      }

      return ctx;
    }
  }, {
    key: 'table',
    value: function table(opts) {
      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }

      var Table = require('./table');
      var ctx = new Table(this._doc, this, this._opts(opts));
      this._begin(ctx);

      return ctx;
    }
  }, {
    key: 'image',
    value: function image(img, opts) {
      var _this2 = this;

      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }

      this._begin(null);
      this._pending.push(function () {
        return renderImage(img, _this2._doc, _this2, opts);
      });
    }
  }, {
    key: 'pageBreak',
    value: function pageBreak() {
      var _this3 = this;

      this._begin(null);
      this._pending.push(function () {
        return _this3._parent._pageBreak(1);
      });
    }
  }, {
    key: 'op',
    value: function op(fn) {
      var _this4 = this,
          _arguments = arguments;

      this._begin(null);
      this._pending.push(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var args;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (_this4._doc._currentContent) {
                  _context3.next = 3;
                  break;
                }

                _context3.next = 3;
                return _this4._doc._startPage();

              case 3:
                args = _arguments;

                if (!(typeof fn === 'function')) {
                  _context3.next = 8;
                  break;
                }

                args = fn(_this4._cursor.x, _this4._cursor.y);

                if (Array.isArray(args)) {
                  _context3.next = 8;
                  break;
                }

                throw new TypeError('Return of .op(() => {}) must be an array');

              case 8:
                return _context3.abrupt('return', _this4._doc._write(ops.write.apply(ops, args)));

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this4);
      })));
    }
  }, {
    key: 'destination',
    value: function destination(name) {
      var _this5 = this;

      this._begin(null);
      this._pending.push(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var DestinationRangeStyle, self;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                DestinationRangeStyle = require('./text').DestinationRangeStyle;
                self = {
                  destination: name,
                  doc: _this5._doc,
                  from: _this5._cursor.x,
                  y: _this5._cursor.y
                };

                DestinationRangeStyle.prototype._applyStyle.call(self);

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this5);
      })));
    }
  }]);

  return Fragment;
}();