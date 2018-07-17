'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('../util');

var PDFReference = function () {
  function PDFReference(obj) {
    _classCallCheck(this, PDFReference);

    Object.defineProperty(this, 'object', {
      enumerable: true,
      get: function get() {
        if (!obj) {
          return undefined;
        }

        if (typeof obj === 'function') {
          obj = obj();
        }

        return obj;
      }
    });
  }

  _createClass(PDFReference, [{
    key: 'toString',
    value: function toString() {
      return this.object.id + ' ' + this.object.rev + ' R';
    }
  }], [{
    key: 'parse',
    value: function parse(xref, lexer, trial) {
      var before = lexer.pos;

      var id = lexer.readNumber(trial);
      if (id === undefined && !trial) {
        throw new Error('Invalid indirect');
      }

      lexer.skipSpace(1, trial);
      var generation = lexer.readNumber(trial);
      if (generation === undefined && !trial) {
        throw new Error('Invalid indirect');
      }

      lexer.skipSpace(1, trial);
      if (lexer.getString(1) !== 'R') {
        if (trial) {
          lexer.pos = before;
          return undefined;
        }

        throw new Error('Invalid indirect');
      }

      lexer.shift(1);

      return new PDFReference(parseObject.bind(null, xref, lexer.outer, id));
    }
  }]);

  return PDFReference;
}();

module.exports = PDFReference;

function parseObject(xref, lexer, id) {
  var PDFObject = require('./object');
  var Lexer = require('../parser/lexer');

  var obj = xref.get(id);
  if (obj) {
    return obj;
  }

  var offset = xref.getOffset(id);
  if (offset === null) {
    var entry = xref.objects[id];
    if (entry.compressed) {
      if (!entry.obj) {
        lexer.pos = xref.getOffset(entry.id);
        var _obj = PDFObject.parse(xref, lexer);

        var type = _obj.properties.get('Type');
        if (type && type.name !== 'ObjStm') {
          throw new Error('Expected compressed object stream');
        }

        var src = util.inflate(_obj);
        // console.log("STRING: ", String.fromCharCode.apply(null, src))
        var innerLexer = new Lexer(src, lexer);

        _obj.lexer = innerLexer;
        _obj.innerObjects = [];
        var n = _obj.properties.get("N");
        for (var i = 0; i < n; ++i) {
          var _id = innerLexer.readNumber(false);
          innerLexer.skipSpace(1, false);
          var _offset = innerLexer.readNumber(false);
          innerLexer.skipWhitespace(1, true);

          _obj.innerObjects.push({
            id: _id,
            offset: _offset,
            obj: null
          });
        }

        entry.obj = _obj;
      }

      var inner = entry.obj.innerObjects[entry.ix];
      if (!inner.obj) {
        var _innerLexer = entry.obj.lexer;
        _innerLexer.pos = entry.obj.properties.get('First') + inner.offset;

        inner.obj = PDFObject.parseInner(xref, _innerLexer);
      }

      return inner.obj;
    } else {
      throw new Error('Expected compressed object stream');
    }
  } else {
    lexer.pos = offset;
    return PDFObject.parse(xref, lexer);
  }
}