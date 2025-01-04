// src/app/experiments/[id]/page.tsx

"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function ExperimentDetail() {
  const { id } = useParams() as { id: string }; // from route
  interface Experiment {
    name: string;
    systemPrompt: string;
    models: string[];
    testCases: {
      prompt: string;
      expected: string;
      responses?: {
        [key: string]: {
          content: string;
          time: number;
          metrics?: {
            factualityScore: number;
            relevanceScore: number;
          };
        };
      };
    }[];
  }

  const [experiment, setExperiment] = useState<Experiment | null>(null);

  useEffect(() => {
    const fetchExperiment = async () => {
      if (!id) return;
      const docRef = doc(db, "experiments", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setExperiment(snapshot.data() as Experiment);
      }
    };
    fetchExperiment();
  }, [id]);

  if (!experiment) return <div>Loading...</div>;

  return (
    <div>
      <h1>{experiment.name}</h1>
      <p>
        <strong>System Prompt:</strong> {experiment.systemPrompt}
      </p>

      <table>
        <thead>
          <tr>
            <th>Test Prompt</th>
            <th>Expected Output</th>
            {experiment.models.map((m: string) => (
              <th key={m}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {experiment.testCases.map((tc: { prompt: string; expected: string; responses?: { [key: string]: { content: string; time: number; metrics?: { factualityScore: number; relevanceScore: number } } } }, index: number) => (
            <tr key={index}>
              <td>{tc.prompt}</td>
              <td>{tc.expected}</td>
              {experiment.models.map((m: string) => (
                <td key={m}>
                  {tc.responses && tc.responses[m] ? (
                    <>
                      <div>{tc.responses[m].content}</div>
                      <div>Time: {tc.responses[m].time}s</div>
                      <div>
                        Factuality: {tc.responses[m].metrics?.factualityScore}%
                      </div>
                      <div>
                        Relevance: {tc.responses[m].metrics?.relevanceScore}%
                      </div>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
