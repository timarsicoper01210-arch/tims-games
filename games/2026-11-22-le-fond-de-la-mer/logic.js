(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Differences = factory();
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

  function shuffle(list, rand) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }

  function buildBoards(symbols, seed, cells, diffs) {
    if (!symbols || symbols.length < 2) throw new Error('buildBoards needs at least 2 symbols');
    if (diffs > cells) throw new Error('buildBoards needs diffs <= cells');
    var rand = rng(String(seed));
    var pool = [];
    while (pool.length < cells) pool = pool.concat(symbols);
    var a = shuffle(pool, rand).slice(0, cells);
    var b = a.slice();
    var picked = shuffle(a.map(function (_, i) { return i; }), rand).slice(0, diffs);
    picked.sort(function (x, y) { return x - y; });
    picked.forEach(function (i) {
      var others = symbols.filter(function (s) { return s !== a[i]; });
      b[i] = others[Math.floor(rand() * others.length)];
    });
    return { a: a, b: b, diff: picked };
  }

  function createGame(diff) {
    var found = {};
    var count = 0;
    return {
      tap: function (i) {
        if (found[i]) return 'already';
        if (diff.indexOf(i) === -1) return 'miss';
        found[i] = true;
        count += 1;
        return 'found';
      },
      isFound: function (i) { return Boolean(found[i]); },
      foundCount: function () { return count; },
      isComplete: function () { return count === diff.length; },
    };
  }

  return { buildBoards: buildBoards, createGame: createGame };
});
