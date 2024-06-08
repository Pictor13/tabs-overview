document.addEventListener("DOMContentLoaded", () => {
  updateTabsOverview();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "update-tab-list") {
    updateTabsOverview();
  }
});

const windows = {};

function updateTabsOverview() {
  // utilities
  const getWindow = id => windows[id] ?? createElement(`<div class="window" data-window-id="${id}">
      <h2>Windows ${id}</h2>
      <ul class="tabs"></ul>
    </div>`
  );

  const liElement = element => createElement('<li>').appendChild(element);
  const addLiTo = list => element => list.appendChild(liElement(element))

  const getTabs = wind => {
    const list = wind.querySelector('ul');
    list.add = addLiTo(list);
    return list;
  };

  const getTab = browserTab => {
    const tab = createElement(`<div class="tab" data-tab-id="${browserTab.id}" title="${browserTab.url}">
        <button>X Close</button>
        ${browserTab.title}
      </div>`
    );
    tab.querySelector('button').onclick = () => closeTab(browserTab.id);

    return tab;
  }

  // process tabs rendering
  chrome.tabs.query({}, (tabs) => {
    const tabsOverview = document.getElementById("tab-list");
    tabsOverview.innerHTML = "";

    const windowList = createElement('<ul id="windows">');
    windowList.add = addLiTo(windowList);

    tabs.forEach((tab) => {
      const wind = windows[tab.windowId] = getWindow(tab.windowId);
      const tabElement = getTab(tab);
      getTabs(wind).add(tabElement);
      windowList.add(wind);
    });
    tabsOverview?.appendChild(windowList);
  });
}

function closeTab(tabId) {
  chrome.tabs.remove(tabId, () => {
    updateTabsOverview();
  });
}



/** UTILS */

/**
 * @param {String} HTML representing a single element.
 * @param {Boolean} flag representing whether or not to trim input whitespace, defaults to true.
 */
function createElement(html, trim = true) {
  // Process the HTML string.
  html = trim ? html.trim() : html;
  // if (!html) return null;

  // Then set up a new template element.
  const template = document.createElement('template');
  template.innerHTML = html;
  const result = template.content.children;

  // Then return either an HTMLElement or HTMLCollection,
  // based on whether the input HTML had one or more roots.
  return result[0];
}