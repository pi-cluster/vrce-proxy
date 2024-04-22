import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [color, setColor] = useState<string>("#000");

  const onclick = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.id !== undefined) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [color],
        func: (color) => {
          document.body.style.backgroundColor = color;
        },
      });
    } else {
      console.error("Tab ID is undefined");
    }
  };
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <input type="color" onChange={(e) => setColor(e.currentTarget.value)} />
        <button
          onClick={() => {
            setCount((count) => count + 1);
            onclick();
          }}
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
