$(function(){
    $('.slideshow img').load(positionContentAfterSlideshow);
    $(window).resize(positionContentAfterSlideshow);

    function positionContentAfterSlideshow() {
        var slideshowHeight = $('.slideshow img').outerHeight(true);
        var $afterSlideshow = $('.after-slideshow');

        $afterSlideshow.css('margin-top', slideshowHeight);
    }
});
