import Anthropic from "@anthropic-ai/sdk";

const API_BASE_URL = "https://cookwithchefeneojo.onrender.com";

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`;

// Keep your Anthropic function as is
export async function getRecipeFromChefClaude(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(", ");

  const msg = await Anthropic.messages.create({
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

// FIXED: Remove undefined API_URL variable
export async function getRecipeFromMistral(ingredientsArr) {
  try {
    // FIX 5: Use hardcoded URL instead of undefined variable
    const response = await fetch(`${API_BASE_URL}/api/recipe`, {
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

// ALTERNATIVE: Dynamic URL detection
export async function getRecipeFromMistralDynamic(ingredientsArr) {
  try {
    // Detect if running locally or on production
    const isProduction = window.location.hostname !== "localhost";
    const baseUrl = isProduction
      ? "https://cookwithchefeneojo.onrender.com"
      : "http://localhost:8080";

    const response = await fetch(`${baseUrl}/api/recipe`, {
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

// DEBUGGING: Test if your API endpoint works
export async function testApiEndpoint() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/recipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ingredients: ["test"] }),
    });

    console.log("API Test Response Status:", response.status);
    console.log("API Test Response OK:", response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log("API Test Success:", data);
    } else {
      console.log("API Test Failed:", await response.text());
    }
  } catch (err) {
    console.error("API Test Error:", err);
  }
}

// Call this function in your browser console to test:
// testApiEndpoint();
