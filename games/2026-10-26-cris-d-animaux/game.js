(function () {
  var game, leftButtons, rightButtons, total, busy = false, selectedBtn = null;

  GF.start(function (content, root) {
    var board = Relie.buildBoard(content.pairs, content.date + content.title);
    total = content.pairs.length;
    game = Relie.createGame(total);
    leftButtons = {};
    rightButtons = {};

    var wrap = document.createElement('div');
    wrap.className = 'rl-board';
    var colLeft = document.createElement('div');
    colLeft.className = 'rl-col';
    var colRight = document.createElement('div');
    colRight.className = 'rl-col';

    board.left.forEach(function (item) {
      var b = document.createElement('button');
      b.className = 'rl-item';
      b.textContent = item.value;
      b.onclick = function () { tap('left', item.pairIndex, b); };
      leftButtons[item.pairIndex] = b;
      colLeft.appendChild(b);
    });
    board.right.forEach(function (item) {
      var b = document.createElement('button');
      b.className = 'rl-item';
      b.textContent = item.value;
      b.onclick = function () { tap('right', item.pairIndex, b); };
      rightButtons[item.pairIndex] = b;
      colRight.appendChild(b);
    });

    wrap.append(colLeft, colRight);

    var hint = document.createElement('button');
    hint.className = 'gf-link';
    hint.textContent = '💡 Montrer une paire';
    hint.onclick = function () {
      var pi = Object.keys(leftButtons).map(Number).find(function (k) { return !leftButtons[k].classList.contains('done'); });
      if (pi === undefined || !GF.requestHint()) return;
      leftButtons[pi].classList.add('peek');
      rightButtons[pi].classList.add('peek');
      setTimeout(function () {
        leftButtons[pi].classList.remove('peek');
        rightButtons[pi].classList.remove('peek');
      }, 1200);
    };

    root.append(wrap, hint);
  });

  function tap(side, pairIndex, btn) {
    if (busy) return;
    var r = game.select(side, pairIndex);
    if (r.result === 'ignored') return;
    if (r.result === 'deselect') { btn.classList.remove('sel'); selectedBtn = null; return; }
    if (r.result === 'first') {
      if (selectedBtn) selectedBtn.classList.remove('sel');
      btn.classList.add('sel');
      selectedBtn = btn;
      return;
    }
    if (selectedBtn) selectedBtn.classList.remove('sel');
    selectedBtn = null;
    if (r.result === 'match') {
      btn.classList.add('done');
      var other = (r.otherSide === 'left' ? leftButtons : rightButtons)[r.otherPairIndex];
      other.classList.add('done');
      if (game.isComplete()) GF.finish({ found: game.pairsFound(), total: total });
    } else if (r.result === 'miss') {
      var otherM = (r.otherSide === 'left' ? leftButtons : rightButtons)[r.otherPairIndex];
      btn.classList.add('wrong');
      otherM.classList.add('wrong');
      busy = true;
      setTimeout(function () {
        btn.classList.remove('wrong');
        otherM.classList.remove('wrong');
        busy = false;
      }, 700);
    }
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      var order = Object.keys(leftButtons).map(Number);
      for (var k = 0; k < order.length; k++) {
        var pi = order[k];
        if (k === order.length - 1 && o && o.beforeFinalMove) { try { await o.beforeFinalMove(); } catch (e) {} }
        leftButtons[pi].click();
        await GF.sleep(d);
        rightButtons[pi].click();
        await GF.sleep(d);
      }
    },
  };
})();
