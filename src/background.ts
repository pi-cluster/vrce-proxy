let selectedProxy: string | null = null;
let exceptionSites: string[] = [];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("selectedProxy", (result) => {
    selectedProxy = result.selectedProxy || null;
    resetProxy();
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SET_PROXY") {
    selectedProxy = message.proxy;
    resetProxy();
    sendResponse({ selectedProxy });
  }
});

function resetProxy() {
  if (selectedProxy) {
    const url = new URL(selectedProxy);
    const proxyConfig = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: url.protocol.replace(":", ""),
          host: url.hostname,
          port: parseInt(url.port),
        },
        bypassList: exceptionSites,
      },
    };
    chrome.proxy.settings.set(
      { value: proxyConfig, scope: "regular" },
      () => {
        console.log("Proxy set to:", selectedProxy);
      }
    );
  } else {
    chrome.proxy.settings.clear({ scope: "regular" }, () => {
      console.log("Proxy disabled");
    });
  }
}
