// n8n Code Node - Cold Email Parser (Production Ready)

const items = $input.all();
if (!items.length) {
  return [
    {
      json: {
        subject: "Generation Failed",
        body: "No input received by parser node.",
      },
    },
  ];
}

const inputData = items[0].json;

// Try to extract raw AI text from different possible sources
const rawText =
  inputData?.candidates?.[0]?.content?.parts?.[0]?.text || // Gemini, "Simplify" OFF
  inputData?.content?.parts?.[0]?.text || // Gemini, "Simplify" ON
  inputData?.output?.[0]?.content?.[0]?.text || // OpenAI agent style
  inputData?.message || // some flows
  inputData?.text || // simple text output
  inputData?.response || // fallback
  "";

// If nothing returned
if (!rawText || rawText.trim() === "") {
  return [
    {
      json: {
        subject: "Generation Failed",
        body: "No email content returned from AI model.",
      },
    },
  ];
}

// Normalize text
let normalized = rawText.replace(/\r/g, "").trim();

// Strip markdown the model sometimes adds despite instructions not to
normalized = normalized.replace(/```[a-z]*\n?/gi, "").replace(/\*\*/g, "");

// Extract Subject — case insensitive, tolerant of leading bold/markdown remnants
const subjectMatch = normalized.match(/^\s*subject:\s*(.+)$/im);
const subject = subjectMatch?.[1]?.trim() || "Cold Outreach Email";

// Remove subject line from body
let body = normalized.replace(/^\s*subject:.*$/im, "").trim();

// Collapse any leftover multi-blank-lines from the removal
body = body.replace(/\n{3,}/g, "\n\n").trim();

// Final response
return [
  {
    json: {
      subject,
      body,
    },
  },
];
