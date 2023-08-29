/**
 A dialog that allows to view and edit the barcode reader settings.
*/
BarcodeReaderSettingsDialogJS = function () {

    BarcodeReaderSettingsDialogJS.cancelButton_clicked = function () {
        $('#barcodeReaderSettingDialog').modal('hide');
    }

    /**
     Gets the barcode reader settings.
    */
    BarcodeReaderSettingsDialogJS.prototype.get_Settings = function () {
        return this._barcodeReaderSettings;
    }

    /**
    Shows a modal window with barcode reader settings.
   */
    BarcodeReaderSettingsDialogJS.prototype.show = function () {
        var that = this;
        var copyOfSettings = this._barcodeReaderSettings.clone();

        $('#barcodeReaderOkButton').on('click', function () {
            that._barcodeReaderSettings = copyOfSettings;
            $('#barcodeReaderSettingDialog').modal('hide');
        });

        // create WebPropertyGridJS
        var propertyGrid = new Vintasoft.Shared.WebPropertyGridJS(copyOfSettings);
        // create PropertyGridControlJS
        var propertyGridControl = new PropertyGridControlJS(propertyGrid, "barcodeReaderSettingGrid", { hideNestedElements: false, showReadOnlyElements: false });
        propertyGridControl.createMarkup();

        // show the dialog
        $('#barcodeReaderSettingDialog').modal('show');
    }



    // barcode reader settings
    this._barcodeReaderSettings = new Vintasoft.Barcode.WebBarcodeReaderSettingsJS();
    this._barcodeReaderSettings.set_SearchQRModel1Barcodes(true);

}
