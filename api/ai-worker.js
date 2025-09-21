// // api/ai-worker.js
// import OpenAI from "openai";
// import { Client as NotionClient } from "@notionhq/client";

// // === Clients ===
// const ai = new OpenAI({
//   apiKey: process.env.DEEPSEEK_API_KEY,
//   baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1"
// });

// const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });
// const RES_DB = process.env.RESOURCES_DB_ID;

// // === Helpers ===
// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// const buildPrompt = ({ title, url, notes }) => `
// Return ONLY JSON matching exactly:
// {"summary": string, "insights": [string,string,string], "tags": [string,string,string]}

// Rules:
// - summary ≤ 80 words, plain text
// - insights: 3 concise, actionable bullets (no numbering)
// - tags: 3 short, lowercase slugs (no spaces; use dashes)
// - If info is minimal, infer reasonably from title/notes.

// Title: ${title || "-"}
// URL: ${url || "-"}
// Notes: ${notes || "-"}
// `;

// function readProp(page, key) {
//   const p = page.properties[key];
//   if (!p) return "";
//   switch (p.type) {
//     case "title": return p.title?.[0]?.plain_text || "";
//     case "url": return p.url || "";
//     case "rich_text": return p.rich_text?.[0]?.plain_text || "";
//     case "select": return p.select?.name || "";
//     case "multi_select": return p.multi_select.map(o => o.name).join(", ");
//     default: return "";
//   }
// }

// async function listPending(limit = 5) {
//   const res = await notion.databases.query({
//     database_id: RES_DB,
//     filter: { property: "AI Status", select: { equals: "Pending" } },
//     page_size: limit
//   });
//   return res.results;
// }

// async function setStatus(page_id, name) {
//   await notion.pages.update({
//     page_id,
//     properties: { "AI Status": { select: { name } } }
//   });
//   await sleep(300);
// }

// async function updateAIFields(page_id, { summary, insights, tags }) {
//   const insightsText = (insights || [])
//     .filter(Boolean)
//     .map(i => `• ${i}`)
//     .join("\n");

//   const props = {
//     "AI Summary": {
//       rich_text: [{ type: "text", text: { content: (summary || "").slice(0, 800) } }]
//     },
//     "AI Insights": {
//       rich_text: [{ type: "text", text: { content: insightsText } }]
//     },
//     "AI Suggested Tags": {
//       rich_text: [{ type: "text", text: { content: (tags || []).join(", ") } }]
//     }
//   };

//   // If your "AI Suggested Tags" property is Multi-select instead of Text:
//   // props["AI Suggested Tags"] = { multi_select: (tags || []).map(t => ({ name: t })) };

//   await notion.pages.update({ page_id, properties: props });
//   await sleep(300);
// }

// async function runOnce() {
//   const pending = await listPending(5);
//   const results = [];

//   for (const page of pending) {
//     try {
//       await setStatus(page.id, "Processing");

//       const title = readProp(page, "Name");
//       const url = readProp(page, "URL");
//       const notes = readProp(page, "Notes");

//       const completion = await ai.chat.completions.create({
//         model: "deepseek-chat",
//         temperature: 0.3,
//         messages: [
//           { role: "system", content: "You are a strict formatter. Output ONLY valid JSON." },
//           { role: "user", content: buildPrompt({ title, url, notes }) }
//         ]
//       });

//       let content = completion.choices[0].message.content.trim();

//       let data;
//       try {
//         data = JSON.parse(content);
//       } catch {
//         const s = content.indexOf("{");
//         const e = content.lastIndexOf("}");
//         data = JSON.parse(content.slice(s, e + 1));
//       }

//       await updateAIFields(page.id, data);
//       await setStatus(page.id, "Done");

//       results.push({ pageId: page.id, status: "Done" });
//     } catch (err) {
//       console.error("Error page:", page.id, err?.message);
//       await setStatus(page.id, "Error");
//       results.push({ pageId: page.id, status: "Error", error: err?.message });
//     }
//   }

//   return results;
// }

// // === Vercel handler ===
// export default async function handler(req, res) {
//   try {
//     const results = await runOnce();
//     res.status(200).json({ ok: true, processed: results.length, results });
//   } catch (e) {
//     res.status(500).json({ ok: false, error: e?.message });
//   }
// }

export default function handler(req, res) {
  res.status(200).json({ ok: true, msg: "hello from ai-worker" });
}
