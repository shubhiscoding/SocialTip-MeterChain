import React, { useEffect, useState } from "react";
import NavBar, { getCurrentProvider } from "./Components/NavBar";
import TipForm from "./Components/TipForm";
import Home from "./Components/Home";
import TwitterLogin from "./Components/TwitterLogin";
import SplashScreen from "./Components/SplashScreen";
import "./Styles/TipForm.css";
import "./App.css";
import "./Styles/Responsive.css"
import { BrowserRouter as Route } from "react-router-dom";

function App() {
  const [currentProvider, setCurrentProvider] = useState("Meter Testnet");
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleLottieLoaded = () => {
    setIsSplashVisible(false);
  };

  console.log(currentProvider);

  return (
    <div className="App">
      {isSplashVisible &&
        <SplashScreen onAnimationComplete={handleLottieLoaded} />}
      <header className="App-header" id="home">
        <Home onLottieLoaded={handleLottieLoaded} />
        <TipForm provider={currentProvider} />
        <TwitterLogin currentProvider={currentProvider} />
      </header>
    </div>
  );
}

export default App;
