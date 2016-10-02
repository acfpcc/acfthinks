if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

var ACFThinksAPI = (function() {
  var API = {}

  var MESSAGE_API_URL = "https://acf-pcc.appspot.com/api/acfthinks/messages/";

  var message = function(msg) {
    console.log(msg);
  };

  API.str2Html = function(str) {
    return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
  };

  API.getMessage = function(msgType, callback) {
    var messagesUrl = chrome.extension.getURL("messages/"+msgType+".txt");
    $.get(messagesUrl, {}, function(messages) {
      messages = messages.split("\n");
      var index = _.random(0, messages.length-1);
      callback(messages[index]);
    });
  };

  API.wipeStorage = function() {
    chrome.storage.sync.clear();
  };

  API.createThought = function(thought, messageUrl) {
    messageUrl = (typeof messageUrl === 'undefined') ? '' : messageUrl;
    if (!thought) {
      message('Error: No thought was specified');
      return;
    }
    chrome.storage.sync.get({thoughts: {}, lastId: -1, idCount: 0}, function (result) {
      var thoughts = result.thoughts;
      var id = result.idCount;
      var idCount = result.idCount + 1;
      var lastDate = Date.now();
      thoughts[id] = {
        date: lastDate, 
        id: id, 
        thought: thought, 
        messageUrl: messageUrl
      };
      chrome.storage.sync.set({
        thoughts: thoughts, 
        lastId: id, 
        lastDate: lastDate,
        idCount: idCount
      }, function() {
        console.log("Created thought!");
      });
    });
  };

  API.saveThought = function(id, thought) {
    if (!thought) {
      message('Error: No thought was specified');
      return;
    }
    chrome.storage.sync.get({thoughts: {}}, function (result) {
      var thoughts = result.thoughts;
      if (_.has(thoughts, id)) {
        thoughts[id].thought = thought;
      }
      chrome.storage.sync.set({
        thoughts: thoughts
      }, function() {
        console.log("Saved thought!");
      });
    });
  };

  API.deleteThought = function(id) {
    chrome.storage.sync.get({thoughts: {}, lastId: -1, lastDate: 0}, function (result) {
      var thoughts = result.thoughts;
      var lastId = result.lastId;
      var lastDate = result.lastDate;
      if (_.has(thoughts, id)) {
        delete thoughts[id];
        if (lastId == id) {
          if (_.isEmpty(thoughts)) {
            lastId = 0;
            lastDate = 0;
          } else {
            lastId = _.reduce(_.keys(thoughts), function(curr, id){ 
              return (thoughts[id].date > thoughts[curr].date) ? id : curr; 
            });
            lastDate = thoughts[lastId].date;
          }
        }
        chrome.storage.sync.set({
          thoughts: thoughts, 
          lastId: lastId, 
          lastDate: lastDate
        }, function() {
          console.log("Deleted "+id+"!");
        });
      }
    });
  };

  API.thoughtsListener = function(action) {
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if (namespace == "sync" && _.has(changes, "thoughts")) {
        var before = changes["thoughts"].oldValue;
        var after = changes["thoughts"].newValue;
        var removed = _.map(_.difference(_.keys(before), _.keys(after)),
                            function(key){ return before[key]; });
        var added = _.map(_.difference(_.keys(after), _.keys(before)),
                            function(key){ return after[key]; });
        action(added, removed)
      }
    });
  };

  API.lastDateListener = function(action) {
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if (namespace == "sync" && _.has(changes, "lastDate")) {
        var before = changes["lastDate"].oldValue;
        var after = changes["lastDate"].newValue;
        action(after, before)
      }
    });
  };

  API.getAllThoughts = function(callback) {
    chrome.storage.sync.get({thoughts: {}}, function(result) {
      callback(result.thoughts);
    });
  };

  API.getThought = function(id, callback) {
    API.getAllThoughts(function(thoughts) {
      if (_.has(thoughts, id)) {
        callback(thoughts[id]);
      } else {
        callback(undefined);
      }
    });
  };

  API.thoughtSubmittedToday = function(callback) {
    getState(function(state) {
      callback(state.submitted);
    });
  };

  API.getAllMessages = function(callback) {
    $.getJSON(MESSAGE_API_URL, {
      format: "json"
    }).done(function(data) { 
      callback(data.results) 
    });
  };

  API.getLatestMessage = function(callback) {
    API.getAllMessages(function(messages) {
      if (_.size(messages) > 0) {
        callback(messages[0]);
      } else {
        callback(null);
      }
    });
  };

  return API
}());