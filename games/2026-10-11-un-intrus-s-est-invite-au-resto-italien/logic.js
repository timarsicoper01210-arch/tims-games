(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OddOneOut = factory();
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

  function buildRounds(rounds, seed) {
    var rand = rng(String(seed));
    return rounds.map(function (round) {
      var cells = round.others.map(function (value) { return { value: value, odd: false }; });
      cells.push({ value: round.odd, odd: true });
      for (var i = cells.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var tmp = cells[i]; cells[i] = cells[j]; cells[j] = tmp;
      }
      return {
        rule: round.rule,
        cells: cells.map(function (c) { return c.value; }),
        oddIndex: cells.findIndex(function (c) { return c.odd; }),
      };
    });
  }

  function createGame(rounds) {
    var current = 0;
    var solved = 0;
    var mistakes = 0;
    return {
      tap: function (i) {
        if (current >= rounds.length) return { result: 'ignored' };
        if (i !== rounds[current].oddIndex) { mistakes += 1; return { result: 'wrong' }; }
        var rule = rounds[current].rule;
        current += 1;
        solved += 1;
        return { result: current === rounds.length ? 'done' : 'correct', rule: rule, next: current };
      },
      round: function () { return rounds[current]; },
      current: function () { return current; },
      oddIndex: function () { return current < rounds.length ? rounds[current].oddIndex : -1; },
      isComplete: function () { return solved === rounds.length; },
      solved: function () { return solved; },
      mistakes: function () { return mistakes; },
      total: function () { return rounds.length; },
    };
  }

  return { buildRounds: buildRounds, createGame: createGame };
});
