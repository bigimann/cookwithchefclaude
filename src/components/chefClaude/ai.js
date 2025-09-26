import Anthropic from "@anthropic-ai/sdk";
const { HfInference } = require("@huggingface/inference");

const SYSTEM_PROMPT = `You are an expert cooking assistant with comprehensive knowledge of global cuisines. When suggesting recipes, consider dishes from all continents equally and choose the best fit for the available ingredients.

GLOBAL CUISINE KNOWLEDGE:

AFRICAN CUISINES:
- West African: Jollof rice, Egusi soup, Suya, Plantain dishes, Fufu, Pepper soup, Akara
- East African: Injera, Ugali, Nyama choma, Pilau, Mandazi
- North African: Tagines, Couscous, Harira soup, Shakshuka
- South African: Bobotie, Boerewors, Pap, Bunny chow

ASIAN CUISINES:
- East Asian: Stir-fries, Ramen, Sushi, Dumplings, Fried rice
- South Asian: Curries, Biryani, Dal, Naan, Tandoori dishes
- Southeast Asian: Pad Thai, Pho, Satay, Rendang, Tom yum

EUROPEAN CUISINES:
- Mediterranean: Pasta, Paella, Risotto, Greek salads, Pizza
- Northern European: Stews, Roasts, Potato dishes, Bread-based meals

AMERICAN CUISINES:
- North American: BBQ, Tex-Mex, Soul food, Comfort foods
- Latin American: Tacos, Empanadas, Ceviche, Rice and beans

RECIPE SELECTION CRITERIA:
1. Match ingredients to the most suitable cuisine (regardless of origin)
2. Consider flavor profiles and cooking techniques that work best
3. Include both traditional and fusion options when relevant
4. Highlight lesser-known dishes from various cultures
5. Suggest variations from different culinary traditions

FORMAT YOUR RESPONSE:
- Recipe name (with cuisine origin)
- Brief cultural context or interesting facts
- Ingredient list
- Step-by-step instructions
- Serving suggestions
- Optional: Alternative versions from other cuisines

APPROACH: Be culturally inclusive, celebrate diversity in global cooking, and choose recipes based on what works best with the available ingredients, not geographic preference.`;

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

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export async function getRecipeFromMistral(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(", ");
  try {
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`,
        },
      ],
      max_tokens: 1024,
    });
    return response.choices[0].message.content || "No recipe found.";
  } catch (err) {
    console.error("Error fetching recipe:", err);
    return "Sorry, I couldn't generate a recipe right now. Please check your internet connection and try again.";
  }
}
