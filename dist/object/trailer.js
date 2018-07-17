'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var version = require('../../package.json').version;
var PDFDictionary = require('./dictionary');
var PDFArray = require('./array');
var PDFString = require('./string');

var InfoKeys = {
  title: 'Title',
  author: 'Author',
  subject: 'Subject',
  keywords: 'Keywords',
  creator: 'Creator',
  producer: 'Producer',
  creationDate: 'CreationDate',
  modDate: 'ModDate'
};

var PDFTrailer = function (_PDFDictionary) {
  _inherits(PDFTrailer, _PDFDictionary);

  function PDFTrailer(size, root, info) {
    _classCallCheck(this, PDFTrailer);

    var _this = _possibleConstructorReturn(this, (PDFTrailer.__proto__ || Object.getPrototypeOf(PDFTrailer)).call(this));

    _this.set('Size', size);
    _this.set('Root', root && root.toReference());

    var id = new PDFString(info.id).toHexString();
    _this.set('ID', new PDFArray([id, id]));

    // Default to now and convert to string
    info.creationDate = formatDate(info.creationDate || new Date());
    if (!info.producer) {
      // Set default producer if not one provided
      info.producer = 'pdfjs v' + version + ' (github.com/rkusa/pdfjs)';
    }
    if ('modDate' in info) {
      // Convert to string
      info.modDate = formatDate(info.modDate);
    }

    var infoDictionary = {};

    for (var key in InfoKeys) {
      if (key in info) {
        infoDictionary[InfoKeys[key]] = new PDFString(info[key]);
      }
    }

    _this.set('Info', new PDFDictionary(infoDictionary));
    return _this;
  }

  _createClass(PDFTrailer, [{
    key: 'toString',
    value: function toString() {
      return 'trailer\n' + PDFDictionary.prototype.toString.call(this);
    }
  }], [{
    key: 'parse',
    value: function parse(xref, lexer) {
      lexer.skipWhitespace(null, true);

      if (lexer.readString(7) !== 'trailer') {
        throw new Error('Invalid trailer: trailer expected but not found');
      }

      lexer.skipWhitespace(null, true);

      var dict = PDFDictionary.parse(xref, lexer);
      return dict;
    }
  }]);

  return PDFTrailer;
}(PDFDictionary);

module.exports = PDFTrailer;

function formatDate(date) {
  var str = 'D:' + date.getFullYear() + ('00' + (date.getMonth() + 1)).slice(-2) + ('00' + date.getDate()).slice(-2) + ('00' + date.getHours()).slice(-2) + ('00' + date.getMinutes()).slice(-2) + ('00' + date.getSeconds()).slice(-2);

  var offset = date.getTimezoneOffset();
  var rel = offset === 0 ? 'Z' : offset > 0 ? '-' : '+';
  offset = Math.abs(offset);
  var hoursOffset = Math.floor(offset / 60);
  var minutesOffset = offset - hoursOffset * 60;

  str += rel + ('00' + hoursOffset).slice(-2) + '\'' + ('00' + minutesOffset).slice(-2) + '\'';

  return str;
}