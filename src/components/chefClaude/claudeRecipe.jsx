import ReactMarkdown from "react-markdown";

export default function ClaudeRecipe(props) {
  return (
    <section className="response" aria-live="polite">
      <h2>Chef Claude Recommends:</h2>
      <article className="suggested-recipe-container" aria-live="polite">
        <ReactMarkdown>{props.recipe}</ReactMarkdown>
      </article>
    </section>
  );
}
