// src/app/experiments/page.tsx

"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function ExperimentsList() {
  interface Experiment {
    id: string;
    name: string;
    systemPrompt?: string;
    models?: string[];
    testCases?: TestCase[];

  }

  interface TestCase {
    prompt: string;
    expected?: string;
    responses?: Record<
      string, 
      {
        content: string;
        time: number;
        metrics?: {
          factualityScore?: number;
          relevanceScore?: number;

        };
      }
    >;
  }


  const [experiments, setExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    const fetchExperiments = async () => {
      const ref = collection(db, "experiments");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data() as Omit<Experiment, "id">;
        return { id: doc.id, ...docData };
      });
      setExperiments(data);

    };
    fetchExperiments();
  }, []);

  return (
    <div>
      <h1>Experiments</h1>
      <Link href="/experiments/new">Create New Experiment</Link>
      <ul>
        {experiments.map((exp) => (
          <li key={exp.id}>
            <Link href={`/experiments/${exp.id}`}>{exp.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
