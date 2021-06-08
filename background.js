const log = console.log;

let isPapaFailed = false;
const csvTabObject = {}

try {
  importScripts("./assets/libs/papaparse.min.js");
} catch (e) {
  console.error(e);
  isPapaFailed = true;
}

//* converts using the papaparse library.
function convertAuto(csvString) {
  csvString = csvString.replace(/[\r]/gim, "");

  const config = {
    quotes: false, //or array of booleans
    quoteChar: '"',
    escapeChar: '"',
    delimiter: "",
    header: true,
    newline: "\r\n",
    skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
    columns: null, //or array of strings
  };

  const results = Papa.parse(csvString, { header: true });

  return results;
}

//*fetch csv data from server.
async function fetchCsvData(url) {
  try {
    return fetch(url).then((res) => res.text());
  } catch (e) {
    return null;
  }
}

//*converts csv data to array with objects.
//! depreceted.
async function convertor() {
  const csv = await fetchCsvData();
  if (csv === null) {
    console.error("An Error Occured!");
    return;
  }
  const csvString = csv.replace(/[\r]/gim, "");
  log(csvString);
  papa(csvString);
}

//*listen for the incoming messages from popup.js
async function listener(listenerCallback) {
  return new Promise((resolve, reject) => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      sendResponse({ farewell: "goodbye" });

      const csvUrl = request.csvUrl;
      const targetUrl = request.targetUrl;

      if (!(csvUrl && targetUrl && csvUrl.length && targetUrl.length)) {
        reject(false);
      } else {
        listenerCallback(csvUrl, targetUrl);
        resolve({ csvUrl, targetUrl });
      }

      return true;
    });
  });
}

async function sender(csvObjectArray, tabId) {
  chrome.tabs.sendMessage(tabId, { csvObjectArray }, function (response) {
    console.log(response);
  });
}

async function navigator(targetUrl) {
  /**
   * @param {string} url - the webpage url that need to be fill.
   */
  const promise = await chrome.tabs.create({ active: true, url: targetUrl });

  log("navigator done", promise.id);
  return promise.id;
}

async function executeContentScript(tabId) {
  log("execute loaded");
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["./assets/js/contentScripts/injector.js"],
      },
      () => {
        resolve(true);
      }
    );
  });
}

async function listenerCallback(csvUrl, targetUrl) {
 
  if (!csvUrl) {
    console.error("An Error Occured!");
  }
  const csvString = await fetchCsvData(csvUrl);

  let csvObjectArray;
  if (!isPapaFailed) {
    csvObjectArray = convertAuto(csvString);
  }

  const tabId = await navigator(targetUrl);
  
  csvTabObject[tabId] = csvObjectArray;

  log('csvTabObject', csvTabObject)
}

(async () => {
    await listener(listenerCallback);

    chrome.tabs.onUpdated.addListener(async (updatedTabId, changeInfo) => {
      log('updatedTabId', updatedTabId)
      if (changeInfo.status === "complete") {
        if(csvTabObject[updatedTabId]) {
          await executeContentScript(updatedTabId);
          sender(csvTabObject[updatedTabId], updatedTabId)
        }
      }
      return true;
    });

})();
