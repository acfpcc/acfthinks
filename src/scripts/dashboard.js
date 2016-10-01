function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function addThoughtItem(thought, render) {
  var data = {
    date: new Date(thought.date), 
    thought: str2Html(thought.thought),
    id: thought.id,
    messageUrl: thought.messageUrl,
    canEdit: consideredSameDate(new Date(), new Date(thought.date))
  };
  $('.thoughts').append(render(data)); 
  $("#thought-item-"+thought.id+" .delete").click(function() {
    deleteThought($(this).data("thoughtId"));
  });
  $("#thought-item-"+thought.id+" .edit").click(function() {
    var isEdit = $(this).data("isEdit");
    var thoughtBox = $("#thought-item-"+thought.id+" .thought");
    if (isEdit) {
      saveThought(thought.id, thoughtBox.text());
      thoughtBox.attr("contenteditable", false)
                .removeClass("editable");
      $(this).text("edit");
    } else {
      thoughtBox.attr("contenteditable", true)
                .addClass("editable")
      placeCaretAtEnd(thoughtBox.get(0));
      $(this).text("done");
    }
    $(this).data("isEdit", !isEdit);
  });
}

$(function() {
  var templateUrl = chrome.extension.getURL("templates/dashboard.html");
  $.get(templateUrl, {}, function(template) {
    var render = _.template(template);
    var data = {};
    $('body').attr('id', 'acfthinks-body').html(render(data));

    $("#wipe-all.clear-all").click(function() {
      if (window.confirm("Are you sure?")) {
        wipeStorage();
      }
    });

    getAllThoughts(function(thoughts) { 
      var templateUrl = chrome.extension.getURL("templates/thoughts-item.html");
      $.get(templateUrl, {}, function(template) {
        var render = _.template(template);
        var sortedThoughts = _.sortBy(_.values(thoughts), 'date').reverse(); 
        $.each(sortedThoughts, function(index, thought) {
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