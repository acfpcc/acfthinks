function startCompletedTransition() {
  $("#thought-bar").animate({opacity:0}, function() {
    $("#thought-prompt span.gradient").stop().animate({
      opacity: 0
    }, 500, function() {
      getMessage("submitted", function(message) {
        $("#thought-prompt span.gradient").text(message)
        .animate({
          opacity: 1
        }, 2000, function() {
          location.reload();
        });
      });
    });
  });
}

function getToggleContent(width, height) {
  var imgUrl = chrome.extension.getURL("assets/images/paul.png");
  var container = $("<div>");
  container.css({
    display: "inline-block",
    verticalAlign: "top",
    width: width,
    height: height,
  });
  var image = $("<img>");
  image.css({
    maxHeight: "100%",
    maxWidth: "100%",
  });
  image.attr("src", imgUrl);
  container.append(image);
  return container;
}

var templateUrl = chrome.extension.getURL("templates/prompt.html");
$.get(templateUrl, {}, function(template) {
  var render = _.template(template);
  var data = {};
  $('body').attr('id', 'acfthinks-body').html(render(data));

  $('.hi').click(function(e) {
    e.preventDefault();
    if ($(this).data("toggleContent") === undefined) {
      $(this).data("toggleContent", 
          getToggleContent($(this).width(), $(this).height()));
    }
    var newToggleContent = $(this).html();
    $(this).html($(this).data("toggleContent"));
    $(this).data("toggleContent", newToggleContent);
  });

  getLatestMessage(function(message) {
    $('#latest-message').append("<p>"+str2Html(message.body)+"</p>");

    $("#thought-bar").keypress(function (e) {
      var key = e.which;
      if (key == 13 && !e.shiftKey) {
        e.preventDefault();
        $(this).attr('readonly', true).addClass("submitted");
        var thought = $(this)[0].value;
        saveThought(thought, message.url);
        startCompletedTransition();
      }
    });

    $(document)
    .one('focus.textarea', '#thought-bar', function(){
      var savedValue = this.value;
      this.value = '';
      this.baseScrollHeight = this.scrollHeight;
      this.value = savedValue;
    })
    .on('input.textarea', '#thought-bar', function(){
      var minRows = this.getAttribute('data-min-rows')|0;
      var maxRows = this.getAttribute('data-max-rows');
      if (maxRows == null) {
        maxRows = 99999;
      }
      var rows;
      this.rows = minRows;
      rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 50);
      this.rows = Math.min(minRows + rows, maxRows);
    });

  });

  lastDateListener(function(after, before) {
    thoughtSubmittedToday(function(submitted) {
      if (submitted) {
        startCompletedTransition();
      }
    });
  });
});