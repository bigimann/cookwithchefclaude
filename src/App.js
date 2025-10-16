import Main from "./components/chefClaude/main.jsx";
import Header from "./components/chefClaude/header.jsx";

function App() {
  return (
    <>
      <div className="desktop-warning">
        Sorry! Desktop mode not available for this web app yet, resize your
        screen to a width of <strong>&lt;= 632px</strong>
      </div>
      <div className="chef-claude">
        <Header />
        <Main />
      </div>
    </>
  );
}

export default App;
