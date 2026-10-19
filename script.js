let users = [];
let currentUser = null;
let evaluations = [];
let lastCorrection = null;

document.addEventListener("DOMContentLoaded", function () {
  loadAllData();
  bindEvents();
  initializeDate();
  updateAuthUI();
});

function bindEvents() {
  document.getElementById("loginTabBtn").addEventListener("click", showLoginForm);
  document.getElementById("registerTabBtn").addEventListener("click", showRegisterForm);

  document.getElementById("loginForm").addEventListener("submit", loginUser);
  document.getElementById("registerForm").addEventListener("submit", registerUser);
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);

  document.getElementById("teacherDashboardBtn").addEventListener("click", showTeacherDashboard);
  document.getElementById("studentResultsBtn").addEventListener("click", showStudentConsultation);

  document.getElementById("showCreateEvaluationBtn").addEventListener("click", showCreateEvaluation);
  document.getElementById("showCorrectCopyBtn").addEventListener("click", showCorrectCopy);
  document.getElementById("showClassResultsBtn").addEventListener("click", showClassResults);

  document.getElementById("exportAllBtn").addEventListener("click", exportAllResults);
  document.getElementById("resetAppBtn").addEventListener("click", resetApplication);

  document.querySelectorAll(".backHomeBtn").forEach(function (btn) {
    btn.addEventListener("click", showHome);
  });

  document.querySelectorAll(".backDashboardBtn").forEach(function (btn) {
    btn.addEventListener("click", showTeacherDashboard);
  });

  document.getElementById("saveEvaluationBtn").addEventListener("click", saveEvaluation);
  document.getElementById("clearEvaluationFormBtn").addEventListener("click", clearEvaluationForm);

  document.getElementById("evaluationSelect").addEventListener("change", showSelectedEvaluationInfo);

  document.getElementById("correctAndSaveBtn").addEventListener("click", correctAndSaveCopy);
  document.getElementById("clearCopyFormBtn").addEventListener("click", clearCopyForm);

  document.getElementById("scanTeacherBtn").addEventListener("click", scanTeacherImage);
  document.getElementById("scanStudentBtn").addEventListener("click", scanStudentImage);

  document.getElementById("printSingleBtn").addEventListener("click", function () {
    window.print();
  });

  document.getElementById("saveFollowupBtn").addEventListener("click", saveFollowup);

  document.getElementById("applyFiltersBtn").addEventListener("click", renderClassResults);
  document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);

  document.getElementById("searchStudentResultsBtn").addEventListener("click", searchStudentResults);
  document.getElementById("clearStudentSearchBtn").addEventListener("click", clearStudentSearch);
}

function loadAllData() {
  users = JSON.parse(localStorage.getItem("dicteeCoachUsers")) || [];
  currentUser = JSON.parse(localStorage.getItem("dicteeCoachCurrentUser")) || null;
  evaluations = JSON.parse(localStorage.getItem("dicteeCoachEvaluations")) || [];
}

function saveUsers() {
  localStorage.setItem("dicteeCoachUsers", JSON.stringify(users));
}

function saveCurrentUser() {
  localStorage.setItem("dicteeCoachCurrentUser", JSON.stringify(currentUser));
}

function saveEvaluations() {
  localStorage.setItem("dicteeCoachEvaluations", JSON.stringify(evaluations));
}

function showLoginForm() {
  document.getElementById("loginTabBtn").classList.add("active");
  document.getElementById("registerTabBtn").classList.remove("active");
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
}

function showRegisterForm() {
  document.getElementById("registerTabBtn").classList.add("active");
  document.getElementById("loginTabBtn").classList.remove("active");
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
}

function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value.trim();
  const role = document.getElementById("registerRole").value;
  const classe = document.getElementById("registerClass").value.trim();

  if (!name || !email || !password || !role) {
    alert("Veuillez remplir le nom, l’email, le mot de passe et le profil.");
    return;
  }

  if (role === "apprenant" && !classe) {
    alert("Veuillez renseigner la classe de l’apprenant.");
    return;
  }

  const exists = users.some(function (user) {
    return user.email === email;
  });

  if (exists) {
    alert("Un compte existe déjà avec cet email.");
    return;
  }

  const user = {
    id: generateId("user"),
    name: name,
    email: email,
    password: password,
    role: role,
    classe: classe,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveUsers();

  alert("Compte créé avec succès. Vous pouvez maintenant vous connecter.");

  document.getElementById("registerForm").reset();
  showLoginForm();
}

function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value.trim();

  const user = users.find(function (item) {
    return item.email === email && item.password === password;
  });

  if (!user) {
    alert("Email ou mot de passe incorrect.");
    return;
  }

  currentUser = user;
  saveCurrentUser();

  document.getElementById("loginForm").reset();
  updateAuthUI();
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem("dicteeCoachCurrentUser");
  updateAuthUI();
}

function updateAuthUI() {
  const authSection = document.getElementById("authSection");
  const homeSection = document.getElementById("homeSection");
  const badge = document.getElementById("connectedUserBadge");
  const logoutBtn = document.getElementById("logoutBtn");
  const teacherBtn = document.getElementById("teacherDashboardBtn");
  const studentBtn = document.getElementById("studentResultsBtn");

  hideAllAppSections();

  if (!currentUser) {
    authSection.classList.remove("hidden");
    homeSection.classList.add("hidden");
    badge.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    return;
  }

  authSection.classList.add("hidden");
  homeSection.classList.remove("hidden");
  badge.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");

  badge.textContent = `${currentUser.name} — ${currentUser.role}`;

  document.getElementById("welcomeTitle").textContent = `Bonjour ${currentUser.name}`;
  document.getElementById("welcomeText").textContent =
    currentUser.role === "enseignant"
      ? "Vous pouvez créer une évaluation, corriger les copies, ajouter des appréciations et suivre les progrès."
      : "Vous pouvez consulter vos résultats, appréciations et conseils de suivi.";

  teacherBtn.classList.toggle("hidden", currentUser.role !== "enseignant");
  studentBtn.classList.toggle("hidden", currentUser.role !== "apprenant");

  if (currentUser.role === "apprenant") {
    document.getElementById("searchStudentName").value = currentUser.name;
    document.getElementById("searchStudentClass").value = currentUser.classe || "";
  }

  populateEvaluationSelects();
  updateDashboardStats();
}

function hideAllAppSections() {
  const sections = [
    "teacherDashboardSection",
    "paperCopiesSection",
    "createEvaluationSection",
    "correctCopySection",
    "singleResultSection",
    "classResultsSection",
    "studentConsultationSection"
  ];

  sections.forEach(function (id) {
    document.getElementById(id).classList.add("hidden-section");
  });
}

function showHome() {
  hideAllAppSections();
  document.getElementById("homeSection").classList.remove("hidden");
}

function showTeacherDashboard() {
  if (!requireRole("enseignant")) return;

  hideAllAppSections();
  document.getElementById("teacherDashboardSection").classList.remove("hidden-section");
  updateDashboardStats();
}

function showStudentConsultation() {
  if (!requireRole("apprenant")) return;

  hideAllAppSections();
  document.getElementById("studentConsultationSection").classList.remove("hidden-section");

  document.getElementById("searchStudentName").value = currentUser.name;
  document.getElementById("searchStudentClass").value = currentUser.classe || "";
}

function showCreateEvaluation() {
  if (!requireRole("enseignant")) return;

  hideAllAppSections();
  document.getElementById("createEvaluationSection").classList.remove("hidden-section");
}

function showCorrectCopy() {
  if (!requireRole("enseignant")) return;

  hideAllAppSections();
  document.getElementById("correctCopySection").classList.remove("hidden-section");
  document.getElementById("singleResultSection").classList.remove("hidden-section");

  populateEvaluationSelects();
  showSelectedEvaluationInfo();
}

function showClassResults() {
  if (!requireRole("enseignant")) return;

  hideAllAppSections();
  document.getElementById("classResultsSection").classList.remove("hidden-section");

  populateEvaluationSelects();
  renderClassResults();
}

function requireRole(role) {
  if (!currentUser || currentUser.role !== role) {
    alert("Accès non autorisé pour ce profil.");
    return false;
  }

  return true;
}

function saveEvaluation() {
  const title = document.getElementById("evaluationTitle").value.trim();
  const classe = document.getElementById("evaluationClass").value.trim();
  const date = document.getElementById("evaluationDate").value;
  const scale = Number(document.getElementById("evaluationScale").value);
  if (!Number.isFinite(scale) || scale <= 0 || scale > 100) { alert("Choisissez un barème entre 1 et 100."); return; }
  const text = document.getElementById("referenceText").value.trim();

  if (!title || !classe || !date || !text) {
    alert("Veuillez remplir le titre, la classe, la date et le texte original.");
    return;
  }

  const evaluation = {
    id: generateId("eval"),
    teacherId: currentUser.id,
    teacherName: currentUser.name,
    title: title,
    classe: classe,
    date: date,
    scale: scale,
    referenceText: text,
    copies: [],
    createdAt: new Date().toISOString()
  };

  evaluations.push(evaluation);
  saveEvaluations();

  alert("Évaluation enregistrée avec succès.");

  clearEvaluationForm();
  populateEvaluationSelects();
  updateDashboardStats();
  showTeacherDashboard();
}

function clearEvaluationForm() {
  document.getElementById("evaluationTitle").value = "";
  document.getElementById("evaluationClass").value = "";
  document.getElementById("evaluationScale").value = 20;
  document.getElementById("referenceText").value = "";
  document.getElementById("teacherImageInput").value = "";
  document.getElementById("teacherScanStatus").textContent = "";

  initializeDate();
}

function populateEvaluationSelects() {
  const evaluationSelect = document.getElementById("evaluationSelect");
  const filterEvaluation = document.getElementById("filterEvaluation");

  evaluationSelect.innerHTML = "";
  filterEvaluation.innerHTML = '<option value="">Toutes les évaluations</option>';

  const visibleEvaluations = currentUser && currentUser.role === "enseignant"
    ? evaluations.filter(function (evaluation) {
        return evaluation.teacherId === currentUser.id;
      })
    : evaluations;

  if (visibleEvaluations.length === 0) {
    evaluationSelect.innerHTML = '<option value="">Aucune évaluation disponible</option>';
    return;
  }

  visibleEvaluations.forEach(function (evaluation) {
    const label = `${formatDate(evaluation.date)} - ${evaluation.title} - ${evaluation.classe}`;

    const option = document.createElement("option");
    option.value = evaluation.id;
    option.textContent = label;
    evaluationSelect.appendChild(option);

    const filterOption = document.createElement("option");
    filterOption.value = evaluation.id;
    filterOption.textContent = label;
    filterEvaluation.appendChild(filterOption);
  });
}

function getSelectedEvaluation() {
  const evaluationId = document.getElementById("evaluationSelect").value;

  return evaluations.find(function (evaluation) {
    return evaluation.id === evaluationId;
  }) || null;
}

function showSelectedEvaluationInfo() {
  const info = document.getElementById("selectedEvaluationInfo");
  const evaluation = getSelectedEvaluation();

  if (!evaluation) {
    info.classList.add("hidden");
    info.innerHTML = "";
    return;
  }

  info.classList.remove("hidden");
  info.innerHTML = `
    <strong>Dictée :</strong> ${escapeHTML(evaluation.title)}<br>
    <strong>Classe :</strong> ${escapeHTML(evaluation.classe)}<br>
    <strong>Date :</strong> ${formatDate(evaluation.date)}<br>
    <strong>Barème :</strong> /${evaluation.scale}<br>
    <strong>Copies corrigées :</strong> ${evaluation.copies.length}
  `;

  const studentClass = document.getElementById("studentClass");

  if (!studentClass.value.trim()) {
    studentClass.value = evaluation.classe;
  }
}

function correctAndSaveCopy() {
  const evaluation = getSelectedEvaluation();

  if (!evaluation) {
    alert("Veuillez sélectionner une évaluation.");
    return;
  }

  const name = document.getElementById("studentFullName").value.trim();
  const classe = document.getElementById("studentClass").value.trim();
  const text = document.getElementById("studentText").value.trim();

  if (!name || !classe || !text) {
    alert("Veuillez renseigner le nom, la classe et le texte de la copie.");
    return;
  }

  if (splitWords(evaluation.referenceText).length > 1500 || splitWords(text).length > 1500) { alert("Limite de 1 500 mots par copie."); return; }
  const correction = compareTexts(evaluation.referenceText, text);
  const note = Math.round((correction.score / 100) * evaluation.scale * 100) / 100;
  const appreciation = getAppreciation(correction.score);

  const result = {
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
    appreciation: appreciation,

    teacherAppreciation: "",
    studentStrengths: "",
    studentDifficulties: "",
    remediationAdvice: "",
    followupDate: "",
    followupStatus: "À revoir",

    correctedAt: new Date().toISOString()
  };

  evaluation.copies.push(result);
  saveEvaluations();

  lastCorrection = {
    evaluation: evaluation,
    result: result
  };

  renderSingleResult(evaluation, result);
  renderClassResults();
  updateDashboardStats();
  showSelectedEvaluationInfo();

  alert("Copie corrigée et résultat enregistré. Vous pouvez maintenant compléter l’appréciation et le suivi.");

  clearCopyForm();
}

function clearCopyForm() {
  document.getElementById("studentFullName").value = "";
  document.getElementById("studentClass").value = "";
  document.getElementById("studentText").value = "";
  document.getElementById("studentImageInput").value = "";
  document.getElementById("studentScanStatus").textContent = "";
}

function compareTexts(reference, student) {
  const a = splitWords(reference), b = splitWords(student);
  if (a.length > 1500 || b.length > 1500) throw new Error("Limite de 1 500 mots par copie.");
  const d = Array.from({length:a.length+1}, () => new Uint16Array(b.length+1));
  for(let i=0;i<=a.length;i++) d[i][0]=i;
  for(let j=0;j<=b.length;j++) d[0][j]=j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  let i=a.length,j=b.length, correctCount=0; const ops=[];
  while(i||j){
    if(i&&j&&d[i][j]===d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)){
      ops.push({expected:a[i-1],given:b[j-1],position:i,type:a[i-1]===b[j-1]?null:detectErrorType(a[i-1],b[j-1])});i--;j--;
    }else if(i&&d[i][j]===d[i-1][j]+1){ops.push({expected:a[i-1],given:"mot manquant",position:i,type:"Mot oublié"});i--;}
    else{ops.push({expected:"aucun mot attendu",given:b[j-1],position:i+1,type:"Mot ajouté"});j--;}
  }
  ops.reverse(); const errors=[];let outputHTML="";
  for(const op of ops){
    if(!op.type){correctCount++;outputHTML+=`<span class="word-correct">${escapeHTML(op.given)}</span> `;}
    else {errors.push(op);outputHTML+=`<span class="word-error">${escapeHTML(op.given)}</span> <span class="word-missing">→ ${escapeHTML(op.expected)}</span> `;}
  }
  return {score:a.length?Math.max(0,Math.round((1-errors.length/a.length)*100)):0,correctCount,totalWords:a.length,errors,outputHTML};
}

function renderSingleResult(evaluation, result) {
  document.getElementById("singleResultSection").classList.remove("hidden-section");

  document.getElementById("scoreValue").textContent = `${result.score}%`;

  document.querySelector(".score-circle").style.background =
    `conic-gradient(#16a34a ${result.score}%, #e5e7eb ${result.score}%)`;

  document.getElementById("feedbackTitle").textContent =
    `${result.studentName} — ${evaluation.title}`;

  document.getElementById("feedbackMessage").innerHTML = `
    <strong>Date :</strong> ${formatDate(evaluation.date)} |
    <strong>Classe :</strong> ${escapeHTML(result.studentClass)} |
    <strong>Note :</strong> ${result.note}/${result.scale}<br>
    ${escapeHTML(result.appreciation)}
  `;

  document.getElementById("totalWords").textContent = result.totalWords;
  document.getElementById("correctWords").textContent = result.correctWords;
  document.getElementById("errorWords").textContent = result.errorCount;

  document.getElementById("correctionOutput").innerHTML =
    result.correctionHTML || "Aucune correction disponible.";

  const errorList = document.getElementById("errorList");

  if (result.errors.length === 0) {
    errorList.innerHTML = "<li>Bravo ! Aucune erreur repérée.</li>";
  } else {
    errorList.innerHTML = "";

    result.errors.forEach(function (error) {
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

  document.getElementById("teacherAppreciation").value =
    result.teacherAppreciation || generateAutomaticTeacherAppreciation(result.score, result.errorCount);

  document.getElementById("studentStrengths").value =
    result.studentStrengths || generateStrengths(result.score);

  document.getElementById("studentDifficulties").value =
    result.studentDifficulties || generateDifficulties(result.errors);

  document.getElementById("remediationAdvice").value =
    result.remediationAdvice || generateRemediationAdvice(result.score);

  document.getElementById("followupDate").value = result.followupDate || "";
  document.getElementById("followupStatus").value = result.followupStatus || "À revoir";
  document.getElementById("followupStatusMessage").textContent = "";
  document.getElementById("followupStatusMessage").className = "scan-status";
}

function saveFollowup() {
  if (!lastCorrection || !lastCorrection.evaluation || !lastCorrection.result) {
    alert("Aucune correction récente à compléter.");
    return;
  }

  const teacherAppreciation = document.getElementById("teacherAppreciation").value.trim();
  const studentStrengths = document.getElementById("studentStrengths").value.trim();
  const studentDifficulties = document.getElementById("studentDifficulties").value.trim();
  const remediationAdvice = document.getElementById("remediationAdvice").value.trim();
  const followupDate = document.getElementById("followupDate").value;
  const followupStatus = document.getElementById("followupStatus").value;

  const evaluation = evaluations.find(function (item) {
    return item.id === lastCorrection.evaluation.id;
  });

  if (!evaluation) {
    alert("Évaluation introuvable.");
    return;
  }

  const copy = evaluation.copies.find(function (item) {
    return item.id === lastCorrection.result.id;
  });

  if (!copy) {
    alert("Résultat de l’élève introuvable.");
    return;
  }

  copy.teacherAppreciation = teacherAppreciation;
  copy.studentStrengths = studentStrengths;
  copy.studentDifficulties = studentDifficulties;
  copy.remediationAdvice = remediationAdvice;
  copy.followupDate = followupDate;
  copy.followupStatus = followupStatus;

  saveEvaluations();

  lastCorrection.result = copy;

  const message = document.getElementById("followupStatusMessage");
  message.textContent = "Appréciation et suivi pédagogique enregistrés avec succès.";
  message.className = "scan-status success-status";

  renderClassResults();
}

function renderClassResults() {
  const body = document.getElementById("classResultsBody");
  const selectedEval = document.getElementById("filterEvaluation").value;
  const selectedClass = normalizeForSearch(document.getElementById("filterClass").value);
  const selectedStudent = normalizeForSearch(document.getElementById("filterStudent").value);

  const rows = [];

  evaluations.forEach(function (evaluation) {
    if (currentUser && currentUser.role === "enseignant" && evaluation.teacherId !== currentUser.id) {
      return;
    }

    if (selectedEval && evaluation.id !== selectedEval) {
      return;
    }

    evaluation.copies.forEach(function (copy) {
      const classMatch = !selectedClass || normalizeForSearch(copy.studentClass).includes(selectedClass);
      const studentMatch = !selectedStudent || normalizeForSearch(copy.studentName).includes(selectedStudent);

      if (classMatch && studentMatch) {
        rows.push({ evaluation: evaluation, copy: copy });
      }
    });
  });

  if (rows.length === 0) {
    body.innerHTML = `<tr><td colspan="10">Aucun résultat trouvé.</td></tr>`;
    return;
  }

  body.innerHTML = "";

  rows.forEach(function (item) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatDate(item.evaluation.date)}</td>
      <td>${escapeHTML(item.evaluation.title)}</td>
      <td>${escapeHTML(item.copy.studentClass)}</td>
      <td>${escapeHTML(item.copy.studentName)}</td>
      <td class="${getScoreClass(item.copy.score)}">${item.copy.score}%</td>
      <td>${item.copy.note}/${item.copy.scale}</td>
      <td>${item.copy.errorCount}</td>
      <td><span class="followup-badge">${escapeHTML(item.copy.followupStatus || "À revoir")}</span></td>
      <td>${item.copy.followupDate ? formatDate(item.copy.followupDate) : "Non renseignée"}</td>
      <td>${escapeHTML(item.copy.teacherAppreciation || item.copy.appreciation)}</td>
    `;

    body.appendChild(tr);
  });
}

function clearFilters() {
  document.getElementById("filterEvaluation").value = "";
  document.getElementById("filterClass").value = "";
  document.getElementById("filterStudent").value = "";
  renderClassResults();
}

function searchStudentResults() {
  const name = normalizeForSearch(document.getElementById("searchStudentName").value);
  const classe = normalizeForSearch(document.getElementById("searchStudentClass").value);
  const date = document.getElementById("searchEvaluationDate").value;
  const box = document.getElementById("studentResultsBox");

  if (!name || !classe) {
    alert("Veuillez renseigner votre nom et votre classe.");
    return;
  }

  const results = [];

  evaluations.forEach(function (evaluation) {
    if (date && evaluation.date !== date) {
      return;
    }

    evaluation.copies.forEach(function (copy) {
      const nameMatch = normalizeForSearch(copy.studentName).includes(name);
      const classMatch = normalizeForSearch(copy.studentClass) === classe;

      if (nameMatch && classMatch) {
        results.push({ evaluation: evaluation, copy: copy });
      }
    });
  });

  if (results.length === 0) {
    box.innerHTML = `
      <p>Aucun résultat trouvé.</p>
      <p>Vérifiez votre nom, votre classe ou la date d’évaluation.</p>
    `;
    return;
  }

  box.innerHTML = "";

  results.forEach(function (item) {
    const div = document.createElement("div");
    div.className = "result-card-student";

    div.innerHTML = `
      <h3>${escapeHTML(item.evaluation.title)}</h3>
      <p><strong>Date :</strong> ${formatDate(item.evaluation.date)}</p>
      <p><strong>Classe :</strong> ${escapeHTML(item.copy.studentClass)}</p>
      <p><strong>Score :</strong> <span class="${getScoreClass(item.copy.score)}">${item.copy.score}%</span></p>
      <p><strong>Note :</strong> ${item.copy.note}/${item.copy.scale}</p>
      <p><strong>Nombre d’erreurs :</strong> ${item.copy.errorCount}</p>
      <p><strong>Appréciation automatique :</strong> ${escapeHTML(item.copy.appreciation)}</p>
      <p><strong>Appréciation de l’enseignant :</strong> ${escapeHTML(item.copy.teacherAppreciation || item.copy.appreciation)}</p>
      <p><strong>Points forts :</strong> ${escapeHTML(item.copy.studentStrengths || "Non renseigné")}</p>
      <p><strong>Difficultés à renforcer :</strong> ${escapeHTML(item.copy.studentDifficulties || "Non renseigné")}</p>
      <p><strong>Conseils de remédiation :</strong> ${escapeHTML(item.copy.remediationAdvice || "Non renseigné")}</p>
      <p><strong>Statut du suivi :</strong> <span class="followup-badge">${escapeHTML(item.copy.followupStatus || "À revoir")}</span></p>
      <p><strong>Date de suivi proposée :</strong> ${item.copy.followupDate ? formatDate(item.copy.followupDate) : "Non renseignée"}</p>
    `;

    box.appendChild(div);
  });
}

function clearStudentSearch() {
  document.getElementById("searchStudentName").value = currentUser ? currentUser.name : "";
  document.getElementById("searchStudentClass").value = currentUser ? currentUser.classe || "" : "";
  document.getElementById("searchEvaluationDate").value = "";
  document.getElementById("studentResultsBox").innerHTML = "Aucun résultat recherché pour le moment.";
}

function exportAllResults() {
  const lines = [];
  lines.push("Date;Dictée;Classe;Élève;Score;Note;Barème;Erreurs;Statut suivi;Date suivi;Appréciation;Points forts;Difficultés;Conseils");

  evaluations.forEach(function (evaluation) {
    if (currentUser && currentUser.role === "enseignant" && evaluation.teacherId !== currentUser.id) {
      return;
    }

    evaluation.copies.forEach(function (copy) {
      lines.push([
        evaluation.date,
        evaluation.title,
        copy.studentClass,
        copy.studentName,
        `${copy.score}%`,
        copy.note,
        copy.scale,
        copy.errorCount,
        copy.followupStatus || "À revoir",
        copy.followupDate || "",
        copy.teacherAppreciation || copy.appreciation,
        copy.studentStrengths || "",
        copy.studentDifficulties || "",
        copy.remediationAdvice || ""
      ].map(escapeCSV).join(";"));
    });
  });

  if (lines.length === 1) {
    alert("Aucun résultat à exporter.");
    return;
  }

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "resultats_et_suivi_dictee_coach_ia.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function resetApplication() {
  if (!confirm("Voulez-vous supprimer toutes vos évaluations et résultats ?")) {
    return;
  }

  if (currentUser && currentUser.role === "enseignant") {
    evaluations = evaluations.filter(function (evaluation) {
      return evaluation.teacherId !== currentUser.id;
    });
  }

  saveEvaluations();
  populateEvaluationSelects();
  updateDashboardStats();

  alert("Données réinitialisées.");
  showTeacherDashboard();
}

async function scanTeacherImage() {
  const file = document.getElementById("teacherImageInput").files[0];

  if (!file) {
    alert("Veuillez choisir une image.");
    return;
  }

  const status = document.getElementById("teacherScanStatus");
  const button = document.getElementById("scanTeacherBtn");

  setScanStatus(status, "Lecture de l’image en cours...", "");
  button.disabled = true;

  try {
    const text = await extractTextFromImage(file, status);
    document.getElementById("referenceText").value = cleanOCRText(text);

    setScanStatus(status, "Texte extrait. Vérifiez-le avant l’enregistrement.", "success-status");
  } catch (error) {
    console.error(error);
    setScanStatus(status, "Erreur de lecture. Essayez avec une photo plus nette.", "error-status");
  } finally {
    button.disabled = false;
  }
}

async function scanStudentImage() {
  const file = document.getElementById("studentImageInput").files[0];

  if (!file) {
    alert("Veuillez choisir une image.");
    return;
  }

  const status = document.getElementById("studentScanStatus");
  const button = document.getElementById("scanStudentBtn");

  setScanStatus(status, "Lecture de la copie en cours...", "");
  button.disabled = true;

  try {
    const text = await extractTextFromImage(file, status);
    document.getElementById("studentText").value = cleanOCRText(text);

    setScanStatus(status, "Texte extrait. Relisez-le avant correction.", "success-status");
  } catch (error) {
    console.error(error);
    setScanStatus(status, "Erreur de lecture. Essayez avec une photo plus nette.", "error-status");
  } finally {
    button.disabled = false;
  }
}

async function extractTextFromImage(file, statusElement) {
  if (typeof Tesseract === "undefined") {
    throw new Error("Tesseract.js n’est pas chargé.");
  }

  const imageURL = URL.createObjectURL(file);

  const result = await Tesseract.recognize(imageURL, "fra", {
    logger: function (message) {
      if (message.status === "recognizing text") {
        const progress = Math.round(message.progress * 100);
        setScanStatus(statusElement, `Reconnaissance du texte : ${progress}%`, "");
      }
    }
  });

  URL.revokeObjectURL(imageURL);

  return result.data.text;
}

function updateDashboardStats() {
  if (!currentUser || currentUser.role !== "enseignant") return;

  const myEvaluations = evaluations.filter(function (evaluation) {
    return evaluation.teacherId === currentUser.id;
  });

  let copies = [];
  myEvaluations.forEach(function (evaluation) {
    copies = copies.concat(evaluation.copies);
  });

  const average = copies.length
    ? Math.round(copies.reduce(function (sum, copy) {
        return sum + copy.score;
      }, 0) / copies.length)
    : 0;

  document.getElementById("statEvaluations").textContent = myEvaluations.length;
  document.getElementById("statCopies").textContent = copies.length;
  document.getElementById("statAverage").textContent = `${average}%`;
}

function initializeDate() {
  const dateInput = document.getElementById("evaluationDate");

  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

function generateAutomaticTeacherAppreciation(score, errorCount) {
  if (score >= 90) {
    return `Très bon travail. L’élève maîtrise globalement la dictée avec seulement ${errorCount} erreur(s) repérée(s). Il faut maintenir les efforts et continuer la relecture.`;
  }

  if (score >= 70) {
    return `Bon travail dans l’ensemble. L’élève présente des acquis solides, mais certaines erreurs doivent être retravaillées avec attention.`;
  }

  if (score >= 50) {
    return `Résultat moyen. L’élève comprend globalement l’exercice, mais doit renforcer l’orthographe, les accords et la relecture.`;
  }

  return `Des difficultés importantes sont observées. L’élève a besoin d’un accompagnement régulier et d’exercices de remédiation ciblés.`;
}

function generateStrengths(score) {
  if (score >= 90) {
    return "Bonne maîtrise générale, attention soutenue, respect du texte et effort de relecture.";
  }

  if (score >= 70) {
    return "Présence d’acquis, effort de transcription, compréhension globale du texte.";
  }

  if (score >= 50) {
    return "Quelques acquis sont visibles. L’élève peut progresser avec un accompagnement régulier.";
  }

  return "L’élève a participé à l’exercice et dispose d’une base à renforcer progressivement.";
}

function generateDifficulties(errors) {
  if (!errors || errors.length === 0) {
    return "Aucune difficulté majeure repérée dans cette correction.";
  }

  const types = errors.map(function (error) {
    return error.type;
  });

  const uniqueTypes = [...new Set(types)];

  return uniqueTypes.join(", ");
}

function generateRemediationAdvice(score) {
  if (score >= 90) {
    return "Poursuivre les exercices de dictée, maintenir la relecture et travailler les détails de ponctuation.";
  }

  if (score >= 70) {
    return "Reprendre les mots signalés, faire une courte dictée de renforcement et vérifier les accords dans chaque phrase.";
  }

  if (score >= 50) {
    return "Prévoir des exercices ciblés sur les accords, les homophones, la conjugaison et la ponctuation.";
  }

  return "Mettre en place un accompagnement rapproché : reprise des mots difficiles, dictées courtes, lecture régulière et correction guidée.";
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function normalizeText(text) {
  return text
    .normalize("NFC")
    .trim()
    .replace(/[’]/g, "'")
    .replace(/[.,;:!?()"]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function splitWords(text) {
  const clean = normalizeText(text);
  return clean ? clean.split(" ") : [];
}

function cleanOCRText(text) {
  return text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[|]/g, "I")
    .trim();
}

function detectErrorType(expected, given) {
  if (given === "mot manquant") return "Mot oublié";
  if (expected.length === given.length) return "Erreur d’orthographe possible";
  if (expected.startsWith(given) || given.startsWith(expected)) return "Mot incomplet ou accord oublié";
  if (Math.abs(expected.length - given.length) <= 2) return "Erreur proche du mot attendu";
  return "Mot différent";
}

function getAppreciation(score) {
  if (score >= 90) return "Excellent travail. La dictée est très bien maîtrisée.";
  if (score >= 70) return "Bon travail. Quelques erreurs doivent être reprises.";
  if (score >= 50) return "Résultat moyen. Il faut renforcer l’orthographe et la relecture.";
  return "Des difficultés importantes sont observées. Une remédiation est nécessaire.";
}

function getScoreClass(score) {
  if (score >= 70) return "score-good";
  if (score >= 50) return "score-medium";
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
  if (!dateString) return "";

  const parts = dateString.split("-");

  if (parts.length !== 3) return dateString;

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