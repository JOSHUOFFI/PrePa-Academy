const { config } = require("../config/env");
const { createClassroomLesson } = require("../features/classroom/classroomService");
const { readJsonBody, sendJson } = require("../helpers/http");

/**
 * Classroom API Request Handler
 * Receives topic/question from frontend, calls AI service, returns structured lesson
 */
async function handleClassroomRequest(req, res, runtimeConfig = config) {
  // Only accept POST requests
  if (req.method !== "POST") {
    sendJson(res, 405, {
      error: "Method not allowed. Use POST to request AI lessons."
    });
    return;
  }

  try {
    // Parse request payload
    const payload = await getRequestPayload(req);

    // Validate payload before processing
    if (!payload || typeof payload !== "object") {
      sendJson(res, 400, {
        error: "Invalid request format. Please send a JSON payload with 'topic' and 'mode'."
      });
      return;
    }

    // Create lesson using AI service
    const lesson = await createClassroomLesson(payload, runtimeConfig);

    // Return successful response
    sendJson(res, 200, { lesson });
  } catch (error) {
    handleClassroomError(error, res);
  }
}

async function getRequestPayload(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return readJsonBody(req);
}

/**
 * Handles errors from classroom requests
 * Returns appropriate status codes and user-friendly messages
 */
function handleClassroomError(error, res) {
  const statusCode = Number(error.statusCode || 500);

  // Log error for debugging (server-side only)
  console.error(`[Classroom API] ${statusCode}:`, error.message);

  // Determine user-friendly message based on error type
  let userMessage;

  if (statusCode === 400) {
    // Input validation errors - show the message
    userMessage = error.message;
  } else if (statusCode === 401 || statusCode === 403) {
    userMessage = "You don't have permission to use Classroom. Please ensure you're logged in.";
  } else if (statusCode === 404) {
    userMessage = "The Classroom service is not available. Please try again later.";
  } else if (statusCode === 409) {
    // Conflict - usually means configuration issue
    userMessage = "Classroom configuration issue detected. Please contact support.";
  } else if (statusCode === 429) {
    userMessage = "Too many requests. Please wait a moment before trying again.";
  } else if (statusCode === 500) {
    // Server errors - generic message
    userMessage = "The AI tutor encountered an error. Please try again in a moment.";
  } else if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
    // Gateway/service unavailable
    userMessage = "Classroom is temporarily unavailable. Please try again shortly.";
  } else {
    // Fallback
    userMessage = "Something went wrong with Classroom. Please refresh and try again.";
  }

  sendJson(res, statusCode, { error: userMessage });
}

module.exports = { handleClassroomRequest };
