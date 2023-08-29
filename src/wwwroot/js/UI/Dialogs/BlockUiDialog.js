/**
 A dialog that allows to block UI.
*/
BlockUiDialogJS = function (message) {

    // set message in dialog
    $("#blockUiDialogText").html(message);
    // show dialog
    $('#blockUiDialog').modal('show');


    BlockUiDialogJS.prototype.close = function () {
        // hide dialog
        $('#blockUiDialog').modal('hide');
    }

}
