import React from "react";
import ClaudeRecipe from "./claudeRecipe";
import IngredientsList from "./ingredientsList";
import { getRecipeFromMistral } from "./ai";
import "./index.css";

export default function Main() {
  // State values
  const [ingredients, setIngredients] = React.useState([]);

  const [recipe, setRecipe] = React.useState("");

  // Derive values
  const recipeSection = React.useRef(null);

  // scroll down when the ingredients is ready
  React.useEffect(() => {
    if (recipe !== "" && recipeSection.current !== null) {
      recipeSection.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [recipe]);

  // Get the recipe from the API and save it to the recipe state
  const tips = document.getElementById("tips");
  async function getRecipe() {
    const recipeMarkDown = await getRecipeFromMistral(ingredients);
    setRecipe(recipeMarkDown);
    if (recipeMarkDown) {
      tips.style.display = "none";
    }
  }

  // Display the ingredients from the form data as a list item to the screen
  const myList = ingredients.map((list) => {
    return list.length < 1 ? null : <li key={list}>{list}</li>;
  });

  // Alternative version with better error handling:
  function submitForm(formData) {
    const newIngredient = formData.get("ingredient");
    const handleError = document.getElementById("handle-error");

    // Helper function to show error
    const showError = (message) => {
      handleError.textContent = message;
      handleError.style.display = "block";
    };

    // Helper function to hide error
    const hideError = () => {
      handleError.textContent = "";
      handleError.style.display = "none";
    };

    // Validation checks
    if (
      !newIngredient ||
      (newIngredient.trim() === "" && !newIngredient) ||
      newIngredient.trim() < 4
    ) {
      showError("Error: Please add at least ingredients!");
      return;
    }

    if (/^\d+$/.test(newIngredient.trim())) {
      showError("Error: Please enter a valid ingredient");
      return;
    }

    // Check for very short inputs (less than 2 characters)
    if (newIngredient.trim().length < 3) {
      showError("Error: Ingredient name is too short!");
      return;
    }

    // Success - add ingredient and hide error
    setIngredients((items) => [...items, newIngredient.trim()]);
    hideError();
  }

  return (
    <main className="main">
      <form className="form" action={submitForm}>
        <input
          type="text"
          aria-label="Add ingredient"
          placeholder="e.g oregano"
          name="ingredient"
        />
        <button type="submit">Add Ingredient</button>
      </form>
      <p id="handle-error"></p>
      <IngredientsList
        getRecipe={getRecipe}
        myList={myList}
        ingredients={ingredients}
        recipeSection={recipeSection}
      />
      {recipe && <ClaudeRecipe recipe={recipe} />}
      <section id="tips" className="tips">
        <h2>TIPS</h2>
        <p>
          <ul>
            <li>
              Click on the input box and then submit to add ingredients to the
              list
            </li>
            <li>
              Add at least 4 ingredients to display the "Get Recipe" button
            </li>
            <li>Input should not be empty</li>
            <li>Ingredients must be at a length of 3 or more</li>
            <li>
              Click on "Get a recipe" when your ingredients list is complete
            </li>
          </ul>
        </p>
      </section>
    </main>
  );
}
