(function($) {

    $.fn.panCrop = function(method) {

        var methods = {
            init : function(options) {
                this.panCrop.settings = $.extend({}, this.panCrop.defaults, options);
                return this.each(function() {
                    var $element = $(this),
                        settings = $element.panCrop.settings;
                    
                    var $wrapper = $('<div/>')
                        .css({
                            width: settings.width,
                            height: settings.height,
                            overflow: 'hidden'
                        });
                    $element.panCrop.$wrapper = $wrapper;

                    $element.panCrop.cssBackup = {};
                    $element.panCrop.cssBackup.position = $element[0].style.position;
                    $element.panCrop.cssBackup.top      = $element[0].style.top;
                    $element.panCrop.cssBackup.left     = $element[0].style.left;
                    $element.css({
                        position: 'relative',
                        top: 0,
                        left: 0
                    });

                    var dragging = false;
                    var startX   = 0;
                    var startY   = 0;

                    $element.off('mousedown.pancrop');
                    $element.on('mousedown.pancrop', function (e) {
                        e.preventDefault();

                        dragging = true;
                        startX = e.pageX;
                        startY = e.pageY;
                    });

                    $(document).off('mouseup.pancrop');
                    $(document).on('mouseup.pancrop', function () {
                        dragging = false;
                    });

                    $element.on('mousemove.pancrop', function (e) {
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

                            var cropValues = {
                                x1: - left,
                                y1: - top,
                                x2: - left + settings.width,
                                y2: - top + settings.height,
                                w: settings.width,
                                h: settings.height
                            };
                            var originalImageSize = getOriginalImageSize($element[0].src);
                            var xMod = originalImageSize.w / $element.width();
                            var yMod = originalImageSize.h / $element.height();

                            cropValues.x1 = cropValues.x1 * xMod;
                            cropValues.x2 = cropValues.x2 * xMod;
                            cropValues.w  = cropValues.w  * xMod;
                            cropValues.y1 = cropValues.y1 * yMod;
                            cropValues.y2 = cropValues.y2 * yMod;
                            cropValues.h  = cropValues.h  * yMod;

                            $element.panCrop.crop = cropValues;
                        }
                    });

                    $element.wrap($wrapper);
                });
            },

            destroy : function () {
                var $element = $(this);

                if ($element.panCrop.$wrapper) {
                    for (var prop in $element.panCrop.cssBackup) {
                        $element[0].style[prop] = $element.panCrop.cssBackup[prop];
                    }
                    $element.panCrop = null;
                    $element.unwrap();
                    $element.unbind('mousemove.pancrop mouseup.pancrop mousedown.pancrop');
                }
            }
        };

        var limitValue = function (value, min, max) {
            value = Math.min(max, value);
            value = Math.max(min, value);

            return value;
        };

        var getOriginalImageSize = function (src) {
            var img = new Image();
            img.src = src;

            return {
                w: img.width,
                h: img.height
            };
        };

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method "' +  method + '" does not exist in panCrop plugin!');
        }

    };

    $.fn.panCrop.defaults = {};

    $.fn.panCrop.settings = {};

})(jQuery);