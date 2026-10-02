(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuizLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function createQuiz(questions) {
    var i = 0;
    var score = 0;
    return {
      total: questions.length,
      index: function () { return i; },
      current: function () { return i < questions.length ? questions[i] : null; },
      score: function () { return score; },
      wrongChoices: function () {
        var q = questions[i];
        return q.choices.map(function (_, k) { return k; }).filter(function (k) { return k !== q.answer; });
      },
      answer: function (choice) {
        if (i >= questions.length) throw new Error('quiz already finished');
        var correct = choice === questions[i].answer;
        if (correct) score += 1;
        i += 1;
        return { correct: correct, done: i >= questions.length };
      },
    };
  }
  return { createQuiz: createQuiz };
});
