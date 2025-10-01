(function () {
  const startScreen = document.getElementById('start-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');

  const startBtn = document.getElementById('startBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const restartBtn = document.getElementById('restartBtn');

  const progressEl = document.getElementById('progress');
  const qText = document.getElementById('question-text');
  const optionsForm = document.getElementById('options-form');

  const scoreLine = document.getElementById('score-line');
  const reviewList = document.getElementById('review-list');

  // Build the question bank (20 total), each with multiple choices.
  // Each item: { q: string, correct: string, choices: string[] }
  const QUESTION_BANK = [
    { q: "Who is the author of the Sun Station comics?", correct: "Grayson", choices: ["Grayson", "Hudson", "Preston", "Logan"] },
    { q: "What is Super Sun's power in the first comic?", correct: "Bright Power", choices: ["Bright Power", "Ice Power", "Shadow Beam", "Wind Blast"] },
    { q: "Does Evil Earth turn good (in comic 2)?", correct: "True", choices: ["True", "False"] },
    { q: "In comic 1, does Mars give up helping Super Sun at the end?", correct: "No", choices: ["Yes", "No"] },
    { q: "Is Uranus happy about his name?", correct: "No", choices: ["Yes", "No"] },
    { q: "Does Pluto think he's a real planet?", correct: "No", choices: ["Yes", "No"] },
    { q: "Who is the backup character for Evil Earth in comic 2?", correct: "Alien", choices: ["Alien", "Comet", "Astro-Dog", "Robot"] },
    { q: "How does Super Sun make Evil Earth turn good?", correct: "By removing the trash from Earth", choices: ["By removing the trash from Earth", "By freezing the oceans", "By moving the Moon", "By turning off gravity"] },
    { q: "How does Evil Earth turn evil?", correct: "A guy littering.", choices: ["A guy littering.", "A volcano eruption.", "A failed rocket launch.", "A solar eclipse."] },
    { q: "In comic 1 does the bad guy get away?", correct: "No", choices: ["Yes", "No"] },
    { q: "What is Evil Earth's name when he turns good?", correct: "Cool Earth", choices: ["Cool Earth", "Kind Earth", "Hero Earth", "Calm Earth"] },
    { q: "What happened to the star when it was shot by the aliens?", correct: "He broke the ship and went away", choices: ["He broke the ship and went away", "He vanished forever", "He joined the aliens", "He fell to the Moon"] },
    { q: "Did the astronaut get scared when Super Sun looked at him angrily?", correct: "Yes", choices: ["Yes", "No"] },
    { q: "Did Super Sun and Mars get sucked up by the black hole?", correct: "Yes", choices: ["Yes", "No"] },
    { q: "Did the astronaut find a cool base?", correct: "Yes", choices: ["Yes", "No"] },
    { q: "What did Super Sun take to go to the Moon?", correct: "The Sun Ship", choices: ["The Sun Ship", "A Rocket Bike", "A Space Train", "The Meteor Bus"] },
    { q: "What does Evil Earth use to light the boom?", correct: "Flint and Steel", choices: ["Flint and Steel", "Laser Eyes", "Matches", "Lightning"] },
    { q: "What does Super Sun capture Evil Earth with?", correct: "Rope", choices: ["Rope", "Net", "Chains", "Laser Cage"] },
    { q: "How many times did Super Sun capture Evil Earth in comic 2?", correct: "2", choices: ["2", "1", "3", "4"] },
    { q: "What did the astronaut say on the last page of comic 2?", correct: "Then what will I read?", choices: ["Then what will I read?", "I’m going home.", "Mission accomplished!", "I need a new helmet."] },
  ];

  const QUIZ_SIZE = 5;

  // State
  let quizQuestions = [];
  let currentIndex = 0;
  let selectedAnswers = []; // strings
  let score = 0;

  // Utility: Fisher-Yates shuffle
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandomQuestions() {
    const shuffled = shuffle(QUESTION_BANK);
    return shuffled.slice(0, QUIZ_SIZE).map(q => {
      // shuffle choices per question so correct isn't always first
      return { ...q, choices: shuffle(q.choices) };
    });
  }

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  function startQuiz() {
    quizQuestions = pickRandomQuestions();
    currentIndex = 0;
    selectedAnswers = new Array(QUIZ_SIZE).fill(null);
    score = 0;

    renderQuestion();
    hide(startScreen);
    hide(resultScreen);
    show(quizScreen);
  }

  function renderQuestion() {
    const q = quizQuestions[currentIndex];

    progressEl.textContent = `Question ${currentIndex + 1} of ${QUIZ_SIZE}`;
    qText.textContent = q.q;

    // Clear previous options
    optionsForm.innerHTML = "";

    q.choices.forEach((choice, idx) => {
      const id = `opt-${currentIndex}-${idx}`;
      const wrapper = document.createElement('label');
      wrapper.className = 'option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q-${currentIndex}`;
      input.value = choice;
      input.id = id;
      input.required = true;

      if (selectedAnswers[currentIndex] === choice) {
        input.checked = true;
      }

      const text = document.createElement('span');
      text.textContent = choice;

      wrapper.appendChild(input);
      wrapper.appendChild(text);
      optionsForm.appendChild(wrapper);
    });

    // Toggle Next/Submit
    const isLast = currentIndex === QUIZ_SIZE - 1;
    nextBtn.classList.toggle('hidden', isLast);
    submitBtn.classList.toggle('hidden', !isLast);
  }

  function recordSelection() {
    const data = new FormData(optionsForm);
    const picked = data.get(`q-${currentIndex}`);
    if (picked) {
      selectedAnswers[currentIndex] = picked;
      return true;
    }
    return false;
  }

  function nextQuestion() {
    if (!recordSelection()) {
      alert('Please select an answer to continue.');
      return;
    }
    currentIndex++;
    renderQuestion();
  }

  function gradeQuiz() {
    if (!recordSelection()) {
      alert('Please select an answer before submitting.');
      return;
    }

    score = 0;
    for (let i = 0; i < QUIZ_SIZE; i++) {
      if (selectedAnswers[i] === quizQuestions[i].correct) {
        score++;
      }
    }
    const percent = Math.round((score / QUIZ_SIZE) * 100);

    // Build review list
    reviewList.innerHTML = "";
    quizQuestions.forEach((q, i) => {
      const li = document.createElement('li');
      const gotIt = selectedAnswers[i] === q.correct;
      li.innerHTML = `
        <div><strong>Q${i + 1}:</strong> ${q.q}</div>
        <div>Your answer: <span class="${gotIt ? 'correct' : 'incorrect'}">${selectedAnswers[i] ?? '(none)'}</span></div>
        <div>Correct answer: <strong>${q.correct}</strong></div>
      `;
      reviewList.appendChild(li);
    });

    scoreLine.textContent = `${score}/${QUIZ_SIZE} correct — ${percent}%`;
    hide(quizScreen);
    show(resultScreen);
  }

  function restart() {
    hide(resultScreen);
    show(startScreen);
  }

  // Events
  startBtn.addEventListener('click', startQuiz);
  nextBtn.addEventListener('click', nextQuestion);
  submitBtn.addEventListener('click', gradeQuiz);
  restartBtn.addEventListener('click', restart);
})();
