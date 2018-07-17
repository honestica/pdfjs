'use strict';

exports.parse = function (xref, lexer, trial) {
  var isNull = lexer.getString(4) === 'null';

  if (!isNull) {
    if (trial) {
      return undefined;
    }

    throw new Error('Invalid null');
  }

  lexer.shift(4);

  return null;
};