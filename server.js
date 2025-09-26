const express = require("express");
const cors = require("cors");
const path = require("path");
const { HfInference } = require("@huggingface/inference");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files if you have a React build folder
app.use(express.static(path.join(__dirname, "build")));

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

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.post("/api/recipe", async (req, res) => {
  console.log("Recipe endpoint hit with:", req.body);

  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res
        .status(400)
        .json({ error: "Please provide ingredients as an array." });
    }

    const ingredientsString = ingredients.join(", ");
    console.log("Processing ingredients:", ingredientsString);

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

    console.log("HuggingFace response received");

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
    console.error("Recipe generation error:", err);
    res
      .status(500)
      .json({ error: "Failed to generate recipe. Please try again." });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Recipe API is running!",
    endpoints: ["/api/recipe"],
    status: "healthy",
  });
});

// Catch-all for React Router (if serving React build)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
  console.log(`API endpoint: http://localhost:${port}/api/recipe`);
});
