const log = console.log;
const myStorage = window.sessionStorage;

function loadCsv() {
    const inputCsvUrl = document.getElementById('inputCsvUrl')
    const inputTargetUrl = document.getElementById('inputTargetUrl')
    const loadCsv = document.getElementById('loadCsv')

    if(!(inputCsvUrl instanceof HTMLElement)) return ;
    if(!(inputTargetUrl instanceof HTMLElement)) return ;
    if(!(loadCsv instanceof HTMLElement)) return ;

    //* http://crm.saffronfabs.com/bbb2fedex/Ouploads/2021-06-05-10-19-48-Order-send-Result.csv

    //? experimantal
    const offlineTargetUrl = chrome.runtime.getURL('./assets/html/new2.html');
    inputTargetUrl.value = 'http://localhost:8000/new2.html';
    //?

    const handleLoad = (e) => {
        const csvUrl = (inputCsvUrl.value || '').trim();
        const targetUrl = (inputTargetUrl.value || '').trim();

        if(!(csvUrl && csvUrl.length)) return;
        if(!(targetUrl && targetUrl.length)) return;

        myStorage.setItem('csvInput', csvUrl)
        myStorage.setItem('targetInput', targetUrl)

        chrome.runtime.sendMessage({csvUrl, targetUrl}, function(response) {
            console.log(response);
        });
    }
    loadCsv.addEventListener('click', handleLoad)

   
}

function resetInput() {
    const resetInputBtn = document.getElementById('resetInput')
    const inputCsvUrl = document.getElementById('inputCsvUrl')
    const inputTargetUrl = document.getElementById('inputTargetUrl')
    if(!(
        resetInputBtn &&
        inputCsvUrl &&
        inputTargetUrl &&
        resetInputBtn instanceof HTMLElement &&
        inputCsvUrl instanceof HTMLElement &&
        inputTargetUrl instanceof HTMLElement
        )) {
            console.error('[reset] an error occured!')
            return;
        }
    const handleReset = () => {
        inputCsvUrl.value = "";
        inputTargetUrl.value = ""
        myStorage.clear();
    }
    resetInputBtn.addEventListener('click', handleReset)
}

function saveInput() {
    const inputCsvUrl = document.getElementById('inputCsvUrl')
    const inputTargetUrl = document.getElementById('inputTargetUrl')

    let csvInputValue = myStorage.getItem('csvInput');
    let targetInputValue = myStorage.getItem('targetInput')

    if(csvInputValue !== null) {
        inputCsvUrl.value = csvInputValue
    } 

    if(targetInputValue !== null) {
        inputTargetUrl.value = targetInputValue
    }
}

(() => {
    saveInput()
    loadCsv()
    resetInput()
})()