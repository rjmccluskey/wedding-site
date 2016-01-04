$(function(){
    if ($('.slideshow img')) {

        $('.slideshow img').load(positionContentAfterSlideshow);
        $(window).resize(positionContentAfterSlideshow);

        function positionContentAfterSlideshow() {
            var slideshowHeight = $('.slideshow img').outerHeight(true);
            var $afterSlideshow = $('.after-slideshow');

            $afterSlideshow.css('margin-top', slideshowHeight + 10);
        }

    }

    if ($('#menu')) {
        var interval;
        var $menu = $('#menu');
        $('.scroll-arrow-left').on('mousedown touchstart', function() {
            interval = setInterval(function() {
                $menu.scrollLeft( $menu.scrollLeft() - 4);
            }, 20);
        });
        $('.scroll-arrow-right').on('mousedown touchstart', function() {
            interval = setInterval(function() {
                $menu.scrollLeft( $menu.scrollLeft() + 4);
            }, 20);
        });
        $('.scroll-arrow-left,.scroll-arrow-right').on('mouseup mouseleave touchend', function(){
            clearInterval(interval);
        });

        var $activeMenuItem = $('.pure-menu-link.active');
        var $allMenuItems = $('.pure-menu-link');
        var leftPosition = 0;
        $allMenuItems.each(function() {
            if ($(this).text() === $activeMenuItem.text()) {
                return false;
            }
            leftPosition += $(this).outerWidth();
        });
        $menu.scrollLeft(leftPosition);
    }
});
