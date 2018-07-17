'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDF = require('./object');
var Header = require('./header');

module.exports = function (_Header) {
  _inherits(Footer, _Header);

  function Footer(doc, parent) {
    _classCallCheck(this, Footer);

    return _possibleConstructorReturn(this, (Footer.__proto__ || Object.getPrototypeOf(Footer)).call(this, doc, parent));
  }

  /// private API

  _createClass(Footer, [{
    key: '_createObject',
    value: function _createObject() {
      var xobj = Header.prototype._createObject.call(this);
      // since the footer has to be moved to the bottom of the page a Matrix property is added here
      xobj.prop('Matrix', this._matrix.toReference());
      return xobj;
    }
  }, {
    key: '_pageBreak',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(level) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                throw new Error('Footer is to long (tried to execute a page break inside the footer)');

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
                this._matrix = new PDF.Object();
                this._doc._registerObject(this._matrix);

                _context2.next = 4;
                return Header.prototype._start.call(this);

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
        var innerHeight, offset, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, instance;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // keep track of the innerHeight to calculate the offset (to move the footer to the bottom
                // of the page) below
                innerHeight = this._doc._cursor.startY - this._doc._cursor.bottom;
                _context3.next = 3;
                return Header.prototype._end.call(this);

              case 3:

                // calculate the offset and set the Matrix accordingly
                offset = innerHeight - this.height;

                this._matrix.content = new PDF.Array([1, 0, 0, 1, 0, -offset]);
                _context3.next = 7;
                return this._doc._writeObject(this._matrix);

              case 7:

                // also move the page numbers by the offset (otherwise they would be rendered on top of the
                // page)
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context3.prev = 10;
                for (_iterator = this._pageNumbers[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  instance = _step.value;

                  instance.y -= offset;
                }
                _context3.next = 18;
                break;

              case 14:
                _context3.prev = 14;
                _context3.t0 = _context3['catch'](10);
                _didIteratorError = true;
                _iteratorError = _context3.t0;

              case 18:
                _context3.prev = 18;
                _context3.prev = 19;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 21:
                _context3.prev = 21;

                if (!_didIteratorError) {
                  _context3.next = 24;
                  break;
                }

                throw _iteratorError;

              case 24:
                return _context3.finish(21);

              case 25:
                return _context3.finish(18);

              case 26:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[10, 14, 18, 26], [19,, 21, 25]]);
      }));

      function _end() {
        return _ref3.apply(this, arguments);
      }

      return _end;
    }()
  }]);

  return Footer;
}(Header);