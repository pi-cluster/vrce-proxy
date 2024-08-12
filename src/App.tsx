import { useState } from "react";
import "./App.css";

function App() {
  const [isProxyEnabled, setProxyEnabled] = useState(false);

  const toggleProxy = () => {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: "TOGGLE_PROXY" }, (response) => {
        setProxyEnabled(response.isProxyEnabled);
      });
    } else {
      console.error("chrome.runtime.sendMessage is not available");
    }
    
  };

  return (
    <div>
      <h1>Proxy Extension</h1>
      <p>Proxy is {isProxyEnabled ? "Enabled" : "Disabled"}</p>
      <button onClick={toggleProxy}>
        {isProxyEnabled ? "Disable Proxy" : "Enable Proxy"}
      </button>
    </div>
  );
}

export default App;
