
var sidebarToggle = false;

$('body').on('click', '.easy-sidebar-toggle', function(e) {
    e.preventDefault();
    var self = this;
  	
    if(sidebarToggle){
    	sidebarToggle = false;
	    $(self).removeClass("active");
		$('html').removeClass('easy-sidebar-active');
		$('#mContainer').removeClass('toggled');
		$('.navbar.easy-sidebar').removeClass('toggled');
		$('.overlayNav').hide();
    }
    else{
    	sidebarToggle = true;
    	$(self).addClass("active");
    	$('html').addClass('easy-sidebar-active');
		$('#mContainer').addClass('toggled');
		$('.navbar.easy-sidebar').addClass('toggled');
		$('.overlayNav').show();
    }
});



$(document).on('swiperight swipeleft', function(e){
    if(e.type == 'swipeleft')
        sidebarToggle = true;
    else
        sidebarToggle = false;
    console.log(e.type)
  $('.easy-sidebar-toggle').trigger('click');
});

$('body').on('click', '.overlayNav, .easy-sidebar li', function(e) {
    console.log('herer')
    sidebarToggle = true;
    $('.easy-sidebar-toggle').trigger('click');
});



$('#cp1').colorpicker().on('changeColor', function(e) {
    less.modifyVars({ '@color1' : e.color.toHex()});
});


var mywindow = $(window);
var mypos = mywindow.scrollTop();
var up = false;
var newscroll;
var sticky = $('.sticky');

mywindow.scroll(function () {
    if(sidebarToggle==false){
        newscroll = mywindow.scrollTop();
        if (newscroll > mypos && !up) {
            sticky.hide();
            setTimeout(function(){
                sticky.fadeIn(300);
            },600)
            sticky.addClass('fixed');
            up = !up;
        } else if(newscroll < mypos && up) {
            sticky.removeClass('fixed');
            up = !up;
        }
        mypos = newscroll;
    }
});

if ($('#back-to-top').length) {
	var scrollTrigger = 100;
    var  backToTop = function () {
        if (mypos > scrollTrigger) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    };
    backToTop();
    $(window).on('scroll', function () {
        backToTop();
    });
    $('#back-to-top').on('click', function (e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: 0
        }, 700);
    });
}



