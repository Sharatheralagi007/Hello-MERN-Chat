import React from "react";
import { Route, Switch } from "react-router-dom"; // Switch to group routes and Route to define paths
import "./App.css";
import Homepage from "./Pages/Homepage";
import Chatpage from "./Pages/Chatpage";

function App() {
  return (
    <div className="App">
      <div className="overlay">
        <Switch>
          {/* Define the routes using the render or component prop */}
          <Route path="/" component={Homepage} exact />
          <Route path="/chats" component={Chatpage} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
