function getState(callback) {
  chrome.storage.sync.get({lastDate: null}, function(result) {
    var state = {};
    var today = new Date();
    if (result.lastDate == null) {
      state["submitted"] = false;
    } else {
      var EARLIEST_HOUR = 6
      var lastDate = new Date(result.lastDate);
      today.setHours(today.getHours() - EARLIEST_HOUR);
      lastDate.setHours(lastDate.getHours() - EARLIEST_HOUR);
      state["submitted"] = (lastDate.toDateString() === today.toDateString())
    }
    callback(state);
  });
}
