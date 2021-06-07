const log = console.log;

let isPapaFailed = false;

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

  const results = Papa.parse(csvString, {header: true});

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
async function listener() {
  return new Promise((resolve, reject) => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      sendResponse({ farewell: "goodbye" });

      const url = request.url;

      if (!(url && url.length)) {
        reject(false);
      } else {
        resolve(url);
      }

      return true;
    });
  });
}

async function sender(csvObjectArray) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {csvObjectArray}, function(response) {
      console.log(response);
    });
  });
}

(async () => {
  // convertor()

  const url = await listener();
  if(!url) {
    console.error('An Error Occured!')
  }
  const csvString = await fetchCsvData(url)

  let csvObjectArray;
  if(!isPapaFailed) {
    csvObjectArray = convertAuto(csvString)
  } 

  log('csvObjectArray', csvObjectArray)
  sender(csvObjectArray)
})();
