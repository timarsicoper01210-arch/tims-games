(function () {
  var items, game, cardEl, progressEl, btnA, btnB;

  GF.start(function (content, root) {
    items = Tri.shuffle(content.items, content.date + content.title);
    game = Tri.createGame(items);

    var wrap = document.createElement('div');
    wrap.className = 'tr-wrap';

    progressEl = document.createElement('div');
    progressEl.className = 'tr-progress';

    cardEl = document.createElement('div');
    cardEl.className = 'tr-card';

    var buttons = document.createElement('div');
    buttons.className = 'tr-buttons';
    btnA = document.createElement('button');
    btnA.className = 'tr-btn';
    btnA.textContent = content.categoryA;
    btnA.onclick = function () { choose('A'); };
    btnB = document.createElement('button');
    btnB.className = 'tr-btn';
    btnB.textContent = content.categoryB;
    btnB.onclick = function () { choose('B'); };
    buttons.append(btnA, btnB);

    var hint = document.createElement('button');
    hint.className = 'gf-link';
    hint.textContent = '💡 Indice';
    hint.onclick = function () {
      if (!GF.requestHint()) return;
      var btn = game.current().side === 'A' ? btnA : btnB;
      btn.classList.add('flash');
      setTimeout(function () { btn.classList.remove('flash'); }, 900);
    };

    wrap.append(progressEl, cardEl, buttons, hint);
    root.append(wrap);
    render();
  });

  function render() {
    if (game.isComplete()) return;
    progressEl.textContent = game.found() + ' / ' + game.total();
    cardEl.textContent = game.current().label;
    cardEl.classList.remove('correct', 'wrong');
  }

  function choose(side) {
    if (game.isComplete()) return;
    var r = game.choose(side);
    if (r.result === 'correct') {
      cardEl.classList.add('correct');
      if (game.isComplete()) {
        progressEl.textContent = game.found() + ' / ' + game.total();
        GF.finish({ found: game.found(), total: game.total() });
        return;
      }
      setTimeout(render, 200);
    } else {
      cardEl.classList.add('wrong');
      setTimeout(function () { cardEl.classList.remove('wrong'); }, 300);
    }
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      while (!game.isComplete()) {
        var isLast = game.found() === game.total() - 1;
        if (isLast && o && o.beforeFinalMove) { try { await o.beforeFinalMove(); } catch (e) {} }
        var side = game.current().side;
        (side === 'A' ? btnA : btnB).click();
        await GF.sleep(d);
      }
    },
  };
})();
