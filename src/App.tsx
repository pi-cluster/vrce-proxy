import { useState, useEffect } from "react";
import "./App.css";
import { FaTrash, FaPowerOff, FaCheck } from "react-icons/fa";

function App() {
  const [proxies, setProxies] = useState<string[]>([]);
  const [selectedProxy, setSelectedProxy] = useState<string | null>(null);
  const [newProxy, setNewProxy] = useState("");
  const [exceptionSites, setExceptionSites] = useState<string[]>([]);
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null); // Для хранения ошибок

  useEffect(() => {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(["proxies", "selectedProxy", "exceptionSites"], (result) => {
        setProxies(result.proxies || []);
        setSelectedProxy(result.selectedProxy || null);
        setExceptionSites(result.exceptionSites || []);
      });
    } else {
      console.warn("chrome.storage.sync is not available.");
      setIsStorageAvailable(false);
    }
  }, []);

  const addProxy = () => {
    if (newProxy) {
      if (proxies.includes(newProxy)) {
        setError("This proxy is already in the list."); // Установка ошибки при дубликате
        return;
      }

      const updatedProxies = [...proxies, newProxy];
      setProxies(updatedProxies);
      setNewProxy("");
      setError(null); // Очистка ошибки

      if (isStorageAvailable) {
        chrome.storage.sync.set({ proxies: updatedProxies });
      }
    }
  };

  const removeProxy = (proxyToRemove: string) => {
    const updatedProxies = proxies.filter((proxy) => proxy !== proxyToRemove);
    setProxies(updatedProxies);
    if (selectedProxy === proxyToRemove) {
      setSelectedProxy(null);
      chrome.runtime.sendMessage({ type: "SET_PROXY", proxy: null });
    }

    if (isStorageAvailable) {
      chrome.storage.sync.set({ proxies: updatedProxies, selectedProxy: null });
    }
  };

  const toggleProxy = (proxy: string) => {
    const isSameProxy = selectedProxy === proxy;
    const newSelectedProxy = isSameProxy ? null : proxy;
    setSelectedProxy(newSelectedProxy);

    if (isSameProxy) {
      chrome.runtime.sendMessage({ type: "SET_PROXY", proxy: null });
    } else {
      chrome.runtime.sendMessage({ type: "SET_PROXY", proxy });
    }

    if (isStorageAvailable) {
      chrome.storage.sync.set({ selectedProxy: newSelectedProxy });
    }
  };

  const toggleExceptionSite = (site: string) => {
    if (exceptionSites.includes(site)) {
      const updatedSites = exceptionSites.filter((s) => s !== site);
      setExceptionSites(updatedSites);
      if (isStorageAvailable) {
        chrome.storage.sync.set({ exceptionSites: updatedSites });
      }
    } else {
      const updatedSites = [...exceptionSites, site];
      setExceptionSites(updatedSites);
      if (isStorageAvailable) {
        chrome.storage.sync.set({ exceptionSites: updatedSites });
      }
    }
  };

  const handleCurrentSiteToggle = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url;
      if (currentUrl) {
        toggleExceptionSite(currentUrl);
      }
    });
  };

  return (
    <div className="container">
      <h1>{proxies.length > 0 ? "My Proxies" : "Proxy Extension"}</h1>

      {proxies.length > 0 && (
        <ul>
          {proxies.map((proxy) => (
            <li key={proxy}>
              <span>{proxy}</span>
              <div className="btns">
                <button
                  className={selectedProxy === proxy ? "disable" : "enable"}
                  onClick={() => toggleProxy(proxy)}
                >
                  {selectedProxy === proxy ? <FaPowerOff /> : <FaCheck />}
                </button>
                <button className="remove" onClick={() => removeProxy(proxy)}>
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {proxies.length === 0 && <p>Add a proxy to get started</p>}

      {isStorageAvailable ? (
        <>
          <div className="adder">
            <input
              type="text"
              value={newProxy}
              onChange={(e) => setNewProxy(e.target.value)}
              placeholder="Add new proxy (e.g., http://example.com:3128)"
            />
            <button className="add_btn" onClick={addProxy}>Add</button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>} {/* Отображение ошибки */}

          <button className="add_btn" onClick={handleCurrentSiteToggle}>
            {exceptionSites.includes(window.location.href) ? "Remove from exceptions" : "Add to exceptions"}
          </button>

          {exceptionSites.length > 0 && (
            <ul>
              {exceptionSites.map((site) => (
                <li key={site}>
                  <span>{site}</span>
                  <button className="remove" onClick={() => toggleExceptionSite(site)}>
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>Storage sync is not available. Proxies will not be saved.</p>
      )}
    </div>
  );
}

export default App;
