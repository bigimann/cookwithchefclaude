import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,

  dangerouslyAllowBrowser: true,
});

export async function getRecipeFromChefClaude(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(", ");

  const msg = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`,
      },
    ],
  });
  return msg.content[0].text;
}

export async function getRecipeFromMistral(ingredientsArr) {
  try {
    const response = await fetch("http://localhost:5000/api/recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ingredients: ingredientsArr }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No recipe found.";
  } catch (err) {
    console.error("Error fetching recipe:", err);
    return "Sorry, I couldn't generate a recipe right now. Please check your internet connection and try again.";
  }
}
