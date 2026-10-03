(function () {
  var deck, game, cards, busy = false;

  GF.start(function (content, root) {
    deck = Memory.buildDeck(content.pairs, content.date + content.title);
    game = Memory.createGame(deck);
    var grid = document.createElement('div');
    grid.className = 'mm-grid';
    cards = deck.map(function (c, i) {
      var b = document.createElement('button');
      b.className = 'mm-card';
      b.textContent = c.value;
      b.onclick = function () { flip(i); };
      grid.appendChild(b);
      return b;
    });
    var hint = document.createElement('button');
    hint.className = 'gf-link';
    hint.textContent = '💡 Montrer une paire';
    hint.onclick = function () {
      var idx = cards.findIndex(function (c) { return !c.classList.contains('done'); });
      if (idx === -1 || !GF.requestHint()) return;
      var twin = deck.findIndex(function (c, j) { return j !== idx && c.value === deck[idx].value; });
      [idx, twin].forEach(function (k) { cards[k].classList.add('peek'); });
      setTimeout(function () { [idx, twin].forEach(function (k) { cards[k].classList.remove('peek'); }); }, 1200);
    };
    root.append(grid, hint);
  });

  function flip(i) {
    if (busy) return;
    var r = game.flip(i);
    if (r.result === 'ignored') return;
    cards[i].classList.add('open');
    if (r.result === 'match') {
      cards[i].classList.add('done');
      cards[r.other].classList.add('done');
      if (game.isComplete()) GF.finish({ found: game.pairsFound(), total: deck.length / 2 });
    } else if (r.result === 'miss') {
      busy = true;
      setTimeout(function () {
        cards[i].classList.remove('open');
        cards[r.other].classList.remove('open');
        busy = false;
      }, 700);
    }
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      var done = {};
      for (var i = 0; i < deck.length; i++) {
        if (done[i]) continue;
        var twin = deck.findIndex(function (c, j) { return j !== i && c.value === deck[i].value; });
        done[i] = done[twin] = true;
        cards[i].click();
        await GF.sleep(d);
        cards[twin].click();
        await GF.sleep(d);
      }
    },
  };
})();
