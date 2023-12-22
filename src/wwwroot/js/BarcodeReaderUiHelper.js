/**
 A helper that helps to create UI for barcode reading.
*/
var BarcodeReaderUiHelperJS = function (blockUiFunc, unblockUiFunc) {

    var _docViewer;
    var _barcodeReaderHelper;
    var _readBarcodesButton = null;
    var _recognizedInformationTextarea;

    var _barcodeReaderSettings = new Vintasoft.Barcode.WebBarcodeReaderSettingsJS();
    _barcodeReaderSettings.set_SearchQRModel1Barcodes(true);

    var _barcodeReaderSettingsDialog = null;

    var _defaultBarcodeReadingInformationText = null;

    

    /**
     Creates UI panel with barcode recognition functionality.
    */
    BarcodeReaderUiHelperJS.prototype.createBarcodeReadingPanel = function () {
        // create the button that allows to start the asynchronous barcode recognition process
        _readBarcodesButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
            cssClass: "readBarcodes",
            title: "Read barcodes",
            localizationId: "readBarcodesButton",
            css: { "margin-left": "5px" },
            onClick: __readBarcodesButton_clicked
        });

        // create the button that allows to view and change the barcode reader settings
        var barcodeReaderSettingsButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
            cssClass: "barcodeReaderSettings",
            title: "Barcode reader settings",
            localizationId: "barcodeReaderSettingsButton",
            css: { "margin-left": "5px" },
            onClick: __barcodeReaderSettingsButton_clicked
        });

        // create the text area, where information about recognized barcodes will be shown
        _recognizedInformationTextarea = new Vintasoft.Imaging.UI.UIElements.WebUiTextareaElementJS({
            text: "",
            readonly: true,
            css: {
                position: "relative", width: "100%", height: "calc(100% - 45px)", "border-top": "1px solid #dddddd",
                "border-bottom": "1px solid #dddddd", "border-right": "0px", "border-left": "0px", resize: "none"
            }
        });

        // create the button that allows to open/close the barcode recognition panel
        var panelOpenButton = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
            cssClass: "barcodeReader",
            title: "Barcode reading",
            localizationId: "barcodeReaderPanelButton"
        });

        // create an UI panel, which allows to recognize barcodes in image and see the barcode recognition results
        var barcodeReadingPanel = new Vintasoft.Imaging.UI.Panels.WebUiPanelJS(
            ["rectangularSelectionToolButton", _readBarcodesButton, barcodeReaderSettingsButton, _recognizedInformationTextarea],
            { cssClass: "vsui-sidePanel-content" },
            panelOpenButton
        );

        _barcodeReaderHelper = new BarcodeReaderHelperJS(_recognizedInformationTextarea, blockUiFunc, unblockUiFunc);

        // subscribe to the "activated" event of the barcode recognition panel
        Vintasoft.Shared.subscribeToEvent(barcodeReadingPanel, "activated", __barcodeReadingPanel_activated);

        return barcodeReadingPanel;
    }

    function __readBarcodesButton_clicked(event, uiElement) {
        _docViewer = uiElement.get_RootControl();
        var imageViewer = _docViewer.get_ImageViewer();
        _barcodeReaderHelper.sendReadBarcodeRequest(uiElement, imageViewer, _barcodeReaderSettings);
    }

    function __barcodeReaderSettingsButton_clicked(event, uiElement) {
        // if dialog not created
        if (_barcodeReaderSettingsDialog == null) {
            // create the property grid with information about interactive field properties
            var propertyGrid = new Vintasoft.Shared.WebPropertyGridJS(_barcodeReaderSettings);
            // create the barcode reader settings dialog
            _barcodeReaderSettingsDialog = new Vintasoft.Imaging.UI.Dialogs.WebUiPropertyGridDialogJS(
                propertyGrid,
                {
                    title: Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReaderSettingsDialog-title"),
                    cssClass: "vsui-dialog barcodeReaderSettings",
                });

            _docViewer.get_Items().addItem(_barcodeReaderSettingsDialog);
        }

        // show the barcode reader settings dialog
        _barcodeReaderSettingsDialog.show();
    }

    /**
     Barcode recognition panel is activated.
    */
    function __barcodeReadingPanel_activated() {
        // get the document viewer
        _docViewer = this.get_RootControl();
        // get the image viewer
        var imageViewer = _docViewer.get_ImageViewer();

        // subscribe to the "imagesChanged" event of image viewer
        Vintasoft.Shared.subscribeToEvent(imageViewer.get_Images(), 'changing', __images_changing);

        // subscribe to the "focusedIndexChanged" event of image viewer
        Vintasoft.Shared.subscribeToEvent(imageViewer, 'focusedIndexChanged', __imageViewer_focusedIndexChanged);

        // get the image viewer control
        var imageViewerControl = imageViewer.get_Control();
        // specify that barcode recognition result must be shown when left mouse button is double clicked over the recognized barcode in image viewer
        Vintasoft.Shared.subscribeToEvent(imageViewerControl, 'dblclick', __onViewerDoubleClick);
        Vintasoft.Shared.subscribeToEvent(imageViewerControl, 'pointerdown', __onViewerDoubleClick);
        // specify that barcode recognition result must be shown when right mouse button is clicked over the recognized barcode in image viewer
        imageViewer.set_ContextMenuFunc(__onViewerDoubleClick);
    }

    function __images_changing() {
        // get the image viewer
        var imageViewer = _docViewer.get_ImageViewer();

        // clear information about recognized barcodes
        __clearBarcodeInformationTextBox(imageViewer);
    }

    function __imageViewer_focusedIndexChanged() {
        // get the image viewer
        var imageViewer = _docViewer.get_ImageViewer();

        // clear information about recognized barcodes
        __clearBarcodeInformationTextBox(imageViewer);
    }

    /**
     Clears information about recognized barcodes.
     @param {object} Image viewer.
    */
    function __clearBarcodeInformationTextBox(viewer) {
        if (viewer.get_FocusedImage() !== _barcodeReaderHelper.barcodeImage) {
            // enable the "Read barcodes" button
            _readBarcodesButton.set_IsEnabled(true);

            var barcodeRecognizeRequest = _barcodeReaderHelper.get_BarcodeRecognizeRequest();
            // if request is defined
            if (barcodeRecognizeRequest != null) {
                barcodeRecognizeRequest.abort();
                _barcodeReaderHelper.clearBarcodeRecognizeRequest();
            }

            // get the highlight tool
            var highLightTool = _barcodeReaderHelper.getHighLightSelectionTool(viewer);
            if (highLightTool != null)
                // clear the previous barcode recognition results
                highLightTool.clearItems();

            if (_defaultBarcodeReadingInformationText == null) {
                __createDefaultBarcodeReadingInformationText();
            }

            _barcodeReaderHelper.writeBarcodeInformation(_defaultBarcodeReadingInformationText);

            _barcodeReaderHelper.clearBarcodeImage();
        }
    }

    /**
     Mouse button is double clicked in image viewer.
     @param {object} event Event.
    */
    function __onViewerDoubleClick(event) {
        var imageViewer = _docViewer.get_ImageViewer();

        // get the highlight tool
        var highLightTool = _barcodeReaderHelper.getHighLightSelectionTool(imageViewer);
        if (highLightTool != null) {
            // get selected item
            var item = highLightTool.findItem(event.pageX, event.pageY);
            // if selected item is not found
            if (item == null)
                // exit
                return;

            highLightTool.selectItem(item);
            // get information about the recognized barcode
            var barcodeInfo = _barcodeReaderHelper.getBarcodeInformation(item.barcodeIndex);

            var barcodeQualityTestInfo;
            // if information about quality tests exist
            if (barcodeInfo.printQualityTest != null)
                // get information about the print quality test of recognized barcode
                barcodeQualityTestInfo = barcodeInfo.printQualityTest;

            __showBarcodeResultDialog(barcodeInfo, barcodeQualityTestInfo);
        }
    }

    /**
     Shows the dialog with barcode recognition result.
     @param {object} barcodeInfo Information about recognized barcode.
     @param {object} barcodeQualityTestInfo Information about print quality test of recognized barcode.
    */
    function __showBarcodeResultDialog(barcodeInfo, barcodeQualityTestInfo) {
        new BarcodeRecognitionResultDialogJS(_barcodeReaderHelper, barcodeInfo, barcodeQualityTestInfo);
    }

    function __createDefaultBarcodeReadingInformationText() {
        _defaultBarcodeReadingInformationText =
            Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReadingInformationText-start") + "\n\n" +
            Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReadingInformationText-step1") + "\n\n" +
            Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReadingInformationText-step2") + "\n\n" +
            Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReadingInformationText-step3") + "\n\n" +
            Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReadingInformationText-step4");
    }

}
