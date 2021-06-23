try {
  importScripts("./assets/libs/papaparse.min.js");
} catch (err) {
  throw new Error("fatal - failed to import papaparse!", err);
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  sendResponse(true);

  if (!sender.tab && request.csvUrl && request.targetUrl) {
    const csvUrl = request.csvUrl;
    const targetUrl = request.targetUrl;

    if (csvUrl.length && targetUrl.length) {
      executeScript(
        await navigator(targetUrl),
        convertAuto(await fetchCsvData(csvUrl))
      );
    }
  }

  return true;
});

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
