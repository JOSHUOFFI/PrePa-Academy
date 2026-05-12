const { generateGeminiContent } = require("../../services/ai/geminiClient");

const MAX_HISTORY_MESSAGES = 8;

function sanitizeText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function validateClassroomPayload(payload) {
  const mode = payload?.mode === "followup" ? "followup" : "lesson";
  const topic = sanitizeText(payload?.topic, 120);
  const question = sanitizeText(payload?.question, 180);

  if (!topic) {
    const error = new Error("Please enter a topic to learn.");
    error.statusCode = 400;
    throw error;
  }

  if (mode === "followup" && !question) {
    const error = new Error("Please enter a follow-up question.");
    error.statusCode = 400;
    throw error;
  }

  return {
    mode,
    topic,
    question,
    history: sanitizeHistory(payload?.history)
  };
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history.slice(-MAX_HISTORY_MESSAGES).map(message => ({
    role: message?.role === "student" ? "student" : "assistant",
    content: summarizeMessageContent(message?.content)
  })).filter(message => message.content);
}

function summarizeMessageContent(content) {
  if (typeof content === "string") return sanitizeText(content, 500);

  const title = sanitizeText(content?.title, 120);
  const intro = sanitizeText(content?.intro, 300);
  const sections = Array.isArray(content?.sections)
    ? content.sections.map(section => {
        const heading = sanitizeText(section?.heading, 80);
        const items = Array.isArray(section?.items)
          ? section.items.map(item => sanitizeText(item, 140)).filter(Boolean).slice(0, 3)
          : [];
        return [heading, ...items].filter(Boolean).join(": ");
      }).filter(Boolean).slice(0, 3)
    : [];

  return sanitizeText([title, intro, ...sections].filter(Boolean).join(" | "), 700);
}

/**
 * Builds system instruction for educational AI
 * Emphasizes clear, beginner-friendly explanations suitable for secondary students
 */
function buildSystemInstruction() {
  return [
    "You are PrePa AI Tutor, a patient and encouraging educational assistant for secondary school students (JSS-SS level).",
    "",
    "Your role:",
    "- Teach clearly using simple, student-friendly language",
    "- Break down complex topics into digestible pieces",
    "- Use relatable examples from student experiences",
    "- Build confidence and curiosity",
    "- Connect concepts to real-world applications when possible",
    "",
    "Response format (MUST be valid JSON, no Markdown wrapping):",
    "{ \"title\": \"...\", \"intro\": \"...\", \"sections\": [{\"heading\": \"...\", \"items\": [...]}], \"note\": \"...\" }",
    "",
    "Guidelines:",
    "- Use 3-5 main sections for lessons",
    "- Each section should have 3-6 bullet points",
    "- Include definitions, key ideas, real examples, and practical tips",
    "- Use \"Key Idea:\", \"Example:\", \"Remember:\" prefixes for clarity",
    "- Keep bullet points concise (under 20 words each)",
    "- End with an encouraging note or study tip"
  ].join("\n");
}

/**
 * Builds the user prompt for lessons or follow-ups
 * Provides context from conversation history for continuity
 */
function buildPrompt({ mode, topic, question, history }) {
  const context = history.length
    ? `\nRecent classroom context:\n${history.map(message => `${message.role}: ${message.content}`).join("\n")}`
    : "";

  if (mode === "followup") {
    return [
      `Topic: ${topic}`,
      `Student's follow-up question: ${question}`,
      context,
      "",
      "Instructions:",
      "- Answer the follow-up question directly and concisely",
      "- Build on what was previously explained",
      "- Include at least one practical example",
      "- If the question seems off-topic, gently guide back to the main topic"
    ].join("\n");
  }

  return [
    `Create a complete beginner-friendly lesson on: ${topic}`,
    context,
    "",
    "Instructions:",
    "- Start with a clear, accessible definition",
    "- Explain step by step using simple language",
    "- Include real-world examples students can relate to",
    "- Highlight key concepts and tips",
    "- End with an encouraging note about the topic"
  ].join("\n");
}

async function createClassroomLesson(payload, config) {
  const safePayload = validateClassroomPayload(payload);
  const rawText = await generateGeminiContent({
    apiKey: config.geminiApiKey,
    model: config.geminiModel,
    systemInstruction: buildSystemInstruction(),
    prompt: buildPrompt(safePayload)
  });

  return normalizeLesson(rawText, safePayload.topic);
}

/**
 * Parses and normalizes the AI response into a structured lesson format
 * Handles multiple response formats for flexibility
 */
function normalizeLesson(rawText, topic) {
  const parsed = parseJsonLesson(rawText);
  const lesson = parsed && typeof parsed === "object" ? parsed : null;

  if (!lesson) {
    const error = new Error("The AI response format was not recognized. Please try again with a simpler topic.");
    error.statusCode = 502;
    throw error;
  }

  const sections = Array.isArray(lesson.sections)
    ? lesson.sections
        .map(section => ({
          heading: sanitizeText(section?.heading, 90) || "Learn",
          items: Array.isArray(section?.items)
            ? section.items
                .map(item => sanitizeText(item, 320))
                .filter(Boolean)
                .slice(0, 6)
            : []
        }))
        .filter(section => section.items.length > 0)
        .slice(0, 6)
    : [];

  if (sections.length === 0) {
    const error = new Error("Could not extract lesson sections from the AI response. Please try again.");
    error.statusCode = 502;
    throw error;
  }

  return {
    title: sanitizeText(lesson.title, 120) || `Understanding ${topic}`,
    intro: sanitizeText(lesson.intro, 500) || `Here is a clear explanation of ${topic}.`,
    sections,
    note: sanitizeText(lesson.note, 260) || "Ask a follow-up question to explore more!"
  };
}

/**
 * Attempts to parse JSON from raw text
 * Handles wrapped JSON, markdown code blocks, and formatting variations
 */
function parseJsonLesson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (error) {
    // Try to extract JSON from markdown code blocks or wrapped text
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

module.exports = {
  createClassroomLesson,
  sanitizeText,
  validateClassroomPayload
};
