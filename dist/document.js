'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Cursor = require('./cursor');
var Fragment = require('./fragment');
var ops = require('./ops');
var PDF = require('./object');
var Readable = require('stream').Readable;
var uuid = require('uuid');
var util = require('./util');
var ContentChunk = require('./content');
var ExternalDocument = require('./external');
var Font = require('./font/base');

// constants
var RESOLVE = Promise.resolve();

var Document = function (_Readable) {
  _inherits(Document, _Readable);

  function Document(opts) {
    _classCallCheck(this, Document);

    if (!opts) {
      opts = {};
    }

    // readable stream options

    var _this = _possibleConstructorReturn(this, (Document.__proto__ || Object.getPrototypeOf(Document)).call(this, {
      highWaterMark: opts.highWaterMark || 16384 // 16kB
    }));

    _this.version = '1.6';
    _this.info = Object.assign({}, opts.properties, { id: uuid.v4() });
    _this.width = opts.width || 595.296;
    _this.height = opts.height || 841.896;

    _this._nextObjectId = 1;
    _this._xref = new PDF.Xref();
    _this._reading = false; // wheater someone is reading data from the underlying Readable
    _this._length = 0; // keeps track of the total document length (in byte)

    // header
    var header = '%PDF-' + _this.version + '\n'
    // The PDF format mandates that we add at least 4 commented binary characters
    // (ASCII value >= 128), so that generic tools have a chance to detect
    // that it's a binary file
    + '%\xFF\xFF\xFF\xFF\n\n';

    // a backlog of pending operations
    _this._pending = [function () {
      return _this._write(header);
    }];
    // this is the current operation that is executed (operations are executed sequentially)
    _this._pending.current = null;

    // init default styling opts
    _this.defaultFont = opts.font || require('../font/Helvetica');
    _this.defaultFontSize = opts.fontSize || 11;
    _this.defaultColor = opts.color && util.colorToRgb(opts.color) || [0, 0, 0];
    _this.defaultLineHeight = opts.lineHeight || 1.15;

    if (!Font.isFont(_this.defaultFont)) {
      throw new TypeError('opts.font must be set to a valid default font');
    }

    // create document and page font dict
    _this._fonts = {};
    _this._xobjects = {};
    _this._pageFonts = {};
    _this._annotations = [];

    // these properties are used to keep track of used Font and Image objects and assign ids to
    // them in a document-scoped way
    _this._aliases = new AliasGenerator();
    _this._mapping = new WeakMap();

    // a page could consist out of multiple content chunks, which are keept track of using the
    // following properties
    _this._currentContent = null;
    _this._contents = [];
    _this._contentObjCreator = null;

    // this array can be used to register callbacks that are executed when finalizing the document
    // e.g. rendering the total page count
    _this._finalize = [];

    _this._header = _this._footer = _this._template = null;

    // init cursor
    // TODO: test for valid values
    var padding = opts.padding >= 0 ? opts.padding : 20;
    _this.paddingTop = util.defaults(opts.paddingTop, padding);
    _this.paddingBottom = util.defaults(opts.paddingBottom, padding);
    _this.paddingLeft = util.defaults(opts.paddingLeft, padding);
    _this.paddingRight = util.defaults(opts.paddingRight, padding);

    _this._cursor = new Cursor(_this.width - _this.paddingLeft - _this.paddingRight, _this.height - _this.paddingTop - _this.paddingBottom, // width, height
    _this.paddingLeft, _this.height - _this.paddingTop // x, y
    );

    // init pages catalog
    _this._pages = new PDF.Array();
    _this._pagesObj = new PDF.Object('Pages');
    _this._registerObject(_this._pagesObj);

    // init destinations name tree
    _this._destinations = new PDF.NameTree();

    // init outlines hierarchy
    _this._outlines = [];

    // init color space
    _this._colorSpace = new PDF.Object();
    var iccProfile = require('./sRGB_IEC61966-2-1_black_scaled') + '~>';
    _this._colorSpace.content = 'stream\n' + iccProfile + '\nendstream\n';
    _this._colorSpace.prop('Length', iccProfile.length);
    _this._colorSpace.prop('N', 3);
    _this._colorSpace.prop('Alternate', 'DeviceRGB');
    // this._colorSpace.prop('Filter', new PDF.Array([
    //   new PDF.Name('ASCII85Decode'), new PDF.Name('FlateDecode')
    // ]))
    _this._colorSpace.prop('Filter', new PDF.Name('ASCII85Decode'));
    _this._registerObject(_this._colorSpace);
    _this._currentColorSpace = '/CS1';

    // start to work the _pending queue
    _this._next();

    Fragment.prototype._init.call(_this, _this, _this);
    return _this;
  }

  /// private API

  _createClass(Document, [{
    key: '_next',
    value: function _next() {
      var _this2 = this;

      // return if there is already an operation worked on
      if (this._pending.current) {
        return this._pending.current;
      }

      // variables used to traverse the nested queue
      var parent = this._pending;
      var next = parent[0];

      // if there is nothing in the queue, we are done here
      if (!next) {
        return RESOLVE;
      }

      // the operation queue is a nested array, e.g.: [op1, [op2, op3, [ op4 ]], op5]
      // it is therefore necessary traverse the first element until the first non array element
      // is encountered
      while (Array.isArray(next)) {
        // if the first element is an empty array, remove it and start over
        if (next.length === 0) {
          parent.shift();
          return this._next();
        }

        parent = next;
        next = next[0];
      }

      // remove next from the queue
      parent.shift();

      // TODO: still necessary?
      // if (!next) {
      //   return this._next()
      // }

      // return and set the current operation that is being executed
      return this._pending.current = next().then(function () {
        // once the execution finished, continue in the queue
        _this2._pending.current = null;
        return _this2._next();
      });
    }

    // This is method is used by Node.js stream.Readable class, which we inherit from.
    // The method is called, if data is available from the resource, which means that we should
    // start pushing data into the read queue (using `this.push(dataChunk)`). It should continue
    // reading from the resoruce and pushing data until `this.push()` return `false`. Only when it
    // is called again aft it has stopped should it resume pushing additional data onto the
    // read queue.

  }, {
    key: '_read',
    value: function _read() /* size */{
      this._reading = true;
      this.emit('read');
    }

    // This method is used to push data onto the read queue. If the Readable stream is currently
    // not read from, the writing is postponed.

  }, {
    key: '_write',
    value: function _write(chunk) {
      var _this3 = this;

      if (this._reading) {
        if (!this.push(chunk, 'binary')) {
          this._reading = false;
        }
        this._length += chunk.length;
        return RESOLVE;
      } else {
        return new Promise(function (resolve) {
          _this3.once('read', function () {
            resolve(_this3._write(chunk));
          });
        });
      }
    }
  }, {
    key: '_useFont',
    value: function _useFont(font) {
      var alias = void 0;
      if (this._mapping.has(font)) {
        alias = this._mapping.get(font);
        // if the alias exists but is now blocked (e.g. because of having set a new template with
        // colliding aliases), remove the mapping and unset the alias to force creation of a new one
        if (this._aliases.isBlocked(alias)) {
          this._mapping.delete(font);
          alias = undefined;
        }
      }

      if (!alias) {
        alias = new PDF.Name(this._aliases.next('F'));
        this._mapping.set(font, alias);

        var fontObj = new PDF.Object('Font');
        this._fonts[alias] = { f: font.instance(), o: fontObj };
        this._registerObject(fontObj);
      }

      if (this._currentContent && !(alias in this._currentContent._fonts)) {
        this._currentContent._fonts[alias] = this._fonts[alias].o.toReference();
      }

      return alias;
    }
  }, {
    key: '_fontAlias',
    value: function _fontAlias(instance) {
      return this._useFont(instance.parent);
    }
  }, {
    key: '_fontInstance',
    value: function _fontInstance(font) {
      return this._fonts[this._useFont(font)].f;
    }
  }, {
    key: '_useXObject',
    value: function _useXObject(xobj) {
      var alias = void 0;
      if (this._mapping.has(xobj)) {
        alias = this._mapping.get(xobj);
        // if the alias exists but is now blocked (e.g. because of having set a new template with
        // colliding aliases), remove the mapping and unset the alias to force creation of a new one
        if (this._aliases.isBlocked(alias)) {
          this._mapping.delete(xobj);
          alias = undefined;
        }
      }

      if (!alias) {
        alias = new PDF.Name(this._aliases.next('X'));
        this._mapping.set(xobj, alias);

        var xobjObjs = [];
        for (var i = 0; i < xobj.xobjCount; ++i) {
          var xobjObj = new PDF.Object('XObject');
          this._registerObject(xobjObj);
          xobjObjs.push(xobjObj);
        }
        this._xobjects[alias] = { x: xobj, o: xobjObjs };
      }

      if (this._currentContent && !(alias in this._currentContent._xobjects)) {
        for (var _i = 0; _i < this._xobjects[alias].o.length; ++_i) {
          this._currentContent._xobjects[alias + '.' + _i] = this._xobjects[alias].o[_i].toReference();
        }
      }

      var aliases = [];
      for (var _i2 = 0; _i2 < this._xobjects[alias].o.length; ++_i2) {
        aliases.push(alias + '.' + _i2);
      }
      return aliases;
    }
  }, {
    key: '_startPage',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var page, taken, alias, i, chunk, _i3, obj, _alias, _chunk, _i4, _obj, _alias2;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this._currentPage) {
                  _context.next = 2;
                  break;
                }

                throw new Error('There is already a started page');

              case 2:
                page = this._currentPage = new PDF.Object('Page');

                this._pages.push(page.toReference());

                if (this._template) {
                  taken = {};

                  for (alias in this._template.colorSpaces) {
                    taken[alias] = null;
                  }

                  i = 1;

                  for (1; '/CS' + i in taken; ++i) {}
                  this._currentColorSpace = '/CS' + i;
                } else {
                  this._currentColorSpace = '/CS1';
                }

                _context.next = 7;
                return this._startContentObject();

              case 7:
                if (!this._header) {
                  _context.next = 14;
                  break;
                }

                chunk = '';

                for (_i3 in this._header._objects) {
                  obj = this._header._objects[_i3];
                  _alias = new PDF.Name(this._aliases.next('H'));

                  this._currentContent._xobjects[_alias] = obj.toReference();
                  chunk += ops.Do(_alias);
                }

                _context.next = 12;
                return this._write(chunk);

              case 12:
                _context.next = 14;
                return this._header._render();

              case 14:
                if (!this._footer) {
                  _context.next = 21;
                  break;
                }

                _chunk = '';

                for (_i4 in this._footer._objects) {
                  _obj = this._footer._objects[_i4];
                  _alias2 = new PDF.Name(this._aliases.next('F'));

                  this._currentContent._xobjects[_alias2] = _obj.toReference();
                  _chunk += ops.Do(_alias2);
                }

                _context.next = 19;
                return this._write(_chunk);

              case 19:
                _context.next = 21;
                return this._footer._render();

              case 21:

                this._cursor.reset();

                if (this._header) {
                  this._cursor.y -= this._header.height;
                }

                if (this._footer) {
                  this._cursor.bottomOffset = this._footer.height;
                }

              case 24:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _startPage() {
        return _ref.apply(this, arguments);
      }

      return _startPage;
    }()
  }, {
    key: '_endPage',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var fonts, xobjects, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, content, _alias5, _alias6, page, colorSpace, contents, alias, _alias3, _alias4;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this._currentPage) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt('return');

              case 2:
                _context2.next = 4;
                return this._endContentObject();

              case 4:
                fonts = new PDF.Dictionary({});
                xobjects = new PDF.Dictionary({});
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context2.prev = 9;


                for (_iterator = this._contents[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  content = _step.value;

                  for (_alias5 in content._fonts) {
                    fonts.add(_alias5, content._fonts[_alias5]);
                  }

                  for (_alias6 in content._xobjects) {
                    xobjects.add(_alias6, content._xobjects[_alias6]);
                  }
                }

                _context2.next = 17;
                break;

              case 13:
                _context2.prev = 13;
                _context2.t0 = _context2['catch'](9);
                _didIteratorError = true;
                _iteratorError = _context2.t0;

              case 17:
                _context2.prev = 17;
                _context2.prev = 18;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 20:
                _context2.prev = 20;

                if (!_didIteratorError) {
                  _context2.next = 23;
                  break;
                }

                throw _iteratorError;

              case 23:
                return _context2.finish(20);

              case 24:
                return _context2.finish(17);

              case 25:
                page = this._currentPage;

                page.prop('Parent', this._pagesObj.toReference());

                colorSpace = new PDF.Dictionary(_defineProperty({}, this._currentColorSpace, new PDF.Array([new PDF.Name('ICCBased'), this._colorSpace.toReference()])));

                page.prop('Resources', new PDF.Dictionary({
                  ColorSpace: colorSpace,
                  ProcSet: new PDF.Array([new PDF.Name('PDF'), new PDF.Name('Text'), new PDF.Name('ImageB'), new PDF.Name('ImageC'), new PDF.Name('ImageI')]),
                  Font: fonts,
                  XObject: xobjects
                }));

                if (this._annotations.length > 0) {
                  page.prop('Annots', new PDF.Array(this._annotations));
                  this._annotations = [];
                }

                contents = this._contents.map(function (c) {
                  return c._object.toReference();
                });

                page.prop('Contents', new PDF.Array(contents));

                if (this._template) {
                  contents.unshift.apply(contents, this._template.contents);

                  for (alias in this._template.colorSpaces) {
                    colorSpace.dictionary[alias] = this._template.colorSpaces[alias];
                  }

                  for (_alias3 in this._template.fonts) {
                    fonts.dictionary[_alias3] = this._template.fonts[_alias3];
                  }

                  for (_alias4 in this._template.xobjects) {
                    xobjects.dictionary[_alias4] = this._template.xobjects[_alias4];
                  }
                }

                _context2.next = 35;
                return this._writeObject(page);

              case 35:

                this._currentContent = this._currentPage = null;
                this._contents.length = 0;

              case 37:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[9, 13, 17, 25], [18,, 20, 24]]);
      }));

      function _endPage() {
        return _ref2.apply(this, arguments);
      }

      return _endPage;
    }()
  }, {
    key: '_pageBreak',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this._currentPage) {
                  _context3.next = 3;
                  break;
                }

                _context3.next = 3;
                return this._startPage();

              case 3:
                _context3.next = 5;
                return this._cursor.reset();

              case 5:
                _context3.next = 7;
                return this._endPage();

              case 7:
                _context3.next = 9;
                return this._startPage();

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _pageBreak() {
        return _ref4.apply(this, arguments);
      }

      return _pageBreak;
    }()
  }, {
    key: '_startContentObject',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(obj, force) {
        var content, chunk;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(!force && this._length - 16 == this._contentStart)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt('return', this._currentContent);

              case 2:
                if (!this._currentContent) {
                  _context4.next = 5;
                  break;
                }

                _context4.next = 5;
                return this._endContentObject();

              case 5:

                if (this._contentObjCreator) {
                  obj = this._contentObjCreator();
                }

                content = this._currentContent = new ContentChunk(this, obj);

                this._contents.push(content);

                this._xref.add(content._object.id, {
                  offset: this._length,
                  obj: content._object
                });

                chunk = content._object.id + ' ' + content._object.rev + ' obj\n' + content._object.properties.toString() + '\n' + 'stream\n';


                this._contentStart = this._length + chunk.length;

                // set color space
                chunk += ops.CS(this._currentColorSpace) + ops.cs(this._currentColorSpace);
                _context4.next = 14;
                return this._write(chunk);

              case 14:
                return _context4.abrupt('return', content);

              case 15:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _startContentObject(_x, _x2) {
        return _ref5.apply(this, arguments);
      }

      return _startContentObject;
    }()
  }, {
    key: '_endContentObject',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var chunk;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this._currentContent) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt('return');

              case 2:

                this._currentContent._length.content = this._length - this._contentStart - 1;
                if (this._currentContent._length.content < 0) {
                  this._currentContent._length.content = 0;
                }

                chunk = 'endstream\nendobj\n\n';
                _context5.next = 7;
                return this._write(chunk);

              case 7:
                _context5.next = 9;
                return this._writeObject(this._currentContent._length);

              case 9:

                this._currentContent = null;

              case 10:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _endContentObject() {
        return _ref6.apply(this, arguments);
      }

      return _endContentObject;
    }()
  }, {
    key: '_registerObject',
    value: function _registerObject(object, force) {
      if (object instanceof PDF.Stream) {
        object = object.object;
      }

      if (!force && object.id) {
        return;
      }

      object.id = this._nextObjectId;
      this._nextObjectId++;
    }
  }, {
    key: '_writeObject',
    value: function _writeObject(object) {
      if (object instanceof PDF.Stream) {
        object = object.object;
      }

      if (!object.id) {
        this._registerObject(object);
      }

      this._xref.add(object.id, {
        offset: this._length,
        obj: object
      });
      return this._write(object.toString() + '\n\n');
    }
  }, {
    key: '_updateOutlinesCount',
    value: function _updateOutlinesCount(id) {
      if (this._outlines[id].data.count < 1) {
        this._outlines[id].data.count -= 1;
        this._outlines[id].prop('Count', this._outlines[id].data.count);
      } else {
        this._outlines[id].data.count = -1;
        this._outlines[id].prop('Count', this._outlines[id].data.count);
      }
      var nextParent = this._outlines[id].data.parentIndex;
      if (nextParent !== undefined) {
        this._updateOutlinesCount(nextParent);
      }
    }

    // public API

  }, {
    key: 'end',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, fn, alias, font, _alias7, xobj, catalog, destsObj, i, startxref, objectsCount, trailer;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return Fragment.prototype.end.call(this);

              case 2:
                _context6.next = 4;
                return this._next();

              case 4:
                _context6.next = 6;
                return this._endPage();

              case 6:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context6.prev = 9;
                _iterator2 = this._finalize[Symbol.iterator]();

              case 11:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context6.next = 18;
                  break;
                }

                fn = _step2.value;
                _context6.next = 15;
                return fn();

              case 15:
                _iteratorNormalCompletion2 = true;
                _context6.next = 11;
                break;

              case 18:
                _context6.next = 24;
                break;

              case 20:
                _context6.prev = 20;
                _context6.t0 = _context6['catch'](9);
                _didIteratorError2 = true;
                _iteratorError2 = _context6.t0;

              case 24:
                _context6.prev = 24;
                _context6.prev = 25;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 27:
                _context6.prev = 27;

                if (!_didIteratorError2) {
                  _context6.next = 30;
                  break;
                }

                throw _iteratorError2;

              case 30:
                return _context6.finish(27);

              case 31:
                return _context6.finish(24);

              case 32:

                this._pagesObj.prop('MediaBox', new PDF.Array([0, 0, this.width, this.height]));
                this._pagesObj.prop('Kids', this._pages);
                this._pagesObj.prop('Count', this._pages.length);
                _context6.next = 37;
                return this._writeObject(this._pagesObj);

              case 37:
                _context6.next = 39;
                return this._writeObject(this._colorSpace);

              case 39:
                _context6.t1 = regeneratorRuntime.keys(this._fonts);

              case 40:
                if ((_context6.t2 = _context6.t1()).done) {
                  _context6.next = 47;
                  break;
                }

                alias = _context6.t2.value;
                font = this._fonts[alias];
                _context6.next = 45;
                return font.f.write(this, font.o);

              case 45:
                _context6.next = 40;
                break;

              case 47:
                _context6.t3 = regeneratorRuntime.keys(this._xobjects);

              case 48:
                if ((_context6.t4 = _context6.t3()).done) {
                  _context6.next = 55;
                  break;
                }

                _alias7 = _context6.t4.value;
                xobj = this._xobjects[_alias7];
                _context6.next = 53;
                return xobj.x.write(this, xobj.o);

              case 53:
                _context6.next = 48;
                break;

              case 55:
                catalog = new PDF.Object('Catalog');

                catalog.prop('Pages', this._pagesObj.toReference());

                if (!(this._destinations.length > 0)) {
                  _context6.next = 63;
                  break;
                }

                destsObj = new PDF.Object();

                destsObj.prop("Dests", this._destinations);
                _context6.next = 62;
                return this._writeObject(destsObj);

              case 62:
                catalog.prop('Names', destsObj.toReference());

              case 63:
                if (!(this._outlines.length > 0)) {
                  _context6.next = 72;
                  break;
                }

                i = 0;

              case 65:
                if (!(i < this._outlines.length)) {
                  _context6.next = 71;
                  break;
                }

                _context6.next = 68;
                return this._writeObject(this._outlines[i]);

              case 68:
                i += 1;
                _context6.next = 65;
                break;

              case 71:
                catalog.prop('Outlines', this._outlines[0].toReference());

              case 72:
                _context6.next = 74;
                return this._writeObject(catalog);

              case 74:

                // to support random access to individual objects, a PDF file
                // contains a cross-reference table that can be used to locate
                // and directly access pages and other important objects within the file
                startxref = this._length;
                _context6.next = 77;
                return this._write(this._xref.toString());

              case 77:

                // trailer
                objectsCount = this._nextObjectId - 1;
                trailer = new PDF.Trailer(objectsCount + 1, catalog, this.info);
                _context6.next = 81;
                return this._write(trailer.toString() + '\n');

              case 81:
                _context6.next = 83;
                return this._write('startxref\n' + startxref + '\n%%EOF');

              case 83:

                // close readable stream
                this.push(null);

              case 84:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[9, 20, 24, 32], [25,, 27, 31]]);
      }));

      function end() {
        return _ref7.apply(this, arguments);
      }

      return end;
    }()
  }, {
    key: 'asBuffer',
    value: function asBuffer(callback) {
      var _this4 = this;

      var p = new Promise(function (resolve, reject) {
        var chunks = [];
        _this4.on('data', function (chunk) {
          return chunks.push(chunk);
        });
        _this4.on('end', function () {
          return resolve(Buffer.concat(chunks));
        });
        _this4.on('error', reject);
        _this4.end();
      });
      if (typeof callback === 'function') {
        p = p.then(function (data) {
          return callback(null, data);
        }).catch(callback);
      }
      return p;
    }
  }, {
    key: 'header',
    value: function header() {
      var _this5 = this;

      var Header = require('./header');
      var ctx = new Header(this, this);
      this._begin(ctx);

      this._pending.push(function () {
        _this5._header = ctx;
        return ctx._start();
      });

      return ctx;
    }
  }, {
    key: 'footer',
    value: function footer() {
      var _this6 = this;

      var Footer = require('./footer');
      var ctx = new Footer(this, this);
      this._begin(ctx);

      this._pending.push(function () {
        _this6._footer = ctx;
        return ctx._start();
      });

      return ctx;
    }
  }, {
    key: 'addPagesOf',
    value: function addPagesOf(external) {
      var _this7 = this;

      if (!(external instanceof ExternalDocument)) {
        throw new TypeError('argument must be of type ExternalDocument');
      }

      this._begin(null);
      this._pending.push(function () {
        return external.write(_this7);
      });
    }
  }, {
    key: 'addPageOf',
    value: function addPageOf(page, external) {
      var _this8 = this;

      if (!(external instanceof ExternalDocument)) {
        throw new TypeError('argument must be of type ExternalDocument');
      }

      if (!page || page < 1 || page > external.pageCount) {
        throw new TypeError('ExternalDocument does not have page ' + page);
      }

      this._begin(null);
      this._pending.push(function () {
        return external.write(_this8, page);
      });
    }
  }, {
    key: 'setTemplate',
    value: function setTemplate(external) {
      var _this9 = this;

      if (!(external instanceof ExternalDocument)) {
        throw new TypeError('argument must be of type ExternalDocument');
      }

      this._begin(null);
      this._pending.push(function () {
        return external.setAsTemplate(_this9);
      });
    }
  }, {
    key: 'outline',
    value: function outline(title, destination, parent) {
      // Skip empty titles and/or destination
      if (title === undefined || destination === undefined) return;

      // Create the root outline the first time this method is called
      if (this._outlines.length === 0) {
        this._outlines[0] = new PDF.Object('Outlines');
        this._outlines[0].data = { type: 'Outlines' };
        this._registerObject(this._outlines[0]);
      }
      // Find parent item
      var parentIndex = void 0;
      if (typeof parent === 'number' && parent >= 0 && parent <= this._outlines.length) {
        // the user provided a valid index number: use it as the parentIndex
        parentIndex = parent;
      } else {
        // the user did not provide a valid index number: search for it in the outline array
        // if it is not found, create the corresponding parent at root level
        if (parent === undefined || parent === '') {
          parentIndex = 0;
        } else {
          parentIndex = this._outlines.findIndex(function (item, index) {
            return item.data.title === parent;
          });
          if (parentIndex === -1) parentIndex = this.outline(parent, destination);
        }
      }

      // Find siblings
      var siblingsIndexes = this._outlines.reduce(function (result, item, index) {
        if (index !== 0 && item.data.parentIndex === parentIndex) result.push(index);
        return result;
      }, []);

      // Create item
      var outline = new PDF.Object();
      outline.data = { title: title, destination: destination, parent: parent };
      outline.prop('Title', new PDF.String(title));
      outline.prop('Parent', this._outlines[parentIndex].toReference());
      outline.prop('A', new PDF.Dictionary({
        S: 'GoTo',
        D: new PDF.String(destination)
      }));
      this._registerObject(outline);
      var outlineIndex = this._outlines.push(outline) - 1;

      // Chain to siblings
      var prevSiblingIndex = siblingsIndexes[siblingsIndexes.length - 1];
      if (prevSiblingIndex > 0) {
        // Next
        this._outlines[prevSiblingIndex].data.nextId = outlineIndex;
        this._outlines[prevSiblingIndex].prop('Next', this._outlines[outlineIndex].toReference());
        // Prev
        this._outlines[outlineIndex].data.prevId = prevSiblingIndex;
        this._outlines[outlineIndex].prop('Prev', this._outlines[prevSiblingIndex].toReference());
      }

      // Chain to parents
      this._outlines[outlineIndex].data.parentIndex = parentIndex;
      if (siblingsIndexes.length === 0) {
        // First
        this._outlines[parentIndex].data.firstIndex = outlineIndex;
        this._outlines[parentIndex].prop('First', this._outlines[outlineIndex].toReference());
      }
      // Last
      this._outlines[parentIndex].data.lastIndex = outlineIndex;
      this._outlines[parentIndex].prop('Last', this._outlines[outlineIndex].toReference());
      // Count(s)
      this._updateOutlinesCount(parentIndex);

      return outlineIndex;
    }
  }]);

  return Document;
}(Readable);

Object.assign(Document.prototype, {
  _begin: Fragment.prototype._begin,
  _end: Fragment.prototype._end,
  _opts: Fragment.prototype._opts,

  text: Fragment.prototype.text,
  cell: Fragment.prototype.cell,
  table: Fragment.prototype.table,
  image: Fragment.prototype.image,
  pageBreak: Fragment.prototype.pageBreak,
  op: Fragment.prototype.op,
  destination: Fragment.prototype.destination
});

var AliasGenerator = function () {
  function AliasGenerator() {
    _classCallCheck(this, AliasGenerator);

    this.nextId = {};
    this.blocked = new Set();
  }

  _createClass(AliasGenerator, [{
    key: 'next',
    value: function next(prefix) {
      if (!(prefix in this.nextId)) {
        this.nextId[prefix] = 1;
      }

      var next = void 0;
      do {
        next = prefix + this.nextId[prefix]++;
      } while (this.blocked.has(next));

      return next;
    }
  }, {
    key: 'block',
    value: function block(alias) {
      alias = String(alias);
      if (alias[0] === '/') {
        alias = alias.slice(1);
      }

      this.blocked.add(alias);
    }
  }, {
    key: 'isBlocked',
    value: function isBlocked(alias) {
      alias = String(alias);
      if (alias[0] === '/') {
        alias = alias.slice(1);
      }

      return this.blocked.has(alias);
    }
  }, {
    key: 'reset',
    value: function reset(prefix) {
      this.nextId[prefix] = 1;
    }
  }]);

  return AliasGenerator;
}();

module.exports = Document;