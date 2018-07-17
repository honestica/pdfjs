'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Fragment = require('./fragment');
var LineBreaker = require('@rkusa/linebreak');
var unorm = require('unorm');
var ops = require('./ops');
var util = require('./util');
var Font = require('./font/base');
var PDF = require('./object');

var UNDERLINE_FLAG = 1;
var STRIKETHROUGH_FLAG = 2;

var Text = module.exports = function (_Fragment) {
  _inherits(Text, _Fragment);

  function Text(doc, parent, opts) {
    _classCallCheck(this, Text);

    var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, doc, parent));

    _this._line = [];
    _this._spaceLeft = 0;
    _this._parts = 0;
    _this._isFirstLine = true;
    _this._isNewLine = true;

    _this._previousFont = null;
    _this._previousFontSize = null;
    _this._previousColor = null;

    _this._previousHeight = 0;
    _this._previousDescent = 0;

    _this.defaultFont = opts.font || _this._doc.defaultFont;
    _this.defaultFontSize = opts.fontSize || _this._doc.defaultFontSize;
    _this.defaultColor = opts.color && util.colorToRgb(opts.color) || _this._doc.defaultColor;
    _this.defaultLineHeight = opts.lineHeight || _this._doc.defaultLineHeight;
    _this.defaultDecoration = (opts.underline ? UNDERLINE_FLAG : 0) | (opts.strikethrough ? STRIKETHROUGH_FLAG : 0);

    _this.alignment = opts.alignment || opts.textAlign || 'left';

    _this.link = opts.link;
    _this.destination = opts.destination;
    _this.goTo = opts.goTo;
    return _this;
  }

  /// private API

  _createClass(Text, [{
    key: '_start',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this._doc._currentContent) {
                  _context.next = 3;
                  break;
                }

                _context.next = 3;
                return this._doc._startPage();

              case 3:

                this._spaceLeft = this._cursor.width;

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _start() {
        return _ref.apply(this, arguments);
      }

      return _start;
    }()
  }, {
    key: '_end',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._doc._write(ops.ET());

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _end() {
        return _ref2.apply(this, arguments);
      }

      return _end;
    }()
  }, {
    key: '_render',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(text, opts) {
        var _this2 = this;

        var font, fontSize, color, lineHeight, link, destination, goTo, decoration, breaker, last, bk, isLastTextChunk, postponeLinebreak, nextWord, word, until, lastIsSpace, wordWidth, offsetWidth, spaceWidth, isLastWord, notEnoughSpace, i, w, subword, left, height, descent, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _w, h, d, _ret, freeSpace, spacing, isLastLine, chunk, lh, out, rangeStyleArgs, underlineStyle, strikethroughStyle, linkStyle, destinationStyle, goToStyle, lastIx, _i, _w2, fontStyleChanged, colorChanged, alias, kerning, pos, _i2, _subword;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this._parts--;

                if (Font.isFont(opts.font || this.defaultFont)) {
                  _context4.next = 3;
                  break;
                }

                throw new TypeError('invalid font: ' + font);

              case 3:
                font = this._doc._fontInstance(opts.font || this.defaultFont);
                fontSize = opts.fontSize || this.defaultFontSize;
                color = opts.color && util.colorToRgb(opts.color) || this.defaultColor;
                lineHeight = opts.lineHeight || this.defaultLineHeight;
                link = opts.link || this.link;
                destination = opts.destination || this.destination;
                goTo = opts.goTo || this.goTo;
                decoration = this.defaultDecoration | (opts.underline ? UNDERLINE_FLAG : 0) | (opts.strikethrough ? STRIKETHROUGH_FLAG : 0);

                // enforce string

                text = String(text);
                text = text.replace(/\r\n/g, '\n').replace(/\u2028|\u2029/g, ''); // <- TODO: does this break things?

                breaker = new LineBreaker(text);
                last = 0, bk = void 0;
                isLastTextChunk = this._parts === 0 && this._ended;
                postponeLinebreak = false;
                nextWord = null;

              case 18:
                if (!(nextWord !== null || postponeLinebreak || (bk = breaker.nextBreak()) || isLastTextChunk && this._line.length > 0)) {
                  _context4.next = 129;
                  break;
                }

                word = null;

                if (!nextWord) {
                  _context4.next = 25;
                  break;
                }

                word = nextWord;
                nextWord = null;
                _context4.next = 36;
                break;

              case 25:
                if (!bk) {
                  _context4.next = 36;
                  break;
                }

                until = bk.position;
                lastIsSpace = text[bk.position - 1].match(/\s/);

                if (lastIsSpace) {
                  until--;
                }

                // get the string between the last break and this one
                word = text.slice(last, until);

                // separate words, if has whitespace, is at the end of the text or
                // ends with a whitespace

                if (!(bk.position === text.length || lastIsSpace)) {
                  _context4.next = 34;
                  break;
                }

                last = bk.position;
                _context4.next = 35;
                break;

              case 34:
                return _context4.abrupt('continue', 18);

              case 35:

                word = unorm.nfc(word);

              case 36:
                wordWidth = 0;
                offsetWidth = 0;
                spaceWidth = 0;


                if (word) {
                  wordWidth = font.stringWidth(word, fontSize);
                  offsetWidth = wordWidth.width;
                  spaceWidth = font.stringWidth(' ', fontSize).width;

                  // add whitespace length for every word, except the first on in the line
                  // on the first line, during the first word the line array is empty, however, for succeeding
                  // lines the line array already contains the word that did not fit into the previous line
                  if (this._line.length > (this._isNewLine ? 0 : 1)) {
                    offsetWidth += spaceWidth;
                  }
                }

                // render line if there is a line break, if we hit the last word of the text, if we
                // have manual page breaks, or if there is not enough space on the line left
                isLastWord = (!bk || bk.position === text.length) && isLastTextChunk;
                notEnoughSpace = this._spaceLeft < offsetWidth;

                if (!(postponeLinebreak || bk && bk.required || isLastWord || notEnoughSpace)) {
                  _context4.next = 125;
                  break;
                }

                if (!(this._line.length === 0 && notEnoughSpace)) {
                  _context4.next = 58;
                  break;
                }

                i = word.length - 1;

              case 45:
                if (!(i >= 0)) {
                  _context4.next = 58;
                  break;
                }

                w = font.stringWidth(word.slice(i), fontSize);

                if (!(this._spaceLeft >= offsetWidth - w.width)) {
                  _context4.next = 55;
                  break;
                }

                subword = word.slice(0, i);

                this._line.push(new TextChunk({
                  wordWidth: font.stringWidth(subword, fontSize),
                  spaceWidth: spaceWidth, word: subword,
                  font: font, fontSize: fontSize, color: color, decoration: decoration,
                  link: link, destination: destination, goTo: goTo
                }));
                offsetWidth -= w.width;
                this._spaceLeft -= offsetWidth;

                nextWord = word.slice(i);
                word = null;

                return _context4.abrupt('break', 58);

              case 55:
                --i;
                _context4.next = 45;
                break;

              case 58:

                // if there is enough space, add word to the current line
                if (!postponeLinebreak && word && this._spaceLeft - offsetWidth >= 0) {
                  this._line.push(new TextChunk({
                    wordWidth: wordWidth, spaceWidth: spaceWidth, word: word, font: font, fontSize: fontSize,
                    color: color, decoration: decoration,
                    link: link, destination: destination, goTo: goTo
                  }));
                  this._spaceLeft -= offsetWidth;
                  word = null;
                }

                // render line
                left = this._cursor.x;

                // calc max line height

                height = 0;
                descent = 0;
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context4.prev = 65;


                for (_iterator = this._line[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  _w = _step.value;
                  h = _w.font.lineHeight(_w.fontSize, true);

                  if (h > height) {
                    height = h;
                  }

                  d = -_w.font.descent(_w.fontSize);

                  if (d > descent) {
                    descent = d;
                  }
                }

                _context4.next = 73;
                break;

              case 69:
                _context4.prev = 69;
                _context4.t0 = _context4['catch'](65);
                _didIteratorError = true;
                _iteratorError = _context4.t0;

              case 73:
                _context4.prev = 73;
                _context4.prev = 74;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 76:
                _context4.prev = 76;

                if (!_didIteratorError) {
                  _context4.next = 79;
                  break;
                }

                throw _iteratorError;

              case 79:
                return _context4.finish(76);

              case 80:
                return _context4.finish(73);

              case 81:
                height *= lineHeight;
                descent *= lineHeight;

                if (height === 0) {
                  height = this._previousHeight;
                  descent = this._previousDescent;
                }

                // break page if necessary

                if (this._cursor.doesFit(height)) {
                  _context4.next = 89;
                  break;
                }

                return _context4.delegateYield( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                  var remainingText;
                  return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          if (_this2._isFirstLine) {
                            _context3.next = 3;
                            break;
                          }

                          _context3.next = 3;
                          return _this2._doc._write(ops.ET());

                        case 3:

                          // execute page break
                          // add remaining text as new text to the queue of pending operations
                          remainingText = bk ? (word ? word + ' ' : '') + text.substring(bk.position) : '';

                          _this2._pending.unshift(function () {
                            _this2._parts++;
                            return _this2._render(remainingText, opts);
                          });

                          _context3.next = 7;
                          return _this2._parent._pageBreak(1);

                        case 7:

                          _this2._isFirstLine = true;
                          _this2._isNewLine = true;
                          _this2._previousFont = null;
                          _this2._previousFontSize = null;
                          _this2._previousColor = null;

                          return _context3.abrupt('return', 'break');

                        case 13:
                        case 'end':
                          return _context3.stop();
                      }
                    }
                  }, _callee3, _this2);
                })(), 't1', 86);

              case 86:
                _ret = _context4.t1;

                if (!(_ret === 'break')) {
                  _context4.next = 89;
                  break;
                }

                return _context4.abrupt('break', 129);

              case 89:

                // shift cursor; since rendering is done above the y coordinate,
                // we have to update the cursor before rendering the line
                this._cursor.y -= height; // shift y cursor

                // calculate remaining space
                freeSpace = this._spaceLeft;

                // alignment

                spacing = 0;
                _context4.t2 = this.alignment;
                _context4.next = _context4.t2 === 'right' ? 95 : _context4.t2 === 'center' ? 97 : _context4.t2 === 'justify' ? 99 : 104;
                break;

              case 95:
                left += freeSpace;
                return _context4.abrupt('break', 104);

              case 97:
                left += this._cursor.width / 2 - (this._cursor.width - freeSpace) / 2;
                return _context4.abrupt('break', 104);

              case 99:
                isLastLine = isLastWord || bk && bk.required;

                if (!(isLastLine && freeSpace / this._cursor.width > .2)) {
                  _context4.next = 102;
                  break;
                }

                return _context4.abrupt('break', 104);

              case 102:
                if (this._line.length > 1) {
                  spacing = freeSpace / (this._line.length - 1);
                }
                return _context4.abrupt('break', 104);

              case 104:

                // render words
                chunk = '';


                if (this._isFirstLine) {
                  this._previousHeight = height;
                  chunk += ops.BT()
                  // set initial pos
                  + ops.Tm(1, 0, 0, 1, left, this._cursor.y)
                  // set leading
                  + ops.TL(this._previousHeight);
                } else {
                  lh = height + this._previousDescent;


                  if (height > 0 && lh !== this._previousHeight) {
                    this._previousHeight = lh;
                    chunk += ops.TL(lh);
                  }

                  if (left > this._cursor.x) {
                    // set new x and y position
                    chunk += ops.Tm(1, 0, 0, 1, left, this._cursor.y);
                  } else {
                    // move to next line
                    chunk += ops.Tstar();
                  }
                }

                if (height > 0) {
                  this._previousDescent = descent;
                }

                out = [];
                rangeStyleArgs = [this._doc, left, this._cursor.y, height, spacing];
                underlineStyle = new (Function.prototype.bind.apply(UnderlineRangeStyle, [null].concat(rangeStyleArgs)))();
                strikethroughStyle = new (Function.prototype.bind.apply(StrikethroughRangeStyle, [null].concat(rangeStyleArgs)))();
                linkStyle = new (Function.prototype.bind.apply(LinkRangeStyle, [null].concat(rangeStyleArgs)))();
                destinationStyle = new (Function.prototype.bind.apply(DestinationRangeStyle, [null].concat(rangeStyleArgs)))();
                goToStyle = new (Function.prototype.bind.apply(GoToRangeStyle, [null].concat(rangeStyleArgs)))();
                lastIx = this._line.length - 1;

                for (_i = 0; _i < this._line.length; ++_i) {
                  _w2 = this._line[_i];
                  fontStyleChanged = _w2.font !== this._previousFont || _w2.fontSize !== this._previousFontSize;
                  colorChanged = !util.rgbEqual(_w2.color, this._previousColor);


                  chunk += underlineStyle.applyStyle(_w2, _i === lastIx, fontStyleChanged || colorChanged);
                  chunk += strikethroughStyle.applyStyle(_w2, _i === lastIx, fontStyleChanged || colorChanged);
                  chunk += linkStyle.applyStyle(_w2, _i === lastIx, fontStyleChanged || colorChanged);
                  chunk += destinationStyle.applyStyle(_w2, _i === lastIx, fontStyleChanged || colorChanged);
                  chunk += goToStyle.applyStyle(_w2, _i === lastIx, fontStyleChanged || colorChanged);

                  if (fontStyleChanged || colorChanged) {
                    if (out.length > 0) {
                      chunk += ops.TJ(out);
                    }

                    if (fontStyleChanged) {
                      this._previousFont = _w2.font;
                      this._previousFontSize = _w2.fontSize;

                      alias = this._doc._fontAlias(_w2.font);

                      // set font and font size

                      chunk += ops.Tf(alias, _w2.fontSize);
                    }

                    // set color if it has changed
                    if (colorChanged) {
                      this._previousColor = _w2.color;
                      chunk += ops.sc.apply(ops, _toConsumableArray(_w2.color));
                    }

                    out.length = 0;
                  }

                  kerning = _w2.wordWidth.kerning;

                  if (kerning.length > 0) {
                    pos = 0;

                    for (_i2 = 0; _i2 < kerning.length; ++_i2) {
                      _subword = _w2.word.substring(pos, kerning[_i2].pos);

                      out.push(_w2.font.encode(_subword), kerning[_i2].offset);
                      pos = kerning[_i2].pos;
                    }
                    out.push(_w2.font.encode(_w2.word.substring(pos)));
                  } else {
                    out.push(_w2.font.encode(_w2.word));
                  }

                  if (_i < this._line.length - 1 && _w2.spaceWidth > 0) {
                    // if is not last and has spaceWidth set
                    out.push(calcSpaceWidth(spacing, _w2.font, _w2.fontSize));
                  }
                }
                if (out.length > 0) {
                  chunk += ops.TJ(out);
                }

                _context4.next = 119;
                return this._doc._write(chunk);

              case 119:

                this._cursor.y -= descent;

                // reset / update variables
                this._spaceLeft = this._cursor.width;
                this._line.length = 0; // empty line array
                this._isFirstLine = false;
                this._isNewLine = bk && bk.required;

                postponeLinebreak = bk && bk.required && word !== null && word.length > 0;

              case 125:

                // consider word for next line
                if (word) {
                  this._line.push(new TextChunk({
                    wordWidth: wordWidth, spaceWidth: spaceWidth, word: word, font: font, fontSize: fontSize,
                    color: color, decoration: decoration,
                    link: link, destination: destination, goTo: goTo
                  }));

                  this._spaceLeft -= offsetWidth;
                }

                bk = null;
                _context4.next = 18;
                break;

              case 129:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[65, 69, 73, 81], [74,, 76, 80]]);
      }));

      function _render(_x, _x2) {
        return _ref3.apply(this, arguments);
      }

      return _render;
    }()

    /// public API

  }, {
    key: 'add',
    value: function add(text, opts) {
      var _this3 = this;

      this._begin(null); // trigger error, if text is already ended
      this._parts++;
      this._pending.push(function () {
        return _this3._render(text, opts || {});
      });

      return this;
    }
  }, {
    key: 'append',
    value: function append(text, opts) {
      var _this4 = this;

      this._begin(null); // trigger error, if text is already ended

      this._parts++;
      this._pending.push(function () {
        if (_this4._line.length > 0) {
          var w = _this4._line[_this4._line.length - 1];
          _this4._spaceLeft += w.spaceWidth;
          w.spaceWidth = 0; // set space width to zero
        }
        return _this4._render(text, opts || {});
      });

      return this;
    }
  }, {
    key: 'br',
    value: function br() {
      var _this5 = this;

      this._begin(null); // trigger error, if text is already ended

      this._parts++;
      this._pending.push(function () {
        return _this5._render('\n\n', {});
      });

      return this;
    }
  }]);

  return Text;
}(Fragment);

function calcSpaceWidth(spacing, font, fontSize) {
  var scaleFactor = 1000 / fontSize;
  return -(spacing + font.stringWidth(' ', fontSize)) * scaleFactor;
}

var TextChunk = function TextChunk(values) {
  _classCallCheck(this, TextChunk);

  this.wordWidth = values.wordWidth;
  this.spaceWidth = values.spaceWidth;
  this.word = values.word;
  this.font = values.font;
  this.fontSize = values.fontSize;
  this.color = values.color;
  this.decoration = values.decoration;
  this.link = values.link;
  this.destination = values.destination;
  this.goTo = values.goTo;
};

var RangeStyle = function () {
  function RangeStyle(doc, x, y, height, spacing) {
    _classCallCheck(this, RangeStyle);

    this.doc = doc;
    this.from = x;
    this.width = 0;
    this.y = y;
    this.height = height;
    this.spacing = spacing;
    this.isActive = false;
    this.lastSpaceWidth = 0;
  }

  _createClass(RangeStyle, [{
    key: 'applyStyle',
    value: function applyStyle(textChunk, isLast, fontStyleChanged) {
      var shouldApply = this._active(textChunk);
      var chunk = '';

      if (shouldApply && !fontStyleChanged && this.isActive) {
        this.width += this.lastSpaceWidth;
      }

      if (this.isActive && (!shouldApply || fontStyleChanged)) {
        chunk += this._applyStyle(textChunk);
        this.from += this.width + this.lastSpaceWidth;
        this.width = 0;
      }

      if (!this.isActive || shouldApply || this.isActive && fontStyleChanged) {
        this._start(textChunk);
      }

      this.isActive = shouldApply;
      this.lastSpaceWidth = this.spacing || textChunk.spaceWidth;
      if (this.isActive) {
        this.width += textChunk.wordWidth;
      } else {
        this.from += textChunk.wordWidth + this.lastSpaceWidth;
      }

      if (this.isActive && isLast) {
        chunk += this._applyStyle(textChunk);
      }

      return chunk;
    }
  }, {
    key: '_active',
    value: function _active(textChunk) {
      // abstract
    }
  }, {
    key: '_start',
    value: function _start(textChunk) {
      // abstract
    }
  }, {
    key: '_applyStyle',
    value: function _applyStyle(textChunk) {
      // abstract
    }
  }]);

  return RangeStyle;
}();

var UnderlineRangeStyle = function (_RangeStyle) {
  _inherits(UnderlineRangeStyle, _RangeStyle);

  function UnderlineRangeStyle(doc, x, y, height, spacing) {
    _classCallCheck(this, UnderlineRangeStyle);

    var _this6 = _possibleConstructorReturn(this, (UnderlineRangeStyle.__proto__ || Object.getPrototypeOf(UnderlineRangeStyle)).call(this, doc, x, y, height, spacing));

    _this6.underlinePosition = 0;
    _this6.underlineThickness = 0;
    _this6.color = null;
    return _this6;
  }

  _createClass(UnderlineRangeStyle, [{
    key: '_active',
    value: function _active(textChunk) {
      return textChunk.decoration & UNDERLINE_FLAG;
    }
  }, {
    key: '_start',
    value: function _start(textChunk) {
      this.underlinePosition = textChunk.font.underlinePosition(textChunk.fontSize);
      this.underlineThickness = textChunk.font.underlineThickness(textChunk.fontSize);
      this.color = textChunk.color;
    }
  }, {
    key: '_applyStyle',
    value: function _applyStyle(textChunk) {
      var y = this.y + this.underlinePosition;
      return ops.w(this.underlineThickness) // line width
      + ops.SC.apply(ops, _toConsumableArray(this.color)) // stroking color
      + ops.S(this.from, y, 'm', this.from + this.width, y, 'l'); // line
    }
  }]);

  return UnderlineRangeStyle;
}(RangeStyle);

var StrikethroughRangeStyle = function (_RangeStyle2) {
  _inherits(StrikethroughRangeStyle, _RangeStyle2);

  function StrikethroughRangeStyle(doc, x, y, height, spacing) {
    _classCallCheck(this, StrikethroughRangeStyle);

    var _this7 = _possibleConstructorReturn(this, (StrikethroughRangeStyle.__proto__ || Object.getPrototypeOf(StrikethroughRangeStyle)).call(this, doc, x, y, height, spacing));

    _this7.ascent = 0;
    _this7.lineThickness = 0;
    _this7.color = null;
    return _this7;
  }

  _createClass(StrikethroughRangeStyle, [{
    key: '_active',
    value: function _active(textChunk) {
      return textChunk.decoration & STRIKETHROUGH_FLAG;
    }
  }, {
    key: '_start',
    value: function _start(textChunk) {
      this.ascent = textChunk.font.ascent(textChunk.fontSize);
      this.lineThickness = textChunk.font.underlineThickness(textChunk.fontSize);
      this.color = textChunk.color;
    }
  }, {
    key: '_applyStyle',
    value: function _applyStyle(textChunk) {
      var y = this.y + this.ascent * .35;
      return ops.w(this.lineThickness) // line width
      + ops.SC.apply(ops, _toConsumableArray(this.color)) // stroking color
      + ops.S(this.from, y, 'm', this.from + this.width, y, 'l'); // line
    }
  }]);

  return StrikethroughRangeStyle;
}(RangeStyle);

var LinkRangeStyle = function (_RangeStyle3) {
  _inherits(LinkRangeStyle, _RangeStyle3);

  function LinkRangeStyle(doc, x, y, height, spacing) {
    _classCallCheck(this, LinkRangeStyle);

    var _this8 = _possibleConstructorReturn(this, (LinkRangeStyle.__proto__ || Object.getPrototypeOf(LinkRangeStyle)).call(this, doc, x, y, height, spacing));

    _this8.link = null;
    return _this8;
  }

  _createClass(LinkRangeStyle, [{
    key: 'applyStyle',
    value: function applyStyle(textChunk, isLast, fontStyleChanged) {
      if (this.link && textChunk.link !== this.link) {
        fontStyleChanged = true;
      }
      return RangeStyle.prototype.applyStyle.call(this, textChunk, isLast, fontStyleChanged);
    }
  }, {
    key: '_active',
    value: function _active(textChunk) {
      return textChunk.link !== undefined;
    }
  }, {
    key: '_start',
    value: function _start(textChunk) {
      this.link = textChunk.link;
    }
  }, {
    key: '_applyStyle',
    value: function _applyStyle(textChunk) {
      this.doc._annotations.push(new PDF.Dictionary({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: new PDF.Array([this.from, this.y, this.from + this.width, this.y + this.height]),
        Border: new PDF.Array([0, 0, 0]),
        A: new PDF.Dictionary({
          Type: 'Action',
          S: 'URI',
          URI: new PDF.String(this.link)
        })
      }));
      return '';
    }
  }]);

  return LinkRangeStyle;
}(RangeStyle);

var DestinationRangeStyle = function (_RangeStyle4) {
  _inherits(DestinationRangeStyle, _RangeStyle4);

  function DestinationRangeStyle(doc, x, y, height, spacing) {
    _classCallCheck(this, DestinationRangeStyle);

    var _this9 = _possibleConstructorReturn(this, (DestinationRangeStyle.__proto__ || Object.getPrototypeOf(DestinationRangeStyle)).call(this, doc, x, y, height, spacing));

    _this9.destination = null;
    return _this9;
  }

  _createClass(DestinationRangeStyle, [{
    key: 'applyStyle',
    value: function applyStyle(textChunk, isLast, fontStyleChanged) {
      if (this.destination && textChunk.destination !== this.destination) {
        fontStyleChanged = true;
      }
      return RangeStyle.prototype.applyStyle.call(this, textChunk, isLast, fontStyleChanged);
    }
  }, {
    key: '_active',
    value: function _active(textChunk) {
      return textChunk.destination !== undefined;
    }
  }, {
    key: '_start',
    value: function _start(textChunk) {
      this.destination = textChunk.destination;
    }
  }, {
    key: '_applyStyle',
    value: function _applyStyle(textChunk) {
      this.doc._destinations.set(this.destination, new PDF.Array([this.doc._currentPage.toReference(), new PDF.Name('XYZ'), this.from, this.y, null]));
      return '';
    }
  }]);

  return DestinationRangeStyle;
}(RangeStyle);

var GoToRangeStyle = function (_RangeStyle5) {
  _inherits(GoToRangeStyle, _RangeStyle5);

  function GoToRangeStyle(doc, x, y, height, spacing) {
    _classCallCheck(this, GoToRangeStyle);

    var _this10 = _possibleConstructorReturn(this, (GoToRangeStyle.__proto__ || Object.getPrototypeOf(GoToRangeStyle)).call(this, doc, x, y, height, spacing));

    _this10.goTo = null;
    return _this10;
  }

  _createClass(GoToRangeStyle, [{
    key: 'applyStyle',
    value: function applyStyle(textChunk, isLast, fontStyleChanged) {
      if (this.goTo && textChunk.goTo !== this.goTo) {
        fontStyleChanged = true;
      }
      return RangeStyle.prototype.applyStyle.call(this, textChunk, isLast, fontStyleChanged);
    }
  }, {
    key: '_active',
    value: function _active(textChunk) {
      return textChunk.goTo !== undefined;
    }
  }, {
    key: '_start',
    value: function _start(textChunk) {
      this.goTo = textChunk.goTo;
    }
  }, {
    key: '_applyStyle',
    value: function _applyStyle(textChunk) {
      this.doc._annotations.push(new PDF.Dictionary({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: new PDF.Array([this.from, this.y, this.from + this.width, this.y + this.height]),
        Border: new PDF.Array([0, 0, 0]),
        A: new PDF.Dictionary({
          S: 'GoTo',
          D: new PDF.String(this.goTo)
        })
      }));
      return '';
    }
  }]);

  return GoToRangeStyle;
}(RangeStyle);

Text.DestinationRangeStyle = DestinationRangeStyle;