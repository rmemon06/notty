import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

async function main() {
  try {
    const chat = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: "Hello from Bun + OpenRouter!" }],
    });

    console.log("✅ OpenRouter reply:", chat.choices[0].message.content);
  } catch (err) {
    console.error("❌ OpenRouter test failed:", err);
  }
}

main();
