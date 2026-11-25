(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CodeSecret = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function rng(seedStr) {
    var h = 0;
    for (var i = 0; i < seedStr.length; i++) h = (Math.imul(31, h) + seedStr.charCodeAt(i)) | 0;
    var t = h >>> 0;
    return function () {
      t = (t + 0x6d2b79f5) | 0;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeCode(symbols, seed, length) {
    var rand = rng(String(seed));
    var pool = symbols.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    return pool.slice(0, Math.min(length, pool.length));
  }

  // code et essai sont toujours des symboles distincts : un simple indexOf suffit
  function score(code, guess) {
    var exact = 0, present = 0;
    for (var i = 0; i < code.length; i++) {
      if (guess[i] === code[i]) exact += 1;
      else if (code.indexOf(guess[i]) !== -1) present += 1;
    }
    return { exact: exact, present: present };
  }

  function createGame(code) {
    var tries = 0;
    var won = false;
    return {
      submit: function (guess) {
        if (won || !Array.isArray(guess) || guess.length !== code.length) return { result: 'ignored' };
        tries += 1;
        var s = score(code, guess);
        won = s.exact === code.length;
        return { result: 'scored', exact: s.exact, present: s.present, win: won, tries: tries };
      },
      tries: function () { return tries; },
      isComplete: function () { return won; },
    };
  }

  return { makeCode: makeCode, score: score, createGame: createGame };
});
