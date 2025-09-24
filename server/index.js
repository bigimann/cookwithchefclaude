const express = require("express");
const cors = require("cors");
const { HfInference } = require("@huggingface/inference");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// FIX 1: Add static file serving for your React app
app.use(express.static("build")); // or 'dist' depending on your build folder

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

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
- Southeast Asian: Pad Thai, Pho, Satay, Rendung, Tom yum

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

app.post("/api/recipe", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res
        .status(400)
        .json({ error: "Please provide ingredients as an array." });
    }

    const ingredientsString = ingredients.join(", ");

    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `I have these ingredients: ${ingredientsString}. Suggest the best recipe that would work with these ingredients, considering cuisines from around the world. Feel free to suggest dishes from any culture - African, Asian, European, American, or fusion recipes that combine different culinary traditions.`,
        },
      ],
      max_tokens: 1024,
    });

    res.json({
      choices: [
        {
          message: {
            content: response.choices[0].message.content,
          },
        },
      ],
    });
  } catch (err) {
    console.error("Error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to generate recipe. Please try again." });
  }
});

// FIX 2: Add a catch-all handler to serve your React app for any non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html")); // or 'dist/index.html'
});

const PORT = process.env.PORT || 8080;

// FIX 3: Use 'app' instead of undefined 'server' variable
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
