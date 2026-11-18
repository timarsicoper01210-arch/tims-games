(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Echo = factory();
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

  // two tiles minimum, otherwise the no-immediate-repeat draw below never ends
  function buildRounds(count, seed, maxLen) {
    if (!(count >= 2)) throw new Error('echo needs at least 2 items');
    var rand = rng(String(seed));
    var master = [];
    while (master.length < maxLen) {
      var i = Math.floor(rand() * count);
      if (master.length && master[master.length - 1] === i) continue;
      master.push(i);
    }
    var rounds = [];
    for (var len = 2; len <= maxLen; len++) rounds.push(master.slice(0, len));
    return rounds;
  }

  function createGame(rounds) {
    var r = 0, pos = 0, errors = 0;
    return {
      current: function () { return rounds[r] || []; },
      roundIndex: function () { return r; },
      total: function () { return rounds.length; },
      errors: function () { return errors; },
      press: function (i) {
        var seq = rounds[r];
        if (!seq) return { result: 'win' };
        if (seq[pos] !== i) { pos = 0; errors += 1; return { result: 'wrong' }; }
        pos += 1;
        if (pos < seq.length) return { result: 'ok' };
        pos = 0;
        r += 1;
        return { result: r >= rounds.length ? 'win' : 'round' };
      },
    };
  }

  return { buildRounds: buildRounds, createGame: createGame };
});
