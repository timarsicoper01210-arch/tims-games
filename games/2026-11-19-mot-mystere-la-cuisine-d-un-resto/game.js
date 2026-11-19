(function () {
  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var words, idx = 0, kept = 0, round, busy = false;
  var clueEl, progressEl, slotsEl, slotEls = [], keyBtns = {}, lifeEls = [];

  GF.start(function (content, root) {
    words = content.words;

    progressEl = document.createElement('span');
    var lives = document.createElement('span');
    lives.className = 'mw-lives';
    lifeEls = [];
    for (var i = 0; i < MotMystere.LIVES; i++) {
      var h = document.createElement('span');
      h.className = 'mw-life';
      h.textContent = '\u2665';
      lives.appendChild(h);
      lifeEls.push(h);
    }
    var top = document.createElement('div');
    top.className = 'mw-top';
    top.append(progressEl, lives);

    clueEl = document.createElement('p');
    clueEl.className = 'mw-clue';

    slotsEl = document.createElement('div');
    slotsEl.className = 'mw-slots';

    var keys = document.createElement('div');
    keys.className = 'mw-keys';
    ALPHABET.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'mw-key';
      b.textContent = c;
      b.onclick = function () { press(c); };
      keys.appendChild(b);
      keyBtns[c] = b;
    });

    var hint = document.createElement('button');
    hint.className = 'gf-link';
    hint.textContent = '\uD83D\uDCA1 Offrir une lettre';
    hint.onclick = function () {
      if (busy || !round.missing().length || !GF.requestHint()) return;
      var c = round.reveal();
      keyBtns[c].disabled = true;
      keyBtns[c].classList.add('ok');
      paintSlots();
      settle();
    };

    root.append(top, clueEl, slotsEl, keys, hint);
    renderRound();
  });

  function renderRound() {
    round = MotMystere.createRound(words[idx].word);
    progressEl.textContent = 'Mot ' + (idx + 1) + ' / ' + words.length;
    clueEl.textContent = words[idx].hint;
    slotsEl.textContent = '';
    slotEls = round.letters.map(function () {
      var s = document.createElement('span');
      s.className = 'mw-slot';
      slotsEl.appendChild(s);
      return s;
    });
    ALPHABET.forEach(function (c) {
      keyBtns[c].disabled = false;
      keyBtns[c].className = 'mw-key';
    });
    paintLives();
  }

  function paintSlots() {
    var masked = round.masked();
    slotEls.forEach(function (el, i) { el.textContent = masked[i]; });
  }

  function paintLives() {
    var left = round.livesLeft();
    lifeEls.forEach(function (el, i) { el.className = i < left ? 'mw-life' : 'mw-life off'; });
  }

  function press(letter) {
    if (busy) return;
    var r = round.guess(letter);
    if (r.result === 'ignored') return;
    keyBtns[letter].disabled = true;
    keyBtns[letter].classList.add(r.result === 'hit' ? 'ok' : 'ko');
    if (r.result === 'hit') paintSlots();
    else paintLives();
    settle();
  }

  function settle() {
    if (round.isSolved()) next(true);
    else if (round.isLost()) next(false);
  }

  function next(won) {
    if (won) kept += 1;
    if (idx === words.length - 1 && won) {
      GF.finish({ found: kept, total: words.length });
      return;
    }
    busy = true;
    if (!won) {
      round.letters.forEach(function (c, i) {
        if (!slotEls[i].textContent) {
          slotEls[i].textContent = c;
          slotEls[i].classList.add('ko');
        }
      });
    }
    setTimeout(function () {
      busy = false;
      idx += 1;
      if (idx >= words.length) GF.finish({ found: kept, total: words.length });
      else renderRound();
    }, won ? 500 : 1400);
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      for (var w = 0; w < words.length; w++) {
        var need = round.missing();
        for (var i = 0; i < need.length; i++) {
          if (w === words.length - 1 && i === need.length - 1 && o && o.beforeFinalMove) {
            try { await o.beforeFinalMove(); } catch (e) {}
          }
          keyBtns[need[i]].click();
          await GF.sleep(d);
        }
        if (w < words.length - 1) await GF.sleep(Math.max(d, 700));
      }
    },
  };
})();
