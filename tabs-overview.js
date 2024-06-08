document.addEventListener("DOMContentLoaded", () => {
  updateTabsOverview();
});

// Doesn't work on Firefox; no `sendMessage` allowed in background.js.
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "update-tab-list") {
//     updateTabsOverview();
//   }
// });

const header = document.getElementById('top');
const tabsOverview = document.getElementById("tab-list");

header.querySelector('#close-selected-tabs').onclick = () => {
  tabsOverview?.querySelectorAll('.tab input:checked').forEach(check => {
    check.replaceWith(createElement(`<img src="spinner.gif" alt="Loading..." class="spinner">`));
    closeTab(check.value, ()=>{});
  });
  updateTabsOverview();
}


function updateTabsOverview() {
  const windows = {};

  // utilities

  const htmlEscape = str => (str+'').replaceAll('<','\<').replaceAll('"','\"');

  const getWindow = id => windows[id] ?? createElement(`<div class="window" data-window-id="${id}">
      <h2>Windows ${id}</h2>
      <ul class="tabs"></ul>
    </div>`
  );

  const liElement = element => createElement('<li>').appendChild(element);
  const addLiTo = list => element => list.appendChild(liElement(element));

  const getTabs = wind => {
    const list = wind.querySelector('ul');
    list.add = addLiTo(list);
    return list;
  };

  const getTab = browserTab => {
    if (!browserTab.url) {
      console.log('broken tab:', browserTab.title, browserTab.url);
      throw new Error('Invalid tab');
    }
    const tab = createElement(`<div class="tab" data-tab-id="${browserTab.id}" title="${browserTab.url}">
        <input type="checkbox" value="${browserTab.id}">
        <span></span>
        <button><i>X</i> Close</button>
      </div>`
    );
    if (tab instanceof Element === false) {
      throw new Error('Unable to render tab descriptor');
    }
    if (tab.querySelector('button') instanceof Element === false) {
      console.log("WTF", tab instanceof Element, tab, tab.querySelector('button'), tab.querySelector('button'), tab.innerHTML);
    }
    const check = tab.querySelector('input');
    tab.querySelector('span').innerHTML = browserTab.title;
    tab.querySelector('button').onclick = () => {
      check.replaceWith(createElement(`<img src="spinner.gif" alt="Loading..." class="spinner">`));
      closeTab(browserTab.id);
    }
    tab.onclick = () => {
      check.checked = check.checked ? '' : 'checked';
    }
    return tab;
  }

  // process tabs rendering

  chrome.tabs.query({}, (tabs) => {
    const windowList = createElement('<ul id="windows">');
    windowList.add = addLiTo(windowList);

    tabs.forEach((tab) => {
      const wind = windows[tab.windowId] = getWindow(tab.windowId);
      const tabElement = getTab(tab);
      getTabs(wind).add(tabElement);
      windowList.add(wind);
    });
    tabsOverview.innerHTML = "";
    tabsOverview?.appendChild(windowList);
  });
}

function closeTab(tabId, callback = () => updateTabsOverview()) {
  chrome.tabs.remove(Number(tabId), callback);
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