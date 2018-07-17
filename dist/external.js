'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDF = require('./object');
var Parser = require('./parser/parser');

module.exports = function () {
  function ExternalDocument(src) {
    _classCallCheck(this, ExternalDocument);

    var parser = new Parser(src);
    parser.parse();

    var catalog = parser.trailer.get('Root').object.properties;
    var pages = catalog.get('Pages').object.properties;

    this.pages = pages;
    var kids = pages.get('Kids');
    this.pageCount = kids.length;

    this.objects = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = kids[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var kid = _step.value;

        var page = kid.object;

        // delete parent property to prevent endless loops when traversing the objects recursively
        page.properties.del('Parent');

        var objects = [];
        Parser.addObjectsRecursive(objects, page);

        this.objects.push(objects);
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

  // TODO: add mutex to not write concurrently (because of document specific _registerObject)


  _createClass(ExternalDocument, [{
    key: 'write',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(doc, page) {
        var kids, pages, i, len, _page, objects, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, obj, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _obj;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return doc._endPage();

              case 2:
                kids = this.pages.get('Kids');
                pages = page ? [kids[page - 1]] : kids;
                i = page ? page - 1 : 0, len = page ? page : kids.length;

              case 5:
                if (!(i < len)) {
                  _context.next = 61;
                  break;
                }

                _page = kids[i].object;
                objects = this.objects[i];


                doc._registerObject(_page, true);

                // first, register objects to assign IDs (for references)
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context.prev = 12;
                for (_iterator2 = objects[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  obj = _step2.value;

                  doc._registerObject(obj, true);
                }

                // write objects
                _context.next = 20;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context['catch'](12);
                _didIteratorError2 = true;
                _iteratorError2 = _context.t0;

              case 20:
                _context.prev = 20;
                _context.prev = 21;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 23:
                _context.prev = 23;

                if (!_didIteratorError2) {
                  _context.next = 26;
                  break;
                }

                throw _iteratorError2;

              case 26:
                return _context.finish(23);

              case 27:
                return _context.finish(20);

              case 28:
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context.prev = 31;
                _iterator3 = objects[Symbol.iterator]();

              case 33:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context.next = 40;
                  break;
                }

                _obj = _step3.value;
                _context.next = 37;
                return doc._writeObject(_obj);

              case 37:
                _iteratorNormalCompletion3 = true;
                _context.next = 33;
                break;

              case 40:
                _context.next = 46;
                break;

              case 42:
                _context.prev = 42;
                _context.t1 = _context['catch'](31);
                _didIteratorError3 = true;
                _iteratorError3 = _context.t1;

              case 46:
                _context.prev = 46;
                _context.prev = 47;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 49:
                _context.prev = 49;

                if (!_didIteratorError3) {
                  _context.next = 52;
                  break;
                }

                throw _iteratorError3;

              case 52:
                return _context.finish(49);

              case 53:
                return _context.finish(46);

              case 54:

                _page.prop('Parent', doc._pagesObj.toReference());
                _context.next = 57;
                return doc._writeObject(_page);

              case 57:

                doc._pages.push(_page.toReference());

              case 58:
                ++i;
                _context.next = 5;
                break;

              case 61:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[12, 16, 20, 28], [21,, 23, 27], [31, 42, 46, 54], [47,, 49, 53]]);
      }));

      function write(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return write;
    }()
  }, {
    key: 'setAsTemplate',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(doc) {
        var kids, first, objects, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, obj, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _obj2, contents, resources, colorSpaces, alias, fonts, _alias, xobjects, _alias2;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return doc._endPage();

              case 2:
                kids = this.pages.get('Kids');

                if (kids[0]) {
                  _context2.next = 5;
                  break;
                }

                throw new TypeError('External document is invalid');

              case 5:
                first = kids[0].object.properties;
                objects = this.objects[0];

                // first, register objects to assign IDs (for references)

                _iteratorNormalCompletion4 = true;
                _didIteratorError4 = false;
                _iteratorError4 = undefined;
                _context2.prev = 10;
                for (_iterator4 = objects[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                  obj = _step4.value;

                  doc._registerObject(obj, true);
                }

                // write objects
                _context2.next = 18;
                break;

              case 14:
                _context2.prev = 14;
                _context2.t0 = _context2['catch'](10);
                _didIteratorError4 = true;
                _iteratorError4 = _context2.t0;

              case 18:
                _context2.prev = 18;
                _context2.prev = 19;

                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                  _iterator4.return();
                }

              case 21:
                _context2.prev = 21;

                if (!_didIteratorError4) {
                  _context2.next = 24;
                  break;
                }

                throw _iteratorError4;

              case 24:
                return _context2.finish(21);

              case 25:
                return _context2.finish(18);

              case 26:
                _iteratorNormalCompletion5 = true;
                _didIteratorError5 = false;
                _iteratorError5 = undefined;
                _context2.prev = 29;
                _iterator5 = objects[Symbol.iterator]();

              case 31:
                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                  _context2.next = 38;
                  break;
                }

                _obj2 = _step5.value;
                _context2.next = 35;
                return doc._writeObject(_obj2);

              case 35:
                _iteratorNormalCompletion5 = true;
                _context2.next = 31;
                break;

              case 38:
                _context2.next = 44;
                break;

              case 40:
                _context2.prev = 40;
                _context2.t1 = _context2['catch'](29);
                _didIteratorError5 = true;
                _iteratorError5 = _context2.t1;

              case 44:
                _context2.prev = 44;
                _context2.prev = 45;

                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                  _iterator5.return();
                }

              case 47:
                _context2.prev = 47;

                if (!_didIteratorError5) {
                  _context2.next = 50;
                  break;
                }

                throw _iteratorError5;

              case 50:
                return _context2.finish(47);

              case 51:
                return _context2.finish(44);

              case 52:
                contents = first.get('Contents');

                if (!Array.isArray(contents)) {
                  contents = [contents];
                }

                resources = first.get('Resources');

                if (resources instanceof PDF.Reference) {
                  resources = resources.object.properties;
                }

                doc._template = {
                  contents: contents.map(function (c) {
                    return c.toString();
                  }),
                  colorSpaces: {},
                  fonts: {},
                  xobjects: {}
                };

                colorSpaces = resources.get('ColorSpace');

                if (colorSpaces) {
                  for (alias in colorSpaces.dictionary) {
                    doc._template.colorSpaces[alias] = colorSpaces.dictionary[alias].toString();
                    doc._aliases.block(alias);
                  }
                }

                fonts = resources.get('Font');

                if (fonts) {
                  for (_alias in fonts.dictionary) {
                    doc._template.fonts[_alias] = fonts.dictionary[_alias].toString();
                    doc._aliases.block(_alias);
                  }
                }

                xobjects = resources.get('XObject');

                if (xobjects) {
                  for (_alias2 in xobjects.dictionary) {
                    doc._template.xobjects[_alias2] = xobjects.dictionary[_alias2].toString();
                    doc._aliases.block(_alias2);
                  }
                }

              case 63:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[10, 14, 18, 26], [19,, 21, 25], [29, 40, 44, 52], [45,, 47, 51]]);
      }));

      function setAsTemplate(_x3) {
        return _ref2.apply(this, arguments);
      }

      return setAsTemplate;
    }()
  }]);

  return ExternalDocument;
}();