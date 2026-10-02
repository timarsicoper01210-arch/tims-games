(function () {
  window.QuizUI = {
    mount: function (root, questions, opts) {
      var quiz = QuizLogic.createQuiz(questions);
      var locked = false;
      var progress = document.createElement('p');
      var prompt = document.createElement('div');
      prompt.className = (opts && opts.promptClass) || 'qz-prompt';
      var choices = document.createElement('div');
      choices.className = 'qz-choices';
      var hint = document.createElement('button');
      hint.className = 'gf-link';
      hint.textContent = '💡 Retirer 2 mauvaises réponses';
      hint.onclick = function () {
        if (locked || !quiz.current() || !GF.requestHint()) return;
        quiz.wrongChoices().slice(0, 2).forEach(function (k) { choices.children[k].classList.add('gone'); });
      };
      root.append(progress, prompt, choices, hint);

      function show() {
        var q = quiz.current();
        progress.textContent = 'Question ' + (quiz.index() + 1) + ' / ' + quiz.total;
        prompt.textContent = q.q;
        choices.innerHTML = '';
        q.choices.forEach(function (label, k) {
          var b = document.createElement('button');
          b.className = 'gf-choice';
          b.textContent = label;
          b.dataset.k = k;
          b.onclick = function () { pick(k, b); };
          choices.appendChild(b);
        });
        locked = false;
      }
      function pick(k, button) {
        if (locked) return;
        locked = true;
        var answerIndex = quiz.current().answer;
        var res = quiz.answer(k);
        button.classList.add(res.correct ? 'ok' : 'bad');
        choices.children[answerIndex].classList.add('ok');
        setTimeout(function () {
          if (res.done) GF.finish({ found: quiz.score(), total: quiz.total });
          else show();
        }, 700);
      }
      show();

      window.__bot = {
        play: async function (o) {
          var d = (o && o.stepDelayMs) || 0;
          while (quiz.current()) {
            await GF.sleep(d);
            choices.children[quiz.current().answer].click();
            await GF.sleep(800);
          }
        },
      };
    },
  };
})();
