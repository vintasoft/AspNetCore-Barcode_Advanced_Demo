/**
 A dialog that allows to edit the Application Identifier value of GS1 value.
*/
Gs1AppIdValueEditorDialogJS = function (gs1ValueEditorDialog, gs1AppIdValueIndex, gs1AppId, gs1AppIdData) {

    /**
     Initializes the dialog.
     */
    function __init(gs1AppId, gs1AppIdData) {
        // initialize the 'gs1AppId' item
        var gs1AppIdItem = document.getElementById('gs1AppId');
        gs1AppIdItem.value = gs1AppId;

        // initialize the 'gs1AppIdData' item
        var gs1AppIdDataItem = document.getElementById('gs1AppIdData');
        gs1AppIdDataItem.value = gs1AppIdData;

        var okButton = document.getElementById("gs1AppIdValueEditorDialog_OkButton");
        // subscribe to the "click" event of "Ok" button
        okButton.addEventListener("click", __gs1AppIdValueEditorDialog_okButton_clicked);

        // show the dialog
        $('#gs1AppIdValueEditorDialog').modal('show');
    }

    /**
     "Ok" button is clicked.
     */
    function __gs1AppIdValueEditorDialog_okButton_clicked() {
        var gs1AppIdItem = document.getElementById('gs1AppId');
        var gs1AppIdDataItem = document.getElementById('gs1AppIdData');

        // get the application identifier
        var gs1AppId = gs1AppIdItem.value;
        // get the data of application identifier
        var gs1AppIdData = gs1AppIdDataItem.value;

        // get the name of application identifier
        var gs1AppIdSelectedText = gs1AppIdItem[gs1AppIdItem.selectedIndex].text;
        var splittedItems = gs1AppIdSelectedText.split(':');
        var gs1AppIdName = splittedItems[1].trim();


        function __validateGs1AppIdValueRequest_success(data) {
            // if new application identifier value must be added
            if (gs1AppIdValueIndex == -1) {
                // add new application identifier value
                gs1ValueEditorDialog.addAppIdValueToGs1Value(gs1AppId, gs1AppIdName, gs1AppIdData);
            }
            // if existing application identifier value must be changed
            else {
                // change existing application identifier value
                gs1ValueEditorDialog.changeAppIdValueInGs1Value(gs1AppIdValueIndex, gs1AppId, gs1AppIdName, gs1AppIdData);
            }

            // update the UI of GS1 value editor dialog
            gs1ValueEditorDialog.updateUI();

            var okButton = document.getElementById("gs1AppIdValueEditorDialog_OkButton");
            // unsubscribe from the "click" event of "Ok" button
            okButton.removeEventListener("click", __gs1AppIdValueEditorDialog_okButton_clicked);

            // hide this dialog
            $('#gs1AppIdValueEditorDialog').modal('hide');
            // show the GS1 Value Editor dialog
            $('#gs1ValueEditorDialog').modal('show');
        }
        function __validateGs1AppIdValueRequest_error(data) {
            // show error message
            alert('ERROR: ' + data.errorMessage);
        }


        // create parameters for web request
        var requestParams = {
            type: 'POST',
            data: {
                gs1AppId: gs1AppId,
                gs1AppIdData: gs1AppIdData
            }
        }
        // create the web request for validating the GS1 Application Identifier value
        var request = new Vintasoft.Shared.WebRequestJS(
            "ValidateGs1AppIdValue",
            __validateGs1AppIdValueRequest_success,
            __validateGs1AppIdValueRequest_error,
            requestParams);
        // send the request to the Barcode web service
        Vintasoft.Shared.WebServiceJS.defaultBarcodeService.sendRequest(request);
    }



    // initialize this dialog
    __init(gs1AppId, gs1AppIdData);

}
