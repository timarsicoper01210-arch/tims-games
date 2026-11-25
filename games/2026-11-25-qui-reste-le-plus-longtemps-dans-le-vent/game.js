(function () {
  var game, unit, ui = {};

  GF.start(function (content, root) {
    unit = content.unit;
    game = Duel.createGame(Duel.buildChain(content.items, content.date + content.title));

    var q = document.createElement('p');
    q.className = 'du-q';
    q.textContent = content.question;

    ui.cur = card();
    ui.next = card();
    ui.vs = document.createElement('p');
    ui.vs.className = 'du-vs';
    ui.vs.textContent = 'VS';

    var btns = document.createElement('div');
    btns.className = 'du-btns';
    ui.plus = button('\u2B06\uFE0F Plus de ' + unit, 'plus');
    ui.moins = button('\u2B07\uFE0F Moins de ' + unit, 'moins');
    btns.append(ui.plus, ui.moins);

    ui.status = document.createElement('p');
    ui.status.className = 'du-status';
    ui.status.setAttribute('aria-live', 'polite');

    ui.hint = document.createElement('button');
    ui.hint.className = 'gf-link';
    ui.hint.textContent = '\uD83D\uDCA1 Combien de chiffres ?';
    ui.hint.onclick = function () {
      if (game.isOver() || !GF.requestHint()) return;
      ui.next.val.textContent = String(game.next().value).length + ' chiffres';
    };

    root.append(q, ui.cur.box, ui.vs, ui.next.box, btns, ui.status, ui.hint);
    paint();
  });

  function card() {
    var box = document.createElement('div');
    box.className = 'du-card';
    var label = document.createElement('div');
    label.className = 'du-label';
    var val = document.createElement('div');
    val.className = 'du-val';
    box.append(label, val);
    return { box: box, label: label, val: val };
  }

  function button(text, choice) {
    var b = document.createElement('button');
    b.className = 'du-btn';
    b.textContent = text;
    b.onclick = function () { answer(choice); };
    return b;
  }

  function paint(wasCorrect) {
    var cur = game.current();
    ui.cur.label.textContent = cur.label;
    ui.cur.val.textContent = cur.value.toLocaleString('fr-FR') + ' ' + unit;
    ui.cur.box.className = 'du-card' + (wasCorrect === undefined ? '' : wasCorrect ? ' ok' : ' bad');
    if (game.isOver()) {
      ui.vs.style.display = 'none';
      ui.next.box.style.display = 'none';
      ui.plus.disabled = true;
      ui.moins.disabled = true;
    } else {
      ui.next.label.textContent = game.next().label;
      ui.next.val.textContent = '?';
    }
    ui.status.textContent = 'Manche ' + game.round() + '/' + game.total() + ' \u00B7 ' + game.score() + ' bonne(s)';
  }

  function answer(choice) {
    var r = game.guess(choice);
    if (!r) return;
    paint(r.correct);
    if (r.over) GF.finish({ found: game.score(), total: game.total() });
  }

  window.__bot = {
    play: async function (o) {
      var d = (o && o.stepDelayMs) || 0;
      while (!game.isOver()) {
        if (game.round() === game.total() && o && o.beforeFinalMove) { try { await o.beforeFinalMove(); } catch (e) {} }
        (game.answer() === 'plus' ? ui.plus : ui.moins).click();
        await GF.sleep(d);
      }
    },
  };
})();
