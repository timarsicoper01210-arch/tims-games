(function () {
  var game, tiles, status, armed = false, won = false;
  var FLASH = 380, GAP = 560;

  GF.start(function (content, root) {
    game = Echo.createGame(Echo.buildRounds(content.items.length, content.date + content.title, 5));

    status = document.createElement('p');
    status.className = 'eq-status';

    var grid = document.createElement('div');
    grid.className = 'eq-grid';
    tiles = content.items.map(function (item, i) {
      var b = document.createElement('button');
      b.className = 'eq-tile';
      b.textContent = item;
      b.onclick = function () { press(i); };
      grid.appendChild(b);
      return b;
    });

    var hint = document.createElement('button');
    hint.className = 'gf-link';
    hint.textContent = '💡 Réécouter la suite';
    hint.onclick = function () {
      if (!armed || won || !GF.requestHint()) return;
      playRound();
    };

    root.append(status, grid, hint);
    playRound();
  });

  function label() {
    return 'Manche ' + (game.roundIndex() + 1) + '/' + game.total() + ' · ' + game.current().length + ' symboles';
  }

  function flash(i, ms) {
    tiles[i].classList.add('eq-flash');
    setTimeout(function () { tiles[i].classList.remove('eq-flash'); }, ms);
  }

  function playRound() {
    armed = false;
    status.textContent = 'Regarde bien… ' + label();
    var seq = game.current();
    seq.forEach(function (idx, k) {
      setTimeout(function () { flash(idx, FLASH); }, 300 + k * GAP);
    });
    setTimeout(function () {
      armed = true;
      status.textContent = 'À toi ! ' + label();
    }, 300 + seq.length * GAP);
  }

  function press(i) {
    if (!armed || won) return;
    var r = game.press(i);
    if (r.result === 'wrong') {
      armed = false;
      tiles[i].classList.add('eq-bad');
      setTimeout(function () { tiles[i].classList.remove('eq-bad'); }, 400);
      status.textContent = 'Raté… on réécoute.';
      setTimeout(playRound, 900);
      return;
    }
    flash(i, 200);
    if (r.result === 'round') {
      armed = false;
      status.textContent = 'Parfait ! Manche suivante…';
      setTimeout(playRound, 900);
    } else if (r.result === 'win') {
      armed = false;
      won = true;
      status.textContent = 'Suite complète ! 🎉';
      GF.finish({ found: game.total(), total: game.total() });
    }
  }

  async function waitArmed() {
    for (var i = 0; i < 600; i++) {
      if (won) return false;
      if (armed) return true;
      await GF.sleep(50);
    }
    return false;
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      while (!won) {
        if (!(await waitArmed())) return;
        var seq = game.current().slice();
        for (var k = 0; k < seq.length; k++) {
          var last = game.roundIndex() === game.total() - 1 && k === seq.length - 1;
          if (last && o && o.beforeFinalMove) { try { await o.beforeFinalMove(); } catch (e) {} }
          tiles[seq[k]].click();
          await GF.sleep(d);
        }
      }
    },
  };
})();
