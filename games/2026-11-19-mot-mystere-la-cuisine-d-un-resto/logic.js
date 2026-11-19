(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MotMystere = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var LIVES = 6;

  function normalize(word) {
    return String(word).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  function createRound(word, lives) {
    var letters = normalize(word).replace(/[^A-Z]/g, '').split('');
    var found = {};
    var tried = {};
    var left = lives === undefined ? LIVES : lives;

    function solved() {
      return letters.every(function (c) { return found[c]; });
    }
    function positionsOf(c) {
      var out = [];
      letters.forEach(function (l, i) { if (l === c) out.push(i); });
      return out;
    }
    function missing() {
      var out = [];
      letters.forEach(function (c) { if (!found[c] && out.indexOf(c) === -1) out.push(c); });
      return out;
    }

    return {
      letters: letters,
      missing: missing,
      isSolved: solved,
      masked: function () {
        return letters.map(function (c) { return found[c] ? c : ''; });
      },
      livesLeft: function () { return left; },
      isLost: function () { return left <= 0 && !solved(); },
      reveal: function () {
        var c = missing()[0];
        if (!c) return null;
        found[c] = true;
        tried[c] = true;
        return c;
      },
      guess: function (letter) {
        var c = normalize(letter);
        if (tried[c] || left <= 0 || solved()) return { result: 'ignored', positions: [] };
        tried[c] = true;
        var positions = positionsOf(c);
        if (positions.length === 0) {
          left -= 1;
          return { result: 'miss', positions: [] };
        }
        found[c] = true;
        return { result: 'hit', positions: positions };
      },
    };
  }

  return { LIVES: LIVES, normalize: normalize, createRound: createRound };
});
