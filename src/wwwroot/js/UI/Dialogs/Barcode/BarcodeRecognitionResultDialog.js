/**
 A dialog that displays information about recognized barcode.
*/
BarcodeRecognitionResultDialogJS = function (barcodeReaderHelper, barcodeInfo, barcodeQualityTestInfo) {
    
    // change title "barcodeRecognitionResultDialog" dialog
    var title = Vintasoft.Shared.VintasoftLocalizationJS.getStringConstant("vsdv-barcodeReader-title");
    document.getElementById('barcodeRecognitionResultDialogTitle').innerHTML = title;


    $('#barcodeRecognitionResultDialog').on('show.bs.modal', function () {
        __openBarcodeRecognitionResultDialog(barcodeInfo, barcodeQualityTestInfo);

        $('#barcodeRecognitionResultDialog').off('show.bs.modal');
    });

    // create a modal window with the barcode reading result
    $('#barcodeRecognitionResultDialog').modal('show');



    /**
     Opens a dialog with information about recognized barcode.
     @param {object} barcodeInfo Information about recognized barcode.
     @param {object} barcodeQualityTestInfo Information about print quality test of recognized barcode.
    */
    function __openBarcodeRecognitionResultDialog(barcodeInfo, barcodeQualityTestInfo) {
        $('#barcodeInformationHtml').empty();

        // creates a HTML markup for modal window with the barcode reading result
        var htmlMarkupDiv = barcodeReaderHelper.createHtmlMarkupForBarcodeReadingResult(barcodeInfo, barcodeQualityTestInfo);
        // set the HTML markup of modal window
        $('#barcodeInformationHtml').append(htmlMarkupDiv);
    }

}
