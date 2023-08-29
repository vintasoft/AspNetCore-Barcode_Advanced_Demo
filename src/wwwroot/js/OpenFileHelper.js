/**
 A helper that helps to open file.
*/
OpenFileHelperJS = function (docViewer, showErrorMessageFunc) {

    var _fileId;



    // === Open default image file ===

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



    // === Open image file ===

    /**
     Opens an image file in image viewer.
    */
    OpenFileHelperJS.prototype.openImageFile = function (fileId) {

        var that = this;


        /**
         Request for file authentication is executed successfully.
         @param {object} data Information about copied file.
        */
        function __authenticateFile_success(data) {
            // get image viewer
            var imageViewer = docViewer.get_ImageViewer();

            // open file from session folder and add images from file to the image viewer
            imageViewer.get_Images().openFile(data.fileId);
        }

        /**
         Request for file authentication is failed.
         @param {object} data Information about error.
        */
        function __authenticateFile_error(data) {
            that.showPasswordDialog(fileId);
        }


        docViewer.authenticateFile(fileId, "", __authenticateFile_success, __authenticateFile_error);
    }



    // === Open image file (password dialog) ===

    /**
     Creates a modal dialog for entering the password and shows the dialog.
    */
    OpenFileHelperJS.prototype.showPasswordDialog = function (fileId) {
        // create password dialog
        var passwordDialog = new Vintasoft.Imaging.DocumentViewer.Dialogs.WebUiDocumentPasswordDialogJS(fileId);
        // subscribe to the authenticationSucceeded of password dialog
        Vintasoft.Shared.subscribeToEvent(passwordDialog, "authenticationSucceeded", __passwordDialog_authenticationSucceeded);

        // add password dialog to the document viewer
        docViewer.get_Items().addItem(passwordDialog);

        // show password dialog
        passwordDialog.show();
    }

    /**
     File is authenticated successfully using password dialog.
    */
    function __passwordDialog_authenticationSucceeded(event, data) {
        // destroy password dialog
        __destroyPasswordDialog(this);

        // open image file in viewer
        docViewer.openFile(new Vintasoft.Shared.WebFileInfoJS(data.fileId, data.filePassword));
    }

    /**
     Destroys password dialog.
    */
    function __destroyPasswordDialog(passwordDialog) {
        // remove password dialog from the document viewer
        docViewer.get_Items().removeItem(passwordDialog);
    }

}
