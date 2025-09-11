function studentInit() {
  // DOM elements
  const quizList = document.getElementById("quizList");
  const quizPlayArea = document.getElementById("quizPlayArea");
  const progressBar = document.getElementById("progress");
  const badgeList = document.getElementById("badgeList");

  // State
  let ecoPoints = parseInt(localStorage.getItem("ecoPoints")) || 0;
  let badges = JSON.parse(localStorage.getItem("badges")) || [];
  let currentQuiz = null;
  let currentQuestionIndex = 0;
  let score = 0;

  // Helpers
  function getQuizzes() {
    return JSON.parse(localStorage.getItem("pp_quizzes")) || [];
  }

  function saveProgress() {
    localStorage.setItem("ecoPoints", ecoPoints);
    localStorage.setItem("badges", JSON.stringify(badges));
  }

  function updateProgress() {
    progressBar.style.width = `${ecoPoints % 100}%`;

    badgeList.innerHTML = "";
    badges.forEach(badge => {
      const li = document.createElement("li");
      li.textContent = badge;
      badgeList.appendChild(li);
    });
  }

  function awardBadge(badgeName) {
    if (!badges.includes(badgeName)) {
      badges.push(badgeName);
      ecoPoints += 50;
      saveProgress();
      updateProgress();
      alert(`🎉 You earned a new badge: ${badgeName}!`);
    }
  }

  // Render available quizzes
  function renderQuizList() {
    const quizzes = getQuizzes();
    quizList.innerHTML = "";
    if (quizzes.length === 0) {
      quizList.innerHTML = "<p>No quizzes available yet.</p>";
      return;
    }
    quizzes.forEach((quiz, idx) => {
      const li = document.createElement("li");
      li.textContent = quiz.title;
      const btn = document.createElement("button");
      btn.textContent = "Take Quiz";
      btn.addEventListener("click", () => startQuiz(quiz, idx));
      li.appendChild(btn);
      quizList.appendChild(li);
    });
  }

  // Start quiz
  function startQuiz(quiz, quizIndex) {
    currentQuiz = quiz;
    currentQuestionIndex = 0;
    score = 0;
    quizPlayArea.style.display = "block";
    quizList.style.display = "none";
    renderQuestion();
  }

  // Render a single question
  function renderQuestion() {
    if (currentQuestionIndex >= currentQuiz.questions.length) {
      finishQuiz();
      return;
    }

    const q = currentQuiz.questions[currentQuestionIndex];
    quizPlayArea.innerHTML = `
      <h3>${q.text}</h3>
      <ul>
        ${Object.entries(q.options)
          .map(
            ([key, val]) =>
              `<li><button class="answer-btn" data-answer="${key}">${key}: ${val}</button></li>`
          )
          .join("")}
      </ul>
    `;

    document.querySelectorAll(".answer-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.answer === q.correct) {
          ecoPoints += 10;
          score++;
        }
        currentQuestionIndex++;
        renderQuestion();
      });
    });
  }

  // End of quiz
  function finishQuiz() {
    const total = currentQuiz.questions.length;
    quizPlayArea.innerHTML = `
      <p>You scored ${score} / ${total}</p>
      <button id="backBtn">Back to Quiz List</button>
    `;

    if (score === total) {
      awardBadge("Perfect Score");
    }
    if (ecoPoints >= 100) {
      awardBadge("Eco Warrior");
    }

    saveProgress();
    updateProgress();

    document.getElementById("backBtn").addEventListener("click", () => {
      quizPlayArea.style.display = "none";
      quizList.style.display = "block";
      renderQuizList();
    });
  }

  // Init
  updateProgress();
  renderQuizList();
}

// Bootstrap
if (document.getElementById("quizList")) {
  studentInit();
}
