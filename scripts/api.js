var MESSAGE_API_URL = "https://acf-pcc.appspot.com/api/acfthinks/messages/"

function message(msg) {
  console.log(msg);
}

function str2Html(str) {
  return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
}

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

function getMessage(msgType, callback) {
  var messagesUrl = chrome.extension.getURL("messages/"+msgType+".txt");
  $.get(messagesUrl, {}, function(messages) {
    messages = messages.split("\n");
    var index = _.random(0, messages.length-1);
    callback(messages[index]);
  });
}

function wipeStorage() {
  chrome.storage.sync.clear();
}

function saveThought(thought, messageUrl) {
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
      console.log("Saved "+thought+"!");
    });
  });
}

function deleteThought(id) {
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
        console.log("Delete "+id+"!");
      });
    }
  });
}

function thoughtsListener(action) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    console.log(changes);
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
}

function getAllThoughts(callback) {
  chrome.storage.sync.get({thoughts: {}}, function(result) {
    callback(result.thoughts);
  });
}

function getThought(id, callback) {
  getAllThoughts(function(thoughts) {
    if (_.has(thoughts, id)) {
      callback(thoughts[id]);
    } else {
      callback(undefined);
    }
  });
}

function thoughtSubmittedToday(callback) {
  chrome.storage.sync.get({lastDate: null}, function(result) {
    var today = new Date();
    var hasSubmitted;
    if (result.lastDate == null) {
      hasSubmitted = false;
    } else {
      var lastDate = new Date(result.lastDate);
      hasSubmitted = (lastDate.toDateString() === today.toDateString());
    }
    callback(hasSubmitted);
  });
}

function getAllMessages(callback) {
  $.getJSON(MESSAGE_API_URL, {
    format: "json"
  }).done(function(data) { 
    callback(data.results) 
  });
}

function getLatestMessage(callback) {
  getAllMessages(function(messages) {
    if (_.size(messages) > 0) {
      callback(messages[0]);
    } else {
      callback(null);
    }
  });
}