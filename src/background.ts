let isProxyEnabled = false;

chrome.runtime.onInstalled.addListener(() => {
  resetProxy();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "TOGGLE_PROXY") {
    isProxyEnabled = !isProxyEnabled;
    resetProxy();
    sendResponse({ isProxyEnabled });
  }
});

function resetProxy() {
  if (isProxyEnabled) {
    const proxyConfig = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: "http",
          host: "37.9.35.22",
          port: 3128
        },
        bypassList: ["localhost"]
      }
    };
    chrome.proxy.settings.set(
      { value: proxyConfig, scope: "regular" },
      () => {
        console.log("Proxy enabled");
      }
    );
  } else {
    chrome.proxy.settings.clear({ scope: "regular" }, () => {
      console.log("Proxy disabled");
    });
  }
}
