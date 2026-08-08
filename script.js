let evaluations = [];
let lastCorrection = null;

const homeSection = document.getElementById("homeSection");

const teacherDashboardSection = document.getElementById("teacherDashboardSection");
const createEvaluationSection = document.getElementById("createEvaluationSection");
const correctCopySection = document.getElementById("correctCopySection");
const singleResultSection = document.getElementById("singleResultSection");
const classResultsSection = document.getElementById("classResultsSection");
const studentConsultationSection = document.getElementById("studentConsultationSection");

const teacherDashboardBtn = document.getElementById("teacherDashboardBtn");
const studentResultsBtn = document.getElementById("studentResultsBtn");

const showCreateEvaluationBtn = document.getElementById("showCreateEvaluationBtn");
const showCorrectCopyBtn = document.getElementById("showCorrectCopyBtn");
const showClassResultsBtn = document.getElementById("showClassResultsBtn");
const exportAllBtn = document.getElementById("exportAllBtn");
const resetAppBtn = document.getElementById("resetAppBtn");

const backHomeBtns = document.querySelectorAll(".backHomeBtn");
const backDashboardBtns = document.querySelectorAll(".backDashboardBtn");

const evaluationTitle = document.getElementById("evaluationTitle");
const evaluationClass = document.getElementById("evaluationClass");
const evaluationDate = document.getElementById("evaluationDate");
const evaluationScale = document.getElementById("evaluationScale");
const referenceText = document.getElementById("referenceText");

const teacherImageInput = document.getElementById("teacherImageInput");
const scanTeacherBtn = document.getElementById("scanTeacherBtn");
const teacherScanStatus = document.getElementById("teacherScanStatus");

const saveEvaluationBtn = document.getElementById("saveEvaluationBtn");
const clearEvaluationFormBtn = document.getElementById("clearEvaluationFormBtn");

const evaluationSelect = document.getElementById("evaluationSelect");
const selectedEvaluationInfo = document.getElementById("selectedEvaluationInfo");

const studentFullName = document.getElementById("studentFullName");
const studentClass = document.getElementById("studentClass");
const studentText = document.getElementById("studentText");

const studentImageInput = document.getElementById("studentImageInput");
const scanStudentBtn = document.getElementById("scanStudentBtn");
const studentScanStatus = document.getElementById("studentScanStatus");

const correctAndSaveBtn = document.getElementById("correctAndSaveBtn");
const clearCopyFormBtn = document.getElementById("clearCopyFormBtn");

const scoreValue = document.getElementById("scoreValue");
const feedbackTitle = document.getElementById("feedbackTitle");
const feedbackMessage = document.getElementById("feedbackMessage");
const totalWords = document.getElementById("totalWords");
const correctWords = document.getElementById("correctWords");
const errorWords = document.getElementById("errorWords");
const correctionOutput = document.getElementById("correctionOutput");
const errorList = document.getElementById("errorList");
const printSingleBtn = document.getElementById("printSingleBtn");

const filterEvaluation = document.getElementById("filterEvaluation");
const filterClass = document.getElementById("filterClass");
const filterStudent = document.getElementById("filterStudent");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const classResultsBody = document.getElementById("classResultsBody");

const searchStudentName = document.getElementById("searchStudentName");
const searchStudentClass = document.getElementById("searchStudentClass");
const searchEvaluationDate = document.getElementById("searchEvaluationDate");
const searchStudentResultsBtn = document.getElementById("searchStudentResultsBtn");
const clearStudentSearchBtn = document.getElementById("clearStudentSearchBtn");
const studentResultsBox = document.getElementById("studentResultsBox");

teacherDashboardBtn.addEventListener("click", showTeacherDashboard);
studentResultsBtn.addEventListener("click", showStudentConsultation);

showCreateEvaluationBtn.addEventListener("click", showCreateEvaluation);
showCorrectCopyBtn.addEventListener("click", showCorrectCopy);
showClassResultsBtn.addEventListener("click", showClassResults);
exportAllBtn.addEventListener("click", exportAllResults);
resetAppBtn.addEventListener("click", resetApplication);

backHomeBtns.forEach((btn) => {
  btn.addEventListener("click", showHome);
});

backDashboardBtns.forEach((btn) => {
  btn.addEventListener("click", showTeacherDashboard);
});

saveEvaluationBtn.addEventListener("click", saveEvaluation);
clearEvaluationFormBtn.addEventListener("click", clearEvaluationForm);

evaluationSelect.addEventListener("change", showSelectedEvaluationInfo);

correctAndSaveBtn.addEventListener("click", correctAndSaveCopy);
clearCopyFormBtn.addEventListener("click", clearCopyForm);

scanTeacherBtn.addEventListener("click", scanTeacherImage);
scanStudentBtn.addEventListener("click", scanStudentImage);

printSingleBtn.addEventListener("click", () => window.print());

applyFiltersBtn.addEventListener("click", renderClassResults);
clearFiltersBtn.addEventListener("click", clearFilters);

searchStudentResultsBtn.addEventListener("click", searchStudentResults);
clearStudentSearchBtn.addEventListener("click", clearStudentSearch);

function loadEvaluations() {
  const saved = localStorage.getItem("dicteeCoachEvaluations");

  if (saved) {
    evaluations = JSON.parse(saved);
  } else {
    evaluations = [];
  }
}

function saveEvaluationsToStorage() {
  localStorage.setItem("dicteeCoachEvaluations", JSON.stringify(evaluations));
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function hideAllSections() {
  homeSection.classList.add("hidden-section");
  teacherDashboardSection.classList.add("hidden-section");
  createEvaluationSection.classList.add("hidden-section");
  correctCopySection.classList.add("hidden-section");
  singleResultSection.classList.add("hidden-section");
  classResultsSection.classList.add("hidden-section");
  studentConsultationSection.classList.add("hidden-section");
}

function showHome() {
  hideAllSections();
  homeSection.classList.remove("hidden-section");
}

function showTeacherDashboard() {
  hideAllSections();
  teacherDashboardSection.classList.remove("hidden-section");
}

function showStudentConsultation() {
  hideAllSections();
  studentConsultationSection.classList.remove("hidden-section");
}

function showCreateEvaluation() {
  hideAllSections();
  createEvaluationSection.classList.remove("hidden-section");
}

function showCorrectCopy() {
  hideAllSections();
  correctCopySection.classList.remove("hidden-section");
  singleResultSection.classList.remove("hidden-section");
  populateEvaluationSelects();
  showSelectedEvaluationInfo();
}

function showClassResults() {
  hideAllSections();
  classResultsSection.classList.remove("hidden-section");
  populateEvaluationSelects();
  renderClassResults();
}

function saveEvaluation() {
  const title = evaluationTitle.value.trim();
  const classe = evaluationClass.value.trim();
  const date = evaluationDate.value;
  const scale = Number(evaluationScale.value) || 20;
  const text = referenceText.value.trim();

  if (!title) {
    alert("Veuillez renseigner le titre de la dictée.");
    return;
  }

  if (!classe) {
    alert("Veuillez renseigner la classe.");
    return;
  }

  if (!date) {
    alert("Veuillez renseigner la date de l’évaluation.");
    return;
  }

  if (!text) {
    alert("Veuillez saisir ou importer le texte original de la dictée.");
    return;
  }

  const evaluation = {
    id: generateId("eval"),
    title: title,
    classe: classe,
    date: date,
    scale: scale,
    referenceText: text,
    copies: [],
    createdAt: new Date().toISOString()
  };

  evaluations.push(evaluation);
  saveEvaluationsToStorage();
  populateEvaluationSelects();

  alert("Évaluation enregistrée avec succès.");

  clearEvaluationForm();
  showTeacherDashboard();
}

function clearEvaluationForm() {
  evaluationTitle.value = "";
  evaluationClass.value = "";
  evaluationDate.value = "";
  evaluationScale.value = 20;
  referenceText.value = "";
  teacherImageInput.value = "";
  teacherScanStatus.textContent = "";
  teacherScanStatus.className = "scan-status";
}

function populateEvaluationSelects() {
  evaluationSelect.innerHTML = "";
  filterEvaluation.innerHTML = '<option value="">Toutes les évaluations</option>';

  if (evaluations.length === 0) {
    evaluationSelect.innerHTML = '<option value="">Aucune évaluation disponible</option>';
    return;
  }

  evaluations.forEach((evaluation) => {
    const option = document.createElement("option");
    option.value = evaluation.id;
    option.textContent = `${formatDate(evaluation.date)} - ${evaluation.title} - ${evaluation.classe}`;
    evaluationSelect.appendChild(option);

    const filterOption = document.createElement("option");
    filterOption.value = evaluation.id;
    filterOption.textContent = `${formatDate(evaluation.date)} - ${evaluation.title} - ${evaluation.classe}`;
    filterEvaluation.appendChild(filterOption);
  });
}

function getSelectedEvaluation() {
  const evaluationId = evaluationSelect.value;

  if (!evaluationId) {
    return null;
  }

  return evaluations.find((evaluation) => evaluation.id === evaluationId) || null;
}

function showSelectedEvaluationInfo() {
  const evaluation = getSelectedEvaluation();

  if (!evaluation) {
    selectedEvaluationInfo.classList.add("hidden");
    selectedEvaluationInfo.innerHTML = "";
    return;
  }

  selectedEvaluationInfo.classList.remove("hidden");

  selectedEvaluationInfo.innerHTML = `
    <strong>Dictée :</strong> ${escapeHTML(evaluation.title)}<br>
    <strong>Classe :</strong> ${escapeHTML(evaluation.classe)}<br>
    <strong>Date :</strong> ${formatDate(evaluation.date)}<br>
    <strong>Barème :</strong> /${evaluation.scale}<br>
    <strong>Copies déjà corrigées :</strong> ${evaluation.copies.length}
  `;

  if (!studentClass.value.trim()) {
    studentClass.value = evaluation.classe;
  }
}

function clearCopyForm() {
  studentFullName.value = "";
  studentClass.value = "";
  studentText.value = "";
  studentImageInput.value = "";
  studentScanStatus.textContent = "";
  studentScanStatus.className = "scan-status";
}

function correctAndSaveCopy() {
  const evaluation = getSelectedEvaluation();

  if (!evaluation) {
    alert("Veuillez sélectionner une évaluation.");
    return;
  }

  const name = studentFullName.value.trim();
  const classe = studentClass.value.trim();
  const text = studentText.value.trim();

  if (!name) {
    alert("Veuillez renseigner le nom et prénom de l’élève.");
    return;
  }

  if (!classe) {
    alert("Veuillez renseigner la classe de l’élève.");
    return;
  }

  if (!text) {
    alert("Veuillez saisir ou importer le texte de la copie élève.");
    return;
  }

  const correction = compareTexts(evaluation.referenceText, text);
  const note = Math.round((correction.score / 100) * evaluation.scale * 100) / 100;
  const appreciation = getAppreciation(correction.score, name);

  const copyResult = {
    id: generateId("copy"),
    studentName: name,
    studentClass: classe,
    studentText: text,
    score: correction.score,
    note: note,
    scale: evaluation.scale,
    correctWords: correction.correctCount,
    totalWords: correction.totalWords,
    errorCount: correction.errors.length,
    errors: correction.errors,
    correctionHTML: correction.outputHTML,
    appreciation: appreciation.message,
    correctedAt: new Date().toISOString()
  };

  evaluation.copies.push(copyResult);
  saveEvaluationsToStorage();

  lastCorrection = {
    evaluation: evaluation,
    result: copyResult
  };

  renderSingleResult(evaluation, copyResult);
  renderClassResults();
  populateEvaluationSelects();
  showSelectedEvaluationInfo();

  alert("Copie corrigée et résultat enregistré avec succès.");

  clearCopyForm();
}

function compareTexts(reference, student) {
  const referenceWords = splitWords(reference);
  const studentWords = splitWords(student);

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

  const score = referenceWords.length
    ? Math.round((correctCount / referenceWords.length) * 100)
    : 0;

  return {
    score: score,
    correctCount: correctCount,
    totalWords: referenceWords.length,
    errors: errors,
    outputHTML: outputHTML
  };
}

function renderSingleResult(evaluation, result) {
  singleResultSection.classList.remove("hidden-section");

  scoreValue.textContent = `${result.score}%`;

  const circle = document.querySelector(".score-circle");

  circle.style.background =
    `conic-gradient(#22c55e ${result.score}%, #e5e7eb ${result.score}%)`;

  feedbackTitle.textContent = `${result.studentName} — ${evaluation.title}`;

  feedbackMessage.innerHTML = `
    <strong>Date :</strong> ${formatDate(evaluation.date)} |
    <strong>Classe :</strong> ${escapeHTML(result.studentClass)} |
    <strong>Note :</strong> ${result.note}/${result.scale}<br>
    ${escapeHTML(result.appreciation)}
  `;

  totalWords.textContent = result.totalWords;
  correctWords.textContent = result.correctWords;
  errorWords.textContent = result.errorCount;

  correctionOutput.innerHTML = result.correctionHTML || "Aucune correction disponible.";

  if (result.errors.length === 0) {
    errorList.innerHTML = "<li>Bravo ! Aucune erreur repérée.</li>";
  } else {
    errorList.innerHTML = "";

    result.errors.forEach((error) => {
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
}

function renderClassResults() {
  const selectedEval = filterEvaluation.value;
  const selectedClass = normalizeForSearch(filterClass.value);
  const selectedStudent = normalizeForSearch(filterStudent.value);

  const rows = [];

  evaluations.forEach((evaluation) => {
    if (selectedEval && evaluation.id !== selectedEval) {
      return;
    }

    evaluation.copies.forEach((copy) => {
      const classMatch = !selectedClass || normalizeForSearch(copy.studentClass).includes(selectedClass);
      const studentMatch = !selectedStudent || normalizeForSearch(copy.studentName).includes(selectedStudent);

      if (classMatch && studentMatch) {
        rows.push({
          evaluation: evaluation,
          copy: copy
        });
      }
    });
  });

  if (rows.length === 0) {
    classResultsBody.innerHTML = `
      <tr>
        <td colspan="8">Aucun résultat trouvé.</td>
      </tr>
    `;
    return;
  }

  classResultsBody.innerHTML = "";

  rows.forEach((item) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatDate(item.evaluation.date)}</td>
      <td>${escapeHTML(item.evaluation.title)}</td>
      <td>${escapeHTML(item.copy.studentClass)}</td>
      <td>${escapeHTML(item.copy.studentName)}</td>
      <td class="${getScoreClass(item.copy.score)}">${item.copy.score}%</td>
      <td>${item.copy.note}/${item.copy.scale}</td>
      <td>${item.copy.errorCount}</td>
      <td>${escapeHTML(item.copy.appreciation)}</td>
    `;

    classResultsBody.appendChild(tr);
  });
}

function clearFilters() {
  filterEvaluation.value = "";
  filterClass.value = "";
  filterStudent.value = "";
  renderClassResults();
}

function searchStudentResults() {
  const name = normalizeForSearch(searchStudentName.value);
  const classe = normalizeForSearch(searchStudentClass.value);
  const date = searchEvaluationDate.value;

  if (!name) {
    alert("Veuillez renseigner votre nom.");
    return;
  }

  if (!classe) {
    alert("Veuillez renseigner votre classe.");
    return;
  }

  const results = [];

  evaluations.forEach((evaluation) => {
    if (date && evaluation.date !== date) {
      return;
    }

    evaluation.copies.forEach((copy) => {
      const nameMatch = normalizeForSearch(copy.studentName).includes(name);
      const classMatch = normalizeForSearch(copy.studentClass) === classe;

      if (nameMatch && classMatch) {
        results.push({
          evaluation: evaluation,
          copy: copy
        });
      }
    });
  });

  if (results.length === 0) {
    studentResultsBox.innerHTML = `
      <p>Aucun résultat trouvé pour ces informations.</p>
      <p>Vérifiez l’orthographe de votre nom, votre classe ou la date saisie.</p>
    `;
    return;
  }

  studentResultsBox.innerHTML = "";

  results.forEach((item) => {
    const div = document.createElement("div");
    div.className = "result-card-student";

    div.innerHTML = `
      <h3>${escapeHTML(item.evaluation.title)}</h3>
      <p><strong>Date :</strong> ${formatDate(item.evaluation.date)}</p>
      <p><strong>Classe :</strong> ${escapeHTML(item.copy.studentClass)}</p>
      <p><strong>Score :</strong> <span class="${getScoreClass(item.copy.score)}">${item.copy.score}%</span></p>
      <p><strong>Note :</strong> ${item.copy.note}/${item.copy.scale}</p>
      <p><strong>Nombre d’erreurs :</strong> ${item.copy.errorCount}</p>
      <p><strong>Appréciation :</strong> ${escapeHTML(item.copy.appreciation)}</p>
    `;

    studentResultsBox.appendChild(div);
  });
}

function clearStudentSearch() {
  searchStudentName.value = "";
  searchStudentClass.value = "";
  searchEvaluationDate.value = "";
  studentResultsBox.innerHTML = "Aucun résultat recherché pour le moment.";
}

function exportAllResults() {
  const lines = [];

  lines.push("Date;Dictée;Classe;Élève;Score;Note;Barème;Erreurs;Appréciation");

  evaluations.forEach((evaluation) => {
    evaluation.copies.forEach((copy) => {
      lines.push([
        evaluation.date,
        evaluation.title,
        copy.studentClass,
        copy.studentName,
        `${copy.score}%`,
        copy.note,
        copy.scale,
        copy.errorCount,
        copy.appreciation
      ].map(escapeCSV).join(";"));
    });
  });

  if (lines.length === 1) {
    alert("Aucun résultat à exporter.");
    return;
  }

  const content = lines.join("\n");

  const blob = new Blob([content], {
    type: "text/csv;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "resultats_dictee_coach_ia.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function resetApplication() {
  if (!confirm("Voulez-vous vraiment supprimer toutes les évaluations et tous les résultats ?")) {
    return;
  }

  localStorage.removeItem("dicteeCoachEvaluations");
  evaluations = [];
  lastCorrection = null;

  populateEvaluationSelects();
  renderClassResults();
  clearEvaluationForm();
  clearCopyForm();
  clearStudentSearch();

  alert("Application réinitialisée.");
  showHome();
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
    referenceText.value = cleanOCRText(extractedText);

    if (referenceText.value.trim()) {
      setScanStatus(
        teacherScanStatus,
        "Texte extrait avec succès. Vérifiez-le avant d’enregistrer l’évaluation.",
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
    studentText.value = cleanOCRText(extractedText);

    if (studentText.value.trim()) {
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

function detectErrorType(expected, given) {
  if (given === "mot manquant") {
    return "Mot oublié";
  }

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

function getAppreciation(score, name) {
  if (score >= 90) {
    return {
      title: `Excellent travail, ${name} !`,
      message: "Excellent travail. La dictée est très bien maîtrisée."
    };
  }

  if (score >= 70) {
    return {
      title: `Bon travail, ${name} !`,
      message: "Bon travail. Les acquis sont présents, mais quelques erreurs doivent être reprises."
    };
  }

  if (score >= 50) {
    return {
      title: `Courage, ${name} !`,
      message: "Résultat moyen. Il faut renforcer l’orthographe, les accords et la relecture."
    };
  }

  return {
    title: `À reprendre avec accompagnement, ${name}.`,
    message: "Des difficultés importantes sont observées. Une remédiation est nécessaire."
  };
}

function getScoreClass(score) {
  if (score >= 70) {
    return "score-good";
  }

  if (score >= 50) {
    return "score-medium";
  }

  return "score-low";
}

function normalizeForSearch(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

function escapeCSV(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}

window.addEventListener("load", () => {
  loadEvaluations();
  populateEvaluationSelects();

  const today = new Date().toISOString().split("T")[0];
  evaluationDate.value = today;

  showHome();
});