(function () {
  var LEN = 4;
  var code, game, slots, current = [], palette = {}, verifyBtn, board, statusEl, hintsEl, revealed = 0;

  GF.start(function (content, root) {
    code = CodeSecret.makeCode(content.symbols, String(content.date) + content.title, LEN);
    game = CodeSecret.createGame(code);

    var intro = document.createElement('p');
    intro.className = 'cs-intro';
    intro.textContent = 'Compose un code de ' + LEN + ' symboles différents. Après chaque essai : ✅ = bien placé, 🔁 = dans le code mais ailleurs.';

    board = document.createElement('div');
    board.className = 'cs-board';

    var row = document.createElement('div');
    row.className = 'cs-row cs-current';
    slots = [];
    for (var i = 0; i < LEN; i++) {
      var slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'cs-slot';
      slot.setAttribute('aria-label', 'Case ' + (i + 1));
      slot.onclick = (function (k) { return function () { clearFrom(k); }; })(i);
      row.appendChild(slot);
      slots.push(slot);
    }

    var pal = document.createElement('div');
    pal.className = 'cs-palette';
    content.symbols.forEach(function (sym) {
      var key = document.createElement('button');
      key.type = 'button';
      key.className = 'cs-key';
      key.textContent = sym;
      key.onclick = function () { place(sym); };
      pal.appendChild(key);
      palette[sym] = key;
    });

    verifyBtn = document.createElement('button');
    verifyBtn.type = 'button';
    verifyBtn.className = 'cs-verify';
    verifyBtn.textContent = 'Vérifier';
    verifyBtn.disabled = true;
    verifyBtn.onclick = submit;

    statusEl = document.createElement('p');
    statusEl.className = 'cs-status';
    statusEl.textContent = 'Essai 1';

    hintsEl = document.createElement('p');
    hintsEl.className = 'cs-hints';

    var hint = document.createElement('button');
    hint.type = 'button';
    hint.className = 'gf-link';
    hint.textContent = '💡 Révéler une case';
    hint.onclick = function () {
      // un indice de moins que la longueur du code : il ne doit jamais tout donner
      if (revealed >= LEN - 1 || game.isComplete() || !GF.requestHint()) return;
      revealed += 1;
      hintsEl.textContent += (hintsEl.textContent ? '   ' : 'Indices : ') + 'case ' + revealed + ' = ' + code[revealed - 1];
    };

    root.append(intro, board, row, pal, verifyBtn, statusEl, hintsEl, hint);
  });

  function place(sym) {
    if (game.isComplete() || current.length >= LEN || current.indexOf(sym) !== -1) return;
    current.push(sym);
    draw();
  }

  function clearFrom(k) {
    if (game.isComplete() || k >= current.length) return;
    current = current.slice(0, k);
    draw();
  }

  function draw() {
    for (var i = 0; i < LEN; i++) {
      slots[i].textContent = current[i] || '';
      slots[i].classList.toggle('filled', i < current.length);
    }
    Object.keys(palette).forEach(function (sym) {
      palette[sym].classList.toggle('used', current.indexOf(sym) !== -1);
    });
    verifyBtn.disabled = current.length !== LEN;
  }

  function submit() {
    var guess = current.slice();
    var r = game.submit(guess);
    if (r.result === 'ignored') return;
    var line = document.createElement('div');
    line.className = 'cs-row';
    guess.forEach(function (sym) {
      var chip = document.createElement('span');
      chip.className = 'cs-chip';
      chip.textContent = sym;
      line.appendChild(chip);
    });
    var fb = document.createElement('span');
    fb.className = 'cs-fb';
    fb.textContent = '✅ ' + r.exact + '   🔁 ' + r.present;
    line.appendChild(fb);
    board.appendChild(line);
    current = [];
    draw();
    if (r.win) {
      statusEl.textContent = 'Code trouvé en ' + r.tries + ' essai' + (r.tries > 1 ? 's' : '') + ' !';
      verifyBtn.disabled = true;
      GF.finish({ found: LEN, total: LEN });
    } else {
      statusEl.textContent = 'Essai ' + (r.tries + 1);
    }
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      var i;
      // décalage du code : aucun symbole bien placé, retour 0 bien placés / 4 ailleurs
      var miss = code.slice(1).concat(code.slice(0, 1));
      for (i = 0; i < miss.length; i++) {
        palette[miss[i]].click();
        await GF.sleep(d);
      }
      verifyBtn.click();
      await GF.sleep(d);
      for (i = 0; i < code.length; i++) {
        palette[code[i]].click();
        await GF.sleep(d);
      }
      if (o && o.beforeFinalMove) { try { await o.beforeFinalMove(); } catch (e) {} }
      verifyBtn.click();
    },
  };
})();
