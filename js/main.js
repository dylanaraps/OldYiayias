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
$('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { e.stopPropagation(); });
});