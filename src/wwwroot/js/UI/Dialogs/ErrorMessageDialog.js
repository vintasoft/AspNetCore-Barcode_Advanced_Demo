/**
 A dialog that allows to show error message.
*/
ErrorMessageDialogJS = function (errorData) {

    var errorMessage = "";
    var additionalErrorInfo = null;
    if (typeof errorData == "string") {
        errorMessage = errorData;
    }
    else if (typeof errorData == "object") {
        var errors = errorData.errors;
        if (errors != undefined) {
            var errors = errors[''];
            if (errors != null) {
                for (var i = 0; i < errors.length; i++) {
                    if (errorMessage != "") {
                        errorMessage += "\n";
                    }
                    errorMessage += errors[i];
                }
            }
        }

        if (errorMessage == "") {
            if (errorData.errorMessage != undefined) {
                errorMessage = errorData.errorMessage;
            }
            else if (errorData.message != undefined) {
                errorMessage = errorData.message;
            }
            else if (errorData.error != undefined) {
                errorMessage = errorData.error;
            }
            else if (errorData.responseJSON != undefined) {
                if (errorData.responseJSON.Message != null && errorData.responseJSON.MessageDetail != null) {
                    errorMessage = errorData.responseJSON.Message;
                    additionalErrorInfo = errorData.responseJSON.MessageDetail;
                }
                else {
                    errorMessage = errorData.responseJSON.ExceptionMessage;
                }
            }
            else if (errorData.responseText != undefined) {
                if (errorData.responseText.Message != undefined && errorData.responseText.MessageDetail != undefined) {
                    errorMessage = errorData.responseText.Message;
                    additionalErrorInfo = erorData.responseText.MessageDetail;
                }
                else {
                    errorMessage = errorData.responseText;
                }
            }
            else {
                errorMessage = "Unknown error";
            }
        }
    }

    var htmlMarkup = errorMessage;
    if (additionalErrorInfo != null)
        htmlMarkup = htmlMarkup + "<br /><br />" + additionalErrorInfo;

    $("#errorMessageDiv").html(htmlMarkup);

    $('#errorMessageDialog').modal('show');
}
