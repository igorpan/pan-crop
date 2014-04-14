(function($) {

    $.fn.panCrop = function(method) {

        var methods = {
            init : function(options) {
                this.panCrop.settings = $.extend({}, this.panCrop.defaults, options);
                return this.each(function() {
                    var $element = $(this),
                        element  = this,
                        settings = $element.panCrop.settings;
                    
                    var $wrapper = $('<div/>')
                        .css({
                            width: settings.width,
                            height: settings.height,
                            overflow: 'hidden'
                        });
                    $element.css({
                        position: 'relative',
                        top: 0,
                        left: 0
                    });

                    var dragging = false;
                    var startX   = 0;
                    var startY   = 0;
                    $element.mousedown(function (e) {
                        e.preventDefault();

                        dragging = true;
                        startX = e.pageX;
                        startY = e.pageY;
                    });

                    $(document).on('mouseup', function () {
                        dragging = false;
                    });

                    $element.mousemove(function (e) {
                        if (dragging) {
                            var deltaX = e.pageX - startX;
                            var deltaY = e.pageY - startY;
                            startX = e.pageX;
                            startY = e.pageY;
                            
                            var currentLeft = parseInt($element.css('left'));
                            var currentTop = parseInt($element.css('top'));

                            var left = limitValue(currentLeft + deltaX, settings.width - $element.width(), 0);
                            var top = limitValue(currentTop + deltaY, settings.height - $element.height(), 0);

                            $element.css({
                                left: left,
                                top: top
                            });
                        }
                    });

                    $element.wrap($wrapper);
                });
            }
        };

        var limitValue = function (value, min, max) {
            value = Math.min(max, value);
            value = Math.max(min, value);

            return value;
        };

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method "' +  method + '" does not exist in panCrop plugin!');
        }

    }

    $.fn.panCrop.defaults = {};

    $.fn.panCrop.settings = {};

})(jQuery);