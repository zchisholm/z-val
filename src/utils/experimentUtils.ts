// src/utils/experimentUtils.ts

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
//import { runDeepEvalMetrics } from "@/lib/deepEval";
import { callLLM } from "@/lib/modelClients";

export interface TestCase {
  prompt: string;
  expected: string;
  responses: Record<
    string,
    {
      content?: string;
      time?: number;
      metrics?: {
        factualityScore?: number;
        relevanceScore?: number;
      };
    }
  >;
}

export async function runExperiment(
  systemPrompt: string,
  testCases: TestCase[],
  models: string[]
): Promise<TestCase[]> {
  const updatedTestCases = await Promise.all(
    testCases.map(async (testCase) => {
      const newResponses = { ...testCase.responses };

      for (const model of models) {
        try {
          // Combine systemPrompt + user prompt
          const combinedPrompt = `${systemPrompt}\nUser: ${testCase.prompt}`;
          const result = await callLLM(model, combinedPrompt);
          // If you returned "text|||time" from callLLM:
          const [content, time] = result.split("|||");
          const timeNum = parseFloat(time);

          // Evaluate metrics via DeepEval
        const { factualityScore, relevanceScore } = await runDeepEvalMetrics(
            content,
            testCase.expected
          ); 

          newResponses[model] = {
            content,
            time: timeNum,
            metrics: {
              factualityScore,
              relevanceScore,
            },
          };
        } catch (err) {
          newResponses[model] = {
            content: "Error calling model" + {err},
            time: 0,
          };
        }
      }

      return {
        ...testCase,
        responses: newResponses,
      };
    })
  );

  return updatedTestCases;
}

export async function createExperimentInFirebase(data: {
  name: string;
  systemPrompt: string;
  models: string[];
  testCases: TestCase[];
}) {
  const ref = collection(db, "experiments");
  await addDoc(ref, data);
}
