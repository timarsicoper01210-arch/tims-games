(function () {
  var game, cells = [], grid, stepEl, ruleEl, busy = false;

  GF.start(function (content, root) {
    game = OddOneOut.createGame(OddOneOut.buildRounds(content.rounds, content.date + content.title));

    var hook = document.createElement('p');
    hook.className = 'oo-hook';
    hook.textContent = content.hook;

    stepEl = document.createElement('p');
    stepEl.className = 'oo-step';

    grid = document.createElement('div');
    grid.className = 'oo-grid';

    ruleEl = document.createElement('p');
    ruleEl.className = 'oo-rule';

    var hint = document.createElement('button');
    hint.className = 'gf-link';
    hint.textContent = '💡 Éliminer un élément sûr';
    hint.onclick = function () {
      if (busy || game.isComplete()) return;
      var odd = game.oddIndex();
      var idx = -1;
      for (var i = 0; i < cells.length; i++) {
        if (i !== odd && !cells[i].disabled) { idx = i; break; }
      }
      if (idx === -1 || !GF.requestHint()) return;
      cells[idx].classList.add('out');
      cells[idx].disabled = true;
    };

    root.append(hook, stepEl, grid, ruleEl, hint);
    renderRound();
  });

  function say(text, miss) {
    ruleEl.textContent = text;
    ruleEl.className = miss ? 'oo-rule miss' : 'oo-rule';
  }

  function renderRound() {
    stepEl.textContent = 'Manche ' + (game.current() + 1) + ' / ' + game.total();
    say('');
    grid.textContent = '';
    cells = game.round().cells.map(function (value, i) {
      var b = document.createElement('button');
      b.className = 'oo-cell';
      b.textContent = value;
      b.onclick = function () { tap(i); };
      grid.appendChild(b);
      return b;
    });
  }

  function tap(i) {
    if (busy) return;
    var r = game.tap(i);
    if (r.result === 'ignored') return;
    if (r.result === 'wrong') {
      cells[i].classList.add('bad');
      cells[i].disabled = true;
      say('Raté : celui-là est bien à sa place.', true);
      return;
    }
    cells[i].classList.add('good');
    say('✅ Les 3 autres : ' + r.rule);
    if (r.result === 'done') {
      GF.finish({ found: game.solved(), total: game.total() });
      return;
    }
    busy = true;
    setTimeout(function () { renderRound(); busy = false; }, 900);
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      var total = game.total();
      for (var r = 0; r < total; r++) {
        for (var w = 0; w < 300 && busy; w++) await GF.sleep(20);
        if (r === total - 1 && o && o.beforeFinalMove) { try { await o.beforeFinalMove(); } catch (e) {} }
        cells[game.oddIndex()].click();
        await GF.sleep(d);
      }
    },
  };
})();
