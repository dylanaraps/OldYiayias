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
        $(".navbar-default").addClass("navbar-color-scroll");
        $(".navbar-default").addClass("navbar-margin-scroll");
        $(".yiayias-network").addClass("yiayias-network-scroll");
    } 
    else {
        $(".navbar-default").removeClass("navbar-color-scroll");
        $(".navbar-default").removeClass("navbar-margin-scroll");
        $(".yiayias-network").removeClass("yiayias-network-scroll");
    }
});

jQuery(document).ready(function($){
window.sr = new scrollReveal({ mobile: false })
scrollReveal.init();
});
