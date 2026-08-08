let referenceText = "";
let lastErrors = [];

const modeSelection = document.getElementById("modeSelection");
const teacherSection = document.getElementById("teacherSection");
const studentSection = document.getElementById("studentSection");
const resultSection = document.getElementById("resultSection");
const gameSection = document.getElementById("gameSection");

const teacherModeBtn = document.getElementById("teacherModeBtn");
const studentModeBtn = document.getElementById("studentModeBtn");
const backBtns = document.querySelectorAll(".backBtn");

const referenceInput = document.getElementById("referenceText");
const studentInput = document.getElementById("studentText");
const studentNameInput = document.getElementById("studentName");

const saveReferenceBtn = document.getElementById("saveReferenceBtn");
const showReferenceBtn = document.getElementById("showReferenceBtn");
const clearBtn = document.getElementById("clearBtn");
const correctBtn = document.getElementById("correctBtn");
const hintBtn = document.getElementById("hintBtn");
const printBtn = document.getElementById("printBtn");
const exportBtn = document.getElementById("exportBtn");
const startGameBtn = document.getElementById("startGameBtn");

const referencePreview = document.getElementById("referencePreview");
const hintBox = document.getElementById("hintBox");
const scoreValue = document.getElementById("scoreValue");
const feedbackTitle = document.getElementById("feedbackTitle");
const feedbackMessage = document.getElementById("feedbackMessage");
const totalWords = document.getElementById("totalWords");
const correctWords = document.getElementById("correctWords");
const errorWords = document.getElementById("errorWords");
const correctionOutput = document.getElementById("correctionOutput");
const errorList = document.getElementById("errorList");
const gameBox = document.getElementById("gameBox");

const teacherImageInput = document.getElementById("teacherImageInput");
const studentImageInput = document.getElementById("studentImageInput");

const scanTeacherBtn = document.getElementById("scanTeacherBtn");
const scanStudentBtn = document.getElementById("scanStudentBtn");

const teacherScanStatus = document.getElementById("teacherScanStatus");
const studentScanStatus = document.getElementById("studentScanStatus");

teacherModeBtn.addEventListener("click", showTeacherMode);
studentModeBtn.addEventListener("click", showStudentMode);

backBtns.forEach((btn) => {
  btn.addEventListener("click", showModeSelection);
});

saveReferenceBtn.addEventListener("click", saveReference);
showReferenceBtn.addEventListener("click", toggleReference);
clearBtn.addEventListener("click", clearAll);
correctBtn.addEventListener("click", correctDictation);
hintBtn.addEventListener("click", showHint);
printBtn.addEventListener("click", () => window.print());
exportBtn.addEventListener("click", exportResult);
startGameBtn.addEventListener("click", startGame);

scanTeacherBtn.addEventListener("click", scanTeacherImage);
scanStudentBtn.addEventListener("click", scanStudentImage);

function showTeacherMode() {
  modeSelection.style.display = "none";

  teacherSection.classList.remove("hidden-section");
  studentSection.classList.add("hidden-section");
  resultSection.classList.add("hidden-section");
  gameSection.classList.add("hidden-section");
}

function showStudentMode() {
  modeSelection.style.display = "none";

  teacherSection.classList.add("hidden-section");
  studentSection.classList.remove("hidden-section");
  resultSection.classList.remove("hidden-section");
  gameSection.classList.remove("hidden-section");
}

function showModeSelection() {
  modeSelection.style.display = "block";

  teacherSection.classList.add("hidden-section");
  studentSection.classList.add("hidden-section");
  resultSection.classList.add("hidden-section");
  gameSection.classList.add("hidden-section");
}

function saveReference() {
  referenceText = referenceInput.value.trim();

  if (!referenceText) {
    alert("Veuillez saisir le texte de référence.");
    return;
  }

  localStorage.setItem("referenceText", referenceText);

  referencePreview.textContent = referenceText;
  referencePreview.classList.remove("hidden");

  alert("Texte de référence enregistré avec succès !");
}

function toggleReference() {
  const savedText = localStorage.getItem("referenceText") || referenceInput.value.trim();

  if (!savedText) {
    alert("Aucun texte de référence enregistré.");
    return;
  }

  referencePreview.textContent = savedText;
  referencePreview.classList.toggle("hidden");
}

function clearAll() {
  if (!confirm("Voulez-vous vraiment réinitialiser toute l'application ?")) {
    return;
  }

  localStorage.removeItem("referenceText");

  referenceText = "";
  lastErrors = [];

  referenceInput.value = "";
  studentInput.value = "";
  studentNameInput.value = "";

  referencePreview.textContent = "";
  referencePreview.classList.add("hidden");

  hintBox.textContent = "";
  hintBox.classList.add("hidden");

  teacherImageInput.value = "";
  studentImageInput.value = "";

  teacherScanStatus.textContent = "";
  studentScanStatus.textContent = "";

  teacherScanStatus.className = "scan-status";
  studentScanStatus.className = "scan-status";

  scoreValue.textContent = "0%";

  document.querySelector(".score-circle").style.background =
    "conic-gradient(#22c55e 0%, #e5e7eb 0%)";

  feedbackTitle.textContent = "En attente de correction";
  feedbackMessage.textContent =
    "Saisissez un texte de référence et une dictée d’élève pour commencer.";

  totalWords.textContent = "0";
  correctWords.textContent = "0";
  errorWords.textContent = "0";

  correctionOutput.textContent = "La correction apparaîtra ici.";
  errorList.innerHTML = "<li>Aucune correction effectuée.</li>";
  gameBox.innerHTML = "<p>Aucun mot à retravailler pour le moment.</p>";
}

function normalizeText(text) {
  return text
    .trim()
    .replace(/[’]/g, "'")
    .replace(/[.,;:!?()"]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function splitWords(text) {
  const cleanText = normalizeText(text);

  if (!cleanText) {
    return [];
  }

  return cleanText.split(" ");
}

function correctDictation() {
  referenceText = localStorage.getItem("referenceText") || referenceInput.value.trim();

  const studentText = studentInput.value.trim();
  const studentName = studentNameInput.value.trim() || "Élève";

  if (!referenceText) {
    alert("Veuillez d’abord demander à l’enseignant d’enregistrer le texte de référence.");
    return;
  }

  if (!studentText) {
    alert("Veuillez saisir le texte de l’élève ou importer une copie manuscrite.");
    return;
  }

  const referenceWords = splitWords(referenceText);
  const studentWords = splitWords(studentText);

  let correctCount = 0;
  let errors = [];
  let outputHTML = "";

  const maxLength = Math.max(referenceWords.length, studentWords.length);

  for (let i = 0; i < maxLength; i++) {
    const expected = referenceWords[i] || "";
    const given = studentWords[i] || "";

    if (expected && given && expected === given) {
      correctCount++;

      outputHTML += `<span class="word-correct">${escapeHTML(given)}</span> `;
    } else if (expected && given && expected !== given) {
      errors.push({
        position: i + 1,
        expected: expected,
        given: given,
        type: detectErrorType(expected, given)
      });

      outputHTML += `<span class="word-error">${escapeHTML(given)}</span> `;
      outputHTML += `<span class="word-missing">→ ${escapeHTML(expected)}</span> `;
    } else if (expected && !given) {
      errors.push({
        position: i + 1,
        expected: expected,
        given: "mot manquant",
        type: "Mot oublié"
      });

      outputHTML += `<span class="word-missing">+ ${escapeHTML(expected)}</span> `;
    } else if (!expected && given) {
      errors.push({
        position: i + 1,
        expected: "aucun mot attendu",
        given: given,
        type: "Mot ajouté"
      });

      outputHTML += `<span class="word-error">${escapeHTML(given)}</span> `;
    }
  }

  lastErrors = errors;

  const score = referenceWords.length
    ? Math.round((correctCount / referenceWords.length) * 100)
    : 0;

  updateScore(score, correctCount, errors.length, referenceWords.length);
  updateFeedback(score, studentName);
  updateCorrectionOutput(outputHTML);
  updateErrorList(errors);
}

function updateScore(score, correctCount, errorCount, total) {
  scoreValue.textContent = `${score}%`;

  const circle = document.querySelector(".score-circle");

  circle.style.background =
    `conic-gradient(#22c55e ${score}%, #e5e7eb ${score}%)`;

  totalWords.textContent = total;
  correctWords.textContent = correctCount;
  errorWords.textContent = errorCount;
}

function updateFeedback(score, studentName) {
  if (score >= 90) {
    feedbackTitle.textContent = `Excellent travail, ${studentName} !`;
    feedbackMessage.textContent =
      "La dictée est très bien réussie. Quelques détails peuvent encore être vérifiés.";
  } else if (score >= 70) {
    feedbackTitle.textContent = `Bon travail, ${studentName} !`;
    feedbackMessage.textContent =
      "La dictée est globalement maîtrisée. Il faut reprendre les mots signalés pour progresser.";
  } else if (score >= 50) {
    feedbackTitle.textContent = `Courage, ${studentName} !`;
    feedbackMessage.textContent =
      "Il y a des acquis, mais plusieurs erreurs doivent être retravaillées avec l’enseignant.";
  } else {
    feedbackTitle.textContent = `On reprend ensemble, ${studentName}.`;
    feedbackMessage.textContent =
      "La dictée doit être retravaillée pas à pas. Le mini-jeu peut aider à revoir les mots difficiles.";
  }
}

function updateCorrectionOutput(html) {
  correctionOutput.innerHTML = html || "Aucune correction disponible.";
}

function updateErrorList(errors) {
  if (errors.length === 0) {
    errorList.innerHTML = "<li>Bravo ! Aucune erreur repérée.</li>";
    return;
  }

  errorList.innerHTML = "";

  errors.forEach((error) => {
    const li = document.createElement("li");

    li.innerHTML = `
      Position ${error.position} :
      tu as écrit <strong>${escapeHTML(error.given)}</strong>,
      il fallait écrire <strong>${escapeHTML(error.expected)}</strong>.
      <em>Type probable : ${escapeHTML(error.type)}</em>.
    `;

    errorList.appendChild(li);
  });
}

function detectErrorType(expected, given) {
  if (expected.length === given.length) {
    return "Erreur d’orthographe possible";
  }

  if (expected.startsWith(given) || given.startsWith(expected)) {
    return "Mot incomplet ou accord oublié";
  }

  if (Math.abs(expected.length - given.length) <= 2) {
    return "Erreur proche du mot attendu";
  }

  return "Mot différent";
}

function showHint() {
  referenceText = localStorage.getItem("referenceText") || referenceInput.value.trim();

  if (!referenceText) {
    alert("Aucun texte de référence n’a encore été enregistré.");
    return;
  }

  const words = splitWords(referenceText);

  if (words.length === 0) {
    return;
  }

  const randomWord = words[Math.floor(Math.random() * words.length)];

  hintBox.innerHTML = `
    <strong>Indice :</strong> un mot important de la dictée commence par
    <strong>${randomWord.charAt(0).toUpperCase()}</strong>
    et contient <strong>${randomWord.length}</strong> lettres.
  `;

  hintBox.classList.remove("hidden");
}

function startGame() {
  if (!lastErrors || lastErrors.length === 0) {
    gameBox.innerHTML = "<p class='success'>Aucun mot à retravailler. Bravo !</p>";
    return;
  }

  const randomError = lastErrors[Math.floor(Math.random() * lastErrors.length)];

  gameBox.innerHTML = `
    <p class="game-question">
      Réécris correctement ce mot :
      <span class="word-error">${escapeHTML(randomError.given)}</span>
    </p>

    <input
      type="text"
      id="gameAnswer"
      class="game-input"
      placeholder="Écris la bonne réponse..."
    />

    <div class="actions">
      <button onclick="checkGameAnswer('${escapeForAttribute(randomError.expected)}')">
        Vérifier
      </button>
    </div>

    <p id="gameFeedback"></p>
  `;
}

function checkGameAnswer(expected) {
  const answerInput = document.getElementById("gameAnswer");
  const gameFeedback = document.getElementById("gameFeedback");

  const answer = normalizeText(answerInput.value);
  const expectedNormalized = normalizeText(expected);

  if (!answer) {
    gameFeedback.innerHTML = "<span class='fail'>Écris d’abord une réponse.</span>";
    return;
  }

  if (answer === expectedNormalized) {
    gameFeedback.innerHTML =
      "<span class='success'>Bravo ! Le mot est bien corrigé.</span>";
  } else {
    gameFeedback.innerHTML = `
      <span class='fail'>
        Ce n’est pas encore juste. La bonne réponse est : ${escapeHTML(expected)}
      </span>
    `;
  }
}

function exportResult() {
  const studentName = studentNameInput.value.trim() || "Élève";
  const score = scoreValue.textContent;
  const feedback = feedbackMessage.textContent;

  let errorsText = "";

  if (lastErrors.length === 0) {
    errorsText = "Aucune erreur repérée.";
  } else {
    errorsText = lastErrors
      .map((error) => {
        return `Position ${error.position} : "${error.given}" → "${error.expected}" (${error.type})`;
      })
      .join("\n");
  }

  const content = `
Résultat de dictée - Dictée Coach IA

Élève : ${studentName}
Score : ${score}

Commentaire :
${feedback}

Erreurs :
${errorsText}

Note :
Cette correction est une aide automatique. La validation finale revient à l’enseignant.
`;

  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `correction_dictee_${studentName.replace(/\s+/g, "_")}.txt`;
  link.click();

  URL.revokeObjectURL(url);
}

async function scanTeacherImage() {
  const file = teacherImageInput.files[0];

  if (!file) {
    alert("Veuillez d’abord choisir ou prendre une photo du modèle de dictée.");
    return;
  }

  setScanStatus(teacherScanStatus, "Lecture de l’image en cours... Veuillez patienter.", "");
  scanTeacherBtn.disabled = true;

  try {
    const extractedText = await extractTextFromImage(file, teacherScanStatus);

    referenceInput.value = cleanOCRText(extractedText);
    referenceText = referenceInput.value.trim();

    if (referenceText) {
      localStorage.setItem("referenceText", referenceText);
      referencePreview.textContent = referenceText;
      referencePreview.classList.remove("hidden");

      setScanStatus(
        teacherScanStatus,
        "Texte extrait avec succès. Vérifiez-le avant d’enregistrer définitivement.",
        "success-status"
      );
    } else {
      setScanStatus(
        teacherScanStatus,
        "Aucun texte n’a été reconnu. Veuillez reprendre la photo plus clairement.",
        "error-status"
      );
    }
  } catch (error) {
    console.error(error);

    setScanStatus(
      teacherScanStatus,
      "Erreur lors de la lecture de l’image. Essayez avec une photo plus nette.",
      "error-status"
    );
  } finally {
    scanTeacherBtn.disabled = false;
  }
}

async function scanStudentImage() {
  const file = studentImageInput.files[0];

  if (!file) {
    alert("Veuillez d’abord choisir ou prendre une photo de la copie manuscrite.");
    return;
  }

  setScanStatus(studentScanStatus, "Lecture de la copie en cours... Veuillez patienter.", "");
  scanStudentBtn.disabled = true;

  try {
    const extractedText = await extractTextFromImage(file, studentScanStatus);

    studentInput.value = cleanOCRText(extractedText);

    if (studentInput.value.trim()) {
      setScanStatus(
        studentScanStatus,
        "Texte extrait avec succès. Vérifiez-le avant de lancer la correction.",
        "success-status"
      );
    } else {
      setScanStatus(
        studentScanStatus,
        "Aucun texte n’a été reconnu. Veuillez reprendre la photo plus clairement.",
        "error-status"
      );
    }
  } catch (error) {
    console.error(error);

    setScanStatus(
      studentScanStatus,
      "Erreur lors de la lecture de la copie. Essayez avec une photo plus nette.",
      "error-status"
    );
  } finally {
    scanStudentBtn.disabled = false;
  }
}

async function extractTextFromImage(file, statusElement) {
  if (typeof Tesseract === "undefined") {
    throw new Error("Tesseract.js n’est pas chargé.");
  }

  const imageURL = URL.createObjectURL(file);

  const result = await Tesseract.recognize(
    imageURL,
    "fra",
    {
      logger: function (message) {
        if (message.status === "recognizing text") {
          const progress = Math.round(message.progress * 100);
          setScanStatus(
            statusElement,
            `Reconnaissance du texte : ${progress}%`,
            ""
          );
        } else if (message.status) {
          setScanStatus(
            statusElement,
            `Préparation : ${message.status}`,
            ""
          );
        }
      }
    }
  );

  URL.revokeObjectURL(imageURL);

  return result.data.text;
}

function cleanOCRText(text) {
  return text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[|]/g, "I")
    .trim();
}

function setScanStatus(element, message, className) {
  element.textContent = message;
  element.className = "scan-status";

  if (className) {
    element.classList.add(className);
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeForAttribute(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', "&quot;");
}

window.addEventListener("load", () => {
  const savedReference = localStorage.getItem("referenceText");

  if (savedReference) {
    referenceText = savedReference;
    referenceInput.value = savedReference;
    referencePreview.textContent = savedReference;
  }

  showModeSelection();
});