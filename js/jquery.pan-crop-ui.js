(function($) {
    var counter = 0;
    var allSettings = {};

    /**
     * Options
     *
     * $previewBox          : jQuery wrapped node [REQUIRED]; Box in which cropper UI will be created
     *
     * width                : integer             [OPTIONAL]; If provided, images will be cropped to this width.
     *                                                        If not, width will be inherited from $previewBox element.
     *
     * height               : integer             [OPTIONAL]; If provided, images will be cropped to this height.
     *                                                        If not, height will be inherited from $previewBox element.
     *
     * mousewheelScale      : boolean             [OPTIONAL]; Defaults to true; If enabled, mouse wheel can be used to
     *                                                        scale image.
     *
     * mousewheelSensitivity: float               [OPTIONAL]; Defaults to .05; Defines how much image scale will be changed
     *                                                        when mousewheel event occurs. 
     *
     * submitCropData       : string|false        [OPTIONAL]; Defaults to false. If a string is provided, cropper will add
     *                                                        a hidden input field named after that string on form submit.
     *                                                        Field will contain a json object containing data to handle serverside
     *                                                        croping:
     *                                                        {
     *                                                            s : float   (scale)
     *                                                            w : integer (width (if croping after scale))
     *                                                            h : integer (height (if croping after scale))
     *                                                            sw: integer (width (if croping before scale))
     *                                                            sh: integer (height (if croping before scale))
     *                                                            x : integer (x coordinate of top left corner (if croping after scale))
     *                                                            y : integer (y coordinate of top left corner (if croping after scale))
     *                                                            sx: integer (x coordinate of top left corner (if croping before scale))
     *                                                            sy: integer (y coordinate of top left corner (if croping before scale))
     *                                                        }
     */
    $.fn.panCropUi = function(method) {
        var methods = {
            init : function(options) {
                this.panCropUi.settings = $.extend({}, this.panCropUi.defaults, options);
                return this.each(function() {
                    var id = counter;
                    var $input = $(this),
                        settings = allSettings[id] = $.extend({}, $input.panCropUi.settings);

                    if (!settings.$previewBox) {
                        $.error('$previewBox setting must be provided!');
                    }
                    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                        alert('The File APIs are not fully supported in this browser!');
                    }
                    var $previewBox = settings.$previewBox;

                    $input.change(function (e) {
                        var file = e.target.files[0];

                        var fileReader = new FileReader();
                        fileReader.onload = function (e) {
                            var imgElement = document.createElement('img');
                            imgElement.src = e.target.result;

                            $previewBox.empty().append(imgElement);

                            var $image = allSettings[id].$image = $(imgElement);
                            $image.panCrop({
                                width: settings.width || $previewBox.width(),
                                height: settings.height || $previewBox.height(),
                                onLoad: function () {
                                    if (settings.mousewheelScale) {
                                        var scale = $image.panCrop('getCropData').s;
                                        var scrollHandler = function (e) {
                                            e.preventDefault();
                                            var delta = settings.mousewheelSensitivity * ((e.wheelDelta || -e.detail) > 0 ? 1 : -1);
                                            $image.panCrop('scale', $image.panCrop('getCropData').s + delta);
                                        };
                                        $image[0].addEventListener('mousewheel', scrollHandler, false);
                                        $image[0].addEventListener('DOMMouseScroll', scrollHandler, false);
                                    }
                                }
                            });

                            if (settings.submitCropData) {
                                var $form = $input.closest('form');
                                $form.off('submit.pancrop');
                                $form.on('submit.pancrop', function (e) {
                                    for (var id in allSettings) {
                                        $form.append(
                                            '<input name="' 
                                            + allSettings[id].submitCropData 
                                            + '" type="hidden" value=\'' 
                                            + JSON.stringify(allSettings[id].$image.panCrop('getCropData')) 
                                            + '\'>'
                                        );
                                    }
                                });
                            }
                        };

                        fileReader.readAsDataURL(file);
                    });

                    counter++;
                });
            }
        };

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method "' +  method + '" does not exist in panCropUi plugin!');
        }

    };

    $.fn.panCropUi.defaults = {
        mousewheelScale      : true,
        mousewheelSensitivity: .05
    };

    $.fn.panCropUi.settings = {};

})(jQuery);