(function () {
  var items, idx = 0, tiles = [], typed = [], tileEls = [], els = {}, busy = false;

  GF.start(function (content, root) {
    items = content.items;
    els.progress = document.createElement('p');
    els.hint = document.createElement('p');
    els.hint.className = 'sc-hint';
    els.answer = document.createElement('div');
    els.answer.className = 'sc-answer';
    els.tiles = document.createElement('div');
    els.tiles.className = 'sc-tiles';
    var help = document.createElement('button');
    help.className = 'gf-link';
    help.textContent = '💡 Révéler la 1re lettre';
    help.onclick = function () {
      if (busy || typed.length > 0 || !GF.requestHint()) return;
      tileEls[Scramble.botTapOrder(items[idx].word, tiles)[0]].click();
    };
    root.append(els.progress, els.hint, els.answer, els.tiles, help);
    show(content.date + content.title);
  });

  function show(seed) {
    var word = items[idx].word;
    tiles = Scramble.shuffleWord(word, seed + idx);
    typed = [];
    els.progress.textContent = 'Mot ' + (idx + 1) + ' / ' + items.length;
    els.hint.textContent = items[idx].hint;
    els.answer.innerHTML = '';
    for (var i = 0; i < word.length; i++) {
      var s = document.createElement('div');
      s.className = 'sc-slot';
      els.answer.appendChild(s);
    }
    els.tiles.innerHTML = '';
    tileEls = tiles.map(function (letter, i) {
      var b = document.createElement('button');
      b.className = 'sc-tile';
      b.textContent = letter;
      b.onclick = function () { tap(i, seed); };
      els.tiles.appendChild(b);
      return b;
    });
  }

  function tap(i, seed) {
    if (busy || tileEls[i].disabled) return;
    tileEls[i].disabled = true;
    typed.push(tiles[i]);
    els.answer.children[typed.length - 1].textContent = tiles[i];
    var word = items[idx].word;
    if (typed.length < word.length) return;
    var ok = typed.join('') === word;
    Array.prototype.forEach.call(els.answer.children, function (s) { s.classList.add(ok ? 'ok' : 'bad'); });
    busy = true;
    setTimeout(function () {
      busy = false;
      if (!ok) return show(seed);
      idx += 1;
      if (idx >= items.length) GF.finish({ found: items.length, total: items.length });
      else show(seed);
    }, 600);
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      var paused = false;
      while (idx < items.length) {
        var current = idx;
        var order = Scramble.botTapOrder(items[idx].word, tiles);
        if (idx === items.length - 1 && !paused && o && o.beforeFinalMove) {
          paused = true;
          try { await o.beforeFinalMove(); } catch (e) {}
        }
        for (var k = 0; k < order.length; k++) {
          tileEls[order[k]].click();
          await GF.sleep(d);
        }
        while (idx === current && window.__gameState !== 'complete') await GF.sleep(100);
      }
    },
  };
})();
