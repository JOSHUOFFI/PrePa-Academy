(function () {
  window.PrePa = window.PrePa || {};
  window.PrePa.services = window.PrePa.services || {};

  const DEFAULT_ENDPOINT = "/api/classroom";
  const DEFAULT_TIMEOUT_MS = 45000;

  async function generateLesson(payload, options = {}) {
    return requestClassroomLesson({ ...payload, mode: "lesson" }, options);
  }

  async function generateFollowup(payload, options = {}) {
    return requestClassroomLesson({ ...payload, mode: "followup" }, options);
  }

  async function requestClassroomLesson(payload, options = {}) {
    const endpoint = options.endpoint || window.PREPA_CLASSROOM_API_ENDPOINT || DEFAULT_ENDPOINT;
    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeoutId);
    }

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(data?.error || `AI provider responded with ${response.status}`);
    }

    return normalizeProviderResponse(data, payload.topic, payload.question || "Lesson");
  }

  async function parseJsonResponse(response) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error("The Classroom service returned an invalid response.");
    }
  }

  function normalizeProviderResponse(data, topic, prompt) {
    const lesson = data?.lesson || data;

    if (lesson && Array.isArray(lesson.sections)) {
      const normalized = {
        title: sanitizeOutput(lesson.title || topic, 120),
        intro: sanitizeOutput(lesson.intro || "", 500),
        sections: lesson.sections.map(section => ({
          heading: sanitizeOutput(section.heading || "Learn", 90),
          items: Array.isArray(section.items)
            ? section.items.map(item => sanitizeOutput(item, 320)).filter(Boolean)
            : []
        })).filter(section => section.items.length > 0),
        note: sanitizeOutput(lesson.note || "", 260)
      };

      if (normalized.sections.length > 0) return normalized;
    }

    if (lesson && typeof lesson.content === "string") {
      const converted = textToLesson(topic, lesson.content);
      if (converted.sections.length > 0) return converted;
    }

    throw new Error(`Invalid AI lesson response for ${prompt}.`);
  }

  function textToLesson(topic, content) {
    const lines = content.split(/\n+/).map(line => sanitizeOutput(line, 320)).filter(Boolean);

    return {
      title: topic,
      intro: lines.shift() || `Here is a lesson on ${topic}.`,
      sections: [
        {
          heading: "AI explanation",
          items: lines.length > 0 ? lines : [sanitizeOutput(content, 320)]
        }
      ],
      note: "Ask a follow-up question to continue learning."
    };
  }

  function sanitizeOutput(value, maxLength) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  window.PrePa.services.classroomApi = {
    generateLesson,
    generateFollowup
  };
})();
