document.addEventListener("DOMContentLoaded", () => {
  updateTabList();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "update-tab-list") {
    updateTabList();
  }
});

function updateTabList() {
  chrome.tabs.query({}, (tabs) => {
    const tabList = document.getElementById("tab-list");
    tabList.innerHTML = "";

    let windows = {};
    tabs.forEach((tab) => {
      if (!windows[tab.windowId]) {
        windows[tab.windowId] = [];
      }
      windows[tab.windowId].push(tab);
    });

    for (let windowId in windows) {
      let windowDiv = document.createElement("div");
      windowDiv.className = "window";
      windowDiv.innerHTML = `<h2>Window ${windowId}</h2>`;

      windows[windowId].forEach((tab) => {
        let tabDiv = document.createElement("div");
        tabDiv.className = "tab";
        tabDiv.innerText = tab.title;
        tabDiv.dataset.tabId = tab.id;
        tabDiv.title = tab.url;

        let closeButton = document.createElement("button");
        closeButton.innerText = "Close";
        closeButton.onclick = () => closeTab(tab.id);

        tabDiv.appendChild(closeButton);
        windowDiv.appendChild(tabDiv);
      });

      tabList.appendChild(windowDiv);
    }
  });
}

function closeTab(tabId) {
  chrome.tabs.remove(tabId, () => {
    updateTabList();
  });
}
