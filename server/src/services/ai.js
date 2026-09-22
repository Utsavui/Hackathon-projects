import { GoogleGenAI, Type } from "@google/genai";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

// Retry helper — retries on 503 with exponential backoff
async function withRetry(fn, retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is503 = err?.status === 503 || err?.message?.includes("503");
      if (is503 && attempt < retries) {
        console.warn(`Gemini 503 — retry attempt ${attempt}/${retries} in ${delayMs}ms...`);
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
}

// Generate project tasks
export async function generateTasks(projectName, description = "") {
  // Local fallback if Gemini API key is not configured
  if (!ai) {
    return [
      { title: `Define scope for ${projectName}`, priority: "high" },
      { title: "Create initial technical plan", priority: "high" },
      { title: "Implement core functionality", priority: "medium" },
      { title: "Test, polish and document the project", priority: "medium" },
    ];
  }

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `
Create 5 practical development tasks for this project.

Project name:
${projectName}

Project description:
${description}

Each task must contain:
- title
- priority

Priority must be one of:
low, medium, high, urgent

Return only a JSON array.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                priority: { type: Type.STRING },
              },
              required: ["title", "priority"],
            },
          },
        },
      })
    );

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini task generation error:", error);

    // Fallback if Gemini fails after all retries
    return [
      { title: `Define scope for ${projectName}`, priority: "high" },
      { title: "Create initial technical plan", priority: "high" },
      { title: "Implement core functionality", priority: "medium" },
      { title: "Test and document the project", priority: "medium" },
    ];
  }
}

// Productivity suggestions
export async function productivity(tasks) {
  if (!ai) {
    const urgent = tasks.filter(
      (task) =>
        ["urgent", "high"].includes(task.priority) &&
        task.status !== "done"
    ).length;

    return `You have ${urgent} high-priority unfinished task(s). Finish the highest-impact item first, then clear quick wins.`;
  }

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `
You are a productivity assistant for a project management platform.

Analyze these project tasks:

${JSON.stringify(tasks, null, 2)}

Give concise productivity advice.

Include:
1. Best next step
2. One important risk
3. One practical recommendation

Keep the response short and useful.
        `,
      })
    );

    return response.text;
  } catch (error) {
    console.error("Gemini productivity error:", error);

    return "Focus on the highest-priority unfinished task first, then handle quick wins.";
  }
}