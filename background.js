// BACKGROUND

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('tabs-overview.html') });
});

chrome.runtime.onInstalled.addListener(() => {
  // Code to initialize the extension
  updateTabList();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateTabList();
  }
});

chrome.tabs.onCreated.addListener(updateTabList);
chrome.tabs.onRemoved.addListener(updateTabList);
chrome.windows.onCreated.addListener(updateTabList);
chrome.windows.onRemoved.addListener(updateTabList);

function updateTabList() {
  // chrome.runtime.sendMessage({ type: 'update-tab-list' });
  reloadTabsPage();
}

function reloadTabsPage() {
  chrome.tabs.query({}, (tabs) => {
    for (let tab of tabs) {
      if (tab.url === chrome.runtime.getURL('tabs.html')) {
        chrome.tabs.reload(tab.id);
        break;
      }
    }
  });
}