// src/pages/api/experiments/[experimentId]/run.ts
import Groq from "groq-sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import {
  collection,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { gradeResponse } from "@/lib/grading";

// Example: define your doc shapes
interface TestCaseDoc {
  userMessage: string;
  expectedOutput: string;
  graderType: string;
}

interface TestCase extends TestCaseDoc {
  id: string; // Firestore doc ID
}

// Initialize Groq (or do so outside the handler)
const groqKey = process.env.GROQ_API_KEY;
if (!groqKey) {
  throw new Error("Missing GROQ_API_KEY");
}
const groq = new Groq({ apiKey: groqKey });

async function callLLM(
  llmModel: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const result = await groq.chat.completions.create({
    model: llmModel, // e.g. "llama-guard-3-8b"
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });
  return result.choices?.[0]?.message?.content || "";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { experimentId } = req.query;
    // 1. Fetch the experiment doc
    const experimentDoc = await getDoc(
      doc(db, "experiments", experimentId as string)
    );
    if (!experimentDoc.exists()) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    const experimentData = experimentDoc.data();
    const { systemPrompt, llmModel, testCaseIds } = experimentData;

    // 2. Fetch test cases with typed interface
    const testCases: TestCase[] = [];
    for (const tcId of testCaseIds) {
      const tcDoc = await getDoc(doc(db, "testCases", tcId));
      if (tcDoc.exists()) {
        const data = tcDoc.data() as TestCaseDoc;
        testCases.push({ id: tcId, ...data });
      }
    }

    // 3. Call the LLM for each test case, then grade
    const startedAt = new Date();
    const results = [];

    for (const testCase of testCases) {
      const { userMessage, expectedOutput, graderType } = testCase;
      const actualOutput = await callLLM(llmModel, systemPrompt, userMessage);
      const score = gradeResponse(expectedOutput, actualOutput, graderType);

      results.push({
        testCaseId: testCase.id,
        userMessage,
        expectedOutput,
        actualOutput,
        score,
      });
    }

    const finishedAt = new Date();

    // 4. Store the run results
    const runRef = await addDoc(collection(db, "experimentRuns"), {
      experimentId,
      startedAt,
      finishedAt,
      results,
      createdAt: serverTimestamp(),
    });

    res.status(200).json({
      runId: runRef.id,
      startedAt,
      finishedAt,
      results,
    });
  } catch (error) {
    console.error("run experiment error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
