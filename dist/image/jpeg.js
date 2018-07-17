'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDF = require('../object');

module.exports = function () {
  function JPEGImage(src) {
    _classCallCheck(this, JPEGImage);

    this.src = src;
    this.xobjCount = 1;

    var view = new DataView(src);
    if (view.getUint8(0) !== 0xff || view.getUint8(1) !== 0xd8) {
      throw new Error('Invalid JPEG image.');
    }

    var blockLength = view.getUint8(4) * 256 + view.getUint8(5);
    var len = view.byteLength;
    var i = 4;

    while (i < len) {
      i += blockLength;

      if (view.getUint8(i) !== 0xff) {
        throw new Error('Could not read JPEG the image size');
      }

      if (view.getUint8(i + 1) === 0xc0 || //(SOF) Huffman  - Baseline DCT
      view.getUint8(i + 1) === 0xc1 || //(SOF) Huffman  - Extended sequential DCT
      view.getUint8(i + 1) === 0xc2 || // Progressive DCT (SOF2)
      view.getUint8(i + 1) === 0xc3 || // Spatial (sequential) lossless (SOF3)
      view.getUint8(i + 1) === 0xc4 || // Differential sequential DCT (SOF5)
      view.getUint8(i + 1) === 0xc5 || // Differential progressive DCT (SOF6)
      view.getUint8(i + 1) === 0xc6 || // Differential spatial (SOF7)
      view.getUint8(i + 1) === 0xc7) {
        this.height = view.getUint8(i + 5) * 256 + view.getUint8(i + 6);
        this.width = view.getUint8(i + 7) * 256 + view.getUint8(i + 8);

        var colorSpace = view.getUint8(i + 9);
        switch (colorSpace) {
          case 3:
            this.colorSpace = 'DeviceRGB';
            break;
          case 1:
            this.colorSpace = 'DeviceGRAY';
            break;
        }

        break;
      } else {
        i += 2;
        blockLength = view.getUint8(i) * 256 + view.getUint8(i + 1);
      }
    }
  }

  _createClass(JPEGImage, [{
    key: 'write',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(doc, xobjs) {
        var xobj, hex, content;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                xobj = xobjs[0];


                xobj.prop('Subtype', 'Image');
                xobj.prop('Width', this.width);
                xobj.prop('Height', this.height);
                xobj.prop('ColorSpace', this.colorSpace);
                xobj.prop('BitsPerComponent', 8);

                hex = asHex(this.src);

                xobj.prop('Filter', new PDF.Array(['/ASCIIHexDecode', '/DCTDecode']));
                xobj.prop('Length', hex.length + 1);
                xobj.prop('Length1', this.src.byteLength);

                content = new PDF.Stream(xobj);

                content.content = hex + '>\n';

                _context.next = 14;
                return doc._writeObject(xobj);

              case 14:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function write(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return write;
    }()
  }]);

  return JPEGImage;
}();

function asHex(ab) {
  var view = new Uint8Array(ab);
  var hex = '';
  for (var _i = 0, _len = ab.byteLength; _i < _len; ++_i) {
    hex += toHex(view[_i]);
  }
  return hex;
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}