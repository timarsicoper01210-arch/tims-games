(function () {
  var deck, game, buttons, busy = false;

  GF.start(function (content, root) {
    deck = Ranking.buildDeck(content.items, content.date + content.title);
    game = Ranking.createGame(deck);

    var hookEl = document.createElement('p');
    hookEl.className = 'rk-hook';
    hookEl.textContent = content.hook;

    var list = document.createElement('div');
    list.className = 'rk-list';
    buttons = deck.map(function (card, i) {
      var b = document.createElement('button');
      b.className = 'rk-item';
      var badge = document.createElement('span');
      badge.className = 'rk-badge';
      var label = document.createElement('span');
      label.textContent = card.value;
      b.append(badge, label);
      b.onclick = function () { tap(i); };
      list.appendChild(b);
      return b;
    });

    var hint = document.createElement('button');
    hint.className = 'gf-link';
    hint.textContent = '💡 Montrer le prochain';
    hint.onclick = function () {
      if (game.isComplete() || !GF.requestHint()) return;
      var idx = deck.findIndex(function (c) { return c.id === game.nextId(); });
      buttons[idx].classList.add('peek');
      setTimeout(function () { buttons[idx].classList.remove('peek'); }, 1200);
    };

    root.append(hookEl, list, hint);
  });

  function tap(i) {
    if (busy) return;
    var r = game.tap(i);
    if (r.result === 'ignored') return;
    if (r.result === 'wrong') {
      buttons[i].classList.add('wrong');
      busy = true;
      setTimeout(function () {
        buttons[i].classList.remove('wrong');
        busy = false;
      }, 400);
      return;
    }
    buttons[i].classList.add('done');
    buttons[i].querySelector('.rk-badge').textContent = String(r.rank);
    if (r.result === 'done') GF.finish({ found: game.rankFound(), total: deck.length });
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      for (var id = 0; id < deck.length; id++) {
        var idx = deck.findIndex(function (c) { return c.id === id; });
        if (id === deck.length - 1 && o && o.beforeFinalMove) { try { await o.beforeFinalMove(); } catch (e) {} }
        buttons[idx].click();
        await GF.sleep(d);
      }
    },
  };
})();
