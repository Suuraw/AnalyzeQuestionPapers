import multer from "multer";
import axios from "axios";
import dns from "dns/promises";
import prisma from "../db/db.config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Configure multer for PDF uploads
export const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// Process PDFs with Gemini API
const processPDFs = async (files) => {
  const allQuestions = [];

  for (const file of files) {
    const base64PDF = file.buffer.toString("base64");
    const prompt = `
      Extract all questions from this PDF. A question is a sentence ending with a question mark (?) 
      or a prompt asking for information (e.g., "What are...", "Differentiate...", "Explain...").
      Return questions in this format:
      ---
      Questions:
      - [Question 1]
      - [Question 2]
      ...
      ---
    `;

    try {
      const result = await model.generateContent([
        { inlineData: { data: base64PDF, mimeType: "application/pdf" } },
        { text: prompt },
      ]);
      const responseText = result.response.text();
      const questionsSection = responseText.split("Questions:")[1] || "";

      const questions = questionsSection
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^- /, "").trim())
        .filter((q) => q.length > 5);

      console.log(`Gemini-extracted questions from ${file.originalname}:`, questions);

      questions.forEach((q) => {
        allQuestions.push({
          text: q,
          paper: file.originalname,
        });
      });
    } catch (error) {
      console.error(`Gemini API error for ${file.originalname}:`, error.message);
    }
  }

  if (allQuestions.length === 0) return [];

  const analyzedQuestions = await analyzeQuestions(allQuestions);
  console.log("Analyzed questions before storing:", analyzedQuestions);

  await storeResults(analyzedQuestions);
  console.log("Analyzed questions after storing:", analyzedQuestions);

  return analyzedQuestions;
};

// Analyze questions using Gemini API for topics
const analyzeQuestions = async (questions) => {
  const questionMap = new Map();

  for (const q of questions) {
    const key = q.text.toLowerCase().trim();

    const prompt = `
      Analyze the following question and identify its main topics. A topic is a key concept or subject the question focuses on.
      Return the topics in this format:
      ---
      Topics:
      - [Topic 1]
      - [Topic 2]
      - [Topic 3]
      ---
      Question: "${q.text}"
    `;

    let topics = [];
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const topicsSection = responseText.split("Topics:")[1] || "";
      topics = topicsSection
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^- /, "").trim())
        .filter((t) => t.length > 2)
        .slice(0, 3)
        .map((name) => ({ name, score: 1 }));
    } catch (error) {
      console.error(`Gemini API error for question "${q.text}":`, error.message);
      topics = [{ name: "general", score: 1 }];
    }

    const importanceScore = q.text.length / 50 + topics.length;

    if (questionMap.has(key)) {
      const existing = questionMap.get(key);
      existing.frequency++;
      existing.papers.push({ name: q.paper });
    } else {
      questionMap.set(key, {
        question: q.text,
        frequency: 1,
        importance: categorizeImportance(importanceScore),
        topics: topics.length > 0 ? topics : [{ name: "general", score: 1 }],
        papers: [{ name: q.paper }],
      });
    }
  }

  return Array.from(questionMap.values()).sort((a, b) => {
    const impOrder = { high: 3, moderate: 2, low: 1 };
    return impOrder[b.importance] - impOrder[a.importance] || b.frequency - a.frequency;
  });
};

// Categorize importance
const categorizeImportance = (score) => {
  if (score > 5) return "high";
  if (score > 3) return "moderate";
  return "low";
};

// Generate answers using Gemini API
const generateAnswer = async (question) => {
  try {
    const prompt = `Provide a concise and accurate answer to the following question: "${question}"`;
    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();
    console.log(`Generated answer for "${question}":`, answer);
    return answer;
  } catch (error) {
    console.error(`Error generating answer for "${question}":`, error.message);
    return "Unable to generate answer at this time.";
  }
};

// Fetch YouTube resources with retry
const fetchResources = async (topics, retries = 3) => {
  const resources = [];
  const query = topics.map((t) => t.name).filter(Boolean).join(" ");

  if (!query) return resources;

  try {
    const addresses = await dns.lookup("www.googleapis.com");
    console.log("DNS resolved www.googleapis.com to:", addresses);
  } catch (error) {
    console.error("DNS resolution failed, using fallback IP:", error.message);
    axios.defaults.baseURL = "https://142.250.193.106";
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          q: query,
          key: process.env.YOUTUBE_API_KEY,
          part: "snippet",
          type: "video",
          maxResults: Math.min(2 * topics.length, 10),
        },
        timeout: 5000,
      });

      const items = response.data.items || [];
      topics.forEach((topic) => {
        const topicResources = items
          .filter((item) => item.snippet.title.toLowerCase().includes(topic.name.toLowerCase()))
          .slice(0, 2)
          .map((item) => ({
            type: "youtube",
            title: item.snippet.title,
            url: `https://youtube.com/watch?v=${item.id.videoId}`,
            relevanceScore: topic.score,
          }));
        resources.push(...topicResources);
      });
      return resources;
    } catch (error) {
      console.error(`YouTube API attempt ${attempt} for query "${query}":`, error.message);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return resources;
};

// Store results in database using Prisma
const storeResults = async (analyzedQuestions) => {
  for (const q of analyzedQuestions) {
    // Generate and assign answer
    const answer = await generateAnswer(q.question);
    q.answer = answer; // Ensure the answer is attached to the question object
    q.resources = await fetchResources(q.topics);

    console.log(`Storing question "${q.question}" with answer:`, q.answer);

    try {
      await prisma.analyzeQuestion.upsert({
        where: { question: q.question },
        update: {
          frequency: q.frequency,
          importance: q.importance,
          answer: q.answer,
          topics: { create: q.topics },
          resources: { create: q.resources },
          papers: {
            create: q.papers.map((paper) => ({
              name: paper.name,
              year: paper.year || "",
            })),
          },
        },
        create: {
          question: q.question,
          frequency: q.frequency,
          importance: q.importance,
          answer: q.answer,
          topics: { create: q.topics },
          resources: { create: q.resources },
          papers: {
            create: q.papers.map((paper) => ({
              name: paper.name,
              year: paper.year || "",
            })),
          },
        },
      });
    } catch (error) {
      console.error(`Prisma error storing "${q.question}":`, error.message);
    }
  }
};

// API Endpoints
export const analyzePDFs = async (req, res) => {
  try {
    console.log("Uploaded files:", req.files);
    if (!req.files || req.files.length === 0) {
      console.log("Server error: No files uploaded");
      return res.status(400).json({ error: "No PDF files uploaded" });
    }
    const results = await processPDFs(req.files);
    console.log("Final results sent to client:", results);
    res.json({ success: true, results });
  } catch (error) {
    console.error("Analyze PDFs error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.analyzeQuestion.findMany({
      orderBy: [{ importance: "desc" }, { frequency: "desc" }],
      include: { topics: true, resources: true, papers: true },
    });
    console.log("Retrieved questions from DB:", questions);
    res.json(questions);
  } catch (error) {
    console.error("Get questions error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};