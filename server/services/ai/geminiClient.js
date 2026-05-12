const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Generates educational content using Google Gemini API
 * @param {Object} config - Configuration object
 * @param {string} config.apiKey - Gemini API key
 * @param {string} config.model - Model identifier (e.g., gemini-2.5-flash)
 * @param {string} config.systemInstruction - System prompt for AI behavior
 * @param {string} config.prompt - User prompt/request
 * @returns {Promise<string>} AI-generated content as JSON string
 */
async function generateGeminiContent({ apiKey, model, systemInstruction, prompt }) {
  if (!apiKey) {
    const error = new Error("Gemini API key is not configured. Set GEMINI_API_KEY in your .env file.");
    error.statusCode = 500;
    throw error;
  }

  if (!model) {
    const error = new Error("Gemini model is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const endpoint = `${GEMINI_API_BASE_URL}/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.55,
          topP: 0.9,
          maxOutputTokens: 1400,
          responseMimeType: "application/json"
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_UNSPECIFIED",
            threshold: "BLOCK_NONE"
          }
        ]
      }),
      timeout: 30000
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.error?.message || `Gemini API responded with status ${response.status}`;
      const error = new Error(message);
      error.statusCode = response.status || 502;
      throw error;
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!text) {
      const error = new Error("Gemini returned an empty response. Please try again.");
      error.statusCode = 502;
      throw error;
    }

    return text;
  } catch (fetchError) {
    if (fetchError.name === "AbortError" || fetchError.message?.includes("timeout")) {
      const error = new Error("Gemini API request timed out. Please try again with a shorter topic.");
      error.statusCode = 504;
      throw error;
    }

    if (fetchError.statusCode) {
      throw fetchError;
    }

    throw new Error(`Failed to connect to Gemini API: ${fetchError.message || "Unknown error"}`);
  }
}

module.exports = { generateGeminiContent };
