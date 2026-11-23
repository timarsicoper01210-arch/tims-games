(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Tri = factory();
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

  function shuffle(items, seed) {
    var rand = rng(String(seed));
    var arr = items.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function createGame(items) {
    var idx = 0;
    var found = 0;
    return {
      current: function () { return items[idx]; },
      choose: function (side) {
        if (idx >= items.length) return { result: 'done' };
        if (items[idx].side === side) {
          idx += 1;
          found += 1;
          return { result: 'correct' };
        }
        return { result: 'wrong' };
      },
      isComplete: function () { return idx === items.length; },
      found: function () { return found; },
      total: function () { return items.length; },
    };
  }

  return { shuffle: shuffle, createGame: createGame };
});
