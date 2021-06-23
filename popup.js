document.addEventListener("DOMContentLoaded", () => {
  restoreInput();
  handler();
});

function handler() {
  const inputCsvUrl = document.getElementById("inputCsvUrl");
  const inputTargetUrl = document.getElementById("inputTargetUrl");
  const loadCsv = document.getElementById("loadCsv");
  const resetInputBtn = document.getElementById("resetInput");

  if (!(inputCsvUrl instanceof HTMLElement)) return;
  if (!(inputTargetUrl instanceof HTMLElement)) return;
  if (!(loadCsv instanceof HTMLElement)) return;
  if (!(resetInputBtn instanceof HTMLElement)) return;

  const handleInputCsv = (e) => {
    let csvUrl = e?.target?.value;
    if (csvUrl) {
      csvUrl = csvUrl.trim();
    }
    chrome.storage.local.set({ csvInput: csvUrl });
  };
  const handleTargetUrl = (e) => {
    let targetUrl = e?.target?.value;
    if (targetUrl) {
      targetUrl = targetUrl.trim();
    }
    chrome.storage.local.set({ targetInput: targetUrl });
  };
  const handleLoad = () => {
    const csvUrl = (inputCsvUrl.value || "").trim();
    const targetUrl = (inputTargetUrl.value || "").trim();

    if (!(csvUrl && csvUrl.length)) return;
    if (!(targetUrl && targetUrl.length)) return;

    chrome.storage.local.set({ csvInput: csvUrl, targetInput: targetUrl });

    chrome.runtime.sendMessage({ csvUrl, targetUrl }, function (response) {
      return response;
    });
  };
  const handleReset = () => {
    inputCsvUrl.value = "";
    inputTargetUrl.value = "";
    chrome.storage.local.remove(["csvInput", "targetInput"]);
  };

  inputCsvUrl.addEventListener("input", handleInputCsv);
  inputTargetUrl.addEventListener("input", handleTargetUrl);
  loadCsv.addEventListener("click", handleLoad);
  resetInputBtn.addEventListener("click", handleReset);
}

function restoreInput() {
  const inputCsvUrl = document.getElementById("inputCsvUrl");
  const inputTargetUrl = document.getElementById("inputTargetUrl");

  chrome.storage.local.get(["csvInput", "targetInput"], (result) => {
    let csvInputValue = result.csvInput;
    let targetInputValue = result.targetInput;

    if (!!csvInputValue) {
      inputCsvUrl.value = csvInputValue;
    }
    if (!!targetInputValue) {
      inputTargetUrl.value = targetInputValue;
    }
  });
}
