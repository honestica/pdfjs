'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFName = require('./name');
var PDFString = require('./string');
var PDFDictionary = require('./dictionary');
var PDFArray = require('./array');

var PDFNameTree = function (_PDFDictionary) {
  _inherits(PDFNameTree, _PDFDictionary);

  function PDFNameTree(dictionary) {
    _classCallCheck(this, PDFNameTree);

    return _possibleConstructorReturn(this, (PDFNameTree.__proto__ || Object.getPrototypeOf(PDFNameTree)).call(this, dictionary));
  }

  _createClass(PDFNameTree, [{
    key: 'add',
    value: function add(key, val) {
      if (typeof val === 'string') {
        val = new PDFName(val);
      }
      this.dictionary[key] = val;
    }
  }, {
    key: 'has',
    value: function has(key) {
      return String(key) in this.dictionary;
    }
  }, {
    key: 'get',
    value: function get(key) {
      return this.dictionary[key];
    }
  }, {
    key: 'del',
    value: function del(key) {
      delete this.dictionary[key];
    }
  }, {
    key: 'toString',
    value: function toString() {
      var sortedKeys = Object.keys(this.dictionary);
      sortedKeys.sort(function (lhs, rhs) {
        return lhs.localeCompare(rhs);
      });

      var names = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = sortedKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          names.push(new PDFString(key), this.dictionary[key]);
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

      var dict = new PDFDictionary();
      dict.set("Names", new PDFArray(names));
      dict.set("Limits", new PDFArray([new PDFString(sortedKeys[0]), new PDFString(sortedKeys[sortedKeys.length - 1])]));
      return dict.toString();
    }
  }]);

  return PDFNameTree;
}(PDFDictionary);

module.exports = PDFNameTree;