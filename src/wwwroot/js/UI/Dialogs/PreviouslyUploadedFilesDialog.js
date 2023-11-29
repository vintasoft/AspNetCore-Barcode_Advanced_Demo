/**
 A dialog that allows to show a list of previously uploaded files and select previously uploaded file.
*/
PreviouslyUploadedFilesDialogJS = function (fileService, docViewer, openFileHelper, showErrorMessage) {

    PreviouslyUploadedFilesDialogJS.prototype.show = function () {
        // create a request for getting information about previously uploaded files
        var request = new Vintasoft.Shared.WebRequestJS("GetUploadedFilesUrl", __showUploadedFilesList, null, { type: 'POST' });
        // send the request
        fileService.sendRequest(request);
    }

    PreviouslyUploadedFilesDialogJS.okButton_clicked = function () {
        // get selected input field
        var selectedInput = document.querySelector('input[name=fileList]:checked');
        // if selected input field exists
        if (selectedInput != null) {
            // get file identifier from input field
            var fileId = selectedInput.value;
            // if file identifier exists
            if (fileId != null && fileId != '') {
                try {
                    // open file with authentication
                    docViewer.openFileWithAuthentication(fileId);
                }
                catch (ex) {
                    showErrorMessage(ex.message);
                }
            }
        }

        // close the dialog
        $('#previouslyUploadedFilesDialog').modal('hide');
    }

    PreviouslyUploadedFilesDialogJS.cancelButton_clicked = function () {
        // close the dialog
        $('#previouslyUploadedFilesDialog').modal('hide');
    }

    /**
     Creates a modal dialog with list of uploaded files and shows the dialog.
     @param {object} data Information about uploaded files.
    */
    function __showUploadedFilesList(data) {
        var files = data.files;

        // the dialog items
        var htmlMarkup = "";
        // if there is NO previously uploaded files
        if (files.length === 0) {
            // add label with text "No uploaded files." to the dialog items
            htmlMarkup = htmlMarkup + '<label>No uploaded files.</label><br />';
        }   
        // if there is previously uploaded files
        else {
            // for each previously uploaded file
            for (var i = 0; i < files.length; i++) {
                // add label with file information to the dialog items
                htmlMarkup = htmlMarkup + '<input id="uploadedFileList_item' + i.toString() + '" type="radio" value="' + files[i] + '" name="fileList"> <label for="' + i.toString() + '">' + files[i] + '</label><br />';
            }
        }

        // set HTML markup for file list in dialog
        $("#previouslyUploadedFilesDialogFileList").html(htmlMarkup);

        // show the dialog
        $('#previouslyUploadedFilesDialog').modal('show');
    }

}
