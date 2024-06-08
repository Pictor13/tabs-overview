// BACKGROUND

chrome.action.onClicked.addListener(() => {
  openOverviewTab();
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

function openOverviewTab() {
  chrome.tabs.query({}, (tabs) => {
    let overviewFound = false;
    tabs.forEach((tab) => {
      console.log(`Pass thru tab: ${tab.id} - ${tab.url}`);
      if ((tab.url+'').includes(`extension://`) && (tab.url+'').endsWith(`/tabs-overview.html`)) {
        console.log(`TabsOverview already open, focus tab: ${tab.id} - ${tab.url}`);
        browser.tabs.update(tab.id, {active: true});
        overviewFound = true;
      }
    });
    if (!overviewFound) {
      chrome.tabs.create({ url: chrome.runtime.getURL('tabs-overview.html') });
    }
  });
}