import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function callLLM(
  modelName: string,
  prompt: string
): Promise<string> {
  const startTime = performance.now();

  let responseText = "";

  switch (modelName) {
    case "llama-3.3-70b-versatile": {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: prompt }],
      });
      responseText = completion.choices[0].message?.content ?? "";
      break;
    }

    case "gemma2-9b-it": {
      const completion = await groq.chat.completions.create({
        model: "gemma2-9b-it",
        messages: [{ role: "system", content: prompt }],
      });
      responseText = completion.choices[0].message?.content ?? "";
      break;
    }

    case "mixtral-8x7b-32768": {
      const completion = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "system", content: prompt }],
      });
      responseText = completion.choices[0].message?.content ?? "";
      break;
    }

    default: {
      responseText = "Model not supported.";
    }
  }
  const endTime = performance.now();
  const responseTime = (endTime - startTime) / 1000; 

  return `${responseText}|||${responseTime}`; 
}
