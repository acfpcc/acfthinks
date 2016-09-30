$(function() {
  var templateUrl = chrome.extension.getURL("templates/help.html");
  $.get(templateUrl, {}, function(template) {
    var render = _.template(template);
    var data = {};
    $('body').attr('id', 'acfthinks-body').html(render(data));
  });
});