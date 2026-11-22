(function () {
  var CELLS = 12, DIFFS = 4;
  var boards, game, cells, status;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function buildGrid(values, interactive) {
    var grid = el('div', 'df-grid');
    var nodes = values.map(function (v, i) {
      var c = el(interactive ? 'button' : 'div', 'df-cell', v);
      if (interactive) {
        c.type = 'button';
        c.setAttribute('aria-label', 'Case ' + (i + 1));
        c.onclick = function () { tap(i); };
      }
      grid.appendChild(c);
      return c;
    });
    return { grid: grid, nodes: nodes };
  }

  function refresh() {
    status.textContent = 'Différences : ' + game.foundCount() + ' / ' + boards.diff.length;
  }

  function tap(i) {
    var r = game.tap(i);
    if (r === 'found') {
      cells[i].classList.remove('df-peek');
      cells[i].classList.add('df-ok');
      refresh();
      if (game.isComplete()) GF.finish({ found: game.foundCount(), total: boards.diff.length });
    } else if (r === 'miss') {
      cells[i].classList.add('df-bad');
      setTimeout(function () { cells[i].classList.remove('df-bad'); }, 400);
    }
  }

  GF.start(function (content, root) {
    boards = Differences.buildBoards(content.symboles, content.date + content.title, CELLS, DIFFS);
    game = Differences.createGame(boards.diff);
    var modele = buildGrid(boards.a, false);
    var copie = buildGrid(boards.b, true);
    cells = copie.nodes;
    status = el('p', 'df-status');
    var hint = el('button', 'gf-link', '💡 Montrer une différence');
    hint.onclick = function () {
      var next = boards.diff.filter(function (k) { return !game.isFound(k); })[0];
      if (next === undefined || !GF.requestHint()) return;
      cells[next].classList.add('df-peek');
      setTimeout(function () { cells[next].classList.remove('df-peek'); }, 1200);
    };
    root.append(
      el('p', 'df-label', 'Modèle'), modele.grid,
      el('p', 'df-label', 'Copie — touche les cases qui ont changé'), copie.grid,
      status, hint
    );
    refresh();
  });

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      for (var n = 0; n < boards.diff.length; n++) {
        if (n === boards.diff.length - 1 && o && o.beforeFinalMove) {
          try { await o.beforeFinalMove(); } catch (e) {}
        }
        cells[boards.diff[n]].click();
        await GF.sleep(d);
      }
    },
  };
})();
