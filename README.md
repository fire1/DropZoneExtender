# About Dropzone
Dropzone JS is an open source library that provides drag’n’drop file uploads with image previews.
source: http://www.dropzonejs.com/

# DropZoneExtender 
This project wraps Dropzone configuration to be more easy and quick creation of user-upload interface.

Example:

        dzex("#images-upload", { // Upload form
            paramName: 'FileUpload', // Option from Dropzone
            sizePixel: 202800, // Minimum pixels of accepted images
            sizeError: "Image is to small  ", // Message for small images
            // Dropzone Extended option to make selection of main image in upload list 
            coverConfirm: "You want to make image main? \n", 
            coverTarget: "#item-preview",
            coverViewer: "#cover-preview",
            imagesInput: "#item-pictures"
        });
