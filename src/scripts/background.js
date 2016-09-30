function executeScripts(tabId, injectDetailsArray) {
  function createCallback(tabId, injectDetails, innerCallback) {
    return function () {
      chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
    };
  }
  var callback = null;
  for (var i = injectDetailsArray.length - 1; i >= 0; --i)
    callback = createCallback(tabId, injectDetailsArray[i], callback);
  if (callback !== null)
    callback(); 
}

function insertCSSFiles(tabId, injectDetailsArray) {
  function createCallback(tabId, injectDetails, innerCallback) {
    return function () {
      chrome.tabs.insertCSS(tabId, injectDetails, innerCallback);
    };
  }
  var callback = null;
  for (var i = injectDetailsArray.length - 1; i >= 0; --i)
    callback = createCallback(tabId, injectDetailsArray[i], callback);
  if (callback !== null)
    callback(); 
}

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({url: "pages/dashboard.html"});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  response = {};
  if (request.insertCSSFiles !== undefined) {
    insertCSSFiles(sender.tab.id, request.insertCSSFiles);
    response["insertCSSFiles"] = "css inserted!";
  }
  if (request.executeScripts !== undefined) {
    executeScripts(sender.tab.id, request.executeScripts);
    response["executeScripts"] = "prompted!";
  }
  if (request.getCurrentURL == true) {
    response["getCurrentURL"] = sender.tab.url;
  }
  sendResponse(response);
});

chrome.runtime.onInstalled.addListener(function(details) {
  chrome.tabs.create({url: "pages/help.html"});
});