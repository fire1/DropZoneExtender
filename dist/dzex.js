/**
 * DropZone Extender
 * @param dropZoneForm
 * @param options
 * @param dropZoneAdditional
 */

var dzex = function (dropZoneForm, options, dropZoneAdditional) {

    if (typeof window.jQuery == 'undefined') {
        console.error('jQuery is required for DropZoneExtender! ');
    }

    var defaults = {
        paramName: 'FileUpload',
        sizePixel: 202800, // 800x600 480000 , 600x338 202800
        sizeError: " Given image is too small! \n  ",
        coverConfirm: "You want to set this image as main? \n",
        coverTarget: "#item-preview",
        coverViewer: "#cover-preview",
        imagesInput: "#item-pictures"

    }, settings = $.extend({}, defaults, options);

    /**
     * Trigger on Upload add file to $inputContainerImages
     * @param file
     * @param response
     */
    function onUploadFile(file, response) {
        $(file.previewElement).data('cover', response);
        var newVal = response.done;
        var oldValue = $inputContainerImages.val();
        var trimmed = oldValue.replace(/(^\s*,)|(,\s*$)/g, '');
        $inputContainerImages.val(trimmed + "," + newVal);
    }

    /**
     * Trigger on Remove file ti input
     * @param file
     */
    function onRemoveFile(file) {
        var all_img = $inputContainerImages.val();
        // Create regex
        var regex = new RegExp(file.name, 'g');
        // Clear removed from image container
        $inputContainerImages.val(all_img.replace(regex, '').replace(/(^\s*,)|(,\s*$)/g, ''));
    }

    /**
     * Sets Image preview cover
     * @param image
     */
    function addCover(image) {
        $coverContainerImage.val(image);
        $coverImagesPreviewer.fadeOut(300, function () {
            $coverImagesPreviewer.attr('src', $view + image).fadeIn(300);
        });
    }



    /**
     * Reads file and returns information
     * @param file Path to file
     * @returns {{width: string, height: string, type: string, name: string, size: string, format: string}}
     */
    function getImnageData(file) {

        var reader = new FileReader(), image = new Image(), data = {width: '', height: '', type: '', name: '', size: '', format: ''};

        reader.readAsDataURL(file);
        reader.onload = function (_file) {
            image.src = _file.target.result;    // url.createObjectURL(file);
            image.onload = function () {
                data.width = this.width;
                data.height = this.height;
                data.type = file.type;          // ext only: // file.type.split('/')[1],
                data.name = file.name;
                data.size = ~~(file.size / 1024) + 'KB';
                data.format = (this.width >= this.height) ? 'landscapes' : 'portrait';
            };
            image.onerror = function () {
                console.error('Invalid file type: ' + file.type);
            };
        };
        return data;
    }

    /**
     *
     * @param _t
     * @param value
     * @returns {{name: *, size: *}}
     */
    function fileAttach(_t, value) {

        var mockFile = {
            name: value.name,
            size: value.size,
            type: 'image/jpeg',
            status: Dropzone.ADDED,
            url: $view + value.name
        };
        _t.options.addedfile.call(_t, mockFile);
        _t.options.thumbnail.call(_t, mockFile, $view + value.name);
        _t.options.complete.call(_t, mockFile);
        $(mockFile.previewElement).data('cover', {done: value.name});
        return mockFile;
    }

    /**
     * Limit sizes in drop zone
     * @param file
     * @param done
     */
    function dropZoneSizeLimiter(file, done) {
        var pixels = 0;
        var reader = new FileReader();
        reader.onload = (function (file) {
            var image = new Image();
            image.src = file.target.result;
            image.onload = function () {
                pixels = this.width * this.height;

                if (pixels < settings.sizePixel) {
                    done(settings.sizeError);
                }
                done();
            };
        });

        reader.readAsDataURL(file);
    }

    /**
     *  DropZone button preview
     * @param file
     */
    var btnPreview = function (file) {
        var btn = Dropzone.createElement(
            "<a class=\"dz-add-preview dz-plugin\"><i class=\"fa fa-newspaper-o\"></i></a>"
        );

        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            //console.log(file.previewElement, _this);
            var response = $(file.previewElement).data('cover');
            var ok = window.confirm(settings.coverConfirm);
            if (ok == true) {
                addCover(response.done);
            }
        });
        return btn;
    };


    /**
     * DropZone remove button
     * @param file
     * @param _this
     */
    var btnRemove = function (file, _this) {

        var btn = Dropzone.createElement(
            "<a class=\"dz-remove dz-plugin\"><i class=\"fa fa-remove\"></i></a>"
        );
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this.emit("removedfile", file);
        });
        return btn;
    };
//
// DropZone
// -----------------------------------------------------------------------------
    if (Dropzone) {
        Dropzone.autoDiscover = false;

        var $inputContainerImages = $(settings.imagesInput);
        var $coverContainerImage = $(settings.coverTarget);
        var $coverImagesPreviewer = $(settings.coverViewer);
        var $view = $(dropZoneForm).data('view');

        var dropZoneOptions = {
            paramName: settings.paramName,
            maxFilesize: 8, // MB
            maxFiles: 20,
            loadOldImages: true,
            acceptedFiles: "image/*",
            parallelUploads: 100,
            uploadMultiple: false,
            autoProcessQueue: true,
            accept: function (file, done) {
                return dropZoneSizeLimiter(file, done)
            },
            init: function (file) {
                var _t = this;
                //
                // Add uploaded files / Path to upload with ID:Item
                $.get($(dropZoneForm).data('upload'), function (data) {
                    $.each(data, function (key, value) {
                        var file = fileAttach(_t, value);
                        // Button adding
                        file.previewElement.appendChild(btnPreview(file));
                        file.previewElement.appendChild(btnRemove(file, _t));
                    });
                });
                //
                // On success add values to input
                this.on("success", function (file, responce) {
                    return onUploadFile(file, responce);
                });
                //
                // On added file add remove button
                this.on("addedfile", function (file) {
                    console.log(this);
                    //
                    // Add the button to the file preview element.
                    file.previewElement.appendChild(btnPreview(file, this));
                    file.previewElement.appendChild(btnRemove(file, this));
                });
                //
                // On remove remove values from input
                this.on("removedfile", function (file) {
                    return onRemoveFile(file)
                });
            }
        };

        dropZone = new Dropzone(dropZoneForm, $.extend({}, dropZoneOptions, dropZoneAdditional));
        if (typeof DropZoneUploaded == 'function') {
            Dropzone.options.dropZone = DropZoneUploaded();
        }

    }


}, dropZone;



