/**
 A helper that helps to create UI for barcode writing.
*/
var BarcodeWriterUiHelperJS = function (showErrorMessageFunc) {

    var _docViewer;
    var _writeBarcodeButton = null;
    var _dialogInitialized = false;


    // create settings
    var _barcode1DWriterSettings = new Vintasoft.Barcode.Web1DBarcodeWriterSettingsJS();
    var _barcode2DWriterSettings = new Vintasoft.Barcode.Web2DBarcodeWriterSettingsJS();
    // create property grids
    var barcode1DPropertyGrid = new Vintasoft.Shared.WebPropertyGridJS(_barcode1DWriterSettings);
    var barcode2DPropertyGrid = new Vintasoft.Shared.WebPropertyGridJS(_barcode2DWriterSettings);

    // create dialog for changing settings
    var _barcodeWriterSettingsDialog = new Vintasoft.Imaging.DocumentViewer.Dialogs.WebUiMultiPropertyGridDialogJS(
        {
            title: "Barcode dimension:",
            selectors: [
                { text: "1D", value: "1d", localizationId: "1d", propertyGrid: barcode1DPropertyGrid },
                { text: "2D", value: "2d", localizationId: "2d", propertyGrid: barcode2DPropertyGrid },
            ],
            selectedIndex: 0
        },
        {
            title: "Barcode writer settings"
        }
    );



    /**
     Creates UI panel with barcode creation functionality.
    */
    BarcodeWriterUiHelperJS.prototype.createBarcodeWritingPanel = function () {
        // create the button that allows to start the asynchronous barcode generation process
        _writeBarcodeButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
            cssClass: "writeBarcode",
            title: "Write barcode",
            localizationId: "writeBarcodeButton",
            css: { "margin-left": "5px" },
            onClick: __writeBarcodeButton_clicked
        });

        // create the button that allows to view and change the barcode writer settings
        var barcodeWriterSettingsButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
            cssClass: "barcodeWriterSettings",
            title: "Barcode writer settings",
            localizationId: "barcodeWriterSettingsButton",
            css: { "margin-left": "5px" },
            onClick: __barcodeWriterSettingsButton_clicked
        });

        var defaultWritingInformationText = 'Please do the following steps for writing barcode:\n1. Click the "Barcode Writer Settings" button and specify necessary settings.\n\n2. Click the "Write Barcode" button and new barcode image will be added to image viewer.';
        // create the text area with instructions how to create barcode
        var informationAboutWritingTextarea = new Vintasoft.Imaging.UI.UIElements.WebUiTextareaElementJS({
            text: defaultWritingInformationText,
            localizationId: "barcodeWritingInstructionMessage",
            readonly: true,
            css: {
                position: "relative", width: "100%", height: "calc(100% - 45px)", "border-top": "1px solid #dddddd",
                "border-bottom": "1px solid #dddddd", "border-right": "0px", "border-left": "0px", resize: "none",
            }
        });

        // create the button that allows to open/close the barcode generation panel
        var panelOpenButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
            cssClass: "barcodeWriter",
            title: "Barcode writing",
            localizationId: "barcodeWriterPanelButton"
        });

        // create an UI panel, which allows to generate barcode image
        var panel = new Vintasoft.Imaging.UI.Panels.WebUiPanelJS(
            [
                _writeBarcodeButton, barcodeWriterSettingsButton, informationAboutWritingTextarea
            ],
            { cssClass: "vsui-sidePanel-content" }, panelOpenButton);

        return panel;
    }

    function __writeBarcodeButton_clicked(event, uiElement) {
        // create the barcode writer
        var barcodeWriter = new Vintasoft.Barcode.WebBarcodeWriterJS();

        // get the barcode writer settings from the barcode writer settings dialog
        var barcodeWriterSettings;
        // if current selected property grid index equals 1D settings index
        if (_barcodeWriterSettingsDialog.get_SelectedPropertyGridIndex() == 0) {
            barcodeWriterSettings = _barcode1DWriterSettings;
        }
        else {
            barcodeWriterSettings = _barcode2DWriterSettings;
        }

        // set the barcode writer settings
        barcodeWriter.set_Settings(barcodeWriterSettings);
        // send an asynchronous request for generting the barcode image as a Base64 image
        barcodeWriter.getBarcodeAsBase64Image(
            function (data) {
                // get barcode image
                var imageAsBase64string = data.barcodeImage;
                // upload barcode image to the server
                Vintasoft.Imaging.VintasoftFileAPI.uploadBase64Image(
                    imageAsBase64string,
                    function (data) {
                        var docViewer = uiElement.get_RootControl();
                        var imageViewer = docViewer.get_ImageViewer();

                        // get image collection of image viewer
                        var images = imageViewer.get_Images();
                        // get count of images in image collection
                        var count = images.get_Count();

                        // create new image
                        var image = new Vintasoft.Shared.WebImageJS(new Vintasoft.Shared.WebImageSourceJS(data.imageInfo.fileInfo.id), data.imageInfo.pageIndex);
                        // add new image to the image collection
                        images.add(image);

                        // set focus to the added image
                        imageViewer.set_FocusedIndex(count);

                        // enable the "Generate barcode" button
                        var writeBarcodeButtonElement = _writeBarcodeButton.get_DomElement();
                        writeBarcodeButtonElement.disabled = false;
                    },
                    function (data) {
                        // show the error message
                        showErrorMessageFunc(data);

                        // enable the "Generate barcode" button
                        var writeBarcodeButtonElement = _writeBarcodeButton.get_DomElement();
                        writeBarcodeButtonElement.disabled = false;
                    });
            },
            function (data) {
                // show the error message
                showErrorMessageFunc(data);

                // enable the "Generate barcode" button
                var writeBarcodeButtonElement = _writeBarcodeButton.get_DomElement();
                writeBarcodeButtonElement.disabled = false;
            });

        // disable the "Generate barcode" button
        var writeBarcodeButtonElement = _writeBarcodeButton.get_DomElement();
        writeBarcodeButtonElement.disabled = true;
    }

    function __barcodeWriterSettingsButton_clicked(event, uiElement) {
        _docViewer = uiElement.get_RootControl();

        if (!_dialogInitialized) {
            _docViewer.get_Items().addItem(_barcodeWriterSettingsDialog);
            _dialogInitialized = true;
        }

        _barcodeWriterSettingsDialog.show();
    }

}
