(function () {
  var tiles, game, moves, cells = [], movesCount = 0, statsEl;

  GF.start(function (content, root) {
    tiles = content.tiles;
    var start = Taquin.scramble(tiles, String(content.date) + content.title);
    moves = start.moves;
    game = Taquin.createGame(tiles, start.board);

    var label = document.createElement('p');
    label.className = 'tq-label';
    label.textContent = 'Modèle à reconstituer';

    var model = document.createElement('div');
    model.className = 'tq-model';
    Taquin.goal(tiles).forEach(function (v) {
      var s = document.createElement('span');
      s.textContent = v || '';
      model.appendChild(s);
    });

    statsEl = document.createElement('p');
    statsEl.className = 'tq-stats';

    var grid = document.createElement('div');
    grid.className = 'tq-grid';
    cells = Taquin.goal(tiles).map(function (v, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tq-cell';
      b.onclick = function () { tap(i); };
      grid.appendChild(b);
      return b;
    });

    var hint = document.createElement('button');
    hint.className = 'gf-link';
    hint.textContent = '💡 Montrer les pièces bien placées';
    hint.onclick = function () {
      if (game.isSolved() || !GF.requestHint()) return;
      var board = game.board();
      var good = [];
      tiles.forEach(function (t, i) { if (board[i] === t) good.push(i); });
      good.forEach(function (i) { cells[i].classList.add('ok'); });
      setTimeout(function () {
        good.forEach(function (i) { cells[i].classList.remove('ok'); });
      }, 1200);
    };

    root.append(label, model, statsEl, grid, hint);
    paint();
  });

  function paint() {
    var board = game.board();
    cells.forEach(function (cell, i) {
      var v = board[i];
      cell.textContent = v || '';
      cell.className = v ? 'tq-cell' : 'tq-cell hole';
      if (v) cell.removeAttribute('aria-label');
      else cell.setAttribute('aria-label', 'case vide');
    });
    statsEl.textContent = 'Coups : ' + movesCount + ' · Pièces en place : ' + game.placed() + ' / ' + tiles.length;
  }

  function tap(i) {
    if (game.isSolved()) return;
    if (game.slide(i).result !== 'moved') return;
    movesCount += 1;
    paint();
    if (game.isSolved()) GF.finish({ found: game.placed(), total: tiles.length });
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      var path = Taquin.solutionClicks(moves);
      for (var i = 0; i < path.length; i++) {
        if (i === path.length - 1 && o && o.beforeFinalMove) {
          try { await o.beforeFinalMove(); } catch (e) {}
        }
        cells[path[i]].click();
        await GF.sleep(d);
      }
    },
  };
})();
