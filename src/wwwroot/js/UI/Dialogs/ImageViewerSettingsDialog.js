/**
 A dialog that allows to change settings of image viewer.
*/
ImageViewerSettingsDialogJS = function (viewer) {

    ImageViewerSettingsDialogJS.prototype.show = function () {
        __initialize(this);

        $('#imageViewerSettingsDialog').modal('show');
    }

    /**
     Creates a dialog with image viewer settings.
    */
    function __create(dialog) {
        $('#imageViewerSettingsDialogOkButton').on('click', function () {
            if (__applySettingsToViewer(dialog)) {
                $('#imageViewerSettingsDialog').modal('hide');
            }
        });

        $('#imageViewerSettingsDialogCancelButton').on('click', function () {
            $('#imageViewerSettingsDialog').modal('hide');
        });

        return false;
    }

    /**
     Initializes an image viewer settings dialog.
    */
    function __initialize(dialog) {
        // get image viewer
        var viewer = dialog._viewer;

        // get image viewer settings
        var renderingSettings = viewer.get_RenderingSettings();
        var centerImage = viewer.get_CenterImage();
        var resizeTimeout = viewer.get_ResizeTimeout();
        var tileSize = viewer.get_TileSize()
        var tileHeight = tileSize.height;

        // get background color of image viewer
        var backgroundColor = viewer.get_Control().style.backgroundColor;

        var tileSizeValue = "512x512";
        // set information about tile size
        switch (tileHeight) {
            case 1024:
                tileSizeValue = "1024x1024";
                break;
            case 2048:
                tileSizeValue = "2048x2048";
                break;
        }
        document.getElementById("imageViewerTileSize").value = tileSizeValue;

        // define that image viewer uses the default rendering settings
        var isDefaultRenderingSettings = renderingSettings == null || renderingSettings.isEmpty();
        // initialize "default rendering settings" checkbox
        document.getElementById("imageViewerDefaultRendSettingsCheckbox").checked = isDefaultRenderingSettings ? "checked" : "";
        // get resolution
        var resolution = null;
        if (renderingSettings != null)
            resolution = renderingSettings.get_Resolution();
        else
            resolution = { x: 96, y: 96 };
        // if image viewer uses the default settings
        if (isDefaultRenderingSettings) {
            resolution = { x: 96, y: 96 };
            if (renderingSettings == null)
                renderingSettings = __createRenderingSettings(renderingSettings);
        }

        // change state of custom rendering settings
        __changeStateOfCustomRenderingSettings(isDefaultRenderingSettings ? "disabled" : "");

        // set information about resolution
        document.getElementById("imageViewerRendSettingsHorRes").value = resolution.x;
        document.getElementById("imageViewerRendSettingsVertRes").value = resolution.y;

        // get interpolation mode
        var interpolation = renderingSettings.get_InterpolationMode();
        // set information about interpolation
        document.getElementById("imageViewerRendSettingsInterpolation").value = interpolation.toString();

        // get smoothing mode
        var smoothingMode = renderingSettings.get_SmoothingMode();
        // set information about smoothing
        document.getElementById("imageViewerRendSettingsSmoothing").value = smoothingMode.toString();

        var pdfSettings = __getPdfRenderingSettings(renderingSettings);
        if (pdfSettings != null) {
            var drawNonMarkupAnnotation = pdfSettings.get_DrawNonMarkupAnnotations()
            document.getElementById("drawNonMarkupAnnotations").checked = drawNonMarkupAnnotation ? "checked" : "";
        }

        var isColorManagementEnabled = false;
        if (dialog._decodingSettings) {
            isColorManagementEnabled = dialog._decodingSettings.get_IsColorManagementEnabled()
        }
        // set information about color management
        document.getElementById("imageViewerColorManagementCheckbox").checked = isColorManagementEnabled ? "checked" : "";

        // set information about "centerImage" property
        document.getElementById("imageViewerCenterImageCheckbox").checked = centerImage ? "checked" : "";

        // set information about "resizeTimeout" property
        document.getElementById("imageViewerResizeTimeoutInput").value = resizeTimeout;

        // set information about background color
        document.getElementById("imageViewerBackgroundColor").value = backgroundColor;

        // set status of useVectorRenderingForDocumentsCheckbox checkbox
        document.getElementById("useVectorRenderingForDocumentsCheckbox").checked = viewer.get_UseVectorRendering() ? "checked" : "";
        // set information about background color for vector content
        document.getElementById("vectorContentBackgroundColor").value = viewer.get_VectorContentBackgroundColor();

        var imageAnchor = viewer.get_ImageAnchor();
        var multipageDisplayMode = viewer.get_MultipageDisplayMode();
        var multipageLayoutDirection = viewer.get_MultipageDisplayLayoutDirection();
        var multipageImagesInRow = viewer.get_MultipageDisplayRowCount();
        var useAppearanceInSinglePageMode = viewer.get_UseImageAppearancesInSinglePageMode();
        var multipageImagesPadding = viewer.get_MultipageDisplayImagePadding();

        document.getElementById("imageAnchorSelect").value = imageAnchor.toString();
        document.getElementById("multipageDisplayModeSelect").value = multipageDisplayMode.toString();
        document.getElementById("multipageLayoutDirectionSelect").value = multipageLayoutDirection.toString();
        document.getElementById("multipageImagesInRowInput").value = multipageImagesInRow;
        document.getElementById("multipageImagesPadding").value = multipageImagesPadding[0];

        document.getElementById("useAppearanceInSinglePageMode").checked = useAppearanceInSinglePageMode ? "checked" : "";

        var imageAppearance = viewer.get_ImageAppearance();

        document.getElementById("imageAppearanceBackColorInput").value = imageAppearance.get_BackColor();
        document.getElementById("imageAppearanceBorderColorInput").value = imageAppearance.get_BorderColor();
        document.getElementById("imageAppearanceBorderWidthInput").value = imageAppearance.get_BorderWidth();

        var focusedImageAppearance = viewer.get_FocusedImageAppearance();

        document.getElementById("focusedImageAppearanceBackColorInput").value = focusedImageAppearance.get_BackColor();
        document.getElementById("focusedImageAppearanceBorderColorInput").value = focusedImageAppearance.get_BorderColor();
        document.getElementById("focusedImageAppearanceBorderWidthInput").value = focusedImageAppearance.get_BorderWidth();
    }

    /**
     The "Default settings" checkbox is changed.
    */
    function __useDefaultRenderingSettingsCheckboxChanged(event) {
        // change state of custom rendering settings
        __changeStateOfCustomRenderingSettings(this.checked ? "disabled" : "");
    }

    /**
     Changes state of custom rendering settings.
    */
    function __changeStateOfCustomRenderingSettings(isDisabled) {
        var tdElements = document.querySelectorAll(".customRenderingSettings td");
        for (var i = 0; i < tdElements.length; i++) {
            var tdElement = tdElements[i];
            for (j = 0; j < tdElement.children.length; j++) {
                var thElementChild = tdElement.children[j];
                thElementChild.disabled = isDisabled;
            }
        }
    }

    /**
     Applies the settings to the image viewer.
    */
    function __applySettingsToViewer(dialog) {
        // get image viewer
        var viewer = dialog._viewer;
        // get background color
        var backgroundColor = document.getElementById("imageViewerBackgroundColor").value;
        // create rendering settings
        var renderingSettings = __createRenderingSettings();
        // if custom settings are used
        if (!document.getElementById("imageViewerDefaultRendSettingsCheckbox").checked) {
            // get information about resolution
            var resX = parseFloat(document.getElementById("imageViewerRendSettingsHorRes").value);
            var resY = parseFloat(document.getElementById("imageViewerRendSettingsVertRes").value);
            // get information about interpolation mode
            var interpolation = document.getElementById("imageViewerRendSettingsInterpolation").value;
            // get information about smoothing mode
            var smoothing = document.getElementById("imageViewerRendSettingsSmoothing").value;

            if (isNaN(resX) || isNaN(resY) || resX <= 0 || resY <= 0) {
                alert("Wrong parameters!");
                __initialize(dialog);
                return false;
            }

            // change rendering settings
            renderingSettings.set_Resolution({ x: resX, y: resY });
            renderingSettings.set_InterpolationMode(interpolation);
            renderingSettings.set_SmoothingMode(smoothing);

            var pdfSettings = __getPdfRenderingSettings(renderingSettings);
            if (pdfSettings != null) {
                var drawNonMarkupAnnotation = document.getElementById("drawNonMarkupAnnotations").checked;
                pdfSettings.set_DrawNonMarkupAnnotations(drawNonMarkupAnnotation);
            }
        }

        // get information about color management
        var useDecodingSettings = document.getElementById("imageViewerColorManagementCheckbox").checked;
        // if color management is used
        if (useDecodingSettings) {
            // create decoding settings
            dialog._decodingSettings = new Vintasoft.Shared.WebDecodingSettingsJS();
            // subscribe to the "change" event of image collection
            Vintasoft.Shared.subscribeToEvent(viewer.get_Images(), "changed", __imageViewerImagesChanged);
        }
        // else
        else {
            // clear information about decoding settings
            dialog._decodingSettings = null;
            // unsubscribe from the "change" event of image collection
            Vintasoft.Shared.unsubscribeFromEvent(viewer.get_Images(), "changed", __imageViewerImagesChanged);
        }

        // new tile size
        var tileSize;
        switch (document.getElementById("imageViewerTileSize").value) {
            case "512x512":
                tileSize = { width: 512, height: 512 };
                break;
            case "1024x1024":
                tileSize = { width: 1024, height: 1024 };
                break;
            case "2048x2048":
                tileSize = { width: 2048, height: 2048 };
                break;
        }

        // need center image
        var centerImage = document.getElementById("imageViewerCenterImageCheckbox").checked;

        // viewer resize timeout
        var viewerResizeTimeout = document.getElementById("imageViewerResizeTimeoutInput").value;

        // change the background color
        viewer.get_Control().style.backgroundColor = backgroundColor;

        // get a value indicating whether image viewer should use vector rendering for documents
        var useVectorRenderingForDocuments = document.getElementById("useVectorRenderingForDocumentsCheckbox").checked;

        // get the background color for vector content
        var vectorContentBackgroundColor = document.getElementById("vectorContentBackgroundColor").value;

        var imageAnchor = document.getElementById("imageAnchorSelect").value;
        var useAppearanceInSinglePageMode = document.getElementById("useAppearanceInSinglePageMode").checked;
        var multipageDisplayMode = document.getElementById("multipageDisplayModeSelect").value;
        var multipageLayoutDirection = document.getElementById("multipageLayoutDirectionSelect").value;
        var multipageImagesInRow = parseInt(document.getElementById("multipageImagesInRowInput").value);
        var multipageImagesPadding = parseInt(document.getElementById("multipageImagesPadding").value);

        var imageAppearanceBackColor = document.getElementById("imageAppearanceBackColorInput").value;
        var imageAppearanceBorderColor = document.getElementById("imageAppearanceBorderColorInput").value;
        var imageAppearanceBorderWidth = parseInt(document.getElementById("imageAppearanceBorderWidthInput").value);

        var focusedImageAppearanceBackColor = document.getElementById("focusedImageAppearanceBackColorInput").value;
        var focusedImageAppearanceBorderColor = document.getElementById("focusedImageAppearanceBorderColorInput").value;
        var focusedImageAppearanceBorderWidth = parseInt(document.getElementById("focusedImageAppearanceBorderWidthInput").value);

        if (isNaN(multipageImagesInRow) || isNaN(multipageImagesPadding) || multipageImagesInRow < 1 || multipageImagesPadding < 0
            || isNaN(imageAppearanceBorderWidth) || isNaN(focusedImageAppearanceBorderWidth) || imageAppearanceBorderWidth < 0
            || focusedImageAppearanceBorderWidth < 0) {
            alert("Wrong parameters!");
            __initialize(dialog);
            return false;
        }

        viewer.beginInit();

        // apply changes
        viewer.set_RenderingSettings(renderingSettings);
        viewer.set_CenterImage(centerImage);
        viewer.set_ResizeTimeout(viewerResizeTimeout);
        viewer.set_TileSize(tileSize);

        viewer.get_Images().setDecodingSettings(dialog._decodingSettings);

        viewer.set_ImageAnchor(imageAnchor);
        viewer.set_MultipageDisplayMode(multipageDisplayMode);
        viewer.set_MultipageDisplayLayoutDirection(multipageLayoutDirection);
        viewer.set_MultipageDisplayRowCount(multipageImagesInRow);
        viewer.set_UseImageAppearancesInSinglePageMode(useAppearanceInSinglePageMode);
        viewer.set_MultipageDisplayImagePadding(multipageImagesPadding);

        viewer.set_UseVectorRendering(useVectorRenderingForDocuments);
        viewer.set_VectorContentBackgroundColor(vectorContentBackgroundColor);

        var imageAppearance = viewer.get_ImageAppearance();
        imageAppearance.set_BackColor(imageAppearanceBackColor);
        imageAppearance.set_BorderColor(imageAppearanceBorderColor);
        imageAppearance.set_BorderWidth(imageAppearanceBorderWidth);

        var focusedImageAppearance = viewer.get_FocusedImageAppearance();
        focusedImageAppearance.set_BackColor(focusedImageAppearanceBackColor);
        focusedImageAppearance.set_BorderColor(focusedImageAppearanceBorderColor);
        focusedImageAppearance.set_BorderWidth(focusedImageAppearanceBorderWidth);

        viewer.endInit();

        return true;
    }

    /**
     Image collection of viewer is changed.
    */
    function __imageViewerImagesChanged(event, eventArgs) {
        var dialog = that;
        if (dialog._decodingSettings != null)
            viewer.get_Images().setDecodingSettings(dialog._decodingSettings);
    }

    /**
     Returns WebPdfRenderingSettingsJS object from rendering settings.
    */
    function __getPdfRenderingSettings(renderingSettings) {
        if (Vintasoft.Imaging.Pdf != null) {
            if (renderingSettings instanceof Vintasoft.Shared.WebCompositeRenderingSettingsJS) {
                var settings = renderingSettings.get_Settings();
                for (var i = 0; i < settings.length; i++) {
                    if (settings[i] instanceof Vintasoft.Shared.WebPdfRenderingSettingsJS)
                        return settings[i];
                }
            }
        }
    }

    /**
     Creates rendering settings with specified resolution.
    */
    function __createRenderingSettings(resolution) {
        var imageRenderingSettings = new Vintasoft.Shared.WebRenderingSettingsJS(resolution);
        if (Vintasoft.Imaging.Pdf != null) {
            var pdfRenderingSettings = new Vintasoft.Shared.WebPdfRenderingSettingsJS();

            var compositeRenderingSettings = new Vintasoft.Shared.WebCompositeRenderingSettingsJS([imageRenderingSettings, pdfRenderingSettings]);
            if (resolution != null)
                compositeRenderingSettings.set_Resolution(resolution);

            imageRenderingSettings = compositeRenderingSettings;
        }
        return imageRenderingSettings;
    }



    var that = this;

    this._viewer = viewer;
    this._decodingSettings = null;

    Vintasoft.Shared.subscribeToEvent(document.getElementById("imageViewerDefaultRendSettingsCheckbox"), "change", __useDefaultRenderingSettingsCheckboxChanged);

    $("#imageAppearanceBackColorInput").colorpicker({ format: 'rgba' });
    $("#imageAppearanceBorderColorInput").colorpicker({ format: 'rgba' });
    $("#focusedImageAppearanceBackColorInput").colorpicker({ format: 'rgba' });
    $("#focusedImageAppearanceBorderColorInput").colorpicker({ format: 'rgba' });
    $("#imageViewerBackgroundColor").colorpicker({ format: 'rgba' });

    __create(this);

    if (Vintasoft.Imaging.Pdf != null) {
        var pdfRenderingSettingsTableRows = document.querySelectorAll(".pdfRenderingSettings");
        for (var i = 0; i < pdfRenderingSettingsTableRows.length; i++) {
            pdfRenderingSettingsTableRows[i].style.display = "table-row";
        }
    }
}