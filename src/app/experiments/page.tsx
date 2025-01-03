"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// 1. Define the interfaces
interface TestCase {
  id: string;
  userMessage: string;
  expectedOutput?: string; // or required if always present
  // graderType?: string;
}

interface Experiment {
  id: string;
  systemPrompt: string;
  llmModel: string;
  testCaseIds: string[];
}

// 2. Use them in your component
export default function ExperimentsPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [llmModel, setLlmModel] = useState("gpt-4");

  // Instead of any[], specify TestCase[] and Experiment[]
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  // fetchTestCases expects an array of TestCase
  async function fetchTestCases() {
    const res = await axios.get<TestCase[]>("/api/test-cases");
    setTestCases(res.data);
  }

  // fetchExperiments expects an array of Experiment
  async function fetchExperiments() {
    const res = await axios.get<Experiment[]>("/api/experiments");
    setExperiments(res.data);
  }

  async function createExperiment(e: React.FormEvent) {
    e.preventDefault();
    await axios.post("/api/experiments", {
      systemPrompt,
      llmModel,
      testCaseIds: selectedTestCaseIds,
    });
    setSystemPrompt("");
    setLlmModel("gpt-4");
    setSelectedTestCaseIds([]);
    fetchExperiments();
  }

  function toggleTestCase(id: string) {
    setSelectedTestCaseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  useEffect(() => {
    fetchTestCases();
    fetchExperiments();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Experiments</h1>
      <form onSubmit={createExperiment}>
        <div>
          <label>System Prompt</label>
          <input
            type="text"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </div>
        <div>
          <label>LLM Model</label>
          <select
            value={llmModel}
            onChange={(e) => setLlmModel(e.target.value)}
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5-Turbo</option>
            <option value="claude-v1">Claude v1</option>
          </select>
        </div>
        <div>
          <p>Select Test Cases:</p>
          {testCases.map((tc) => (
            <div key={tc.id}>
              <input
                type="checkbox"
                checked={selectedTestCaseIds.includes(tc.id)}
                onChange={() => toggleTestCase(tc.id)}
              />
              <label>{tc.userMessage}</label>
            </div>
          ))}
        </div>
        <button type="submit">Create Experiment</button>
      </form>

      <h2>Existing Experiments</h2>
      <ul>
        {experiments.map((exp) => (
          <li key={exp.id}>
            <a href={`/experiments/${exp.id}`}>
              {exp.systemPrompt} | Model: {exp.llmModel}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
