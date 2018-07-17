'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFObject = require('./object');
var PDFName = require('./name');
var util = require('../util');

module.exports = function () {
  function PDFXref() {
    _classCallCheck(this, PDFXref);

    this.objects = [];
    this.trailer = null;
  }

  _createClass(PDFXref, [{
    key: 'add',
    value: function add(id, data) {
      this.objects[id] = data;
    }
  }, {
    key: 'get',
    value: function get(id) {
      return this.objects[id] && this.objects[id].obj;
    }
  }, {
    key: 'getOffset',
    value: function getOffset(id) {
      return this.objects[id] && this.objects[id].offset || null;
    }
  }, {
    key: 'toString',
    value: function toString() {
      var xref = 'xref\n';

      var range = { from: 0, refs: [0] };
      var ranges = [range];

      for (var i = 1; i < this.objects.length; ++i) {
        var obj = this.objects[i];
        if (!obj) {
          if (range) {
            range = null;
          }
          continue;
        }

        if (!range) {
          range = { from: i, refs: [] };
          ranges.push(range);
        }

        range.refs.push(obj.offset);
      }

      ranges.forEach(function (range) {
        xref += range.from + ' ' + range.refs.length + '\n';

        range.refs.forEach(function (ref, i) {
          if (range.from === 0 && i === 0) {
            xref += '0000000000 65535 f \n';
          } else {
            xref += '0000000000'.substr(ref.toString().length) + ref + ' 00000 n \n';
          }
        });
      });

      return xref;
    }
  }], [{
    key: 'parse',
    value: function parse(_, lexer, trial) {
      var xref = new PDFXref();

      if (lexer.getString(4) !== 'xref') {
        return this.parseXrefObject(_, lexer, trial);
      }

      lexer.readString(4); // skip xref
      lexer.skipEOL(1);

      var start = void 0;
      while ((start = lexer.readNumber(true)) !== undefined) {
        lexer.skipSpace(1);
        var count = lexer.readNumber();
        lexer.skipSpace(null, true);
        lexer.skipEOL(1);

        for (var i = 0, len = 0 + count; i < len; ++i) {
          var offset = lexer.readNumber();
          lexer.skipSpace(1);
          lexer.readNumber(); // generation
          lexer.skipSpace(1);
          var key = lexer.readString(1);
          lexer.skipSpace(null, true);
          lexer.skipEOL(1);

          var id = start + i;
          if (id > 0 && key === 'n') {
            xref.add(id, {
              offset: offset
            });
          }
        }
      }

      return xref;
    }

    // TODO: this implementation needs to be improved

  }, {
    key: 'parseXrefObject',
    value: function parseXrefObject(_, lexer, trial) {
      var xref = new PDFXref();

      var obj = void 0;

      try {
        obj = PDFObject.parse(xref, lexer, trial);
      } catch (_) {
        throw new Error('Invalid xref: xref expected but not found');
      }

      var kind = obj.properties.get("Type");
      if (!kind || kind.name !== "XRef") {
        throw new Error("Invalid xref object at " + lexer.pos);
      }

      var stream = util.inflate(obj);

      xref.trailer = obj.properties;

      var index = obj.properties.get("Index");
      var start = index ? index[0] : 0;
      var w = obj.properties.get("W");
      var typeSize = w[0] || 1;
      var offsetSize = w[1] || 2;
      var genSize = w[2] || 1;
      var len = stream.length / (typeSize + offsetSize + genSize);
      var pos = 0;
      for (var i = 0; i < len; ++i) {
        var type = readUint(stream, pos, typeSize);
        pos += typeSize;
        var offset = readUint(stream, pos, offsetSize);
        pos += offsetSize;
        switch (type) {
          case 0:
            // free
            pos += genSize;
            continue; // skip type 0 entries (free entries)
          case 1:
            // normal
            xref.add(start + i, {
              offset: offset
            });
            pos += genSize;
            break;
          case 2:
            // compressed
            xref.add(start + i, {
              compressed: true,
              id: offset,
              ix: readUint(stream, pos, genSize)
            });
            pos += genSize;
            break;
          default:
            continue;
        }
      }

      return xref;
    }
  }]);

  return PDFXref;
}();

function readUint(src, pos, size) {
  var val = 0;
  for (var i = 0; i < size; ++i) {
    // for (let i = size - 1; i > 0; --i) {
    val += src[pos + size - i - 1] << 8 * i;
  }
  return val;
}