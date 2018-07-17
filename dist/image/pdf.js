'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDF = require('../object');
var Parser = require('../parser/parser');

module.exports = function () {
  function PDFImage(src) {
    _classCallCheck(this, PDFImage);

    var parser = new Parser(src);
    parser.parse();

    var catalog = parser.trailer.get('Root').object.properties;
    var pages = catalog.get('Pages').object.properties;
    var first = pages.get('Kids')[0].object.properties;
    var mediaBox = first.get('MediaBox') || pages.get('MediaBox');

    this.page = first;
    this.width = mediaBox[2];
    this.height = mediaBox[3];

    var contents = this.page.get('Contents');
    this.xobjCount = Array.isArray(contents) ? contents.length : 1;
  }

  _createClass(PDFImage, [{
    key: 'write',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(doc, xobjs) {
        var resources, bbox, i, xobj, contents, content, objects, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, obj, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _obj;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                resources = this.page.get('Resources');
                bbox = new PDF.Array([0, 0, this.width, this.height]);
                i = 0;

              case 3:
                if (!(i < this.xobjCount)) {
                  _context.next = 68;
                  break;
                }

                xobj = xobjs[i];


                xobj.prop('Subtype', 'Form');
                xobj.prop('FormType', 1);
                xobj.prop('BBox', bbox);
                xobj.prop('Resources', resources instanceof PDF.Object ? resources.toReference() : resources);

                contents = this.page.get('Contents');

                if (Array.isArray(contents)) {
                  contents = contents[i].object;
                } else {
                  contents = contents.object;
                }

                content = new PDF.Stream(xobj);

                content.content = contents.content.content;

                if (contents.properties.has('Filter')) {
                  xobj.prop('Filter', contents.properties.get('Filter'));
                }
                xobj.prop('Length', contents.properties.get('Length'));
                if (contents.properties.has('Length1')) {
                  xobj.prop('Length1', contents.properties.get('Length1'));
                }

                objects = [];

                Parser.addObjectsRecursive(objects, xobj);

                // first, register objects to assign IDs (for references)
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 21;
                for (_iterator = objects[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  obj = _step.value;

                  doc._registerObject(obj, true);
                }

                // write objects
                _context.next = 29;
                break;

              case 25:
                _context.prev = 25;
                _context.t0 = _context['catch'](21);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 29:
                _context.prev = 29;
                _context.prev = 30;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 32:
                _context.prev = 32;

                if (!_didIteratorError) {
                  _context.next = 35;
                  break;
                }

                throw _iteratorError;

              case 35:
                return _context.finish(32);

              case 36:
                return _context.finish(29);

              case 37:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context.prev = 40;
                _iterator2 = objects[Symbol.iterator]();

              case 42:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context.next = 49;
                  break;
                }

                _obj = _step2.value;
                _context.next = 46;
                return doc._writeObject(_obj);

              case 46:
                _iteratorNormalCompletion2 = true;
                _context.next = 42;
                break;

              case 49:
                _context.next = 55;
                break;

              case 51:
                _context.prev = 51;
                _context.t1 = _context['catch'](40);
                _didIteratorError2 = true;
                _iteratorError2 = _context.t1;

              case 55:
                _context.prev = 55;
                _context.prev = 56;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 58:
                _context.prev = 58;

                if (!_didIteratorError2) {
                  _context.next = 61;
                  break;
                }

                throw _iteratorError2;

              case 61:
                return _context.finish(58);

              case 62:
                return _context.finish(55);

              case 63:
                _context.next = 65;
                return doc._writeObject(xobj);

              case 65:
                ++i;
                _context.next = 3;
                break;

              case 68:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[21, 25, 29, 37], [30,, 32, 36], [40, 51, 55, 63], [56,, 58, 62]]);
      }));

      function write(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return write;
    }()
  }]);

  return PDFImage;
}();