const PREPA_CLASSES = [
  { value: "JSS1", label: "JSS 1" },
  { value: "JSS2", label: "JSS 2" },
  { value: "JSS3", label: "JSS 3" },
  { value: "SS1", label: "SS 1" },
  { value: "SS2", label: "SS 2" }
];

const PREPA_TERMS = ["First Term", "Second Term", "Third Term"];

const PREPA_SUBJECT_GROUPS = [
  {
    label: "Core Subjects",
    subjects: ["Mathematics", "English", "Civic Education"]
  },
  {
    label: "Junior Secondary",
    subjects: ["Basic Science", "Basic Technology", "Social Studies", "Business Studies"]
  },
  {
    label: "Science",
    subjects: ["Biology", "Chemistry", "Physics", "Agricultural Science"]
  },
  {
    label: "Arts and Humanities",
    subjects: ["CRS", "Government", "Literature", "History"]
  },
  {
    label: "Commercial",
    subjects: ["Economics", "Commerce", "Accounting"]
  }
];

const PREPA_DEFAULT_CLASS = "SS1";
const PREPA_DEFAULT_TERM = "First Term";

function normalizeClassLevel(value) {
  return String(value || PREPA_DEFAULT_CLASS).replace(/\s+/g, "").toUpperCase();
}

function getClassLabel(value) {
  const normalized = normalizeClassLevel(value);
  const match = PREPA_CLASSES.find(item => item.value === normalized);
  return match ? match.label : normalized;
}

function getAllSubjects() {
  return PREPA_SUBJECT_GROUPS.flatMap(group => group.subjects);
}

function getSubjectGroupsWithAvailability(questionBank) {
  const availableSubjects = new Set(Object.keys(questionBank || {}));

  return PREPA_SUBJECT_GROUPS.map(group => ({
    ...group,
    subjects: group.subjects.map(subject => ({
      name: subject,
      hasQuestions: availableSubjects.has(subject)
    }))
  }));
}

function createSubjectOptionsHtml(selectedSubject = "") {
  return PREPA_SUBJECT_GROUPS.map(group => `
    <optgroup label="${group.label}">
      ${group.subjects.map(subject => `
        <option value="${subject}" ${subject === selectedSubject ? "selected" : ""}>${subject}</option>
      `).join("")}
    </optgroup>
  `).join("");
}

function normalizeQuestion(question, context = {}, index = 0) {
  const options = Array.isArray(question?.options) ? [...question.options] : [];
  let correctAnswer = question?.correctAnswer ?? question?.answer ?? "";

  if (typeof correctAnswer === "number") {
    correctAnswer = options[correctAnswer] ?? "";
  }

  return {
    ...question,
    id: question?.id || `${normalizeClassLevel(context.classLevel)}-${context.term || PREPA_DEFAULT_TERM}-${context.subject || "Subject"}-${index + 1}`,
    classLevel: normalizeClassLevel(question?.classLevel || context.classLevel || PREPA_DEFAULT_CLASS),
    term: question?.term || context.term || PREPA_DEFAULT_TERM,
    subject: question?.subject || context.subject || "General",
    questionText: question?.questionText || question?.text || "",
    text: question?.text || question?.questionText || "",
    options,
    answer: correctAnswer,
    correctAnswer,
    explanation: question?.explanation || "Review the concept tested in this question and compare each option carefully."
  };
}

function getQuestionBank() {
  const builtInQuestions =
    typeof questions === "object" && questions
      ? questions
      : (typeof QUESTIONS_BY_SUBJECT === "object" && QUESTIONS_BY_SUBJECT ? QUESTIONS_BY_SUBJECT : {});
  const customQuestions = JSON.parse(localStorage.getItem("customQuestions")) || {};

  return { ...builtInQuestions, ...customQuestions };
}

function getQuestionsForSelection(questionBank, selection) {
  const subject = selection?.subject || localStorage.getItem("selectedSubject") || "";
  const classLevel = normalizeClassLevel(selection?.classLevel || localStorage.getItem("selectedClassLevel"));
  const term = selection?.term || localStorage.getItem("selectedTerm") || PREPA_DEFAULT_TERM;
  const subjectQuestions = Array.isArray(questionBank?.[subject]) ? questionBank[subject] : [];

  const normalizedQuestions = subjectQuestions.map((question, index) =>
    normalizeQuestion(question, { subject, classLevel, term }, index)
  );

  const exactMatches = normalizedQuestions.filter(question =>
    normalizeClassLevel(question.classLevel) === classLevel &&
    question.term === term &&
    question.subject === subject
  );

  return exactMatches.length > 0 ? exactMatches : normalizedQuestions;
}

function getCurrentExamSelection() {
  const studentDetails = JSON.parse(localStorage.getItem("studentDetails")) || {};

  return {
    classLevel: normalizeClassLevel(studentDetails.classLevel || localStorage.getItem("selectedClassLevel")),
    term: studentDetails.term || localStorage.getItem("selectedTerm") || PREPA_DEFAULT_TERM,
    subject: studentDetails.selectedSubject || localStorage.getItem("selectedSubject") || ""
  };
}
