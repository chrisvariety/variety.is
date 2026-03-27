// you'll need to set
// ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
// ANTHROPIC_API_KEY=...

import { readFileSync } from "fs";
import { join } from "path";

import Anthropic from "@anthropic-ai/sdk";
import { Template } from "@huggingface/jinja";

const __dirname = new URL(".", import.meta.url).pathname;

const chapterText = readFileSync(join(__dirname, "chapter-content.txt"), "utf-8");

const templateSource = readFileSync(join(__dirname, "prompt-v1.jinja"), "utf-8");

const template = new Template(templateSource);
const prompt = template.render({ chapterText });

const client = new Anthropic();

const stream = client.messages.stream({
  messages: [{ role: "user", content: prompt }],
  model: "MiniMax-M2.7",
  max_tokens: 8192,
});

for await (const chunk of stream) {
  if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
    process.stdout.write(chunk.delta.text);
  }
}
