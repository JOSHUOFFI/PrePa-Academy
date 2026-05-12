/* =========================
   CBT RESULTS SCRIPT
========================= */

// ==========================
// Authentication Check
// ==========================
function checkUserAuth() {
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.email) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = "login.html";
    return false;
  }
}

if (!checkUserAuth()) {
  throw new Error('User not authenticated');
}

function getLocalStorageJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[Results] Failed to parse localStorage item '${key}':`, error);
    return fallback;
  }
}

function showFallback(message, actionText = "Return Home", actionHref = "index.html") {
  const mainArea = document.getElementById("result-page");
  const body = document.body;

  if (mainArea) {
    mainArea.innerHTML = `
      <div class="container py-5 text-center">
        <div class="alert alert-warning" role="alert">
          <h4 class="alert-heading">Data unavailable</h4>
          <p>${message}</p>
          <hr>
          <a href="${actionHref}" class="btn btn-primary">${actionText}</a>
        </div>
      </div>
    `;
  } else if (body) {
    body.innerHTML = `<p style="color:red; padding: 2rem;">${message}</p>`;
  }
}

function renderNoResults() {
  const summaryGrid = document.getElementById("summary-grid");
  const performanceCard = document.getElementById("performance-card");
  const percentageDisplay = document.getElementById("percentage-display");
  const progressCircle = document.getElementById("progress-circle");
  const reviewList = document.getElementById("review-list");

  if (reviewList) {
    reviewList.innerHTML = "<p class='text-muted'>No review items available.</p>";
  }
  if (summaryGrid) {
    summaryGrid.innerHTML = "<p class='text-muted'>No summary available.</p>";
  }
  if (performanceCard) {
    performanceCard.textContent = "No performance data available.";
  }
  if (percentageDisplay) {
    percentageDisplay.textContent = "0%";
  }
  if (progressCircle) {
    progressCircle.style.strokeDashoffset = "283";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let studentDetails = getLocalStorageJSON("studentDetails", null);
  let userAnswers = getLocalStorageJSON("userAnswers", {});
  let shuffledQuestions = getLocalStorageJSON("shuffledQuestions", []);

  const summaryGrid = document.getElementById("summary-grid");
  const performanceCard = document.getElementById("performance-card");
  const percentageDisplay = document.getElementById("percentage-display");
  const progressCircle = document.getElementById("progress-circle");
  const reviewList = document.getElementById("review-list");
  const retryWrongBtn = document.getElementById("retry-wrong-btn");
  const excelBtn = document.getElementById("excel-btn");
  const pdfBtn = document.getElementById("pdf-btn");

  const gradeScale = [
    { min: 80, grade: "A+", message: "Outstanding performance" },
    { min: 70, grade: "A", message: "Excellent work" },
    { min: 60, grade: "B", message: "Very good job" },
    { min: 50, grade: "C", message: "Good effort" },
    { min: 40, grade: "D", message: "Pass" },
    { min: 0, grade: "F", message: "Needs improvement" }
  ];

  if (!studentDetails || !Array.isArray(shuffledQuestions) || shuffledQuestions.length === 0) {
    console.error("[Results] Missing or invalid student data/shuffled questions:", { studentDetails, shuffledQuestions });
    showFallback("No exam data found. Please complete an exam first.");
    renderNoResults();
    return;
  }

  if (typeof userAnswers !== "object" || userAnswers === null) {
    console.warn("[Results] Invalid userAnswers data, resetting to empty object.");
    userAnswers = {};
  }

  function calculateResults() {
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const wrongQuestions = [];
    const correctQuestions = [];

    shuffledQuestions.forEach(question => {
      if (!question || typeof question !== "object") return;

      const questionPoints = Number(question.points) || 1;
      const correctAnswer = question.correctAnswer ?? question.answer ?? "";
      const selectedAnswer = userAnswers[question.id] ?? "";

      totalPoints += questionPoints;

      if (selectedAnswer === correctAnswer) {
        correct += 1;
        earnedPoints += questionPoints;
        correctQuestions.push({ ...question, selectedAnswer, correctAnswer });
      } else {
        wrongQuestions.push({ ...question, selectedAnswer, correctAnswer });
      }
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const gradeInfo = gradeScale.find(item => percentage >= item.min) || gradeScale[gradeScale.length - 1];

    return {
      correct,
      wrong: wrongQuestions.length,
      percentage,
      grade: gradeInfo.grade,
      performanceMessage: gradeInfo.message,
      wrongQuestions,
      correctQuestions,
      totalPoints
    };
  }

  const result = calculateResults();

  function persistExamResult() {
    try {
      if (!studentDetails || !Array.isArray(shuffledQuestions) || shuffledQuestions.length === 0) {
        console.warn("[Results] Skipping persistExamResult due to invalid source data.");
        return;
      }

      const sessionId = studentDetails.sessionId || String(Date.now());
      const entry = {
        sessionId,
        timestamp: Date.now(),
        firstName: studentDetails.firstName || "Unknown",
        lastName: studentDetails.lastName || "",
        classLevel: studentDetails.classLevel || localStorage.getItem("selectedClassLevel") || "N/A",
        term: studentDetails.term || localStorage.getItem("selectedTerm") || "N/A",
        selectedSubject: studentDetails.selectedSubject || "Unknown",
        correct: result.correct,
        wrong: result.wrong,
        total: shuffledQuestions.length,
        percentage: result.percentage,
        grade: result.grade,
        breakdown: shuffledQuestions.map((question, index) => {
          const correctAnswer = question?.correctAnswer ?? question?.answer ?? "";
          const selected = userAnswers[question?.id] ?? "Not Answered";

          return {
            no: index + 1,
            text: question?.questionText ?? question?.text ?? "Untitled question",
            selected,
            correct: correctAnswer,
            explanation: question?.explanation ?? "",
            outcome: selected === correctAnswer ? "Correct" : "Wrong"
          };
        })
      };

      const store = getLocalStorageJSON("examResults", []);
      const normalizedStore = Array.isArray(store) ? store : [];
      const existingIndex = normalizedStore.findIndex(item => item.sessionId === sessionId);

      if (existingIndex >= 0) {
        normalizedStore[existingIndex] = entry;
      } else {
        normalizedStore.push(entry);
      }

      localStorage.setItem("examResults", JSON.stringify(normalizedStore));
    } catch (error) {
      console.error("[Results] persistExamResult failed:", error);
    }
  }

  function animatePercentage(target) {
    if (!percentageDisplay || !progressCircle) {
      console.error("[Results] Missing percentageDisplay or progressCircle element.");
      return;
    }

    const circumference = 283;
    const safeTarget = Math.max(0, Math.min(100, Number(target) || 0));
    let current = 0;

    progressCircle.style.strokeDasharray = String(circumference);

    const updateCircle = value => {
      percentageDisplay.textContent = `${value}%`;
      progressCircle.style.strokeDashoffset = String(circumference - (value / 100) * circumference);
    };

    updateCircle(0);

    if (safeTarget === 0) {
      return;
    }

    const interval = setInterval(() => {
      current += 1;
      if (current > safeTarget) {
        current = safeTarget;
      }
      updateCircle(current);

      if (current >= safeTarget) {
        clearInterval(interval);
      }
    }, 15);
  }

  function renderSummary() {
    if (!summaryGrid || !performanceCard) {
      console.error("[Results] Summary grid or performance card missing.");
      return;
    }

    summaryGrid.innerHTML = `
      <div class="col-6 col-md-4">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 gap-md-3 text-center text-md-start">
          <div class="bg-white rounded p-2 shadow-sm"><i class="bi bi-person text-primary"></i></div>
          <div>
            <p class="text-muted extra-small mb-0">Student</p>
            <p class="fw-bold small mb-0">${studentDetails.firstName || "Unknown"}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 gap-md-3 text-center text-md-start">
          <div class="bg-white rounded p-2 shadow-sm"><i class="bi bi-layers text-primary"></i></div>
          <div>
            <p class="text-muted extra-small mb-0">Class</p>
            <p class="fw-bold small mb-0">${studentDetails.classLevel || localStorage.getItem("selectedClassLevel") || "N/A"}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 gap-md-3 text-center text-md-start">
          <div class="bg-white rounded p-2 shadow-sm"><i class="bi bi-calendar3 text-primary"></i></div>
          <div>
            <p class="text-muted extra-small mb-0">Term</p>
            <p class="fw-bold small mb-0">${studentDetails.term || localStorage.getItem("selectedTerm") || "N/A"}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 gap-md-3 text-center text-md-start">
          <div class="bg-white rounded p-2 shadow-sm"><i class="bi bi-book text-primary"></i></div>
          <div>
            <p class="text-muted extra-small mb-0">Subject</p>
            <p class="fw-bold small mb-0">${studentDetails.selectedSubject || "Unknown"}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 gap-md-3 text-center text-md-start">
          <div class="bg-white rounded p-2 shadow-sm"><i class="bi bi-question-circle text-primary"></i></div>
          <div>
            <p class="text-muted extra-small mb-0">Questions</p>
            <p class="fw-bold small mb-0">${shuffledQuestions.length}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 gap-md-3 text-center text-md-start">
          <div class="bg-white rounded p-2 shadow-sm"><i class="bi bi-check-circle text-success"></i></div>
          <div>
            <p class="text-muted extra-small mb-0">Correct</p>
            <p class="fw-bold small mb-0 text-success">${result.correct}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 gap-md-3 text-center text-md-start">
          <div class="bg-white rounded p-2 shadow-sm"><i class="bi bi-bar-chart-line text-info"></i></div>
          <div>
            <p class="text-muted extra-small mb-0">Score</p>
            <p class="fw-bold small mb-0">${result.correct}/${shuffledQuestions.length}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-2 gap-md-3 text-center text-md-start">
          <div class="bg-white rounded p-2 shadow-sm"><i class="bi bi-patch-check-fill text-${result.percentage >= 50 ? "success" : "danger"}"></i></div>
          <div>
            <p class="text-muted extra-small mb-0">Status</p>
            <p class="fw-bold small mb-0 ${result.percentage >= 50 ? "text-success" : "text-danger"}">${result.percentage >= 50 ? "Pass" : "Fail"}</p>
          </div>
        </div>
      </div>
    `;

    performanceCard.textContent = `${result.performanceMessage} - ${result.percentage}% - ${result.percentage >= 50 ? "PASS" : "FAIL"}`;

    if (result.percentage >= 70) {
      performanceCard.className = "p-3 rounded-pill text-center fw-bold mb-5 bg-success-subtle text-success border border-success-subtle";
    } else if (result.percentage < 50) {
      performanceCard.className = "p-3 rounded-pill text-center fw-bold mb-5 bg-danger-subtle text-danger border border-danger-subtle";
    } else {
      performanceCard.className = "p-3 rounded-pill text-center fw-bold mb-5 bg-warning-subtle text-warning border border-warning-subtle";
    }

    animatePercentage(result.percentage);
  }

  function renderReview() {
    if (!reviewList) {
      console.error("[Results] reviewList element missing, cannot render questions.");
      return;
    }

    if (!Array.isArray(shuffledQuestions) || shuffledQuestions.length === 0) {
      reviewList.innerHTML = "<p class='text-muted'>No questions available for review.</p>";
      return;
    }

    reviewList.innerHTML = shuffledQuestions.map((question, index) => {
      const questionText = question?.questionText ?? question?.text ?? "No question text provided";
      const correctAnswer = question?.correctAnswer ?? question?.answer ?? "Unknown";
      const selectedAnswer = userAnswers[question?.id] ?? "Not Answered";
      const isCorrect = selectedAnswer === correctAnswer;

      return `
        <div class="card ${isCorrect ? "border-success" : "border-danger"} mb-3">
          <div class="card-body">
            <h5 class="card-title mb-2">Q${index + 1}: ${questionText}</h5>
            <p class="mb-1"><strong>Your answer:</strong> ${selectedAnswer}</p>
            <p class="mb-1"><strong>Correct answer:</strong> ${correctAnswer}</p>
            <p class="mb-1 ${isCorrect ? "text-success" : "text-danger"}"><strong>${isCorrect ? "Correct" : "Wrong"}</strong></p>
            <p class="text-secondary mb-0"><strong>Explanation:</strong> ${question?.explanation || "Review this concept and try again."}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  function exportToExcel() {
    if (typeof XLSX === "undefined") {
      console.error("[Results] XLSX library missing.");
      alert("Excel export is currently unavailable because the export library did not load.");
      return;
    }

    try {
      const breakdown = shuffledQuestions.map((question, index) => {
        const correctAnswer = question?.correctAnswer ?? question?.answer ?? "";
        const selected = userAnswers[question?.id] ?? "Not Answered";

        return {
          "Question No": index + 1,
          Question: question?.questionText ?? question?.text ?? "Untitled question",
          "Selected Answer": selected,
          "Correct Answer": correctAnswer,
          Result: selected === correctAnswer ? "Correct" : "Wrong"
        };
      });

      breakdown.push({});
      breakdown.push({
        Question: "SUMMARY",
        "Selected Answer": `Score: ${result.correct}/${shuffledQuestions.length}`,
        "Correct Answer": `Percentage: ${result.percentage}%`,
        Result: `Grade: ${result.grade}`
      });

      const worksheet = XLSX.utils.json_to_sheet(breakdown);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Result");
      XLSX.writeFile(workbook, `${studentDetails.firstName || "student"}_${studentDetails.lastName || ""}_${studentDetails.selectedSubject || "subject"}_Result.xlsx`);
    } catch (error) {
      console.error("[Results] exportToExcel failed:", error);
      alert("Failed to export to Excel. See console for details.");
    }
  }

  function exportToPdf() {
    if (typeof html2pdf === "undefined") {
      console.error("[Results] html2pdf library missing.");
      alert("PDF export is currently unavailable because the export library did not load.");
      return;
    }

    const element = document.getElementById("result-page");
    if (!element) {
      console.error("[Results] result-page element missing for PDF export.");
      return;
    }

    const safeFilename = `${studentDetails.firstName || "student"}_${studentDetails.lastName || ""}_Result.pdf`;

    try {
      html2pdf().set({
        margin: 0.5,
        filename: safeFilename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      }).from(element).save();
    } catch (error) {
      console.error("[Results] exportToPdf failed:", error);
      alert("Failed to export to PDF. See console for details.");
    }
  }

  function launchConfetti() {
    try {
      const confetti = document.createElement("div");
      confetti.textContent = "* * *";
      confetti.className = "position-fixed start-50 translate-middle-x mt-3 display-4";
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    } catch (error) {
      console.error("[Results] launchConfetti failed:", error);
    }
  }

  try {
    persistExamResult();
    renderSummary();
    renderReview();

    if (excelBtn) {
      excelBtn.addEventListener("click", exportToExcel);
    }

    if (pdfBtn) {
      pdfBtn.addEventListener("click", exportToPdf);
    }

    if (retryWrongBtn) {
      retryWrongBtn.addEventListener("click", () => {
        if (!Array.isArray(result.wrongQuestions) || result.wrongQuestions.length === 0) {
          alert("No wrong questions to retry. Great job!");
          return;
        }

        const retryQuestions = result.wrongQuestions.map(question => ({
          ...question,
          options: Array.isArray(question?.options) ? [...question.options] : []
        }));

        localStorage.setItem("shuffledQuestions", JSON.stringify(retryQuestions));
        localStorage.removeItem("userAnswers");
        localStorage.removeItem("currentQuestionIndex");
        localStorage.setItem("examEndTime", Date.now() + 40 * 60 * 1000);
        window.location.href = "exam.html";
      });
    }

    if (result.percentage >= 50) {
      launchConfetti();
    }
  } catch (error) {
    console.error("[Results] render or interaction setup failed:", error);
    showFallback("Unable to render results right now. Please refresh or retry later.");
    renderNoResults();
  }
});





