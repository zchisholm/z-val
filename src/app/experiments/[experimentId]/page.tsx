import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ExperimentDetail() {
  const router = useRouter();
  const { experimentId } = router.query;

  const [experiment, setExperiment] = useState<any>(null);
  const [runResults, setRunResults] = useState<any[]>([]);
  const [runInProgress, setRunInProgress] = useState(false);

  async function fetchExperiment() {
    const res = await axios.get("/api/experiments");
    const found = res.data.find((e: any) => e.id === experimentId);
    setExperiment(found);
  }

  async function runExperiment() {
    if (!experimentId) return;
    setRunInProgress(true);
    try {
      const res = await axios.post(`/api/experiments/${experimentId}/run`);
      setRunResults(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setRunInProgress(false);
    }
  }

  useEffect(() => {
    if (experimentId) {
      fetchExperiment();
    }
  }, [experimentId]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Experiment Detail</h1>
      {experiment ? (
        <>
          <p>
            <strong>System Prompt:</strong> {experiment.systemPrompt}
          </p>
          <p>
            <strong>LLM Model:</strong> {experiment.llmModel}
          </p>
          <p>
            <strong>TestCase IDs:</strong> {experiment.testCaseIds.join(", ")}
          </p>

          <button onClick={runExperiment} disabled={runInProgress}>
            {runInProgress ? "Running..." : "Run Experiment"}
          </button>

          {runResults.length > 0 && (
            <>
              <h2>Run Results</h2>
              <ul>
                {runResults.map((r, idx) => (
                  <li key={idx}>
                    <div>
                      <strong>TestCase ID:</strong> {r.testCaseId}
                    </div>
                    <div>
                      <strong>User Message:</strong> {r.userMessage}
                    </div>
                    <div>
                      <strong>Expected:</strong> {r.expectedOutput}
                    </div>
                    <div>
                      <strong>Actual:</strong> {r.actualOutput}
                    </div>
                    <div>
                      <strong>Score:</strong> {r.score}
                    </div>
                  </li>
                ))}
              </ul>
              <h3>
                Aggregate Score:{" "}
                {(
                  runResults.reduce((sum, cur) => sum + cur.score, 0) /
                  runResults.length
                ).toFixed(2)}
              </h3>
            </>
          )}
        </>
      ) : (
        <p>Loading experiment...</p>
      )}
    </div>
  );
}
