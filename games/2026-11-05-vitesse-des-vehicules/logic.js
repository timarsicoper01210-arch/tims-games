(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Ranking = factory();
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

  function buildDeck(items, seed) {
    var rand = rng(String(seed));
    var deck = items.map(function (value, id) { return { id: id, value: value }; });
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
    }
    return deck;
  }

  function createGame(deck) {
    var next = 0;
    var mistakes = 0;
    return {
      tap: function (i) {
        if (deck[i].id < next) return { result: 'ignored' };
        if (deck[i].id !== next) { mistakes += 1; return { result: 'wrong' }; }
        next += 1;
        return { result: next === deck.length ? 'done' : 'correct', rank: next };
      },
      isComplete: function () { return next === deck.length; },
      rankFound: function () { return next; },
      nextId: function () { return next; },
      mistakes: function () { return mistakes; },
    };
  }

  return { buildDeck: buildDeck, createGame: createGame };
});
