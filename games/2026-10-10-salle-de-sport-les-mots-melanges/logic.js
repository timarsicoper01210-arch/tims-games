(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Scramble = factory();
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

  function shuffleWord(word, seed) {
    var letters = word.split('');
    if (new Set(letters).size < 2) return letters;
    var rand = rng(String(seed) + word);
    var out = letters.slice();
    while (out.join('') === word) {
      for (var i = out.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
      }
    }
    return out;
  }

  function botTapOrder(word, tiles) {
    var used = {};
    return word.split('').map(function (ch) {
      for (var i = 0; i < tiles.length; i++) {
        if (!used[i] && tiles[i] === ch) { used[i] = true; return i; }
      }
      throw new Error('letter ' + ch + ' missing from tiles');
    });
  }

  return { shuffleWord: shuffleWord, botTapOrder: botTapOrder };
});
