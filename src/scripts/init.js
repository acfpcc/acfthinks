function consideredSameDate(first, second) {
  var EARLIEST_HOUR = 6;
  first.setHours(first.getHours() - EARLIEST_HOUR);
  second.setHours(second.getHours() - EARLIEST_HOUR);
  return (first.toDateString() === second.toDateString())
}

function getState(callback) {
  chrome.storage.sync.get({lastDate: null, websites: []}, function(result) {
    var state = {};
    var today = new Date();
    if (result.lastDate == null) {
      state["submitted"] = false;
    } else {
      var lastDate = new Date(result.lastDate);
      state["submitted"] = consideredSameDate(today, lastDate);
    }
    state["websites"] = result.websites;
    callback(state);
  });
}
