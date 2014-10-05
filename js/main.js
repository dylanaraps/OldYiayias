jQuery(document).ready(function($){
$('a[href^="#"]').on('click', function(event) {

    var target = $( $(this).attr('href') );

    if( target.length ) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: target.offset().top
        }, 1000);
    }
});
});

$(window).scroll(function() {    
    var scroll = $(window).scrollTop();

    if (scroll >= 10) {
        $(".navbar-default").addClass("navbar-bg");
    } else {
        $(".navbar-default").removeClass("navbar-bg");
    }
});

jQuery(document).ready(function($){
window.sr = new scrollReveal({ mobile: false })
scrollReveal.init();
});

jQuery(document).ready(function($){
$('.dropdown-toggle').click(function(e) {
  e.preventDefault();
  setTimeout($.proxy(function() {
    if ('ontouchstart' in document.documentElement) {
      $(this).siblings('.dropdown-backdrop').off().remove();
    }
  }, this), 0);
});
});