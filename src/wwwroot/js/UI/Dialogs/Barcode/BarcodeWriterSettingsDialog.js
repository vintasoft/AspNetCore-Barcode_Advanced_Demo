/**
 A dialog that allows to view and edit the barcode writer settings.
*/
BarcodeWriterSettingsDialogJS = function () {

    /**
     Gets the barcode writer settings.
    */
    BarcodeWriterSettingsDialogJS.prototype.get_Settings = function () {
        return this._activeSettings;
    }

    /**
     Shows a modal window with barcode writer settings.
    */
    BarcodeWriterSettingsDialogJS.prototype.show = function () {
        if (!this._markupCreated) {
            // create markup
            this._1dBarcoderSettingsControl.createMarkup();
            this._2dBarcoderSettingsControl.createMarkup();
            this._markupCreated = true;
        }
        // change visibility of PropertyGridControlJS 
        __barcodeDimensionChanged(this);

        $("#barcodeWriterSettingDialog").modal('show');
    }

    /**
     Barcode dimensions are changed.
    */
    function __barcodeDimensionChanged(dialog) {
        var currentDimension = $("#barcodeDimensionSelect").val();
        var activeDivID, nonActiveDivID;
        // active 1D settings
        if (currentDimension === "1D") {
            dialog._activeSettings = dialog._barcode1DWriterSettings;
            // get ID of active placeholder
            activeDivID = dialog._1dBarcoderSettingsControl.get_PlaceHolderID();
            // get ID of none active placeholder
            nonActiveDivID = dialog._2dBarcoderSettingsControl.get_PlaceHolderID();
        }
        else {
            dialog._activeSettings = dialog._barcode2DWriterSettings;
            activeDivID = dialog._2dBarcoderSettingsControl.get_PlaceHolderID();
            nonActiveDivID = dialog._1dBarcoderSettingsControl.get_PlaceHolderID();
        }
        // make active div visible
        $("#" + activeDivID).css("display", "block");
        // make other invisible
        $("#" + nonActiveDivID).css("display", "none");
    }



    var that = this;
    // barcode writer settings
    this._barcode1DWriterSettings = new Vintasoft.Barcode.Web1DBarcodeWriterSettingsJS();
    this._barcode2DWriterSettings = new Vintasoft.Barcode.Web2DBarcodeWriterSettingsJS();
    this._activeSettings = this._barcode1DWriterSettings;

    this._markupCreated = false;

    // PropertyGridControl settings
    var _propertyControlSettings = {
        hideNestedElements: false,
        showReadOnlyElements: false
    };

    // create WebPropertyGridJS object for _barcode1DWriterSettings
    var propertyGrid = new Vintasoft.Shared.WebPropertyGridJS(this._barcode1DWriterSettings);
    // create PropertyGridControlJS
    this._1dBarcoderSettingsControl = new PropertyGridControlJS(propertyGrid, "Barcode1DSettingsPropertyGrid", _propertyControlSettings);

    propertyGrid = new Vintasoft.Shared.WebPropertyGridJS(this._barcode2DWriterSettings);
    this._2dBarcoderSettingsControl = new PropertyGridControlJS(propertyGrid, "Barcode2DSettingsPropertyGrid", _propertyControlSettings);

    $("#barcodeDimensionSelect").on("change", function () {
        __barcodeDimensionChanged(that);
    });

}