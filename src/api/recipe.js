import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_ACCESS_TOKEN);

const SYSTEM_PROMPT = `You are an expert cooking assistant... [same as your original SYSTEM_PROMPT text here]`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res
        .status(400)
        .json({ error: "Please provide ingredients as an array." });
    }

    const ingredientsString = ingredients.join(", ");

    const response = await client.textGeneration({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `I have these ingredients: ${ingredientsString}. Suggest the best recipe that would work with these ingredients, considering cuisines from around the world.`,
        },
      ],
      max_tokens: 1024,
    });

    return res.status(200).json({
      choices: [
        {
          message: {
            content: response.choices[0].message.content,
          },
        },
      ],
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    return res.status(500).json({
      error: "Failed to generate recipe. Please try again.",
    });
  }
}
