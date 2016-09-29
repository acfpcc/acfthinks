var MESSAGE_API_URL = "https://acf-pcc.appspot.com/api/acfthinks/messages/"

function message(msg) {
  console.log(msg);
}

function str2Html(str) {
  return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
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

function saveThought(thought) {
  if (!thought) {
    message('Error: No thought was specified');
    return;
  }
  chrome.storage.sync.get({thoughts: {}, lastId: 0}, function (result) {
    var thoughts = result.thoughts;
    var id = result.lastId;
    var lastDate = Date.now();
    var lastId = id + 1;
    thoughts[id] = {date: lastDate, id: id, thought: thought};
    chrome.storage.sync.set({
      thoughts: thoughts, 
      lastId: lastId, 
      lastDate: lastDate,
    }, function() {
      console.log("Saved "+thought+"!");
      chrome.storage.sync.get(null, function (result) {
      });
    });
  });
}

function getAllThoughts(callback) {
  chrome.storage.sync.get({thoughts: {}}, function(result) {
    callback(result.thoughts);
  });
}

function getThought(id, callback) {
  getAllThoughts(function(thoughts) {
    callback(thoughts[id]);
  });
}

function thoughtSubmittedToday(callback) {
  chrome.storage.sync.get({lastDate: null}, function(result) {
    var today = new Date();
    var hasSubmitted;
    if (result.lastDate == null) {
      hasSubmitted = false;
    } else {
      var lastDate = new Date();
      lastDate.setTime(result.lastDate);
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