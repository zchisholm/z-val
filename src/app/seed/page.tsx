// src/app/seed/page.tsx (using the App Router in Next.js)
"use client";

import React from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SeedPage() {
  const handleSeed = async () => {
    try {
      const experimentsRef = collection(db, "experiments");
      await addDoc(experimentsRef, {
        name: "My Experiment",
        systemPrompt: "You are an expert assistant...",
        models: ["llama-3.3-70b-versatile", "gemma2-9b-it"],
        testCases: [
          {
            prompt: "How many 'y' in 'strawberry'?",
            expected: "1",
            responses: {
              "llama-3.3-70b-versatile": {
                content: "There is 1 'y' in 'strawberry'.",
                time: 0.47,
                metrics: {
                  factualityScore: 100,
                  relevanceScore: 100,
                },
              },
            },
          },
        ],
      });
      alert("Seeded experiment successfully!");
    } catch (error) {
      console.error("Seeding error:", error);
      alert("Failed to seed experiment.");
    }
  };

  return (
    <div>
      <h1>Seed Firestore</h1>
      <button onClick={handleSeed}>Seed Database</button>
    </div>
  );
}
