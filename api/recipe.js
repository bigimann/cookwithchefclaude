import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_ACCESS_TOKEN);

const SYSTEM_PROMPT = `You are an expert cooking assistant...`;

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST method allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return new Response(
        JSON.stringify({ error: "Please provide ingredients as an array." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const ingredientsString = ingredients.join(", ");

    const response = await client.chatCompletion({
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

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: response.choices[0].message.content,
            },
          },
        ],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate recipe. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
