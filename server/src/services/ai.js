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
        model: "gemini-2.0-flash",
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
        model: "gemini-2.0-flash",
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

// Smart task analysis — reads actual user tasks and gives detailed advice
export async function analyzeTasks(tasks, projects) {
  const pending = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");
  const urgent = pending.filter((t) => t.priority === "urgent");
  const high = pending.filter((t) => t.priority === "high");

  if (!ai) {
    return {
      summary: `You have ${pending.length} pending tasks across ${projects.length} project(s). ${urgent.length} urgent and ${high.length} high-priority items need your attention.`,
      nextStep: urgent[0]?.title || high[0]?.title || pending[0]?.title || "All tasks completed!",
      risk: pending.length > 10 ? "Too many open tasks — risk of overload." : "Stay consistent to avoid last-minute rushes.",
      tip: "Complete urgent tasks first, then tackle high-priority ones in focused blocks.",
    };
  }

  try {
    const taskSummary = tasks.map((t) => ({
      title: t.title,
      priority: t.priority,
      status: t.status,
      project: t.project?.name || "Unknown",
      dueDate: t.dueDate ? new Date(t.dueDate).toDateString() : null,
    }));

    const projectSummary = projects.map((p) => ({
      name: p.name,
      progress: `${p.progress}%`,
      tasks: `${p.completedCount}/${p.taskCount} done`,
    }));

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `
You are an expert productivity coach for a software project management app.

Here is the user's current workspace data:

PROJECTS:
${JSON.stringify(projectSummary, null, 2)}

ALL TASKS (${tasks.length} total, ${done.length} done, ${pending.length} pending):
${JSON.stringify(taskSummary, null, 2)}

Analyze this data carefully and respond in the following JSON format only:
{
  "summary": "2-3 sentence overall assessment of their current workload and progress",
  "nextStep": "The single most important task they should do RIGHT NOW and why",
  "risk": "The biggest risk or bottleneck you see in their current work",
  "tip": "One practical, specific recommendation to improve their productivity"
}

Be specific — mention actual task names and project names from the data above.
Keep each field under 60 words. Return only valid JSON.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              nextStep: { type: Type.STRING },
              risk: { type: Type.STRING },
              tip: { type: Type.STRING },
            },
            required: ["summary", "nextStep", "risk", "tip"],
          },
        },
      })
    );

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analyze error:", error);
    return {
      summary: `You have ${pending.length} pending tasks. ${urgent.length} urgent items need immediate attention.`,
      nextStep: urgent[0]?.title || high[0]?.title || pending[0]?.title || "All clear!",
      risk: "Could not fetch AI insights. Check your API key.",
      tip: "Focus on urgent items first, then high-priority tasks.",
    };
  }
}