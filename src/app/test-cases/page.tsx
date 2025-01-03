import { useEffect, useState } from "react";
import axios from "axios";

export default function TestCasesPage() {
  const [userMessage, setUserMessage] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [graderType, setGraderType] = useState("exactMatch");
  const [testCases, setTestCases] = useState<any[]>([]);

  // Fetch existing test cases
  async function fetchTestCases() {
    const res = await axios.get("/api/test-cases");
    setTestCases(res.data);
  }

  // Create a new test case
  async function createTestCase(e: React.FormEvent) {
    e.preventDefault();
    await axios.post("/api/test-cases", {
      userMessage,
      expectedOutput,
      graderType,
    });
    setUserMessage("");
    setExpectedOutput("");
    setGraderType("exactMatch");
    fetchTestCases();
  }

  useEffect(() => {
    fetchTestCases();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Cases</h1>
      <form onSubmit={createTestCase}>
        <div>
          <label>User Message</label>
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
        </div>
        <div>
          <label>Expected Output</label>
          <input
            type="text"
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
          />
        </div>
        <div>
          <label>Grader Type</label>
          <select
            value={graderType}
            onChange={(e) => setGraderType(e.target.value)}
          >
            <option value="exactMatch">Exact Match</option>
            <option value="partialMatch">Partial Match</option>
          </select>
        </div>
        <button type="submit">Create Test Case</button>
      </form>

      <h2>Existing Test Cases</h2>
      <ul>
        {testCases.map((tc) => (
          <li key={tc.id}>
            <p>User: {tc.userMessage}</p>
            <p>Expected: {tc.expectedOutput}</p>
            <p>Grader: {tc.graderType}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
