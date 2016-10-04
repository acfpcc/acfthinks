(function($){

  $.extend({
    playSound: function(){
      var sound = $(
        '<audio autoplay="autoplay" style="display:none;">'
          + '<source src="' + arguments[0] + '.mp3" />'
          + '<source src="' + arguments[0] + '.ogg" />'
          + '<embed src="' + arguments[0] + '.mp3" hidden="true" autostart="true" loop="false" class="playSound" />'
        + '</audio>'
      ).appendTo('body');
      sound.on('ended', function() {
        sound.remove();
      });
      return sound;
    }
  });

})(jQuery);