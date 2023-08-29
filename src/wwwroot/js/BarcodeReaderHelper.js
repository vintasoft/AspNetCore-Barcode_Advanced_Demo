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
        var rectangularSelectionTool = __getRectangularSelectionTool(_imageViewer);
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
            var rectangularSelectionTool = __getRectangularSelectionTool(imageViewer);
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
        var compositeTool = imageViewer.get_VisualTool();
        if (compositeTool != null)
            // get the highlight tool
            return compositeTool.getTool(0);
    }

    /**
     Returns the rectangular selection tool.
     @param {object} imageViewer Image viewer.
    */
    function __getRectangularSelectionTool(imageViewer) {
        var compositeTool = imageViewer.get_VisualTool();
        if (compositeTool != null)
            // get the rectangular selection tool
            return compositeTool.getTool(2);
    }


    // === Create highlight objects ===

    /**
     Returns text information about recognized barcodes.
     @param {object} barcodeInfoArray An array with information about recognized barcodes.
    */
    function __getTextInformationAboutBarcodes(barcodeInfoArray) {
        var information = "";
        if (barcodeInfoArray.length == 0) {
            // show a message with the barcode recognition result
            information += 'No barcodes found.\n\n You should try to change barcode recognition settings, for example decrease scan interval, add new scan direction, etc if you are sure that image contains a barcode.\n\n Please send image with barcode to support@vintasoft.com if you cannot recognize barcode - we will do the best to help you.';
        }
        // else
        else {
            // show the count of recognized barcodes
            information += 'Recognized barcodes: ' + barcodeInfoArray.length + '.\n\n';
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

                // create a string with information about barcode
                information += '[' + (i + 1) + ':' + barcodeInfo.barcodeType + ']\n' +
                    'Value: ' + barcodeValue + '\n' +
                    'Confidence: ' + barcodeInfo.confidence + '\n' +
                    'ReadingQuality: ' + barcodeInfo.readingQuality.toFixed(2) + '\n' +
                    'Threshold: ' + barcodeInfo.threshold + '\n' +
                    'Region: ' +
                    'LT=(' + barcodeInfo.region.leftTop.x + ',' + barcodeInfo.region.leftTop.y +
                    '); RT=(' + barcodeInfo.region.rightTop.x + ',' + barcodeInfo.region.rightTop.y +
                    '); LB=(' + barcodeInfo.region.leftBottom.x + ',' + barcodeInfo.region.leftBottom.y +
                    '); RB=(' + barcodeInfo.region.rightBottom.x + ',' + barcodeInfo.region.rightBottom.y + '); ' +
                    'Angle=' + barcodeInfo.region.angle.toFixed(1) + '°\n\n';
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


    // === Create HTML markup for barcode recognition result ===

    /**
     Creates a HTML markup for modal window with the barcode reading result.
     @param {object} barcodeInfo Information about barcode.
     @param {object} barcodeQualityTestInfo Information about quality test.
    */
    BarcodeReaderHelperJS.prototype.createHtmlMarkupForBarcodeReadingResult = function (barcodeInfo, barcodeQualityTestInfo) {
        var htmlMarkup = '<b>BarcodeType: </b>' + barcodeInfo.barcodeType + '<br />';

        if (barcodeInfo.barcodeType == "Mailmark CMDM Type7" || barcodeInfo.barcodeType == "Mailmark CMDM Type9" || barcodeInfo.barcodeType == "Mailmark CMDM Type29") {
            htmlMarkup += '<b>Value: </b><br />';
            htmlMarkup += __createMarkupWithInformationAboutMailmarkCMDMBarcode(barcodeInfo, true, '<br />') + '<br />';
            htmlMarkup += '<b>Base value: </b>' + __replaceSpecialHtmlChars(barcodeInfo.baseValue) + '<br />';
        }
        else if (barcodeInfo.barcodeType == "PPN") {
            htmlMarkup += '<b>Value: </b><br />';
            htmlMarkup += __createMarkupWithInformationAboutPpnBarcode(barcodeInfo, true, '<br />') + '<br />';
            htmlMarkup += '<b>Base value: </b>' + __replaceSpecialHtmlChars(barcodeInfo.baseValue) + '<br />';
        }
        else if (barcodeInfo.barcodeType == "AAMVA") {
            htmlMarkup += '<b>Value: </b><br />';
            htmlMarkup += __createMarkupWithInformationAboutAamvaBarcode(barcodeInfo, true, '<br />') + '<br />';
            htmlMarkup += '<b>Base value: </b>' + __replaceSpecialHtmlChars(barcodeInfo.baseValue) + '<br />';
        }
        else if (barcodeInfo.barcodeType == "Swiss QR Code") {
            htmlMarkup += '<b>Value: </b><br />';
            htmlMarkup += __createMarkupWithInformationAboutSwissQrCodeBarcode(barcodeInfo, true, '<br />') + '<br />';
            htmlMarkup += '<b>Base value: </b>' + __replaceSpecialHtmlChars(barcodeInfo.baseValue) + '<br />';
        }
        else {
            htmlMarkup += '<b>Value: </b>' + __replaceSpecialHtmlChars(barcodeInfo.value) + '<br />';
            if (barcodeInfo.baseValue != null && barcodeInfo.value != barcodeInfo.baseValue) {
                htmlMarkup += '<b>Base value: </b>' + __replaceSpecialHtmlChars(barcodeInfo.baseValue) + '<br />';
            }
        }

        htmlMarkup += '<b>Confidence: </b>' + barcodeInfo.confidence + '<br />';
        htmlMarkup += '<b>ReadingQuality: </b>' + barcodeInfo.readingQuality.toFixed(2) + '<br />';
        htmlMarkup += '<b>Threshold: </b>' + barcodeInfo.threshold + '<br />';
        htmlMarkup += '<b>Region: </b>' + 'LT=(' + barcodeInfo.region.leftTop.x + ',' + barcodeInfo.region.leftTop.y + '); RT=(' + barcodeInfo.region.rightTop.x + ',' + barcodeInfo.region.rightTop.y +
            '); LB=(' + barcodeInfo.region.leftBottom.x + ',' + barcodeInfo.region.leftBottom.y + '); RB=(' + barcodeInfo.region.rightBottom.x + ',' + barcodeInfo.region.rightBottom.y + '); ' + 'Angle' + '=' +
            barcodeInfo.region.angle.toFixed(1) + '°<br />';
        // 1D
        if (barcodeInfo.narrowBarCount) {
            htmlMarkup += '<b>NarrowBarCount: </b>' + barcodeInfo.narrowBarCount + '<br />';
            htmlMarkup += '<b>NarrowBarSize: </b>' + barcodeInfo.narrowBarSize.toFixed(2) + '<br /><br />';
        }
        // 2D
        else if (barcodeInfo.matrixSize) {
            htmlMarkup += '<b>MatrixSize: </b>' + barcodeInfo.matrixSize.x + "x" + barcodeInfo.matrixSize.y + '<br />';
            htmlMarkup += '<b>CellSize: </b>' + barcodeInfo.cellSize.x.toFixed(2) + "x" + barcodeInfo.cellSize.y.toFixed(2) + '<br />';
            if (barcodeInfo.bulleyeCenter != null)
                htmlMarkup += '<b>BulleyeCenter: </b>(' + barcodeInfo.bulleyeCenter.x.toFixed(2) + "," + barcodeInfo.bulleyeCenter.y.toFixed(2) + ')<br />';
            htmlMarkup += "<br />"
        }
        htmlMarkup += '<b>HEXValue: </b><br /><div style="font-family:\'Courier New\'">' + barcodeInfo.hexValue + '</div>';

        if (barcodeQualityTestInfo != null) {
            htmlMarkup += "<br /><b>QualityTestInformation</b>:<br />";
            if (barcodeQualityTestInfo.tests != null) {
                htmlMarkup += __createMarkupForISO15416TestResult(barcodeQualityTestInfo.tests);
            }
            else {
                htmlMarkup += __createMarkupForISO15415TestResult(barcodeQualityTestInfo);
            }
        }

        return htmlMarkup;
    }

    /**
     Creates a HTML markup with information about recognized Mailmark CMDM barcode.
     @param {object} barcodeInfo Information about barcode.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {string} brText A string that should be used as line break symbol.
    */
    function __createMarkupWithInformationAboutMailmarkCMDMBarcode(barcodeInfo, isBoldParameterTitle, brText) {
        var htmlMarkup = __createMarkupForBarcodeInfoParameter('UPU Country ID', barcodeInfo.decodedValue.upuCountryId, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Information type ID', barcodeInfo.decodedValue.informationTypeId, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Version ID', barcodeInfo.decodedValue.versionId, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Item class', barcodeInfo.decodedValue.itemClass, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Supply chain ID', barcodeInfo.decodedValue.supplyChainId, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Item ID', barcodeInfo.decodedValue.itemId, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('DPS', barcodeInfo.decodedValue.dps, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('RTS flag', barcodeInfo.decodedValue.rtsFlag, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Return to sender post code', barcodeInfo.decodedValue.returnToSenderPostCode, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Reserved', barcodeInfo.decodedValue.reserved, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Customer content', barcodeInfo.decodedValue.customerContent, isBoldParameterTitle, '');
        return htmlMarkup;
    }

    /**
     Creates a HTML markup with information about recognized PNP barcode.
     @param {object} barcodeInfo Information about barcode.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {string} brText A string that should be used as line break symbol.
    */
    function __createMarkupWithInformationAboutPpnBarcode(barcodeInfo, isBoldParameterTitle, brText) {
        var htmlMarkup = __createMarkupForBarcodeInfoParameter('Batch number', barcodeInfo.decodedValue.batchNumber, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Date of manufacture', barcodeInfo.decodedValue.dateOfManufacture, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Expiry date', barcodeInfo.decodedValue.expiryDate, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('GTIN', barcodeInfo.decodedValue.GTIN, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Pharmacy product number', barcodeInfo.decodedValue.pharmacyProductNumber, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Serial number', barcodeInfo.decodedValue.serialNumber, isBoldParameterTitle, '');
        return htmlMarkup;
    }

    /**
     Creates a HTML markup with information about recognized AAMVA barcode.
     @param {object} barcodeInfo Information about barcode.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {string} brText A string that should be used as line break symbol.
    */
    function __createMarkupWithInformationAboutAamvaBarcode(barcodeInfo, isBoldParameterTitle, brText) {
        var htmlMarkup = __createMarkupForBarcodeInfoParameter('Version level', barcodeInfo.versionLevel, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Issuer identification number', barcodeInfo.issuerIdentificationNumber, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Jurisdiction version number', barcodeInfo.jurisdictionVersionNumber, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('License number', barcodeInfo.licenseNumber, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Expiration date', barcodeInfo.expirationDate, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('IssueDate', barcodeInfo.issueDate, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Date of birth', barcodeInfo.dateOfBirth, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Card revision date', barcodeInfo.cardRevisionDate, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Family name', barcodeInfo.familyName, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('First name', barcodeInfo.firstName, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Middle name', barcodeInfo.middleName, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Sex', barcodeInfo.sex, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Height', barcodeInfo.height, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Eye color', barcodeInfo.eyeColor, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Hair color', barcodeInfo.hairColor, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Country ID', barcodeInfo.countryId, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Address street 1', barcodeInfo.addressStreet1, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Address street 2', barcodeInfo.addressStreet2, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Address city', barcodeInfo.addressCity, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Address state code', barcodeInfo.addressStateCode, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Address postal code', barcodeInfo.addressPostalCode, isBoldParameterTitle, '');
        return htmlMarkup;
    }

    /**
     Creates a HTML markup with information about recognized Swiss QR Code barcode.
     @param {object} barcodeInfo Information about barcode.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {string} brText A string that should be used as line break symbol.
    */
    function __createMarkupWithInformationAboutSwissQrCodeBarcode(barcodeInfo, isBoldParameterTitle, brText) {
        var htmlMarkup = __createMarkupForBarcodeInfoParameter('QR type', barcodeInfo.decodedValue.qrType, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Version', barcodeInfo.decodedValue.version, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Coding type', barcodeInfo.decodedValue.codingType, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('IBAN', barcodeInfo.decodedValue.IBAN, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Creditor address type', barcodeInfo.decodedValue.creditorAddressType, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Creditor name', barcodeInfo.decodedValue.creditorName, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Creditor street or address line 1', barcodeInfo.decodedValue.creditorStreetOrAddressLine1, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Creditor building number or address line 2', barcodeInfo.decodedValue.creditorBuildingNumberOrAddressLine2, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Creditor postal code', barcodeInfo.decodedValue.creditorPostalCode, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Creditor town', barcodeInfo.decodedValue.creditorTown, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Creditor country', barcodeInfo.decodedValue.creditorCountry, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate creditor address type', barcodeInfo.decodedValue.ultimateCreditorAddressType, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate creditor name', barcodeInfo.decodedValue.ultimateCreditorName, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate creditor street or address line 1', barcodeInfo.decodedValue.ultimateCreditorStreetOrAddressLine1, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate creditor building number or address line 2', barcodeInfo.decodedValue.ultimateCreditorBuildingNumberOrAddressLine2, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate creditor postal code', barcodeInfo.decodedValue.ultimateCreditorPostalCode, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate creditor town', barcodeInfo.decodedValue.ultimateCreditorTown, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate creditor country', barcodeInfo.decodedValue.ultimateCreditorCountry, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Amount', barcodeInfo.decodedValue.amount, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Amount currency', barcodeInfo.decodedValue.amountCurrency, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate debtor address type', barcodeInfo.decodedValue.ultimateDebtorAddressType, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate debtor name', barcodeInfo.decodedValue.ultimateDebtorName, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate debtor street or address line 1', barcodeInfo.decodedValue.ultimateDebtorStreetOrAddressLine1, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate debtor building number or address line 2', barcodeInfo.decodedValue.ultimateDebtorBuildingNumberOrAddressLine2, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate debtor postal code', barcodeInfo.decodedValue.ultimateDebtorPostalCode, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate debtor town', barcodeInfo.decodedValue.ultimateDebtorTown, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Ultimate debtor country', barcodeInfo.decodedValue.ultimateDebtorCountry, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Payment reference type', barcodeInfo.decodedValue.paymentReferenceType, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Payment reference', barcodeInfo.decodedValue.paymentReference, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Unstructured message', barcodeInfo.decodedValue.unstructuredMessage, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Bill information', barcodeInfo.decodedValue.billInformation, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Alternative scheme parameters 1', barcodeInfo.decodedValue.alternativeSchemeParameters1, isBoldParameterTitle, brText);
        htmlMarkup += __createMarkupForBarcodeInfoParameter('Alternative scheme parameters 2', barcodeInfo.decodedValue.alternativeSchemeParameters2, isBoldParameterTitle, '');
        return htmlMarkup;
    }

    /**
     Creates a HTML markup with information about barcode info parameter.
     @param {string} barcodeInfoParamTitle Title of barcode info parameter.
     @param {string} barcodeInfoParamValue Value of barcode info parameter.
     @param {boolean} isBoldTextLabel A value indicating whether the parameter title must be shown using bold font.
     @param {string} brText A string that should be used as line break symbol.
    */
    function __createMarkupForBarcodeInfoParameter(barcodeInfoParamTitle, barcodeInfoParamValue, isBoldParameterTitle, brText) {
        var labelStart = '', labelEnd = '';
        if (isBoldParameterTitle) {
            labelStart = '<b>';
            labelEnd = '</b>';
        }
        return labelStart + '- ' + barcodeInfoParamTitle + ': ' + labelEnd + barcodeInfoParamValue + brText;
    }

    /**
     Creates a HTML markup for ISO15416 barcode print quality test information.
     @param {object} testInfo Information about quality test.
     @returns {string} HTML markup.
    */
    function __createMarkupForISO15416TestResult(testInfo) {
        var htmlMarkup = '';
        for (var i = 0; i < testInfo.length; i++) {
            if (testInfo.length > 1)
                htmlMarkup += '<br /><hr><b>SymbolComponent ' + (i + 1) + ':</b><br /><hr>';
            symbol = testInfo[i];
            htmlMarkup += '<table style="text-align:center; width:100%">';
            htmlMarkup += '<tr style="background-color:#DBD7D7"><td><b>Parameter</b></td><td><b>Value</b></td><td><b>Grade</b></td></tr>';
            if (symbol.decode != null)
                htmlMarkup += __createTableRowForQualityTestProperty("Decode", symbol.decode.value, symbol.decode.grade);
            htmlMarkup += __createTableRowForQualityTestProperty("MaxReflectance", Number(symbol.maxReflectance.value).toFixed(1) + "%", symbol.maxReflectance.grade);
            htmlMarkup += __createTableRowForQualityTestProperty("MinReflectance", Number(symbol.minReflectance.value).toFixed(1) + "%", symbol.minReflectance.grade);
            htmlMarkup += __createTableRowForQualityTestProperty("GlobalThreshold", Number(symbol.globalThreshold.value).toFixed(1) + "%", symbol.globalThreshold.grade);
            htmlMarkup += __createTableRowForQualityTestProperty("SymbolContrast", Number(symbol.symbolContrast.value).toFixed(1) + "%", symbol.symbolContrast.grade);
            htmlMarkup += __createTableRowForQualityTestProperty("MinEdgeContrast", Number(symbol.minEdgeContrast.value).toFixed(1) + "%", symbol.minEdgeContrast.grade);
            htmlMarkup += __createTableRowForQualityTestProperty("Modulation", Number(symbol.modulation.value).toFixed(2), symbol.modulation.grade);
            htmlMarkup += __createTableRowForQualityTestProperty("Defects", Number(symbol.defects.value).toFixed(2), symbol.defects.grade);
            if (symbol.decodability != null)
                htmlMarkup += __createTableRowForQualityTestProperty("Decodability", Number(symbol.decodability.value).toFixed(2), symbol.decodability.grade);
            htmlMarkup += __createTableRowForQualityTestProperty("ScanGrade", symbol.scanGrade.value, symbol.scanGrade.grade);
            htmlMarkup += '</table>';
        }
        return htmlMarkup;
    }

    /**
     Creates a HTML markup for ISO15415 barcode print quality test information.
     @param {object} testInfo Information about quality test.
     @returns {string} HTML markup.
    */
    function __createMarkupForISO15415TestResult(testInfo) {
        var htmlMarkup = '';
        htmlMarkup += '<table style="text-align:center; width:100%">';
        htmlMarkup += '<tr style="background-color:#DBD7D7"><td><b>Parameter</b></td><td><b>Value</b></td><td><b>Grade</b></td></tr>';
        htmlMarkup += __createTableRowForQualityTestProperty("Decode", testInfo.decode.value, testInfo.decode.grade);
        htmlMarkup += __createTableRowForQualityTestProperty("UnusedErrorCorrection", Number(testInfo.unusedErrorCorrection.value).toFixed(2) + "%", testInfo.unusedErrorCorrection.grade);
        if (testInfo.codewordYield != null)
            htmlMarkup += __createTableRowForQualityTestProperty("CodewordYield", testInfo.codewordYield.value + "%", testInfo.codewordYield.grade);
        if (testInfo.codewordPrintQualityModulation != null)
            htmlMarkup += __createTableRowForQualityTestProperty("CodewordPrintQualityModulation", testInfo.codewordPrintQualityModulation.value, testInfo.codewordPrintQualityModulation.grade);
        if (testInfo.codewordPrintQualityDefects != null)
            htmlMarkup += __createTableRowForQualityTestProperty("CodewordPrintQualityDefects", testInfo.codewordPrintQualityDefects.value, testInfo.codewordPrintQualityDefects.grade);
        if (testInfo.codewordPrintQualityDecodability != null)
            htmlMarkup += __createTableRowForQualityTestProperty("CodewordPrintQualityDecodability", testInfo.codewordPrintQualityDecodability.value, testInfo.codewordPrintQualityDecodability.grade);
        if (testInfo.codewordPrintQuality != null)
            htmlMarkup += __createTableRowForQualityTestProperty("CodewordPrintQuality", testInfo.codewordPrintQuality.value, testInfo.codewordPrintQuality.grade);
        if (testInfo.maxReflectance != null)
            htmlMarkup += __createTableRowForQualityTestProperty("MaxReflectance", Number(testInfo.maxReflectance.value).toFixed(2) + "%", testInfo.maxReflectance.grade);
        if (testInfo.minReflectance != null)
            htmlMarkup += __createTableRowForQualityTestProperty("MinReflectance", Number(testInfo.minReflectance.value).toFixed(2) + "%", testInfo.minReflectance.grade);
        if (testInfo.symbolContrast != null)
            htmlMarkup += __createTableRowForQualityTestProperty("SymbolContrast", Number(testInfo.symbolContrast.value).toFixed(2) + "%", testInfo.symbolContrast.grade);
        if (testInfo.axialNonuniformity != null)
            htmlMarkup += __createTableRowForQualityTestProperty("AxialNonuniformity", Number(testInfo.axialNonuniformity.value).toFixed(2), testInfo.axialNonuniformity.grade);
        if (testInfo.gridNonuniformity != null)
            htmlMarkup += __createTableRowForQualityTestProperty("GridNonuniformity", Number(testInfo.gridNonuniformity.value).toFixed(2) + " cell", testInfo.gridNonuniformity.grade);
        if (testInfo.modulation != null)
            htmlMarkup += __createTableRowForQualityTestProperty("Modulation", testInfo.modulation.value, testInfo.modulation.grade);
        if (testInfo.reflectanceMargin != null)
            htmlMarkup += __createTableRowForQualityTestProperty("ReflectanceMargin", testInfo.reflectanceMargin.value, testInfo.reflectanceMargin.grade);
        if (testInfo.fixedPatternDamage != null)
            htmlMarkup += __createTableRowForQualityTestProperty("FixedPatternDamage", testInfo.fixedPatternDamage.value, testInfo.fixedPatternDamage.grade);
        if (testInfo.additionalGrades != null)
            for (var i = 0; i < testInfo.additionalGrades.length; i++)
                htmlMarkup += __createTableRowForQualityTestProperty(testInfo.additionalGrades[i].value, "", testInfo.additionalGrades[i].grade);

        if (testInfo.quietZone != null)
            htmlMarkup += __createTableRowForQualityTestProperty("QuietZone", Number(testInfo.quietZone.value).toFixed(2) + "%", testInfo.quietZone.grade);
        htmlMarkup += __createTableRowForQualityTestProperty("DistortionAngle", Number(testInfo.distortionAngle.value).toFixed(2) + "°", testInfo.distortionAngle.grade);
        htmlMarkup += __createTableRowForQualityTestProperty("ScanGrade", testInfo.scanGrade.value, testInfo.scanGrade.grade);
        htmlMarkup += '</table>';

        if (testInfo.startPattern != null) {
            htmlMarkup += '<hr><b>StartPatternTest</b>:<br /><hr>';
            htmlMarkup += __createMarkupForISO15416TestResult([testInfo.startPattern]);
            htmlMarkup += '<hr>';
        }
        if (testInfo.centerPattern != null) {
            htmlMarkup += '<b>CenterPatternTest</b>:<br /><hr>';
            htmlMarkup += __createMarkupForISO15416TestResult([testInfo.centerPattern]);
            htmlMarkup += '<hr>';
        }
        if (testInfo.stopPattern != null) {
            htmlMarkup += '<b>StopPatternTest</b>:<br /><hr>';
            htmlMarkup += __createMarkupForISO15416TestResult([testInfo.stopPattern]);
            htmlMarkup += '<hr>';
        }

        return htmlMarkup;
    }

    /**
     Creates a HTML markup for quality test property.
     @param {string} propertyName Property name.
     @param {string} value Property value.
     @param {string} grade Property grade.
    */
    function __createTableRowForQualityTestProperty(propertyName, value, grade) {
        var style = 'style="background-color:#DBD7D7; text-align:left"';
        return '<tr><td ' + style + '>' + propertyName + '</td><td>' + value + '</td><td>' + grade + '</td></tr>';
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
