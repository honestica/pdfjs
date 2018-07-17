'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Fragment = require('./fragment');
var util = require('./util');
var ops = require('./ops');
var PDF = require('./object');

module.exports = function (_Fragment) {
  _inherits(Header, _Fragment);

  function Header(doc, parent) {
    _classCallCheck(this, Header);

    // a header could consist out of multiple FormXObjects and this property is later used keep
    // track of them
    var _this = _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this, doc, parent));

    _this._objects = [];

    // this array keeps track of all page numbers rendered in the header, because their rendering
    // is postponed
    _this._pageNumbers = [];

    // create new cursor for header context to not inherite bottom offset of document, which the
    // document receives from having a header
    _this._cursor = _this._cursor.clone();
    return _this;
  }

  /// private API

  // prevent page breaks inside a header


  _createClass(Header, [{
    key: '_pageBreak',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(level) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                throw new Error('Header is to long (tried to execute a page break inside the header)');

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
                return this._doc._endPage();

              case 2:
                _context2.next = 4;
                return this._setup();

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
    key: '_setup',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this._cursor.reset();

                // these objects will be written to the document after all FormXObjects are written
                // it is therefore necessary to keep track of them seperately
                this._resources = new PDF.Object();
                this._doc._registerObject(this._resources);
                this._bbox = new PDF.Object();
                this._doc._registerObject(this._bbox);

                // a FormXObject will receive a Resources dictionary similar to Page objects, which is
                // why it is necessary to keep track of used fonts and xobjects
                this.fonts = new PDF.Dictionary({});
                this.xobjects = new PDF.Dictionary({});

                // this header object has a similar interface like the page object and it is used as such
                // until the header has finished rendering (necessary to track the used fonts and xobjects)
                this._doc._contentObjCreator = this._createObject.bind(this);

                // close current content object and start a new one (by setting the _contentObjCreator object
                // above, the new content object will be created by calling the header's _createObject
                // method)
                _context3.next = 10;
                return this._doc._startContentObject();

              case 10:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _setup() {
        return _ref3.apply(this, arguments);
      }

      return _setup;
    }()
  }, {
    key: '_createObject',
    value: function _createObject() {
      // this is going to be called on each _startContentObject() call as long as the header
      // is rendered, which creates a FormXObject (instead of the usual plain object)
      var xobj = new PDF.Object('XObject');
      xobj.prop('Subtype', 'Form');
      xobj.prop('FormType', 1);
      xobj.prop('BBox', this._bbox.toReference());
      xobj.prop('Resources', this._resources.toReference());
      return xobj;
    }

    // while most parts of the header is static (i.e. rendered only once and then reused), there are
    // some dynamic parts (e.g. page numbers) which are rendered on each page
    // these parts are rendered here

  }, {
    key: '_render',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var _this2 = this;

        var Text, _loop, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, instance;

        return regeneratorRuntime.wrap(function _callee5$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!(this._pageNumbers.length === 0)) {
                  _context6.next = 2;
                  break;
                }

                return _context6.abrupt('return');

              case 2:

                // lazy load text, because of cyclic dependencies of Fragment
                Text = require('./text');
                _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop(instance) {
                  var withPageCount, lhs, rhs, fonts, font, fontAlias, xobj, currentPage, alias, txt;
                  return regeneratorRuntime.wrap(function _loop$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          withPageCount = false;

                          if (instance.fn) {
                            lhs = instance.fn(1, 1);
                            rhs = instance.fn(1, 10);

                            withPageCount = lhs.length !== rhs.length;
                          }

                          // postpone writing page number until the end of the document, because the total page count
                          // is not known now

                          if (!withPageCount) {
                            _context5.next = 21;
                            break;
                          }

                          // since there is only text with an already known font, the fonts dictionary can already
                          // be build
                          fonts = new PDF.Dictionary({});
                          font = _this2._doc._fontInstance(instance.opts.font || _this2._doc.defaultFont);
                          fontAlias = _this2._doc._fontAlias(font);

                          fonts.set(fontAlias, _this2._doc._fonts[fontAlias].o.toReference());

                          // create the FormXObject that is used to render the page numbers
                          xobj = new PDF.Object('XObject');

                          xobj.prop('Subtype', 'Form');
                          xobj.prop('FormType', 1);
                          xobj.prop('BBox', new PDF.Array([instance.x, instance.y, instance.x + instance.width, instance.y - instance.height]));
                          xobj.prop('Resources', new PDF.Dictionary({
                            ColorSpace: new PDF.Dictionary({
                              CS1: new PDF.Array([new PDF.Name('ICCBased'), _this2._doc._colorSpace.toReference()])
                            }),
                            ProcSet: new PDF.Array([new PDF.Name('Text')]),
                            Font: fonts
                          }));
                          _this2._doc._registerObject(xobj);

                          // calculate the number of the currently rendered page
                          currentPage = _this2._doc._pages.length;

                          // add a handler to the document that will be called when the document is finished up
                          // this is necessary because the total count of pages is not yet known

                          _this2._doc._finalize.push(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                            var pageCount, str, txt;
                            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                              while (1) {
                                switch (_context4.prev = _context4.next) {
                                  case 0:
                                    _context4.next = 2;
                                    return _this2._doc._startContentObject(xobj);

                                  case 2:

                                    // setup the cursor to the position the page numbers should be rendered at
                                    _this2._cursor.y = instance.y;
                                    _this2._cursor.x = instance.x;
                                    _this2._cursor.width = instance.width;

                                    // negate document bottomOffset, which is there because of this header
                                    _this2._cursor.bottomOffset = -_this2._doc._cursor.bottomOffset;

                                    // create the text representing the page numbers
                                    pageCount = _this2._doc._pages.length;
                                    str = instance.fn ? instance.fn(currentPage, pageCount) : currentPage;

                                    // manually render the text

                                    txt = new Text(_this2._doc, _this2, instance.opts);

                                    txt._parts++;
                                    txt._ended = true;
                                    _context4.next = 13;
                                    return txt._start();

                                  case 13:
                                    _context4.next = 15;
                                    return txt._render(str, instance.opts);

                                  case 15:
                                    _context4.next = 17;
                                    return txt._end();

                                  case 17:
                                    _context4.next = 19;
                                    return _this2._doc._endContentObject();

                                  case 19:
                                  case 'end':
                                    return _context4.stop();
                                }
                              }
                            }, _callee4, _this2);
                          })));

                          // render and register the FormXObject to the current page
                          alias = new PDF.Name(_this2._doc._aliases.next('X'));

                          _this2._doc._currentContent._xobjects[alias] = xobj.toReference();
                          _context5.next = 19;
                          return _this2._doc._write(ops.Do(alias));

                        case 19:
                          _context5.next = 34;
                          break;

                        case 21:
                          // if there is now total page count necessary, we can write the current page number directly
                          _this2._cursor.y = instance.y;
                          _this2._cursor.x = instance.x;
                          _this2._cursor.width = instance.width;

                          // negate document bottomOffset, which is there because of this header
                          _this2._cursor.bottomOffset = -_this2._doc._cursor.bottomOffset;

                          txt = new Text(_this2._doc, _this2, instance.opts);

                          txt._parts++;
                          txt._ended = true;
                          _context5.next = 30;
                          return txt._start();

                        case 30:
                          _context5.next = 32;
                          return txt._render(String(_this2._doc._pages.length), instance.opts);

                        case 32:
                          _context5.next = 34;
                          return txt._end();

                        case 34:
                        case 'end':
                          return _context5.stop();
                      }
                    }
                  }, _loop, _this2);
                });
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context6.prev = 7;
                _iterator = this._pageNumbers[Symbol.iterator]();

              case 9:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context6.next = 15;
                  break;
                }

                instance = _step.value;
                return _context6.delegateYield(_loop(instance), 't0', 12);

              case 12:
                _iteratorNormalCompletion = true;
                _context6.next = 9;
                break;

              case 15:
                _context6.next = 21;
                break;

              case 17:
                _context6.prev = 17;
                _context6.t1 = _context6['catch'](7);
                _didIteratorError = true;
                _iteratorError = _context6.t1;

              case 21:
                _context6.prev = 21;
                _context6.prev = 22;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 24:
                _context6.prev = 24;

                if (!_didIteratorError) {
                  _context6.next = 27;
                  break;
                }

                throw _iteratorError;

              case 27:
                return _context6.finish(24);

              case 28:
                return _context6.finish(21);

              case 29:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee5, this, [[7, 17, 21, 29], [22,, 24, 28]]);
      }));

      function _render() {
        return _ref4.apply(this, arguments);
      }

      return _render;
    }()
  }, {
    key: '_end',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, content, alias, _alias;

        return regeneratorRuntime.wrap(function _callee6$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                // save the height of the header
                // this is used to correctly offset the cursor when rendering the page
                this.height = this._doc._cursor.startY - this._doc._cursor.y;

                _context7.next = 3;
                return this._doc._endContentObject();

              case 3:

                // collect all fonts and xobjects that are used in the header
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context7.prev = 6;
                for (_iterator2 = this._doc._contents[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  content = _step2.value;

                  for (alias in content._fonts) {
                    this.fonts.add(alias, content._fonts[alias]);
                  }

                  for (_alias in content._xobjects) {
                    this.xobjects.add(_alias, content._xobjects[_alias]);
                  }
                }

                // create the Resources object for the header's FormXObjects
                _context7.next = 14;
                break;

              case 10:
                _context7.prev = 10;
                _context7.t0 = _context7['catch'](6);
                _didIteratorError2 = true;
                _iteratorError2 = _context7.t0;

              case 14:
                _context7.prev = 14;
                _context7.prev = 15;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 17:
                _context7.prev = 17;

                if (!_didIteratorError2) {
                  _context7.next = 20;
                  break;
                }

                throw _iteratorError2;

              case 20:
                return _context7.finish(17);

              case 21:
                return _context7.finish(14);

              case 22:
                this._resources.content = new PDF.Dictionary({
                  ColorSpace: new PDF.Dictionary({
                    CS1: new PDF.Array([new PDF.Name('ICCBased'), this._doc._colorSpace.toReference()])
                  }),
                  ProcSet: new PDF.Array([new PDF.Name('PDF'), new PDF.Name('Text'), new PDF.Name('ImageB'), new PDF.Name('ImageC'), new PDF.Name('ImageI')]),
                  Font: this.fonts,
                  XObject: this.xobjects
                });
                _context7.next = 25;
                return this._doc._writeObject(this._resources);

              case 25:

                // setup the BBox
                this._bbox.content = new PDF.Array([this._cursor.startX, this._cursor.startY, this._cursor.startX + this._doc._cursor.width, this._doc._cursor.y]);
                _context7.next = 28;
                return this._doc._writeObject(this._bbox);

              case 28:

                // the header can consist out of multiple FormXObjects, which are collected here
                this._objects = this._doc._contents.map(function (c) {
                  return c._object;
                });

                // reset everything
                this._doc._cursor.reset();

                this._doc._currentContent = null;
                this._doc._contents.length = 0;

                this._doc._contentObjCreator = null;

              case 33:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee6, this, [[6, 10, 14, 22], [15,, 17, 21]]);
      }));

      function _end() {
        return _ref6.apply(this, arguments);
      }

      return _end;
    }()

    /// public API

  }, {
    key: 'pageNumber',
    value: function pageNumber(fn, opts) {
      var _this3 = this;

      if ((typeof fn === 'undefined' ? 'undefined' : _typeof(fn)) === 'object') {
        opts = fn;
        fn = undefined;
      }

      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }

      var font = this._doc._fontInstance(opts.font || this._doc.defaultFont);
      var fontSize = opts.fontSize || this._doc.defaultFontSize;
      var lineHeight = opts.lineHeight || this._doc.defaultLineHeight;

      var height = font.lineHeight(fontSize, true) * lineHeight;
      var descent = -font.descent(fontSize) * lineHeight;

      this._begin(null);
      this._pending.push(function () {
        _this3._pageNumbers.push({
          y: _this3._cursor.y,
          x: _this3._cursor.x,
          width: _this3._cursor.width,
          height: height + descent,
          opts: opts,
          fn: fn
        });

        _this3._cursor.y -= height + descent;
        return Promise.resolve();
      });
    }
  }]);

  return Header;
}(Fragment);