/**
 Represents the helper for barcode reader.
*/
var BarcodeReaderHelperJS = function (recognizedInformationTextarea, blockUiFunc, unblockUiFunc) {

    var that = this;
    var _blockUiFunc = blockUiFunc;
    var _unblockUiFunc = unblockUiFunc;

    var _readBarcodesButton;

    // barcode reader
    var _barcodeReader = new Vintasoft.Barcode.WebBarcodeReaderJS();

    var _imageViewer;

    // array that contains information about recognized barcodes
    var _barcodeInformation;

    var _recognizedInformationTextarea = recognizedInformationTextarea;



    var _barcodeImage = null;
    BarcodeReaderHelperJS.prototype.get_BarcodeImage = function () {
        return _barcodeImage;
    }
    BarcodeReaderHelperJS.prototype.clearBarcodeImage = function () {
        _barcodeImage = null;
    }

    var _barcodeRecognizeRequest = null;
    BarcodeReaderHelperJS.prototype.get_BarcodeRecognizeRequest = function () {
        return _barcodeRecognizeRequest;
    }
    BarcodeReaderHelperJS.prototype.clearBarcodeRecognizeRequest = function () {
        _barcodeRecognizeRequest = null;
    }

    /**
     Writes information about barcode recognition process.
     @param {string} message Message.
    */
    BarcodeReaderHelperJS.prototype.writeBarcodeInformation = function (message) {
        __writeBarcodeInformation(message);
    }



    // === Barcode recognition ===

    /**
     Sends a request for recognizing barcodes in image.
     @param {object} readBarcodeButton "Read barcodes" button.
     @param {object} imageViewer Image viewer.
    */
    BarcodeReaderHelperJS.prototype.sendReadBarcodeRequest = function (readBarcodesButton, imageViewer, barcodeReaderSettings) {
        _readBarcodesButton = readBarcodesButton;
        _imageViewer = imageViewer;

        // get focused image
        var image = _imageViewer.get_FocusedImage();
        // if focused image exists
        if (image != null) {
            // disable the "Read barcodes" button
            readBarcodesButton.set_IsEnabled(false);

            // reset information about recognized barcodes
            _barcodeInformation = Array();

            // get the highlight tool
            var highLightTool = this.getHighLightSelectionTool(imageViewer);
            if (highLightTool != null)
                // clear the previous barcode recognition results
                highLightTool.clearItems();

            var message = "Read barcodes...";
            _blockUiFunc(message);
            // show a message about start of barcode recognition
            __writeBarcodeInformation(message);

            // set scan rectangle
            __setScanRectangle(imageViewer, barcodeReaderSettings);

            // set barcode reader settings
            _barcodeReader.set_Settings(barcodeReaderSettings);

            // send an asynchronous request for barcode recognition
            var request = _barcodeReader.readBarcodes(image, __readBarcodes_success, __readBarcodes_fail);
            _barcodeRecognizeRequest = request.object;
        }
        return false;
    }

    /**
     Barcode recognition is finished successully.
     @param {object} data Object with information about recognized barcodes.
    */
    function __readBarcodes_success(data) {
        _unblockUiFunc();

        // barcode image, where barcodes are searching
        _barcodeImage = _imageViewer.get_FocusedImage();

        // save information about recognized barcodes
        _barcodeInformation = data.results;

        // get text information about recognized barcodes
        var infoAboutBarcodes = __getTextInformationAboutBarcodes(_barcodeInformation);

        // show information about recognized barcodes
        __writeBarcodeInformation(infoAboutBarcodes);

        // if barcodes are found
        if (_barcodeInformation.length !== 0) {
            // create the objects, which will highlight the recognized barcodes on an image
            var coloredObjects = __createHighlightingForBarcodes(_barcodeInformation);
            // get the highlight tool
            var highLightTool = that.getHighLightSelectionTool(_imageViewer);
            if (highLightTool != null)
                // add the objects in highlight tool
                highLightTool.addItems(coloredObjects);
        }

        __barcodeRecognizeRequest_finished();
    }

    /**
     Barcode recognition is failed.
     @param {object} data Object with information about barcode recognition error.
    */
    function __readBarcodes_fail(data) {
        _unblockUiFunc();

        __writeBarcodeInformation("");
        // if error occurred during the request (request was not aborted)
        if (data.statusText !== "abort") {
            // show information about error
            new ErrorMessageDialogJS(data);
        }

        __barcodeRecognizeRequest_finished();
    }

    /**
     Barcode recognition request is finished.
    */
    function __barcodeRecognizeRequest_finished() {
        _barcodeRecognizeRequest = null;

        // enable the "Read barcodes" button
        _readBarcodesButton.set_IsEnabled(true);

        // get the rectangular selection tool
        var rectangularSelectionTool = __getVisualToolByName(_imageViewer, "RectangularSelection");
        // if tool exists
        if (rectangularSelectionTool != null)
            // clear the selection
            rectangularSelectionTool.reset();
    }


    /**
     Sets the scan rectangle in barcode reader settings.
     @param {object} imageViewer Image viewer.
     @param {object} barcodeReaderSettings Barcode reader settings.
    */
    function __setScanRectangle(imageViewer, barcodeReaderSettings) {
        // scan rectangle where barcodes must be searched
        var scanRectangle = { x: 0, y: 0, width: 0, height: 0 };
        // get the composite visual tool
        var visualTool = imageViewer.get_VisualTool();
        if (visualTool != null) {
            // get the rectangular selection tool
            var rectangularSelectionTool = __getVisualToolByName(_imageViewer, "RectangularSelection");
            // if tool exists
            if (rectangularSelectionTool != null) {
                // if rectangular selection tool active
                if (rectangularSelectionTool.get_IsEnabled()) {
                    // get the scan rectangle
                    scanRectangle = rectangularSelectionTool.get_Rectangle();
                    //  scale the scan rectangle
                    scanRectangle.x = Math.floor(scanRectangle.x);
                    scanRectangle.y = Math.floor(scanRectangle.y);
                    scanRectangle.width = Math.floor(scanRectangle.width);
                    scanRectangle.height = Math.floor(scanRectangle.height);
                }
            }
        }
        // set the scan rectangle
        barcodeReaderSettings.set_ScanRectangle(scanRectangle);
    }


    // === Barcode recognition results ===

    BarcodeReaderHelperJS.prototype.getBarcodeInformation = function (barcodeIndex) {
        return _barcodeInformation[barcodeIndex];
    }

    /**
     Returns the highlight tool.
     @param {object} imageViewer Image viewer.
    */
    BarcodeReaderHelperJS.prototype.getHighLightSelectionTool = function (imageViewer) {
        return __getVisualToolByName(imageViewer, "HighlightTool");
    }


    /**
     Returns the rectangular selection tool.
     @param {object} imageViewer Image viewer.
     @param {string} visualToolName Visual tool name.
    */
    function __getVisualToolByName(imageViewer, visualToolName) {
        var visualTool = imageViewer.get_VisualTool();
        if (visualTool != null) {
            if (visualTool.get_VisualTools != null) {
                var visualTools = visualTool.get_VisualTools();
                for (var i = 0; i < visualTools.length; i++) {
                    if (visualTools[i].get_Name() == visualToolName)
                        return visualTools[i];
                }
            }
            else {
                if (visualTool.get_Name() == visualToolName)
                    return visualTool;
            }
        }
        return null;
    }


    // === Create highlight objects ===

    /**
     Returns text information about recognized barcodes.
     @param {object} barcodeInfoArray An array with information about recognized barcodes.
    */
    function __getTextInformationAboutBarcodes(barcodeInfoArray) {
        var information = "";
        if (barcodeInfoArray.length == 0) {
            // get localized strings
            var str1 = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReadingNoBarcodesInformationText-str1");
            var str2 = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReadingNoBarcodesInformationText-str2");
            var str3 = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReadingNoBarcodesInformationText-str3");

            // show a message with the barcode recognition result
            information += str1 + '\n\n' + str2 + '\n\n' + str3;
        }
        // else
        else {
            var recognizedBarcodesText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-recognizedBarcodes");
            // show the count of recognized barcodes
            information += recognizedBarcodesText + barcodeInfoArray.length + '.\n\n';
            // for each recognized barcode
            for (var i = 0; i < barcodeInfoArray.length; i++) {
                var barcodeInfo = barcodeInfoArray[i];

                var barcodeValue;
                if (barcodeInfo.barcodeType == "Mailmark CMDM Type7" || barcodeInfo.barcodeType == "Mailmark CMDM Type9" || barcodeInfo.barcodeType == "Mailmark CMDM Type29") {
                    barcodeValue = '\n===\n' + __createMarkupWithInformationAboutMailmarkCMDMBarcode(barcodeInfo, false, '\n') + '\n===';
                }
                else if (barcodeInfo.barcodeType == "PPN") {
                    barcodeValue = '\n===\n' + __createMarkupWithInformationAboutPpnBarcode(barcodeInfo, false, '\n') + '\n===';
                }
                else if (barcodeInfo.barcodeType == "AAMVA") {
                    barcodeValue = '\n===\n' + __createMarkupWithInformationAboutAamvaBarcode(barcodeInfo, false, '\n') + '\n===';
                }
                else if (barcodeInfo.barcodeType == "Swiss QR Code") {
                    barcodeValue = '\n===\n' + __createMarkupWithInformationAboutSwissQrCodeBarcode(barcodeInfo, false, '\n') + '\n===';
                }
                else {
                    barcodeValue = barcodeInfo.value;
                }


                var valueText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-value");
                var confidenceText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-confidence");
                var readingQualityText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-readingQuality");
                var thresholdText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-threshold");
                var regionText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-region");
                var angleText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-angle");

                // create a string with information about barcode
                information += '[' + (i + 1) + ':' + barcodeInfo.barcodeType + ']\n' +
                    valueText + barcodeValue + '\n' +
                    confidenceText + barcodeInfo.confidence + '\n' +
                    readingQualityText + barcodeInfo.readingQuality.toFixed(2) + '\n' +
                    thresholdText + barcodeInfo.threshold + '\n' +
                    regionText +
                    'LT=(' + barcodeInfo.region.leftTop.x + ',' + barcodeInfo.region.leftTop.y +
                    '); RT=(' + barcodeInfo.region.rightTop.x + ',' + barcodeInfo.region.rightTop.y +
                    '); LB=(' + barcodeInfo.region.leftBottom.x + ',' + barcodeInfo.region.leftBottom.y +
                    '); RB=(' + barcodeInfo.region.rightBottom.x + ',' + barcodeInfo.region.rightBottom.y + '); ' +
                    angleText + barcodeInfo.region.angle.toFixed(1) + '°\n\n';
            }
        }
        return information;
    }

    /**
     Creates the objects, which will highlight the recognized barcodes on an image.
     @param {object} barcodeInfoArray An array with information about recognized barcodes.
     @returns {object} The objects, which will highlight the recognized barcodes on an image.
    */
    function __createHighlightingForBarcodes(barcodeInfoArray) {
        // an array with highlighting of barcodes
        var objects = Array();
        // for each recognized barcode
        for (var i = 0; i < barcodeInfoArray.length; i++) {
            // get information about recognized barcode
            var item = barcodeInfoArray[i];
            // create an object, which will highlight the recognized barcode on an image
            var obj = __createHighlightingForBarcode(item);
            // save link between highlighting and barcode info
            obj.barcodeIndex = i;

            // add highlighting to an array
            objects.push(obj);
        }
        // create the objects, which will highlight the recognized barcodes on an image
        return new Vintasoft.Imaging.UI.VisualTools.WebHighlightObjectsJS(objects, 'rgba(0,128,0,0.18)', 'rgba(0,128,0,0.75)');
    }

    /**
     Creates an object, which will highlight the recognized barcode on an image.
     @param {object} barcodeInfo Information about recognized barcode.
     @returns {oject} An object, which will highlight the recognized barcode on an image.
    */
    function __createHighlightingForBarcode(barcodeInfo) {
        // create an array with points of barcode region
        var points = Array();
        var region = barcodeInfo.region;
        points.push({ x: region.leftTop.x, y: region.leftTop.y });
        points.push({ x: region.rightTop.x, y: region.rightTop.y });
        points.push({ x: region.rightBottom.x, y: region.rightBottom.y });
        points.push({ x: region.leftBottom.x, y: region.leftBottom.y });

        // creates an object, which will highlight the recognized barcode on an image
        var obj = Vintasoft.Imaging.UI.VisualTools.WebHighlightObjectJS.createObjectFromPolygon(points);
        // create the tooltip for highlighting
        obj.set_ToolTip(barcodeInfo.barcodeType + '\n' + barcodeInfo.value);
        // return the highlighting
        return obj;
    }

    /**
     Creates a "<br />"" HTML element.
    */
    function __getBr() {
        return document.createElement("br");
    }

    /**
     Creates a "<hr>" HTML element.
    */
    function __getHr() {
        return document.createElement("hr");
    }

    /**
     Add text in "<b>" HTML element.
     @param {string} text Bolding text.
    */
    function __boldText(text) {
        var b = document.createElement("b");
        b.append(text);
        return b;
    }


    // === Create HTML markup for barcode recognition result ===

    /**
     Creates a HTML markup for modal window with the barcode reading result.
     @param {object} barcodeInfo Information about barcode.
     @param {object} barcodeQualityTestInfo Information about quality test.
    */
    BarcodeReaderHelperJS.prototype.createHtmlMarkupForBarcodeReadingResult = function (barcodeInfo, barcodeQualityTestInfo) {
        var barcodeInfoDiv = document.createElement("div");

        var barcodeTypeText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-barcodeType");
        // '<b>' + barcodeTypeText + '</b>' + barcodeInfo.barcodeType + '<br />'
        barcodeInfoDiv.append(__boldText(barcodeTypeText), barcodeInfo.barcodeType, __getBr());


        var valueText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-value");

        // '<b>' + valueText + '</b>'
        barcodeInfoDiv.append(__boldText(valueText));

        var isWriteBaseValue = true;
        if (barcodeInfo.barcodeType == "Mailmark CMDM Type7" || barcodeInfo.barcodeType == "Mailmark CMDM Type9" || barcodeInfo.barcodeType == "Mailmark CMDM Type29") {
            barcodeInfoDiv.append(__getBr());
            barcodeInfoDiv.append(...__createMarkupWithInformationAboutMailmarkCMDMBarcode(barcodeInfo, true, [__getBr()]));
        }
        else if (barcodeInfo.barcodeType == "PPN") {
            barcodeInfoDiv.append(__getBr());
            barcodeInfoDiv.append(...__createMarkupWithInformationAboutPpnBarcode(barcodeInfo, true, [__getBr()]));
        }
        else if (barcodeInfo.barcodeType == "AAMVA") {
            barcodeInfoDiv.append(__getBr());
            barcodeInfoDiv.append(...__createMarkupWithInformationAboutAamvaBarcode(barcodeInfo, true, [__getBr()]));
        }
        else if (barcodeInfo.barcodeType == "Swiss QR Code") {
            barcodeInfoDiv.append(__getBr());
            barcodeInfoDiv.append(...__createMarkupWithInformationAboutSwissQrCodeBarcode(barcodeInfo, true, [__getBr()]));
        }
        else {
            barcodeInfoDiv.append(__replaceSpecialHtmlChars(barcodeInfo.value));
            if (barcodeInfo.baseValue == null || barcodeInfo.value == barcodeInfo.baseValue) {
                isWriteBaseValue = false;
            }
        }
        barcodeInfoDiv.append(__getBr());

        if (isWriteBaseValue) {
            var baseValueText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-baseValue");
            // '<b>' + baseValueText + '</b>' + __replaceSpecialHtmlChars(barcodeInfo.baseValue) + '<br />';
            barcodeInfoDiv.append(__boldText(baseValueText), __replaceSpecialHtmlChars(barcodeInfo.baseValue), __getBr());
        }


        var confidenceText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-confidence");
        // '<b>' + confidenceText + '</b>' + barcodeInfo.confidence + '<br />';
        barcodeInfoDiv.append(__boldText(confidenceText), barcodeInfo.confidence, __getBr());

        var readingQualityText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-readingQuality");
        // '<b>' + readingQualityText + '</b>' + barcodeInfo.readingQuality.toFixed(2) + '<br />';
        barcodeInfoDiv.append(__boldText(readingQualityText), barcodeInfo.readingQuality.toFixed(2), __getBr());

        var thresholdText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-threshold");
        // '<b>' + thresholdText + '</b>' + barcodeInfo.threshold + '<br />';
        barcodeInfoDiv.append(__boldText(thresholdText), barcodeInfo.threshold, __getBr());

        var regionText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-region");
        barcodeInfoDiv.append(
            __boldText(regionText), __getBr(),
            'LT = (' + barcodeInfo.region.leftTop.x + ',' + barcodeInfo.region.leftTop.y + ');', __getBr(),
            'RT = (' + barcodeInfo.region.rightTop.x + ',' + barcodeInfo.region.rightTop.y + ');', __getBr(),
            'LB = (' + barcodeInfo.region.leftBottom.x + ',' + barcodeInfo.region.leftBottom.y + ');', __getBr(),
            'RB = (' + barcodeInfo.region.rightBottom.x + ',' + barcodeInfo.region.rightBottom.y + ');', __getBr(),
            'Angle = ' + barcodeInfo.region.angle.toFixed(1) + '°', __getBr());


        // 1D
        if (barcodeInfo.narrowBarCount) {
            var narrowBarCountText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-narrowBarCount");
            // '<b>' + narrowBarCountText + '</b>' + barcodeInfo.narrowBarCount + '<br />';
            barcodeInfoDiv.append(__boldText(narrowBarCountText), barcodeInfo.narrowBarCount, __getBr());

            var narrowBarSizeText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-narrowBarSize");
            // '<b>' + narrowBarSizeText + '</b>' + barcodeInfo.narrowBarSize.toFixed(2) + '<br /><br />';
            barcodeInfoDiv.append(__boldText(narrowBarSizeText), barcodeInfo.narrowBarSize.toFixed(2), __getBr(), __getBr());
        }
        // 2D
        else if (barcodeInfo.matrixSize) {
            var matrixSizeText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-matrixSize");
            // '<b>' + matrixSizeText + '</b>' + barcodeInfo.matrixSize.x + "x" + barcodeInfo.matrixSize.y + '<br />';
            barcodeInfoDiv.append(__boldText(matrixSizeText), barcodeInfo.matrixSize.x + "x" + barcodeInfo.matrixSize.y, __getBr());

            var cellSizeText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-cellSize");
            // '<b>' + cellSizeText + '</b>' + barcodeInfo.cellSize.x.toFixed(2) + "x" + barcodeInfo.cellSize.y.toFixed(2) + '<br />';
            barcodeInfoDiv.append(__boldText(cellSizeText), barcodeInfo.cellSize.x.toFixed(2) + "x" + barcodeInfo.cellSize.y.toFixed(2), __getBr());

            if (barcodeInfo.bulleyeCenter != null) {
                var bulleyeCenterText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-bulleyeCenter");
                // '<b>' + bulleyeCenterText + '</b>(' + barcodeInfo.bulleyeCenter.x.toFixed(2) + "," + barcodeInfo.bulleyeCenter.y.toFixed(2) + ')<br />';
                barcodeInfoDiv.append(__boldText(bulleyeCenterText), '(' + barcodeInfo.bulleyeCenter.x.toFixed(2) + ',' + barcodeInfo.bulleyeCenter.y.toFixed(2) + ')', __getBr());
            }

            barcodeInfoDiv.append(__getBr());
        }

        var hexValueText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-hexValue");
        // '<b>' + hexValueText + '</b><br /><div style="font-family:\'Courier New\'">' + barcodeInfo.hexValue + '</div>';
        var hexValue = document.createElement("div");
        hexValue.style.fontFamily = "Courier New";
        hexValue.append(barcodeInfo.hexValue);
        barcodeInfoDiv.append(__boldText(hexValueText), __getBr(), hexValue);

        if (barcodeQualityTestInfo != null) {
            var qualityTestInformationText = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-qualityTestInformation");
            // "<br /><b>" + qualityTestInformationText + "</b><br />";
            barcodeInfoDiv.append(__getBr(), __boldText(qualityTestInformationText), __getBr());

            if (barcodeQualityTestInfo.tests != null) {
                barcodeInfoDiv.append(...__createMarkupForISO15416TestResult(barcodeQualityTestInfo.tests));
            }
            else {
                barcodeInfoDiv.append(...__createMarkupForISO15415TestResult(barcodeQualityTestInfo));
            }
        }

        return barcodeInfoDiv;
    }

    /**
     Creates a HTML markup with information about recognized Mailmark CMDM barcode.
     @param {object} barcodeInfo Information about barcode.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {object} brText Array of elements that should be used as line break symbol.
     @returns {object} Array of elements for HTML markup.
    */
    function __createMarkupWithInformationAboutMailmarkCMDMBarcode(barcodeInfo, isBoldParameterTitle, brText) {
        var htmlMarkupElements = [
            ...__createMarkupForBarcodeInfoParameter('UPU Country ID', barcodeInfo.decodedValue.upuCountryId, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Information type ID', barcodeInfo.decodedValue.informationTypeId, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Version ID', barcodeInfo.decodedValue.versionId, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Item class', barcodeInfo.decodedValue.itemClass, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Supply chain ID', barcodeInfo.decodedValue.supplyChainId, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Item ID', barcodeInfo.decodedValue.itemId, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('DPS', barcodeInfo.decodedValue.dps, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('RTS flag', barcodeInfo.decodedValue.rtsFlag, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Return to sender post code', barcodeInfo.decodedValue.returnToSenderPostCode, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Reserved', barcodeInfo.decodedValue.reserved, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Customer content', barcodeInfo.decodedValue.customerContent, isBoldParameterTitle, '')
        ];

        return htmlMarkupElements;
    }

    /**
     Creates a HTML markup with information about recognized PNP barcode.
     @param {object} barcodeInfo Information about barcode.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {object} brText Array of elements that should be used as line break symbol.
     @returns {object} Array of elements for HTML markup.
    */
    function __createMarkupWithInformationAboutPpnBarcode(barcodeInfo, isBoldParameterTitle, brText) {
        var htmlMarkupElements = [
            ...__createMarkupForBarcodeInfoParameter('Batch number', barcodeInfo.decodedValue.batchNumber, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Date of manufacture', barcodeInfo.decodedValue.dateOfManufacture, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Expiry date', barcodeInfo.decodedValue.expiryDate, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('GTIN', barcodeInfo.decodedValue.GTIN, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Pharmacy product number', barcodeInfo.decodedValue.pharmacyProductNumber, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Serial number', barcodeInfo.decodedValue.serialNumber, isBoldParameterTitle, '')
        ];
        return htmlMarkupElements;
    }

    /**
     Creates a HTML markup with information about recognized AAMVA barcode.
     @param {object} barcodeInfo Information about barcode.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {object} brText Array of elements that should be used as line break symbol.
     @returns {object} Array of elements for HTML markup.
    */
    function __createMarkupWithInformationAboutAamvaBarcode(barcodeInfo, isBoldParameterTitle, brText) {
        var htmlMarkupElements = [
            ...__createMarkupForBarcodeInfoParameter('Version level', barcodeInfo.versionLevel, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Issuer identification number', barcodeInfo.issuerIdentificationNumber, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Jurisdiction version number', barcodeInfo.jurisdictionVersionNumber, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('License number', barcodeInfo.licenseNumber, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Expiration date', barcodeInfo.expirationDate, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('IssueDate', barcodeInfo.issueDate, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Date of birth', barcodeInfo.dateOfBirth, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Card revision date', barcodeInfo.cardRevisionDate, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Family name', barcodeInfo.familyName, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('First name', barcodeInfo.firstName, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Middle name', barcodeInfo.middleName, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Sex', barcodeInfo.sex, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Height', barcodeInfo.height, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Eye color', barcodeInfo.eyeColor, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Hair color', barcodeInfo.hairColor, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Country ID', barcodeInfo.countryId, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Address street 1', barcodeInfo.addressStreet1, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Address street 2', barcodeInfo.addressStreet2, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Address city', barcodeInfo.addressCity, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Address state code', barcodeInfo.addressStateCode, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Address postal code', barcodeInfo.addressPostalCode, isBoldParameterTitle, '')
        ];
        return htmlMarkupElements;
    }

    /**
     Creates a HTML markup with information about recognized Swiss QR Code barcode.
     @param {object} barcodeInfo Information about barcode.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {object} brText Array of elements that should be used as line break symbol.
     @returns {object} Array of elements for HTML markup.
    */
    function __createMarkupWithInformationAboutSwissQrCodeBarcode(barcodeInfo, isBoldParameterTitle, brText) {
        var htmlMarkupElements = [
            ...__createMarkupForBarcodeInfoParameter('QR type', barcodeInfo.decodedValue.qrType, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Version', barcodeInfo.decodedValue.version, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Coding type', barcodeInfo.decodedValue.codingType, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('IBAN', barcodeInfo.decodedValue.IBAN, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Creditor address type', barcodeInfo.decodedValue.creditorAddressType, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Creditor name', barcodeInfo.decodedValue.creditorName, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Creditor street or address line 1', barcodeInfo.decodedValue.creditorStreetOrAddressLine1, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Creditor building number or address line 2', barcodeInfo.decodedValue.creditorBuildingNumberOrAddressLine2, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Creditor postal code', barcodeInfo.decodedValue.creditorPostalCode, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Creditor town', barcodeInfo.decodedValue.creditorTown, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Creditor country', barcodeInfo.decodedValue.creditorCountry, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate creditor address type', barcodeInfo.decodedValue.ultimateCreditorAddressType, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate creditor name', barcodeInfo.decodedValue.ultimateCreditorName, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate creditor street or address line 1', barcodeInfo.decodedValue.ultimateCreditorStreetOrAddressLine1, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate creditor building number or address line 2', barcodeInfo.decodedValue.ultimateCreditorBuildingNumberOrAddressLine2, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate creditor postal code', barcodeInfo.decodedValue.ultimateCreditorPostalCode, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate creditor town', barcodeInfo.decodedValue.ultimateCreditorTown, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate creditor country', barcodeInfo.decodedValue.ultimateCreditorCountry, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Amount', barcodeInfo.decodedValue.amount, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Amount currency', barcodeInfo.decodedValue.amountCurrency, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate debtor address type', barcodeInfo.decodedValue.ultimateDebtorAddressType, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate debtor name', barcodeInfo.decodedValue.ultimateDebtorName, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate debtor street or address line 1', barcodeInfo.decodedValue.ultimateDebtorStreetOrAddressLine1, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate debtor building number or address line 2', barcodeInfo.decodedValue.ultimateDebtorBuildingNumberOrAddressLine2, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate debtor postal code', barcodeInfo.decodedValue.ultimateDebtorPostalCode, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate debtor town', barcodeInfo.decodedValue.ultimateDebtorTown, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Ultimate debtor country', barcodeInfo.decodedValue.ultimateDebtorCountry, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Payment reference type', barcodeInfo.decodedValue.paymentReferenceType, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Payment reference', barcodeInfo.decodedValue.paymentReference, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Unstructured message', barcodeInfo.decodedValue.unstructuredMessage, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Bill information', barcodeInfo.decodedValue.billInformation, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Alternative scheme parameters 1', barcodeInfo.decodedValue.alternativeSchemeParameters1, isBoldParameterTitle, brText),
            ...__createMarkupForBarcodeInfoParameter('Alternative scheme parameters 2', barcodeInfo.decodedValue.alternativeSchemeParameters2, isBoldParameterTitle, '')
        ];
        return htmlMarkupElements;
    }

    /**
     Creates a HTML markup with information about barcode info parameter.
     @param {string} barcodeInfoParamTitle Title of barcode info parameter.
     @param {string} barcodeInfoParamValue Value of barcode info parameter.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {object} brText Array of elements that should be used as line break symbol.
     @returns {object} Array of elements for HTML markup.
    */
    function __createMarkupForBarcodeInfoParameter(barcodeInfoParamTitle, barcodeInfoParamValue, isBoldParameterTitle, brText) {
        var newTitle = '- ' + barcodeInfoParamTitle + ': ';
        if (isBoldParameterTitle) {
            newTitle = __boldText(newTitle);
        }

        return [newTitle, barcodeInfoParamValue, ...brText];
    }

    /**
     Creates a HTML markup for ISO15416 barcode print quality test information.
     @param {object} testInfo Information about quality test.
     @returns {object} Array of elements for HTML markup.
    */
    function __createMarkupForISO15416TestResult(testInfo) {
        var htmlMarkupElements = [];
        for (var i = 0; i < testInfo.length; i++) {
            if (testInfo.length > 1) {
                // '<br /><hr><b>SymbolComponent ' + (i + 1) + ':</b><br /><hr>';
                htmlMarkupElements.push(...[__getBr(), __getHr(), __boldText('SymbolComponent ' + (i + 1) + ':'), __getBr(), __getHr()]);
            }

            symbol = testInfo[i];
            // '<table style="text-align:center; width:100%">'
            var table = document.createElement("table");
            table.style.textAlign = "center";
            table.style.width = "100%";
            {
                // '<tr style="background-color:#dbd7d7"><td><b>Parameter</b></td><td><b>Value</b></td><td><b>Grade</b></td></tr>'
                var tr = document.createElement("tr");
                tr.style.backgroundColor = "#dbd7d7";
                {
                    var td = document.createElement("td");
                    td.append(__boldText("Parameter"));
                    tr.append(td);

                    td = document.createElement("td");
                    td.append(__boldText("Value"));
                    tr.append(td);

                    td = document.createElement("td");
                    td.append(__boldText("Grade"));
                    tr.append(td);
                }
                table.append(tr);

                if (symbol.decode != null)
                    table.append(__createTableRowForQualityTestProperty("Decode", symbol.decode.value, symbol.decode.grade));
                table.append(__createTableRowForQualityTestProperty("MaxReflectance", Number(symbol.maxReflectance.value).toFixed(1) + "%", symbol.maxReflectance.grade));
                table.append(__createTableRowForQualityTestProperty("MinReflectance", Number(symbol.minReflectance.value).toFixed(1) + "%", symbol.minReflectance.grade));
                table.append(__createTableRowForQualityTestProperty("GlobalThreshold", Number(symbol.globalThreshold.value).toFixed(1) + "%", symbol.globalThreshold.grade));
                table.append(__createTableRowForQualityTestProperty("SymbolContrast", Number(symbol.symbolContrast.value).toFixed(1) + "%", symbol.symbolContrast.grade));
                table.append(__createTableRowForQualityTestProperty("MinEdgeContrast", Number(symbol.minEdgeContrast.value).toFixed(1) + "%", symbol.minEdgeContrast.grade));
                table.append(__createTableRowForQualityTestProperty("Modulation", Number(symbol.modulation.value).toFixed(2), symbol.modulation.grade));
                table.append(__createTableRowForQualityTestProperty("Defects", Number(symbol.defects.value).toFixed(2), symbol.defects.grade));
                if (symbol.decodability != null)
                    table.append(__createTableRowForQualityTestProperty("Decodability", Number(symbol.decodability.value).toFixed(2), symbol.decodability.grade));
                table.append(__createTableRowForQualityTestProperty("ScanGrade", symbol.scanGrade.value, symbol.scanGrade.grade));
            }

            htmlMarkupElements.push(table);
        }
        return htmlMarkupElements;
    }

    /**
     Creates a HTML markup for ISO15415 barcode print quality test information.
     @param {object} testInfo Information about quality test.
     @returns {object} Array of elements for HTML markup.
    */
    function __createMarkupForISO15415TestResult(testInfo) {
        var htmlMarkupElements = [];

        // '<table style="text-align:center; width:100%">'
        var table = document.createElement("table");
        table.style.textAlign = "center";
        table.style.width = "100%";
        {
            // '<tr style="background-color:#dbd7d7"><td><b>Parameter</b></td><td><b>Value</b></td><td><b>Grade</b></td></tr>'
            var tr = document.createElement("tr");
            tr.style.backgroundColor = "#dbd7d7";
            {
                var td = document.createElement("td");
                td.append(__boldText("Parameter"));
                tr.append(td);

                td = document.createElement("td");
                td.append(__boldText("Value"));
                tr.append(td);

                td = document.createElement("td");
                td.append(__boldText("Grade"));
                tr.append(td);
            }
            table.append(tr);

            table.append(__createTableRowForQualityTestProperty("Decode", testInfo.decode.value, testInfo.decode.grade));
            table.append(__createTableRowForQualityTestProperty("UnusedErrorCorrection", Number(testInfo.unusedErrorCorrection.value).toFixed(2) + "%", testInfo.unusedErrorCorrection.grade));
            if (testInfo.codewordYield != null)
                table.append(__createTableRowForQualityTestProperty("CodewordYield", testInfo.codewordYield.value + "%", testInfo.codewordYield.grade));
            if (testInfo.codewordPrintQualityModulation != null)
                table.append(__createTableRowForQualityTestProperty("CodewordPrintQualityModulation", testInfo.codewordPrintQualityModulation.value, testInfo.codewordPrintQualityModulation.grade));
            if (testInfo.codewordPrintQualityDefects != null)
                table.append(__createTableRowForQualityTestProperty("CodewordPrintQualityDefects", testInfo.codewordPrintQualityDefects.value, testInfo.codewordPrintQualityDefects.grade));
            if (testInfo.codewordPrintQualityDecodability != null)
                table.append(__createTableRowForQualityTestProperty("CodewordPrintQualityDecodability", testInfo.codewordPrintQualityDecodability.value, testInfo.codewordPrintQualityDecodability.grade));
            if (testInfo.codewordPrintQuality != null)
                table.append(__createTableRowForQualityTestProperty("CodewordPrintQuality", testInfo.codewordPrintQuality.value, testInfo.codewordPrintQuality.grade));
            if (testInfo.maxReflectance != null)
                table.append(__createTableRowForQualityTestProperty("MaxReflectance", Number(testInfo.maxReflectance.value).toFixed(2) + "%", testInfo.maxReflectance.grade));
            if (testInfo.minReflectance != null)
                table.append(__createTableRowForQualityTestProperty("MinReflectance", Number(testInfo.minReflectance.value).toFixed(2) + "%", testInfo.minReflectance.grade));
            if (testInfo.symbolContrast != null)
                table.append(__createTableRowForQualityTestProperty("SymbolContrast", Number(testInfo.symbolContrast.value).toFixed(2) + "%", testInfo.symbolContrast.grade));
            if (testInfo.axialNonuniformity != null)
                table.append(__createTableRowForQualityTestProperty("AxialNonuniformity", Number(testInfo.axialNonuniformity.value).toFixed(2), testInfo.axialNonuniformity.grade));
            if (testInfo.gridNonuniformity != null)
                table.append(__createTableRowForQualityTestProperty("GridNonuniformity", Number(testInfo.gridNonuniformity.value).toFixed(2) + " cell", testInfo.gridNonuniformity.grade));
            if (testInfo.modulation != null)
                table.append(__createTableRowForQualityTestProperty("Modulation", testInfo.modulation.value, testInfo.modulation.grade));
            if (testInfo.reflectanceMargin != null)
                table.append(__createTableRowForQualityTestProperty("ReflectanceMargin", testInfo.reflectanceMargin.value, testInfo.reflectanceMargin.grade));
            if (testInfo.fixedPatternDamage != null)
                table.append(__createTableRowForQualityTestProperty("FixedPatternDamage", testInfo.fixedPatternDamage.value, testInfo.fixedPatternDamage.grade));
            if (testInfo.additionalGrades != null)
                for (var i = 0; i < testInfo.additionalGrades.length; i++)
                    table.append(__createTableRowForQualityTestProperty(testInfo.additionalGrades[i].value, "", testInfo.additionalGrades[i].grade));
            if (testInfo.quietZone != null)
                table.append(__createTableRowForQualityTestProperty("QuietZone", Number(testInfo.quietZone.value).toFixed(2) + "%", testInfo.quietZone.grade));
            table.append(__createTableRowForQualityTestProperty("DistortionAngle", Number(testInfo.distortionAngle.value).toFixed(2) + "°", testInfo.distortionAngle.grade));
            table.append(__createTableRowForQualityTestProperty("ScanGrade", testInfo.scanGrade.value, testInfo.scanGrade.grade));
        }
        htmlMarkupElements.push(table);

        if (testInfo.startPattern != null) {
            //'<hr><b>StartPatternTest:</b><br /><hr> + __createMarkupForISO15416TestResult([testInfo.startPattern]) + <hr>'
            htmlMarkupElements.push(
                __getHr(), __boldText("StartPatternTest:"), __getBr(),
                ...__createMarkupForISO15416TestResult([testInfo.startPattern]), __getHr());
        }
        if (testInfo.centerPattern != null) {
            //'<hr><b>CenterPatternTest:</b><br /><hr> + __createMarkupForISO15416TestResult([testInfo.centerPattern]) + <hr>'
            htmlMarkupElements.push(
                __getHr(), __boldText("CenterPatternTest:"), __getBr(),
                ...__createMarkupForISO15416TestResult([testInfo.centerPattern]), __getHr());
        }
        if (testInfo.stopPattern != null) {
            //'<hr><b>StopPatternTest:</b><br /><hr> + __createMarkupForISO15416TestResult([testInfo.stopPattern]) + <hr>'
            htmlMarkupElements.push(
                __getHr(), __boldText("StopPatternTest:"), __getBr(),
                ...__createMarkupForISO15416TestResult([testInfo.stopPattern]), __getHr());
        }

        return htmlMarkupElements;
    }

    /**
     Creates a HTML markup for quality test property.
     @param {string} propertyName Property name.
     @param {string} value Property value.
     @param {string} grade Property grade.
     @returns {object} Array of elements for HTML markup.
    */
    function __createTableRowForQualityTestProperty(propertyName, value, grade) {
        // '<tr><td style="background-color:#ededed; text-align:left">' + propertyName + '</td><td>' + value + '</td><td>' + grade + '</td></tr>'
        var tr = document.createElement("tr");
        {
            var td = document.createElement("td");
            td.style.backgroundColor = "#ededed";
            td.style.textAlign = "left";
            td.append(propertyName);
            tr.append(td);

            td = document.createElement("td");
            td.append(value);
            tr.append(td);

            td = document.createElement("td");
            td.append(grade);
            tr.append(td);
        }
        return tr;
    }

    /**
     Replaces special HTML characters from the string with HTML code.
     @param {string} sourceString Source string with HTML code.
     @returns {string} String with replaces special HTML characters
    */
    function __replaceSpecialHtmlChars(sourceString) {
        sourceString = sourceString.replace(/</g, '&lt;');
        sourceString = sourceString.replace(/>/g, '&gt;');
        return sourceString;
    }



    // === Utils ===

    /**
     Writes information about barcode recognition process.
     @param {string} message Message.
    */
    function __writeBarcodeInformation(message) {
        var recognizedInformationTextareaObj = _recognizedInformationTextarea.get_DomElement();
        if (recognizedInformationTextareaObj != null) {
            message = message.split("\\n").join('\n')
            recognizedInformationTextareaObj.textContent = message;
        }
    }

}
