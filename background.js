try {
  importScripts("./assets/libs/papaparse.min.js");
} catch (err) {
  throw new Error("fatal - failed to import papaparse!", err);
}

let absoluteTabId = null, csvUrl = null;

chrome.runtime.onMessage.addListener(handleMessage);
chrome.tabs.onUpdated.addListener(handleTabUpdate);

async function handleMessage(request, sender, sendResponse) {
  sendResponse(true);

  if (!sender.tab && request.csvUrl && request.targetUrl) {
    const targetUrl = request.targetUrl;
    csvUrl = request.csvUrl;

    if (csvUrl.length && targetUrl.length) {
      absoluteTabId = await navigator(targetUrl)
    }
  }
  return true;
}

async function handleTabUpdate(tabId, changeInfo) {
  if (
    csvUrl &&
    absoluteTabId &&
    absoluteTabId === tabId &&
    changeInfo.status === "complete"
  ) {
    executeScript(absoluteTabId, convertAuto(await fetchCsvData(csvUrl)));
    csvUrl = null;
    absoluteTabId = null;
  }
  return true;
}

async function fetchCsvData(url) {
  return fetch(url)
    .then((res) => res.text())
    .catch((err) => {
      throw new Error("fatal - failed to fetch CSV data!", err);
    });
}

function convertAuto(csvString) {
  csvString = csvString.replace(/[\r]/gim, ""); // remove the Carriage Return from csvString.
  return Papa.parse(csvString, { header: true });
}

async function navigator(targetUrl) {
  if (!(targetUrl && targetUrl.length)) return;

  const promise = await chrome.tabs.create({ active: true, url: targetUrl });
  return promise.id;
}

function executeScript(tabId, csvObjectArray) {
  if (!(csvObjectArray && tabId)) return;

  chrome.scripting.executeScript(
    {
      files: ["/assets/js/contentScripts/injector.js"],
      target: { tabId },
    },
    () => {
      chrome.tabs.sendMessage(
        tabId,
        { csvObjectArray, command: "startScript", name: "DROPSHIPPING_TOOL" },
        (response) => response
      );
    }
  );
}
