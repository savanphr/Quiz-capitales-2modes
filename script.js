let countries = [];
let currentCountry = null;
let score = 0;
let total = 0;
let currentLang = 'fr';
let currentMode = 'qcm';

const texts = {
  fr: {
    title: "Quiz des Capitales 🌍",
    question: "Quelle est la capitale de :",
    loading: "Chargement...",
    answerPlaceholder: "Votre réponse",
    submitButton: "Valider",
    nextButton: "Suivant",
    resetButton: "Réinitialiser",
    resultGood: "✅ Bonne réponse :",
    resultWrong: "❌ Mauvaise réponse. La capitale est :",
    score: "Score :",
    loadingError: "Erreur de chargement des données",
    emptyDataError: "Aucune donnée disponible pour poser une question.",
    dataError: "Problème avec l’entrée choisie :",
    countryName: "Pays",
  },
  en: {
    title: "Capital Quiz 🌍",
    question: "What is the capital of :",
    loading: "Loading...",
    answerPlaceholder: "Your answer",
    submitButton: "Submit",
    nextButton: "Next",
    resetButton: "Reset",
    resultGood: "✅ Correct answer:",
    resultWrong: "❌ Wrong answer. The capital is:",
    score: "Score:",
    loadingError: "Error loading data",
    emptyDataError: "No data available to ask a question.",
    dataError: "Problem with the chosen entry:",
    countryName: "Country",
  }
};

function updateUI() {
  const langText = texts[currentLang];
  document.querySelector("h1").textContent = langText.title;
  document.getElementById("question").textContent = langText.question;
  document.getElementById("answer").placeholder = langText.answerPlaceholder;
  document.getElementById("submit").textContent = langText.submitButton;
  document.getElementById("next").textContent = langText.nextButton;
  document.getElementById("reset").textContent = langText.resetButton;
  document.getElementById("score").textContent = `${langText.score} ${score} / ${total}`;
  document.getElementById("mode-qcm").textContent = "QCM";
  document.getElementById("mode-saisie").textContent = "Saisie";
  if (currentMode === 'qcm') {
    document.getElementById("mode-qcm").classList.add("active");
    document.getElementById("mode-saisie").classList.remove("active");
  } else {
    document.getElementById("mode-qcm").classList.remove("active");
    document.getElementById("mode-saisie").classList.add("active");
  }
}

function setLanguage(lang) {
  currentLang = lang;
  updateUI();
  resetQuiz();
}

// Charger la liste des pays
async function loadCountries() {
  try {
    const response = await fetch("countries_bilingual.json");
    if (!response.ok) throw new Error(texts[currentLang].loadingError);

    countries = await response.json();

    if (!Array.isArray(countries) || countries.length === 0) {
      throw new Error(texts[currentLang].emptyDataError);
    }

    console.log(`✅ ${texts[currentLang].countryName}s loaded:`, countries.length);
    nextQuestion();
  } catch (error) {
    console.error("❌ Erreur de chargement :", error);
    document.getElementById("country").innerText = texts[currentLang].loadingError;
  }
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function nextQuestion() {
  if (!countries || countries.length === 0) {
    console.error(`⚠️ ${texts[currentLang].emptyDataError}`);
    return;
  }

  const randomIndex = Math.floor(Math.random() * countries.length);
  currentCountry = countries[randomIndex];

  if (!currentCountry) {
    console.error(`⚠️ ${texts[currentLang].dataError}`, currentCountry);
    return;
  }

  const countryToDisplay = currentLang === 'fr' ? currentCountry.pays : currentCountry.en_pays;
  document.getElementById("country").innerText = countryToDisplay;
  document.getElementById("result").textContent = "";

  if (currentMode === 'qcm') {
    setupQCM();
  } else {
    document.getElementById("answer").value = "";
    setupSaisie();
  }
}

function setupQCM() {
  document.getElementById("qcm-options").style.display = "flex";
  document.getElementById("saisie-libre").style.display = "none";
  document.getElementById("submit").style.display = "none";

  const correctCapital = currentLang === 'fr' ? currentCountry.capitale : currentCountry.en_capitale;
  let options = [correctCapital];

  while (options.length < 4) {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomCapital = currentLang === 'fr' ? randomCountry.capitale : randomCountry.en_capitale;
    if (!options.includes(randomCapital)) {
      options.push(randomCapital);
    }
  }

  options.sort(() => Math.random() - 0.5);

  document.querySelectorAll("#qcm-options button").forEach((button, index) => {
    button.textContent = options[index];
    button.onclick = () => checkQCMAnswer(options[index]);
  });
}

function setupSaisie() {
  document.getElementById("qcm-options").style.display = "none";
  document.getElementById("saisie-libre").style.display = "block";
  document.getElementById("submit").style.display = "inline-block";
}

function checkQCMAnswer(userAnswer) {
  const correctCapital = currentLang === 'fr' ? currentCountry.capitale : currentCountry.en_capitale;
  const langText = texts[currentLang];
  total++;

  if (normalize(userAnswer) === normalize(correctCapital)) {
    score++;
    document.getElementById("result").textContent = `${langText.resultGood} ${correctCapital}`;
  } else {
    document.getElementById("result").textContent = `${langText.resultWrong} ${correctCapital}`;
  }
  document.getElementById("score").textContent = `${langText.score} ${score} / ${total}`;
}

function checkSaisieAnswer() {
  const userAnswer = normalize(document.getElementById("answer").value.trim());
  const correctCapital = currentLang === 'fr' ? currentCountry.capitale : currentCountry.en_capitale;
  const correctAnswers = correctCapital.split("/").map(c => normalize(c.trim()));
  const langText = texts[currentLang];
  total++;

  if (correctAnswers.includes(userAnswer)) {
    score++;
    document.getElementById("result").textContent = `${langText.resultGood} ${correctCapital}`;
  } else {
    document.getElementById("result").textContent = `${langText.resultWrong} ${correctCapital}`;
  }
  document.getElementById("score").textContent = `${langText.score} ${score} / ${total}`;
}

function resetQuiz() {
  score = 0;
  total = 0;
  document.getElementById("score").textContent = `${texts[currentLang].score} 0 / 0`;
  document.getElementById("result").textContent = "";
  nextQuestion();
}

// Gestion des modes
document.getElementById("mode-qcm").addEventListener("click", () => {
  currentMode = 'qcm';
  updateUI();
  setupQCM();
  resetQuiz();
});

document.getElementById("mode-saisie").addEventListener("click", () => {
  currentMode = 'saisie';
  updateUI();
  setupSaisie();
  resetQuiz();
});

document.getElementById("submit").addEventListener("click", checkSaisieAnswer);
document.getElementById("next").addEventListener("click", nextQuestion);
document.getElementById("reset").addEventListener("click", resetQuiz);

document.getElementById("answer").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    checkSaisieAnswer();
  }
});

updateUI();
loadCountries();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker actif'))
    .catch(err => console.error('❌ Erreur d\'enregistrement du SW:', err));
}