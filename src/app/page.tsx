"use client";

import React, { useState } from "react";
import { createExperimentInFirebase } from "@/utils/experimentUtils";
import { callLLM } from "@/lib/modelClients";

interface ModelResponse {
  content?: string;
  time?: number;
  metrics?: Record<string, number>;
}

interface TestCase {
  prompt: string;
  expected: string;
  responses: Record<string, ModelResponse>;
}

export default function Page() {
  // Basic experiment info
  const [experimentName, setExperimentName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  // Models to evaluate (checkboxes)
  const availableModels = [
    "llama-3.3-70b-versatile",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
  ];
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  // Collection of test cases
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  /**
   * Add a blank test case
   */
  const handleAddTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { prompt: "", expected: "", responses: {} },
    ]);
  };

  /**
   * Remove a test case by index
   */
  const handleRemoveTestCase = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Update a field (prompt or expected) in a specific test case
   */
  const handleChangeTestCase = (
    index: number,
    field: "prompt" | "expected",
    value: string
  ) => {
    setTestCases((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  /**
   * Toggle a model in or out of the selected models array
   */
  const handleModelToggle = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  /**
   * Runs each test case against the selected models
   */
  const handleRun = async () => {
    const updatedTestCases = await Promise.all(
      testCases.map(async (testCase) => {
        const newResponses = { ...testCase.responses };

        for (const model of selectedModels) {
          try {
            // Combine systemPrompt + user prompt
            const combinedPrompt = `${systemPrompt}\nUser: ${testCase.prompt}`;

            // callLLM returns "text|||time"
            const result = await callLLM(model, combinedPrompt);
            const [content, time] = result.split("|||");
            const timeNum = parseFloat(time);

            newResponses[model] = {
              content,
              time: timeNum,
            };
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            newResponses[model] = {
              content: `Error calling model: ${message}`,
              time: 0,
            };
          }
        }

        return { ...testCase, responses: newResponses };
      })
    );

    setTestCases(updatedTestCases);
  };

  /**
   * Saves the entire experiment to Firestore
   */
  const handleSave = async () => {
    try {
      await createExperimentInFirebase({
        name: experimentName,
        systemPrompt,
        models: selectedModels,
        testCases,
      });
      alert("Experiment saved successfully!");
    } catch (error) {
      console.error("Error saving experiment:", error);
      alert("Failed to save experiment.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Title */}
      <h1
        className="mb-2 text-center text-3xl font-bold tracking-tight 
                     bg-clip-text text-transparent 
                     bg-gradient-to-r from-purple-500 to-sky-400
                     sm:text-4xl"
      >
        Z-Val - LLM Evaluation
      </h1>
      <h3
        className="mb-8 text-center text-3xl font-bold tracking-tight 
                     bg-clip-text text-transparent 
                     bg-gradient-to-r from-purple-500 to-sky-400
                     sm:text-2xl"
      >
        Learn which model works best for you!
      </h3>

      {/* Experiment Name */}
      <div className="mb-5">
        <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
          Experiment Name
        </label>

        <input
          className="w-full max-w-md rounded border border-gray-300 
                     bg-white px-3 py-2 
                     text-gray-700 shadow-sm focus:outline-none focus:ring-2 
                     focus:ring-purple-400 dark:border-gray-600 
                     dark:bg-gray-800 dark:text-gray-100"
          value={experimentName}
          onChange={(e) => setExperimentName(e.target.value)}
          placeholder='e.g. "Strawberry Test"'
        />
      </div>

      {/* System Prompt */}
      <div className="mb-5">
        <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
          System Prompt / Instruction
        </label>
        <textarea
          className="w-full max-w-lg rounded border border-gray-300 
                     bg-white px-3 py-2 text-gray-700 shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-purple-400 
                     dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          rows={4}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder='e.g. "You are an expert in horticulture..."'
        />
      </div>

      {/* Model Selection */}
      <div className="mb-5">
        <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
          Select Models
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {availableModels.map((model) => (
            <label key={model} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedModels.includes(model)}
                onChange={() => handleModelToggle(model)}
                className="form-checkbox h-5 w-5 text-purple-500"
              />
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {model}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Add Test Case Button */}
      <button
        className="mb-5 rounded bg-gradient-to-r from-purple-500 to-sky-400
                   px-4 py-2 text-white shadow hover:opacity-90 
                   focus:outline-none focus:ring-2 focus:ring-purple-400"
        onClick={handleAddTestCase}
      >
        + Add Test Case
      </button>

      {/* Test Cases Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse rounded-sm">
          <thead>
            <tr
              className="bg-gray-100 text-left text-sm font-semibold 
                           text-gray-700 dark:bg-gray-700 dark:text-gray-100"
            >
              <th className="p-3">Prompt</th>
              <th className="p-3">Expected Output</th>
              {selectedModels.map((model) => (
                <th key={model} className="p-3">
                  {model} (Response / Time)
                </th>
              ))}
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 dark:border-gray-600"
              >
                {/* Prompt */}
                <td className="p-3 align-top">
                  <input
                    className="w-full rounded border border-gray-300 
                               bg-white px-2 py-1 text-gray-700 
                               focus:outline-none focus:ring-1 
                               focus:ring-purple-400 dark:border-gray-600 
                               dark:bg-gray-800 dark:text-gray-100"
                    value={tc.prompt}
                    onChange={(e) =>
                      handleChangeTestCase(index, "prompt", e.target.value)
                    }
                    placeholder="e.g., How many 'y' in 'strawberry'?"
                  />
                </td>

                {/* Expected */}
                <td className="p-3 align-top">
                  <input
                    className="w-full rounded border border-gray-300 
                               bg-white px-2 py-1 text-gray-700 
                               focus:outline-none focus:ring-1 
                               focus:ring-purple-400 dark:border-gray-600 
                               dark:bg-gray-800 dark:text-gray-100"
                    value={tc.expected}
                    onChange={(e) =>
                      handleChangeTestCase(index, "expected", e.target.value)
                    }
                    placeholder='e.g., "1"'
                  />
                </td>

                {/* Model Responses */}
                {selectedModels.map((model) => {
                  const responseData = tc.responses[model] || {};
                  return (
                    <td key={model} className="p-3 align-top">
                      {responseData.content ? (
                        <div>
                          <div className="mb-2 text-sm font-medium">
                            <span className="text-gray-900 dark:text-gray-100">
                              Response:
                            </span>{" "}
                            <span className="text-gray-700 dark:text-gray-200">
                              {responseData.content}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Time:</strong> {responseData.time ?? "N/A"}s
                          </div>
                        </div>
                      ) : (
                        <em className="text-gray-400">No response yet</em>
                      )}
                    </td>
                  );
                })}

                {/* Actions */}
                <td className="p-3 align-top">
                  <button
                    className="text-sm font-semibold text-red-600 hover:underline 
                               dark:text-red-400"
                    onClick={() => handleRemoveTestCase(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {/* If no test cases, optionally show a row */}
            {testCases.length === 0 && (
              <tr>
                <td
                  colSpan={2 + selectedModels.length + 1}
                  className="p-3 text-center text-gray-500 dark:text-gray-400"
                >
                  No test cases added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Run and Save Buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleRun}
          className="rounded bg-purple-600 px-4 py-2 text-white 
                     shadow hover:bg-purple-700 
                     focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Run
        </button>
        <button
          onClick={handleSave}
          className="rounded bg-green-600 px-4 py-2 text-white 
                     shadow hover:bg-green-700 
                     focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Save
        </button>
      </div>
    </div>
  );
}
