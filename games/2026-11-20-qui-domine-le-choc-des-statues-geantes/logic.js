(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Duel = factory();
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

  function buildChain(items, seed) {
    var rand = rng(String(seed));
    var out = items.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  function createGame(chain) {
    var i = 0, score = 0;
    var last = chain.length - 1;
    function over() { return i >= last; }
    function answer() { return chain[i + 1].value > chain[i].value ? 'plus' : 'moins'; }
    return {
      total: function () { return last; },
      round: function () { return Math.min(i + 1, last); },
      score: function () { return score; },
      current: function () { return chain[i]; },
      next: function () { return chain[i + 1]; },
      answer: answer,
      isOver: over,
      guess: function (choice) {
        if (over()) return null;
        // ex aequo : les deux réponses sont acceptées
        var correct = chain[i + 1].value === chain[i].value || choice === answer();
        if (correct) score += 1;
        i += 1;
        return { correct: correct, over: over() };
      },
    };
  }

  return { buildChain: buildChain, createGame: createGame };
});
