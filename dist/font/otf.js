'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var opentype = require('opentype.js');
var FontSubset = require('./subset');
var PDFName = require('../object/name');
var PDFObject = require('../object/object');
var PDFDictionary = require('../object/dictionary');
var PDFString = require('../object/string');
var PDFArray = require('../object/array');
var PDFStream = require('../object/stream');
var Base = require('./base');
var StringWidth = Base.StringWidth;
var util = require('../util');

module.exports = function (_Base) {
  _inherits(OTFFontFactory, _Base);

  function OTFFontFactory(b) {
    _classCallCheck(this, OTFFontFactory);

    // convert to array buffer
    var _this = _possibleConstructorReturn(this, (OTFFontFactory.__proto__ || Object.getPrototypeOf(OTFFontFactory)).call(this));

    var ab = util.toArrayBuffer(b);
    _this.font = opentype.parse(ab);
    return _this;
  }

  _createClass(OTFFontFactory, [{
    key: 'instance',
    value: function instance() {
      return new OTFFont(this.font, this);
    }
  }]);

  return OTFFontFactory;
}(Base);

var OTFFont = function () {
  function OTFFont(font, parent) {
    _classCallCheck(this, OTFFont);

    this.font = font;
    this.parent = parent;

    this.subset = new FontSubset(this.font);
    this.subset.use(' ');
  }

  _createClass(OTFFont, [{
    key: 'encode',
    value: function encode(str) {
      this.subset.use(str);
      return new PDFString(this.subset.encode(str)).toHexString();
    }
  }, {
    key: 'stringWidth',
    value: function stringWidth(str, size) {
      var scale = size / this.font.unitsPerEm;
      var glyphs = this.font.stringToGlyphs(str);
      var kerning = [];

      var width = 0;
      for (var i = 0, len = glyphs.length; i < len; ++i) {
        var left = glyphs[i];
        var right = glyphs[i + 1];

        width += left.advanceWidth;
        if (right) {
          var offset = -this.font.getKerningValue(left, right);

          if (offset !== 0) {
            width += offset;
            kerning.push({ pos: i + 1, offset: offset });
          }
        }
      }

      return new StringWidth(width * scale, kerning);
    }
  }, {
    key: 'lineHeight',
    value: function lineHeight(size, includeGap) {
      if (includeGap == null) {
        includeGap = false;
      }

      var gap = includeGap ? this.font.tables.os2.sTypoLineGap : 0;
      var ascent = this.font.tables.os2.sTypoAscender;
      var descent = this.font.tables.os2.sTypoDescender;

      return (ascent + gap - descent) * size / this.font.unitsPerEm;
    }
  }, {
    key: 'ascent',
    value: function ascent(size) {
      return this.font.tables.os2.sTypoAscender * size / this.font.unitsPerEm;
    }
  }, {
    key: 'descent',
    value: function descent(size) {
      return this.font.tables.os2.sTypoDescender * size / this.font.unitsPerEm;
    }
  }, {
    key: 'underlinePosition',
    value: function underlinePosition(size) {
      return this.font.tables.post.underlinePosition * size / this.font.unitsPerEm;
    }
  }, {
    key: 'underlineThickness',
    value: function underlineThickness(size) {
      return this.font.tables.post.underlineThickness * size / this.font.unitsPerEm;
    }
  }, {
    key: 'write',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(doc, fontObj) {
        var head, scaleFactor, flags, familyClass, isSerif, isFixedPitch, italicAngle, descriptor, descendant, metrics, codeMap, code, width, cmap, mapping, lines, _code, i, data, hex, file;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                head = this.font.tables.head;
                scaleFactor = 1000.0 / this.font.unitsPerEm;
                flags = 0;
                familyClass = (this.font.tables.os2.sFamilyClass || 0) >> 8;
                isSerif = !!~[1, 2, 3, 4, 5, 6, 7].indexOf(familyClass);
                isFixedPitch = this.font.tables.post.isFixedPitch;
                italicAngle = this.font.tables.post.italicAngle;


                if (isFixedPitch) flags |= 1 << 0;
                if (isSerif) flags |= 1 << 1;
                if (familyClass === 10) flags |= 1 << 3;
                if (italicAngle !== 0) flags |= 1 << 6;
                /* assume not being symbolic */flags |= 1 << 5;

                // font descriptor
                descriptor = new PDFObject('FontDescriptor');

                descriptor.prop('FontName', this.subset.name);
                descriptor.prop('Flags', flags);
                descriptor.prop('FontBBox', new PDFArray([head.xMin * scaleFactor, head.yMin * scaleFactor, head.xMax * scaleFactor, head.yMax * scaleFactor]));
                descriptor.prop('ItalicAngle', italicAngle);
                descriptor.prop('Ascent', this.font.tables.os2.sTypoAscender * scaleFactor);
                descriptor.prop('Descent', this.font.tables.os2.sTypoDescender * scaleFactor);
                descriptor.prop('CapHeight', this.font.tables.os2.sCapHeight * scaleFactor);
                descriptor.prop('XHeight', this.font.tables.os2.sxHeight * scaleFactor);
                descriptor.prop('StemV', 0);

                descendant = new PDFObject('Font');

                descendant.prop('Subtype', 'CIDFontType0');
                descendant.prop('BaseFont', this.font.names.postScriptName.en);
                descendant.prop('DW', 1000);
                descendant.prop('CIDToGIDMap', 'Identity');
                descendant.prop('CIDSystemInfo', new PDFDictionary({
                  'Ordering': new PDFString('Identity'),
                  'Registry': new PDFString('Adobe'),
                  'Supplement': 0
                }));
                descendant.prop('FontDescriptor', descriptor.toReference());

                fontObj.prop('Subtype', 'Type0');
                fontObj.prop('BaseFont', this.font.names.postScriptName.en);
                fontObj.prop('Encoding', 'Identity-H');
                fontObj.prop('DescendantFonts', new PDFArray([descendant.toReference()]));

                // widths array
                metrics = [], codeMap = this.subset.cmap();
                _context.t0 = regeneratorRuntime.keys(codeMap);

              case 35:
                if ((_context.t1 = _context.t0()).done) {
                  _context.next = 44;
                  break;
                }

                code = _context.t1.value;

                if (!(code < 32)) {
                  _context.next = 39;
                  break;
                }

                return _context.abrupt('continue', 35);

              case 39:
                width = Math.round(this.subset.glyphs[code].advanceWidth * scaleFactor);

                metrics.push(code - 31);
                metrics.push(new PDFArray([width]));
                _context.next = 35;
                break;

              case 44:

                descendant.prop('W', new PDFArray(metrics));

                // unicode map
                cmap = new PDFStream();

                cmap.writeLine('/CIDInit /ProcSet findresource begin');
                cmap.writeLine('12 dict begin');
                cmap.writeLine('begincmap');
                cmap.writeLine('/CIDSystemInfo <<');
                cmap.writeLine('  /Registry (Adobe)');
                cmap.writeLine('  /Ordering (Identity)');
                cmap.writeLine('  /Supplement 0');
                cmap.writeLine('>> def');
                cmap.writeLine('/CMapName /Identity-H');
                cmap.writeLine('/CMapType 2 def');
                cmap.writeLine('1 begincodespacerange');
                cmap.writeLine('<0000><ffff>');
                cmap.writeLine('endcodespacerange');

                mapping = this.subset.subset, lines = [];
                _context.t2 = regeneratorRuntime.keys(mapping);

              case 61:
                if ((_context.t3 = _context.t2()).done) {
                  _context.next = 69;
                  break;
                }

                _code = _context.t3.value;

                if (!(_code < 32)) {
                  _context.next = 65;
                  break;
                }

                return _context.abrupt('continue', 61);

              case 65:

                if (lines.length >= 100) {
                  cmap.writeLine(lines.length + ' beginbfchar');
                  for (i = 0; i < lines.length; ++i) {
                    cmap.writeLine(lines[i]);
                  }
                  cmap.writeLine('endbfchar');
                  lines.length = 0;
                }

                lines.push('<' + ('0000' + (+_code - 31).toString(16)).slice(-4) + '>' + // cid
                '<' + ('0000' + mapping[_code].toString(16)).slice(-4) + '>' // gid
                );
                _context.next = 61;
                break;

              case 69:

                if (lines.length) {
                  cmap.writeLine(lines.length + ' beginbfchar');
                  lines.forEach(function (line) {
                    cmap.writeLine(line);
                  });
                  cmap.writeLine('endbfchar');
                }

                cmap.writeLine('endcmap');
                cmap.writeLine('CMapName currentdict /CMap defineresource pop');
                cmap.writeLine('end');
                cmap.writeLine('end');

                fontObj.prop('ToUnicode', cmap.toReference());

                // font file
                data = this.subset.save();
                hex = ab2hex(data);
                file = new PDFStream();

                file.object.prop('Subtype', 'OpenType');
                file.object.prop('Length', hex.length + 1);
                file.object.prop('Length1', data.byteLength);
                file.object.prop('Filter', 'ASCIIHexDecode');
                file.content = hex + '>\n';

                descriptor.prop('FontFile3', file.toReference());

                _context.next = 86;
                return doc._writeObject(file);

              case 86:
                _context.next = 88;
                return doc._writeObject(descriptor);

              case 88:
                _context.next = 90;
                return doc._writeObject(descendant);

              case 90:
                _context.next = 92;
                return doc._writeObject(cmap);

              case 92:
                _context.next = 94;
                return doc._writeObject(fontObj);

              case 94:
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

  return OTFFont;
}();

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function ab2hex(ab) {
  var view = new Uint8Array(ab);
  var hex = '';
  for (var i = 0, len = ab.byteLength; i < len; ++i) {
    hex += toHex(view[i]);
  }
  return hex;
}