'use strict';

// const Fragment = require('./fragment')
// const util = require('./util')
// const ops = require('./ops')
// const Cell = require('./cell')

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDF = require('./object');
var Row = require('./row');
var Header = require('./header');

module.exports = function (_Row) {
  _inherits(TableHeader, _Row);

  function TableHeader(doc, parent, opts) {
    _classCallCheck(this, TableHeader);

    var _this = _possibleConstructorReturn(this, (TableHeader.__proto__ || Object.getPrototypeOf(TableHeader)).call(this, doc, parent, opts));

    _this._previousContents = null;
    _this._hadPreviousContent = false;

    // a header could consist out of multiple FormXObjects and this property is later used keep
    // track of them
    _this._objects = [];
    return _this;
  }

  /// private API

  // prevent page breaks inside a header


  _createClass(TableHeader, [{
    key: '_pageBreak',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(level) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                throw new Error('Table Header is to long (tried to execute a page break inside the header)');

              case 1:
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
    key: '_start',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _get(TableHeader.prototype.__proto__ || Object.getPrototypeOf(TableHeader.prototype), '_start', this).call(this);

              case 2:

                this.startedAtY = this._cursor.y;

                this._hadPreviousContent = !!this._doc._currentContent;
                _context2.next = 6;
                return this._doc._endContentObject();

              case 6:

                this._previousContents = this._doc._contents;
                this._doc._contents = [];

                _context2.next = 10;
                return Header.prototype._setup.call(this);

              case 10:

                this._cursor.y = this._y;

              case 11:
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
    key: '_createObject',
    value: function _createObject() {
      return Header.prototype._createObject.call(this);
    }
  }, {
    key: '_end',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var height;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _get(TableHeader.prototype.__proto__ || Object.getPrototypeOf(TableHeader.prototype), '_end', this).call(this);

              case 2:
                height = this.startedAtY - this._cursor.y;
                _context3.next = 5;
                return Header.prototype._end.call(this);

              case 5:
                this.height = height;

                this._doc._contents = this._previousContents;
                this._previousContents = null;

                if (!this._hadPreviousContent) {
                  _context3.next = 11;
                  break;
                }

                _context3.next = 11;
                return this._doc._startContentObject();

              case 11:

                this._cursor.y = this.startedAtY;

              case 12:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _end() {
        return _ref3.apply(this, arguments);
      }

      return _end;
    }()
  }]);

  return TableHeader;
}(Row);