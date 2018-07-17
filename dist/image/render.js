'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var ops = require('../ops');
var PDFImage = require('./pdf');
var PDF = require('../object');

module.exports = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(img, doc, parent, opts) {
    var aliases, _cursor, renderWidth, renderHeight, x, y, chunk, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, alias;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (img) {
              _context.next = 2;
              break;
            }

            throw TypeError('No image provided');

          case 2:
            if (doc._currentContent) {
              _context.next = 5;
              break;
            }

            _context.next = 5;
            return doc._startPage();

          case 5:
            aliases = doc._useXObject(img);
            _cursor = parent._cursor;
            renderWidth = void 0, renderHeight = void 0;

            if (opts.width && opts.height) {
              renderWidth = opts.width;
              renderHeight = opts.height;
            } else if (opts.width) {
              renderWidth = opts.width;
              renderHeight = img.height * (opts.width / img.width);
            } else if (opts.height) {
              renderHeight = opts.height;
              renderWidth = img.width * (opts.height / img.height);
            } else {
              renderWidth = Math.min(img.width, _cursor.width);
              renderHeight = img.height * (renderWidth / img.width);

              if (renderHeight > _cursor.height) {
                renderHeight = _cursor.height;
                renderWidth = img.width * (renderHeight / img.height);
              }
            }

            x = _cursor.x;
            y = _cursor.y;


            if (opts.wrap === false) {
              if (opts.x !== undefined && opts.x !== null) {
                x = opts.x;
              }

              if (opts.y !== undefined && opts.y !== null) {
                y = opts.y;
              }
            } else {
              _cursor.y -= renderHeight;
            }

            y -= renderHeight;

            _context.t0 = opts.align;
            _context.next = _context.t0 === 'right' ? 16 : _context.t0 === 'center' ? 18 : _context.t0 === 'left' ? 20 : 20;
            break;

          case 16:
            x += _cursor.width - renderWidth;
            return _context.abrupt('break', 21);

          case 18:
            x += (_cursor.width - renderWidth) / 2;
            return _context.abrupt('break', 21);

          case 20:
            return _context.abrupt('break', 21);

          case 21:

            if (img instanceof PDFImage) {
              // in percent
              renderWidth /= img.width;
              renderHeight /= img.height;
            }

            chunk = ops.q() + ops.cm(renderWidth, 0, 0, renderHeight, x, y);
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 26;


            for (_iterator = aliases[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              alias = _step.value;

              chunk += ops.Do(alias);
            }

            _context.next = 34;
            break;

          case 30:
            _context.prev = 30;
            _context.t1 = _context['catch'](26);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 34:
            _context.prev = 34;
            _context.prev = 35;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 37:
            _context.prev = 37;

            if (!_didIteratorError) {
              _context.next = 40;
              break;
            }

            throw _iteratorError;

          case 40:
            return _context.finish(37);

          case 41:
            return _context.finish(34);

          case 42:
            chunk += ops.Q();

            if (opts.link) {
              doc._annotations.push(new PDF.Dictionary({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: new PDF.Array([x, y, x + renderWidth, y + renderHeight]),
                Border: new PDF.Array([0, 0, 0]),
                A: new PDF.Dictionary({
                  Type: 'Action',
                  S: 'URI',
                  URI: new PDF.String(opts.link)
                })
              }));
            }
            if (opts.goTo) {
              doc._annotations.push(new PDF.Dictionary({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: new PDF.Array([x, y, x + renderWidth, y + renderHeight]),
                Border: new PDF.Array([0, 0, 0]),
                A: new PDF.Dictionary({
                  S: 'GoTo',
                  D: new PDF.String(opts.goTo)
                })
              }));
            }
            if (opts.destination) {
              doc._destinations.set(opts.destination, new PDF.Array([doc._currentPage.toReference(), new PDF.Name('XYZ'), _cursor.x, _cursor.y + renderHeight, null]));
            }

            _context.next = 48;
            return doc._write(chunk);

          case 48:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[26, 30, 34, 42], [35,, 37, 41]]);
  }));

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();