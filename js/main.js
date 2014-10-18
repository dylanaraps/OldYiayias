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
        $(".navbar-default").addClass("navbar-networkpad-scroll");
        $(".yiayias-network-kek").addClass("yiayias-network-kek-scroll");
    } else {
        $(".navbar-default").removeClass("navbar-bg");
        $(".navbar-default").removeClass("navbar-networkpad-scroll");
        $(".yiayias-network-kek").removeClass("yiayias-network-kek-scroll");
    }
});

jQuery(document).ready(function($){
window.sr = new scrollReveal({ mobile: false })
scrollReveal.init();
});

jQuery(document).ready(function() {
    jQuery("img.lazy").Lazy();
});