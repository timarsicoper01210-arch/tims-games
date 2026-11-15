(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Taquin = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var SIZE = 3;
  var HOLE = SIZE * SIZE - 1;
  var STEPS = 18;

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

  function neighbors(i) {
    var r = Math.floor(i / SIZE), c = i % SIZE, out = [];
    if (r > 0) out.push(i - SIZE);
    if (r < SIZE - 1) out.push(i + SIZE);
    if (c > 0) out.push(i - 1);
    if (c < SIZE - 1) out.push(i + 1);
    return out;
  }

  function goal(tiles) { return tiles.concat([null]); }

  function solved(board, tiles) {
    if (board[HOLE] !== null) return false;
    for (var i = 0; i < tiles.length; i++) if (board[i] !== tiles[i]) return false;
    return true;
  }

  function placed(board, tiles) {
    var n = 0;
    for (var i = 0; i < tiles.length; i++) if (board[i] === tiles[i]) n += 1;
    return n;
  }

  function walk(tiles, seed, steps) {
    var rand = rng(String(seed));
    var board = goal(tiles);
    var hole = HOLE, prev = -1, moves = [];
    for (var s = 0; s < steps; s++) {
      var opts = neighbors(hole).filter(function (j) { return j !== prev; });
      var j = opts[Math.floor(rand() * opts.length)];
      board[hole] = board[j];
      board[j] = null;
      prev = hole;
      hole = j;
      moves.push(j);
    }
    return { board: board, moves: moves };
  }

  function scramble(tiles, seed, steps) {
    var n = steps === undefined ? STEPS : steps;
    var out;
    for (var k = 0; k < 6; k++) {
      out = walk(tiles, String(seed) + k, n);
      if (!solved(out.board, tiles)) break;
    }
    return out;
  }

  // undoing move t means tapping the cell the hole came from, i.e. moves[t - 1]
  function solutionClicks(moves) {
    if (!moves.length) return [];
    return moves.slice(0, -1).reverse().concat([HOLE]);
  }

  function createGame(tiles, board) {
    var b = board.slice();
    return {
      board: function () { return b.slice(); },
      slide: function (i) {
        if (b[i] === null || b[i] === undefined) return { result: 'ignored' };
        var hole = b.indexOf(null);
        if (neighbors(hole).indexOf(i) === -1) return { result: 'ignored' };
        b[hole] = b[i];
        b[i] = null;
        return { result: 'moved', hole: hole };
      },
      isSolved: function () { return solved(b, tiles); },
      placed: function () { return placed(b, tiles); },
    };
  }

  return { HOLE: HOLE, neighbors: neighbors, goal: goal, scramble: scramble, solutionClicks: solutionClicks, createGame: createGame };
});
