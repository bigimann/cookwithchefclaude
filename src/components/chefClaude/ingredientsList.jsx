export default function IngredientsList(props) {
  return (
    <section className="recipe-section">
      {props.ingredients.length < 1 ? undefined : (
        <>
          <h2 className="title">
            {props.ingredients.length === 1 ? "Ingredient" : "Ingredients"} on
            hand:
          </h2>
          <ul className="ingredients-list" aria-live="polite">
            {props.myList}
          </ul>
        </>
      )}
      {props.ingredients.length < 4 ? undefined : (
        <div className="get-recipe-container">
          <div className="text" ref={props.recipeSection}>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>
          <button className="get-recipe" onClick={props.getRecipe}>
            Get a recipe
          </button>
        </div>
      )}
    </section>
  );
}
