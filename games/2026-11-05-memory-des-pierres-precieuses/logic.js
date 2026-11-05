(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Memory = factory();
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

  function buildDeck(pairs, seed) {
    var rand = rng(String(seed));
    var values = pairs.concat(pairs);
    for (var i = values.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = values[i]; values[i] = values[j]; values[j] = tmp;
    }
    return values.map(function (v, i) { return { id: i, value: v }; });
  }

  function createGame(deck) {
    var matched = {};
    var open = null;
    var found = 0;
    return {
      flip: function (i) {
        if (matched[i] || open === i) return { result: 'ignored' };
        if (open === null) { open = i; return { result: 'first' }; }
        var other = open;
        open = null;
        if (deck[other].value === deck[i].value) {
          matched[i] = matched[other] = true;
          found += 1;
          return { result: 'match', other: other };
        }
        return { result: 'miss', other: other };
      },
      isComplete: function () { return found * 2 === deck.length; },
      pairsFound: function () { return found; },
    };
  }

  return { buildDeck: buildDeck, createGame: createGame };
});
