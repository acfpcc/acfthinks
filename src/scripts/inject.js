function extractDomain(url) {
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }

    domain = domain.split(':')[0];
    var parts = domain.split('.');
    if (parts.length > 2) {
      return parts.slice(parts.length-2).join(".");
    } else {
      return domain;
    }
}

getState(function(state) {
  if (!state.submitted) {
    chrome.runtime.sendMessage({getCurrentURL: true}, function(response) {
      var domain = extractDomain(response.getCurrentURL);
      var cssFiles = [
        {file: "assets/css/normalize.css"},
        {file: "assets/css/fonts.css"}, 
        {file: "assets/css/acfthinks.css"}
      ];
      if (domain == "facebook.com") {
        cssFiles = cssFiles.concat([{file: "assets/css/facebook.css"}])
      } else if (domain == "youtube.com") {
        cssFiles = cssFiles.concat([{file: "assets/css/youtube.css"}])
      }
      var scripts = [
        {file: "scripts/underscore.js"},
        {file: "scripts/jquery.js"},
        {file: "scripts/api.js"},
        {file: "scripts/prompt.js"},
      ];
      chrome.runtime.sendMessage({
        insertCSSFiles: cssFiles, 
        executeScripts: scripts
      });
    });
  }
});