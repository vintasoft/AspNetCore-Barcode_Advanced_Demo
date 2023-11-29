/**
 A helper that helps to open file.
*/
OpenFileHelperJS = function (docViewer, showErrorMessageFunc) {

    var _fileId;


    /**
     Opens the default image file in image viewer.
     @param {string} fileId The identifier of default image file.
    */
    OpenFileHelperJS.prototype.openDefaultImageFile = function (fileId) {
        if (fileId == null || fileId === "")
            throw new Error("The identifier of default image file cannot be null or empty.");

        _fileId = fileId;

        // get image viewer
        var imageViewer = docViewer.get_ImageViewer();
        // try to open file from session folder and add images from file to the image viewer
        imageViewer.get_Images().openFile(_fileId, __openFile_success, __openFile_error);
    }

    /**
     Request for opening the file is executed successfully.
     @param {object} data Information about opened file.
    */
    function __openFile_success(data) {
    }

    /**
     Request for opening the file is failed.
     @param {object} data Information about error.
    */
    function __openFile_error(data) {
        // copy the file from global folder to the session folder
        Vintasoft.Imaging.VintasoftFileAPI.copyFile("UploadedImageFiles/" + _fileId, __onCopyFile_success, __onCopyFile_error);
    }

    /**
     Request for copying of file is executed successfully.
     @param {object} data Information about copied file.
    */
    function __onCopyFile_success(data) {
        // get image viewer
        var imageViewer = docViewer.get_ImageViewer();

        // open file from session folder and add images from file to the image viewer
        imageViewer.get_Images().openFile(data.fileId);
    }

    /**
     Request for copying of file is failed.
     @param {object} data Information about error.
    */
    function __onCopyFile_error(data) {
        showErrorMessageFunc(data);
    }

}
