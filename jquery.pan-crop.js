(function($) {

    var limitValue = function (value, min, max) {
        value = Math.min(max, value);
        value = Math.max(min, value);

        return value;
    };

    $.fn.panCrop = function(method) {

        var methods = {
            init : function(options) {
                this.panCrop.settings = $.extend({}, this.panCrop.defaults, options);
                return this.each(function() {
                    var $element = $(this),
                        settings = $element.panCrop.settings;

                    loadOriginalImageSize($element[0].src, function (originalImageSize) {
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

                        $element.panCrop.crop = {
                            x1: 0,
                            y1: 0,
                            w: settings.width,
                            h: settings.height,
                            s: Math.max(Math.max(1, settings.width / originalImageSize.w), settings.height / originalImageSize.h),
                            originalSize: originalImageSize
                        };
                        syncViewToState($element, $element.panCrop.crop);

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
                                var cropValues = $element.panCrop.crop;

                                var left = limitValue(- cropValues.x1 + deltaX, settings.width - $element.width(), 0);
                                var top = limitValue(- cropValues.y1 + deltaY, settings.height - $element.height(), 0);
                                
                                cropValues.x1 = - left;
                                cropValues.y1 = - top;

                                syncViewToState($element, cropValues);
                            }
                        });

                        $element.wrap($wrapper);

                        if (settings.onLoad) {
                            settings.onLoad();
                        }
                    });
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
            },

            scale : function (scale) {
                var $element = $(this);
                var settings = $element.panCrop.settings;
                var cropValues = $element.panCrop.crop;
                var originalSize = $element.panCrop.crop.originalSize;

                var oldWidth  = $element.width();
                var oldHeight = $element.height();

                cropValues.s = limitValue(scale, settings.width / originalSize.w, Math.max(1, settings.width / originalSize.w));
                syncViewToState($element, cropValues);

                var widthRatio  = $element.width() / oldWidth;
                var heightRatio = $element.height() / oldHeight;

                var newX1 = (cropValues.x1 + settings.width / 2) * widthRatio - settings.width / 2;
                var newY1 = (cropValues.y1 + settings.height / 2) * heightRatio - settings.height / 2;

                cropValues.x1 = limitValue(newX1, 0, $element.width() - settings.width);
                cropValues.y1 = limitValue(newY1, 0, $element.height() - settings.height);
                syncViewToState($element, cropValues);

                return cropValues.s;
            }
        };

        var syncViewToState = function ($element, stateObj) {
            var originalSize = $element.panCrop.crop.originalSize;
            $element.width(originalSize.w * stateObj.s);
            $element.height(originalSize.h * stateObj.s);
            $element.css({
                left: - stateObj.x1,
                top: - stateObj.y1
            });
        };

        var loadOriginalImageSize = function (src, callback) {
            var img = new Image();
            img.onload = function () {
                callback({
                    w: img.width,
                    h: img.height
                });
            };
            img.src = src;
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