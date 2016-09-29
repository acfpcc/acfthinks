function addThoughtItem(thought, render) {
  var data = {
    date: new Date(thought.date), 
    thought: str2Html(thought.thought),
    id: thought.id,
    messageUrl: thought.messageUrl
  };
  $('.thoughts').append(render(data)); 
  $("#thought-item-"+thought.id+" .delete").click(function() {
    deleteThought($(this).data("thoughtId"));
  });
}

$(function() {
  var templateUrl = chrome.extension.getURL("templates/dashboard.html");
  $.get(templateUrl, {}, function(template) {
    var render = _.template(template);
    var data = {};
    $('body').attr('id', 'acfthinks-body').html(render(data));

    $("#wipe-all.delete").click(function() {
      wipeStorage();
    });

    getAllThoughts(function(thoughts) { 
      var templateUrl = chrome.extension.getURL("templates/thoughts-item.html");
      $.get(templateUrl, {}, function(template) {
        var render = _.template(template);
        $.each(thoughts, function(id, thought) {
          addThoughtItem(thought, render);
        });

        thoughtsListener(function(added, removed) {
          _.map(added, function(thought) {
            addThoughtItem(thought, render);
          });
          _.map(removed, function(thought) {
            $('#thought-item-'+thought.id).remove();
          });
        });
      });
    });
  });
});