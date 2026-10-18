(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Relie = factory();
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

  function shuffle(arr, rand) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
  }

  function buildBoard(pairs, seed) {
    var rand = rng(String(seed));
    var left = pairs.map(function (p, i) { return { pairIndex: i, value: p.left }; });
    var right = pairs.map(function (p, i) { return { pairIndex: i, value: p.right }; });
    shuffle(left, rand);
    shuffle(right, rand);
    return { left: left, right: right };
  }

  function createGame(size) {
    var matched = {};
    var selected = null;
    var found = 0;
    return {
      select: function (side, pairIndex) {
        if (matched[pairIndex]) return { result: 'ignored' };
        if (selected === null) { selected = { side: side, pairIndex: pairIndex }; return { result: 'first' }; }
        if (selected.side === side) {
          if (selected.pairIndex === pairIndex) { selected = null; return { result: 'deselect' }; }
          selected = { side: side, pairIndex: pairIndex };
          return { result: 'first' };
        }
        var prev = selected;
        selected = null;
        if (prev.pairIndex === pairIndex) {
          matched[pairIndex] = true;
          found += 1;
          return { result: 'match', otherSide: prev.side, otherPairIndex: prev.pairIndex };
        }
        return { result: 'miss', otherSide: prev.side, otherPairIndex: prev.pairIndex };
      },
      isComplete: function () { return found === size; },
      pairsFound: function () { return found; },
    };
  }

  return { buildBoard: buildBoard, createGame: createGame };
});
