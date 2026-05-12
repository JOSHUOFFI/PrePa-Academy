(function () {
  const CONFIG = {
    // Point this to a secure backend route that calls Gemini or another provider.
    // Keep private API keys on the server, never inside browser JavaScript.
    endpoint: window.PREPA_CLASSROOM_API_ENDPOINT || "/api/classroom",
    historyKey: "prepaClassroomTopicHistory",
    maxHistory: 8,
    requestTimeoutMs: 45000
  };

  const state = {
    isBusy: false,
    activeTopic: "",
    messages: []
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", initClassroom);

  function initClassroom() {
    cacheElements();
    bindEvents();
    renderHistory();
  }

  function cacheElements() {
    els.topicForm = document.getElementById("topic-form");
    els.topicInput = document.getElementById("topic-input");
    els.learnBtn = document.getElementById("learn-btn");
    els.lessonArea = document.getElementById("lesson-area");
    els.alert = document.getElementById("classroom-alert");
    els.followupForm = document.getElementById("followup-form");
    els.followupInput = document.getElementById("followup-input");
    els.followupBtn = document.getElementById("followup-btn");
    els.followupSuggestions = document.getElementById("followup-suggestions");
    els.topicChips = document.getElementById("topic-chip-list");
    els.history = document.getElementById("topic-history");
    els.clearHistoryBtn = document.getElementById("clear-history-btn");
  }

  function bindEvents() {
    els.topicForm.addEventListener("submit", event => {
      event.preventDefault();
      startLesson(els.topicInput.value);
    });

    els.followupForm.addEventListener("submit", event => {
      event.preventDefault();
      askFollowup(els.followupInput.value);
    });

    els.topicChips.addEventListener("click", event => {
      const button = event.target.closest("button[data-topic]");
      if (!button) return;
      els.topicInput.value = button.dataset.topic;
      startLesson(button.dataset.topic);
    });

    els.followupSuggestions.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      askFollowup(button.textContent);
    });

    els.clearHistoryBtn.addEventListener("click", () => {
      localStorage.removeItem(CONFIG.historyKey);
      renderHistory();
    });
  }

  async function startLesson(rawTopic) {
    const topic = sanitizeInput(rawTopic);
    if (!topic) {
      showAlert("Please type a topic you want to learn.");
      return;
    }

    if (state.isBusy) return;

    state.activeTopic = topic;
    state.messages = [];
    clearAlert();
    setBusy(true);
    renderConversation();
    appendMessage("student", `Teach me about ${topic}.`);
    renderTyping("Generating lesson...");

    try {
      const lesson = await ClassroomAI.generateLesson({ topic, history: state.messages });
      replaceTypingWithMessage("assistant", lesson);
      saveTopic(topic);
      renderHistory();
      setFollowupEnabled(true);
    } catch (error) {
      console.error("[Classroom] Lesson request failed:", error);
      removeTyping();
      showAlert(getFriendlyErrorMessage(error, "Classroom could not generate that lesson right now. Please try again."));
      appendMessage("assistant", "I could not generate a lesson for that topic right now. Please check your connection and try again in a moment.");
      setFollowupEnabled(false);
    } finally {
      setBusy(false);
    }
  }

  async function askFollowup(rawQuestion) {
    const question = sanitizeInput(rawQuestion);
    if (!question || !state.activeTopic || state.isBusy) return;

    clearAlert();
    setBusy(true);
    els.followupInput.value = "";
    appendMessage("student", question);
    renderTyping("Generating explanation...");

    try {
      const answer = await ClassroomAI.generateFollowup({
        topic: state.activeTopic,
        question,
        history: state.messages
      });
      replaceTypingWithMessage("assistant", answer);
    } catch (error) {
      console.error("[Classroom] Follow-up request failed:", error);
      removeTyping();
      showAlert(getFriendlyErrorMessage(error, "I could not answer that follow-up right now. Please try again."));
      appendMessage("assistant", "I could not generate that explanation right now. Please try the question again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  const ClassroomAI = {
    async generateLesson(payload) {
      return window.PrePa.services.classroomApi.generateLesson(payload, {
        endpoint: CONFIG.endpoint,
        timeoutMs: CONFIG.requestTimeoutMs
      });
    },

    async generateFollowup(payload) {
      return window.PrePa.services.classroomApi.generateFollowup(payload, {
        endpoint: CONFIG.endpoint,
        timeoutMs: CONFIG.requestTimeoutMs
      });
    }
  };

  function appendMessage(role, content) {
    state.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    renderConversation();
  }

  function replaceTypingWithMessage(role, content) {
    removeTyping();
    appendMessage(role, content);
  }

  function renderConversation() {
    if (state.messages.length === 0) {
      els.lessonArea.innerHTML = "";
      const empty = document.createElement("article");
      empty.className = "welcome-card";
      empty.append(createAvatar("assistant"));
      const content = document.createElement("div");
      const title = document.createElement("h2");
      title.textContent = "Preparing your classroom";
      const copy = document.createElement("p");
      copy.textContent = "Your lesson will appear here in a clear, student-friendly format.";
      content.append(title, copy);
      empty.append(content);
      els.lessonArea.append(empty);
      return;
    }

    els.lessonArea.innerHTML = "";
    const stack = document.createElement("div");
    stack.className = "message-stack";

    state.messages.forEach(message => {
      stack.append(createMessageElement(message));
    });

    els.lessonArea.append(stack);
    els.lessonArea.scrollTop = els.lessonArea.scrollHeight;
  }

  function createMessageElement(message) {
    const row = document.createElement("article");
    row.className = `message-row ${message.role}`;
    row.append(createAvatar(message.role));

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.append(createMessageMeta(message.role));

    if (typeof message.content === "string") {
      const paragraph = document.createElement("p");
      paragraph.className = "mb-0";
      paragraph.textContent = message.content;
      bubble.append(paragraph);
    } else {
      bubble.append(createLessonElement(message.content));
    }

    row.append(bubble);
    return row;
  }

  function createAvatar(role) {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    const icon = document.createElement("i");
    icon.className = role === "student" ? "bi bi-person" : "bi bi-stars";
    avatar.append(icon);
    return avatar;
  }

  function createMessageMeta(role) {
    const meta = document.createElement("div");
    meta.className = "message-meta";
    const label = document.createElement("span");
    label.textContent = role === "student" ? "Student" : "PrePa AI Tutor";
    const time = document.createElement("span");
    time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    meta.append(label, time);
    return meta;
  }

  function createLessonElement(lesson) {
    const wrapper = document.createElement("div");

    const title = document.createElement("h2");
    title.className = "h4 mb-2";
    title.textContent = lesson.title || state.activeTopic || "Lesson";
    wrapper.append(title);

    if (lesson.intro) {
      const intro = document.createElement("p");
      intro.textContent = lesson.intro;
      wrapper.append(intro);
    }

    (lesson.sections || []).forEach(section => {
      const sectionEl = document.createElement("section");
      sectionEl.className = "lesson-section";

      const heading = document.createElement("h3");
      heading.textContent = section.heading || "Learn";
      sectionEl.append(heading);

      const list = document.createElement("ul");
      (section.items || []).forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.append(li);
      });
      sectionEl.append(list);
      wrapper.append(sectionEl);
    });

    if (lesson.note) {
      const note = document.createElement("div");
      note.className = "lesson-note";
      note.textContent = lesson.note;
      wrapper.append(note);
    }

    return wrapper;
  }

  function renderTyping(message) {
    removeTyping();

    const typing = document.createElement("article");
    typing.id = "typing-message";
    typing.className = "message-row assistant";
    typing.append(createAvatar("assistant"));

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.append(createMessageMeta("assistant"));

    const dots = document.createElement("div");
    dots.className = "typing-status";
    dots.setAttribute("aria-live", "polite");

    const spinner = document.createElement("span");
    spinner.className = "typing-spinner";
    spinner.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.textContent = message || "Generating lesson...";

    const dotGroup = document.createElement("span");
    dotGroup.className = "typing-dots";
    dotGroup.innerHTML = "<span></span><span></span><span></span>";

    dots.append(spinner, label, dotGroup);
    bubble.append(dots);
    typing.append(bubble);

    let stack = els.lessonArea.querySelector(".message-stack");
    if (!stack) {
      els.lessonArea.innerHTML = "";
      stack = document.createElement("div");
      stack.className = "message-stack";
      els.lessonArea.append(stack);
    }
    stack.append(typing);
  }

  function removeTyping() {
    const typing = document.getElementById("typing-message");
    if (typing) typing.remove();
  }

  function setBusy(isBusy) {
    state.isBusy = isBusy;
    els.learnBtn.disabled = isBusy;
    els.topicInput.disabled = isBusy;
    els.followupBtn.disabled = isBusy || !state.activeTopic;
    els.followupInput.disabled = isBusy || !state.activeTopic;
    els.followupSuggestions.querySelectorAll("button").forEach(button => {
      button.disabled = isBusy || !state.activeTopic;
    });
    els.learnBtn.querySelector("span").textContent = isBusy ? "Generating..." : "Learn";
  }

  function setFollowupEnabled(isEnabled) {
    els.followupInput.disabled = !isEnabled;
    els.followupBtn.disabled = !isEnabled;
    els.followupSuggestions.querySelectorAll("button").forEach(button => {
      button.disabled = !isEnabled;
    });
  }

  function showAlert(message) {
    els.alert.textContent = message;
    els.alert.classList.remove("d-none");
  }

  function clearAlert() {
    els.alert.textContent = "";
    els.alert.classList.add("d-none");
  }

  function sanitizeInput(value) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
  }

  function getFriendlyErrorMessage(error, fallbackMessage) {
    if (error?.name === "AbortError") {
      return "The AI tutor is taking too long to respond. Please try again with a shorter topic.";
    }

    if (!navigator.onLine) {
      return "You appear to be offline. Please reconnect and try again.";
    }

    return error?.message || fallbackMessage;
  }

  function saveTopic(topic) {
    const history = getHistory().filter(item => item.toLowerCase() !== topic.toLowerCase());
    history.unshift(topic);
    localStorage.setItem(CONFIG.historyKey, JSON.stringify(history.slice(0, CONFIG.maxHistory)));
  }

  function getHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CONFIG.historyKey));
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("[Classroom] Failed to parse topic history:", error);
      return [];
    }
  }

  function renderHistory() {
    const history = getHistory();

    if (history.length === 0) {
      els.history.innerHTML = "<p class='text-muted small mb-0'>Your recent Classroom topics will appear here.</p>";
      return;
    }

    els.history.innerHTML = "";
    history.forEach(topic => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = topic;
      button.addEventListener("click", () => {
        els.topicInput.value = topic;
        startLesson(topic);
      });
      els.history.append(button);
    });
  }

})();
