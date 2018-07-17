'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDF = require('./object');

module.exports = function ContentChunk(doc, obj) {
  _classCallCheck(this, ContentChunk);

  this._doc = doc;
  this._fonts = {};
  this._xobjects = {};

  this._object = obj || new PDF.Object();
  this._length = new PDF.Object();

  doc._registerObject(this._object);
  doc._registerObject(this._length);

  this._object.prop('Length', this._length.toReference());
};