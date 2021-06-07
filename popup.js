const log = console.log;

function loadCsv() {
    const inputCsvUrl = document.getElementById('inputCsvUrl')
    const loadCsv = document.getElementById('loadCsv')

    if(!(inputCsvUrl instanceof HTMLElement)) return ;
    if(!(loadCsv instanceof HTMLElement)) return ;

    //* http://crm.saffronfabs.com/bbb2fedex/Ouploads/2021-06-05-10-19-48-Order-send-Result.csv
    
    const handleLoad = (e) => {
        const url = (inputCsvUrl.value || '').trim();
        if(!(url && url.length)) return;
        
        chrome.runtime.sendMessage({url}, function(response) {
            console.log(response);
        });
    }
    loadCsv.addEventListener('click', handleLoad)

   
}

function resetInput() {
null
}

function saveInput() {
null
}

(() => {
    loadCsv()
})()