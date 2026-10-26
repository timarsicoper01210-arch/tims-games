(function () {
  var SIZE = 10;
  var model = null;

  GF.start(function (content, root) {
    var gen = WordSearch.generateGrid({ words: content.words, size: SIZE, seed: content.date + content.title, directions: ['H', 'V', 'D'] });
    model = { placements: gen.placements, found: [], start: null, cells: [] };
    root.appendChild(Object.assign(document.createElement('p'), { textContent: 'Touche la 1re puis la dernière lettre d’un mot.' }));
    var gridEl = document.createElement('div');
    gridEl.className = 'ws-grid';
    gridEl.style.gridTemplateColumns = 'repeat(' + SIZE + ',1fr)';
    gen.grid.forEach(function (row, r) {
      model.cells[r] = [];
      row.forEach(function (letter, c) {
        var b = document.createElement('button');
        b.className = 'ws-cell';
        b.textContent = letter;
        b.dataset.r = r;
        b.dataset.c = c;
        b.onclick = function () { tap(r, c); };
        model.cells[r][c] = b;
        gridEl.appendChild(b);
      });
    });
    root.appendChild(gridEl);
    var list = document.createElement('div');
    list.className = 'ws-words';
    model.placements.forEach(function (p) {
      var w = document.createElement('span');
      w.className = 'ws-word';
      w.textContent = p.word;
      w.id = 'ws-word-' + p.word;
      list.appendChild(w);
    });
    root.appendChild(list);
    var hint = document.createElement('button');
    hint.className = 'gf-link';
    hint.textContent = '💡 Indice';
    hint.onclick = function () {
      var next = model.placements.find(function (p) { return model.found.indexOf(p.word) === -1; });
      if (next && GF.requestHint()) model.cells[next.path[0].row][next.path[0].col].classList.add('hint');
    };
    root.appendChild(hint);
  });

  function tap(r, c) {
    if (!model.start) {
      model.start = { row: r, col: c };
      model.cells[r][c].classList.add('start');
      return;
    }
    var start = model.start;
    model.start = null;
    model.cells[start.row][start.col].classList.remove('start');
    var word = WordSearch.checkSelection(model.placements, [start, { row: r, col: c }]);
    if (!word || model.found.indexOf(word) !== -1) return;
    model.found.push(word);
    var placement = model.placements.find(function (p) { return p.word === word; });
    placement.path.forEach(function (p) { model.cells[p.row][p.col].classList.add('found'); });
    document.getElementById('ws-word-' + word).classList.add('done');
    if (WordSearch.isComplete(model.found, model.placements)) GF.finish({ found: model.found.length, total: model.placements.length });
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      for (var i = 0; i < model.placements.length; i++) {
        var p = model.placements[i];
        var a = p.path[0];
        var b = p.path[p.path.length - 1];
        if (i === model.placements.length - 1 && o && o.beforeFinalMove) { try { await o.beforeFinalMove(); } catch (e) {} }
        model.cells[a.row][a.col].click();
        await GF.sleep(d);
        model.cells[b.row][b.col].click();
        await GF.sleep(d);
      }
    },
  };
})();
