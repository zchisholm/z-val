// src/pages/api/experiments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { systemPrompt, llmModel, testCaseIds } = req.body;
      const docRef = await addDoc(collection(db, "experiments"), {
        systemPrompt,
        llmModel,
        testCaseIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return res.status(201).json({ id: docRef.id });
    }

    if (req.method === "GET") {
      const snapshot = await getDocs(collection(db, "experiments"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("experiments error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
