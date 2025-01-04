// src/app/experiments/new/page.tsx

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TestCase,
  createExperimentInFirebase,
  runExperiment,
} from "@/utils/experimentUtils";

export default function NewExperimentPage() {
  const router = useRouter();

  const [experimentName, setExperimentName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [models, setModels] = useState<string[]>([]);

  // This will hold all test cases in local state
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  const handleAddTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { prompt: "", expected: "", responses: {} },
    ]);
  };

  const handleChangeTestCase = (
    index: number,
    field: "prompt" | "expected",
    value: string
  ) => {
    const updated = [...testCases];
    updated[index][field] = value; 
    setTestCases(updated);
  };


  const onModelToggle = (modelName: string) => {
    setModels((prev) => {
      if (prev.includes(modelName)) {
        return prev.filter((m) => m !== modelName);
      }
      return [...prev, modelName];
    });
  };

  const handleRun = async () => {
    // Call runExperiment which calls the LLMs & collects metrics
    const results = await runExperiment(systemPrompt, testCases, models);
    setTestCases(results);
  };

  const handleSave = async () => {
    await createExperimentInFirebase({
      name: experimentName,
      systemPrompt,
      models,
      testCases,
    });
    router.push("/experiments"); // or wherever you list them
  };

  return (
    <div>
      <h1>Create New Experiment</h1>

      <div>
        <label>Experiment Name</label>
        <input
          value={experimentName}
          onChange={(e) => setExperimentName(e.target.value)}
        />
      </div>

      <div>
        <label>System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
      </div>

      <div>
        <label>Select Models</label>
        <div>
          <label>
            <input
              type="checkbox"
              checked={models.includes("openai-gpt-4")}
              onChange={() => onModelToggle("openai-gpt-4")}
            />
            OpenAI GPT-4
          </label>
          {/* Add more checkboxes for other models */}
        </div>
      </div>

      <button onClick={handleAddTestCase}>Add Test Case</button>

      {/* Render test cases in a table/list */}
      {testCases.map((tc, i) => (
        <div
          key={i}
          style={{ border: "1px solid #ccc", padding: "8px", margin: "8px 0" }}
        >
          <label>Prompt</label>
          <input
            value={tc.prompt}
            onChange={(e) => handleChangeTestCase(i, "prompt", e.target.value)}
          />
          <label>Expected Output</label>
          <input
            value={tc.expected}
            onChange={(e) =>
              handleChangeTestCase(i, "expected", e.target.value)
            }
          />

          {/* If we've run the experiment, show results from each model */}
          {models.map((m) => (
            <div key={m}>
              <strong>{m}</strong>
              {tc.responses[m]?.content ? (
                <div>
                  <p>Response: {tc.responses[m].content}</p>
                  <p>Time: {tc.responses[m].time}s</p>
                  <p>Factuality: {tc.responses[m].metrics?.factualityScore}%</p>
                  <p>Relevance: {tc.responses[m].metrics?.relevanceScore}%</p>
                </div>
              ) : (
                <p>No response yet</p>
              )}
            </div>
          ))}
        </div>
      ))}

      <div>
        <button onClick={handleRun}>Run</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
