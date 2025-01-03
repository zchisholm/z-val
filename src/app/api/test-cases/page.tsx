// src/pages/api/test-cases/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/firebase";
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
      const { userMessage, expectedOutput, graderType } = req.body;
      const docRef = await addDoc(collection(db, "testCases"), {
        userMessage,
        expectedOutput,
        graderType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return res.status(201).json({ id: docRef.id });
    }

    if (req.method === "GET") {
      const snapshot = await getDocs(collection(db, "testCases"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("test-cases error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
