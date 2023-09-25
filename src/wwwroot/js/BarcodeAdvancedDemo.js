var _fileService;

var _docViewer;

var _openFileHelper;

var _previouslyUploadedFilesDialog;

var _blockUiDialog;



// === "File" toolbar, "Previously uploaded files" button ===

/**
 Creates UI button for showing the list with previously uploaded files.
*/
function __createPreviousUploadFilesButton() {
    // create the button that allows to show a dialog with previously uploaded image files and select image file
    var button = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
        cssClass: "uploadedFilesList",
        title: "Previously Uploaded Files",
        localizationId: "previousUploadFilesButton",
        onClick: __previousUploadFilesButton_clicked
    });
    return button;
}

function __previousUploadFilesButton_clicked(event, uiElement) {
    var docViewer = uiElement.get_RootControl();
    if (docViewer != null) {
        // if dialog does not exist
        if (_previouslyUploadedFilesDialog == null)
            // create dialog
            _previouslyUploadedFilesDialog = new PreviouslyUploadedFilesDialogJS(_fileService, docViewer, _openFileHelper, __showErrorMessage);
        // show the dialog
        _previouslyUploadedFilesDialog.show();
    }
}



// === "Tools" toolbar ===

/**
 Creates UI button for activating the visual tool, which allows to pan images in image viewer.
*/
function __createPanToolButton() {
    return new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
        cssClass: "vsdv-tools-panButton",
        title: "Pan",
        localizationId: "panToolButton",
        onClick: __panToolButton_clicked
    });
}

function __panToolButton_clicked(event, uiElement) {
    var imageViewer = _docViewer.get_ImageViewer();
    var compositeTool = imageViewer.get_VisualTool();
    var rectangularSelectionTool = compositeTool.getTool(2);
    rectangularSelectionTool.set_Rectangle({ x: 0, y: 0, width: 0, height: 0 });
    compositeTool.set_ActiveVisualTool();
}

/**
 Creates UI button for activating the visual tool, which allows to select the rectangular image region in image viewer.
*/
function __createRectangularSelectionToolButton() {
    return new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
        cssClass: "vsdv-tools-rectSelectionButton",
        title: "Rectangular selection",
        localizationId: "rectangularSelectionToolButton",
        onClick: __rectangularSelectionToolButton_clicked
    });
}

function __rectangularSelectionToolButton_clicked(event, uiElement) {
    var imageViewer = _docViewer.get_ImageViewer();
    var compositeTool = imageViewer.get_VisualTool();
    var rectangularSelectionTool = compositeTool.getTool(2);
    compositeTool.set_ActiveVisualTool(rectangularSelectionTool);
}



// === Init UI ===

/**
 Registers custom UI elements in "WebUiElementsFactoryJS".
*/
function __registerNewUiElements() {
    var barcodeReaderUiHelper = new BarcodeReaderUiHelperJS(__blockUI, __unblockUI);
    var barcodeWriterUiHelper = new BarcodeWriterUiHelperJS(__showErrorMessage);

    // register the "Previously uploaded files" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("previousUploadFilesButton", __createPreviousUploadFilesButton);

    // register the "Pan" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("panToolButton", __createPanToolButton);
    // register the "Rectangular selection" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("rectangularSelectionToolButton", __createRectangularSelectionToolButton);

    // register the "Barcode reading" panel in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("barcodeReadingPanel", barcodeReaderUiHelper.createBarcodeReadingPanel);
    // register the "Barcode generation" panel in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement("barcodeWritingPanel", barcodeWriterUiHelper.createBarcodeWritingPanel);
}

/**
 Initializes main menu of document viewer.
 @param {object} docViewerSettings Settings of document viewer.
*/
function __initMenu(docViewerSettings) {
    // get items of document viewer
    var items = docViewerSettings.get_Items();

    var uploadFileButton = items.getItemByRegisteredId("uploadFileButton");
    if (uploadFileButton != null)
        uploadFileButton.set_FileExtensionFilter(".bmp, .emf, .gif, .ico, .cur, .jpg, .jpeg, .jls, .pcx, .png, .tif, .tiff, .wmf, .jb2, .jbig2, .jp2, .j2k, .j2c, .jpc, .pdf, .docx, .doc, .xlsx, .xls");

    // get the "File" menu panel
    var fileMenuPanel = items.getItemByRegisteredId("fileToolbarPanel");
    // if menu panel is found
    if (fileMenuPanel != null) {
        // get items of file menu panel
        var fileMenuPanelItems = fileMenuPanel.get_Items();

        // add the "Previous uploaded files" button to the menu panel
        fileMenuPanelItems.insertItem(1, "previousUploadFilesButton");
    }

    // get the "Visual tools" menu panel
    var visualToolsToolbarPanel = items.getItemByRegisteredId("visualToolsToolbarPanel");
    // if menu panel founded
    if (visualToolsToolbarPanel != null) {
        // get items of visual tool menu panel
        var visualToolsToolbarPanelItems = visualToolsToolbarPanel.get_Items();

        // remove all items
        visualToolsToolbarPanelItems.clearItems();
        // add "Pan" button to the menu panel
        visualToolsToolbarPanelItems.addItem("panToolButton");
        // add "Rectangular Selection" button to the menu panel
        visualToolsToolbarPanelItems.addItem("rectangularSelectionToolButton");
    }
}

/**
 Initializes the side panel of document viewer.
 @param {object} docViewerSettings Settings of document viewer.
*/
function __initSidePanel(docViewerSettings) {
    // get items of document viewer
    var items = docViewerSettings.get_Items();

    var sidePanel = items.getItemByRegisteredId("sidePanel");
    if (sidePanel != null) {
        var sidePanelItems = sidePanel.get_PanelsCollection();

        sidePanelItems.addItem("barcodeReadingPanel");
        sidePanelItems.addItem("barcodeWritingPanel");
    }

    // get the thumbnail viewer panel of document viewer
    var thumbnailViewerPanel = items.getItemByRegisteredId("thumbnailViewerPanel");
    // if panel is found
    if (thumbnailViewerPanel != null)
        // subscribe to the "actived" event of the thumbnail viewer panel of document viewer
        Vintasoft.Shared.subscribeToEvent(thumbnailViewerPanel, "activated", __thumbnailsPanelActivated);
}

/**
 Thumbnail viewer panel of document viewer is actived.
*/
function __thumbnailsPanelActivated() {
    var thumbnailViewer = this.get_ThumbnailViewer();
    if (thumbnailViewer != null) {
        // create the progress image
        var progressImage = new Image();
        progressImage.src = __getApplicationUrl() + "Images/fileUploadProgress.gif";
        // specify that the thumbnail viewer must use the progress image for indicating the thumbnail loading progress
        thumbnailViewer.set_ProgressImage(progressImage);

        // additional bottom space for text with page number under thumbnail
        var textCaptionHeight = 18;
        var padding = thumbnailViewer.get_ThumbnailPadding();
        padding[2] += textCaptionHeight
        thumbnailViewer.set_ThumbnailPadding(padding);
        thumbnailViewer.set_DisplayThumbnailCaption(true);
    }
}



// === Visual Tools ===

/**
 Initializes visual tools.
 @param {object} docViewer The document viewer.
*/
function __initializeVisualTools(docViewer) {
    var panTool = docViewer.getVisualToolById("PanTool");
    var panCursorUrl = __getApplicationUrl() + 'Content/Cursors/CloseHand.cur';
    var panCursor = "url('" + panCursorUrl + "'), auto";

    panTool.set_Cursor("pointer");
    panTool.set_ActionCursor(panCursor);
}



// === Utils ===

/**
 Blocks the UI. 
 @param {string} text Message that describes why UI is blocked.
*/
function __blockUI(text) {
    _blockUiDialog = new BlockUiDialogJS(text);
}

/**
 Unblocks the UI.
*/
function __unblockUI() {
    if (_blockUiDialog != null) {
        _blockUiDialog.close();
        _blockUiDialog = null;
    }
}

/**
 Shows an error message.
 @param {object} data Information about error.
*/
function __showErrorMessage(data) {
    __unblockUI();
    new ErrorMessageDialogJS(data);
}

/**
 Returns application URL.
*/
function __getApplicationUrl() {
    var applicationUrl = window.location.toString();
    if (applicationUrl[applicationUrl.length - 1] != '/')
        applicationUrl = applicationUrl + '/';
    return applicationUrl;
}



// === Document viewer events ===

function __docViewer_warningOccured(event, eventArgs) {
    // show the alert if warning occured
    __showErrorMessage(eventArgs.message);
}

function __docViewer_asyncOperationStarted(event, data) {
    // get description of asynchronous operation
    var description = data.description;

    // if image is prepared for printing
    if (description === "Image prepared to print") {
        // do not block UI when images are preparing for printing
    }
    else {
        // block UI
        __blockUI(data.description);
    }
}

function __docViewer_asyncOperationFinished(event, data) {
    // unblock UI
    __unblockUI();
}

function __docViewer_asyncOperationFailed(event, data) {
    // get description of asynchronous operation
    var description = data.description;
    // get additional information about asynchronous operation
    var additionalInfo = data.data;
    // if additional information exists
    if (additionalInfo != null)
        // show error message
        __showErrorMessage(additionalInfo);
    // if additional information does NOT exist
    else
        // show error message
        __showErrorMessage(description + ": unknown error.");
}



// === Main ===

/**
 Main function.
*/
function __main() {
    // set the session identifier
    var hiddenSessionFieldElement = document.getElementById('hiddenSessionField');
    Vintasoft.Shared.WebImagingEnviromentJS.set_SessionId(hiddenSessionFieldElement.value);

    // specify web services, which should be used in this demo

    _fileService = new Vintasoft.Shared.WebServiceControllerJS(__getApplicationUrl() + "vintasoft/api/MyVintasoftFileApi");

    Vintasoft.Shared.WebServiceJS.defaultFileService = _fileService;
    Vintasoft.Shared.WebServiceJS.defaultImageCollectionService = new Vintasoft.Shared.WebServiceControllerJS(__getApplicationUrl() + "vintasoft/api/MyVintasoftImageCollectionApi");
    Vintasoft.Shared.WebServiceJS.defaultImageService = new Vintasoft.Shared.WebServiceControllerJS(__getApplicationUrl() + "vintasoft/api/MyVintasoftImageApi");
    Vintasoft.Shared.WebServiceJS.defaultBarcodeService = new Vintasoft.Shared.WebServiceControllerJS(__getApplicationUrl() + "vintasoft/api/MyVintasoftBarcodeApi");

    // register new UI elements
    __registerNewUiElements();

    // create the document viewer settings
    var docViewerSettings = new Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS("documentViewerContainer", "documentViewer");

    // initialize main menu of document viewer
    __initMenu(docViewerSettings);

    // initialize side panel of document viewer
    __initSidePanel(docViewerSettings);

    // create the document viewer
    _docViewer = new Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS(docViewerSettings);

    // subscribe to the "warningOccured" event of document viewer
    Vintasoft.Shared.subscribeToEvent(_docViewer, "warningOccured", __docViewer_warningOccured);
    // subscribe to the asyncOperationStarted event of document viewer
    Vintasoft.Shared.subscribeToEvent(_docViewer, "asyncOperationStarted", __docViewer_asyncOperationStarted);
    // subscribe to the asyncOperationFinished event of document viewer
    Vintasoft.Shared.subscribeToEvent(_docViewer, "asyncOperationFinished", __docViewer_asyncOperationFinished);
    // subscribe to the asyncOperationFailed event of document viewer
    Vintasoft.Shared.subscribeToEvent(_docViewer, "asyncOperationFailed", __docViewer_asyncOperationFailed);

    __initializeVisualTools(_docViewer);

    // get the image viewer of document viewer
    var imageViewer1 = _docViewer.get_ImageViewer();
    // specify that image viewer must show images in the single continuous column mode
    imageViewer1.set_DisplayMode(new Vintasoft.Imaging.WebImageViewerDisplayModeEnumJS("SingleContinuousColumn"));
    // specify that image viewer must show images in the fit width mode
    imageViewer1.set_ImageSizeMode(new Vintasoft.Imaging.WebImageSizeModeEnumJS("FitToWidth"));
    // set 300 dpi resolution in image viewer
    imageViewer1.set_RenderingSettings(new Vintasoft.Shared.WebRenderingSettingsJS({ x: 300, y: 300 }));

    // create the progress image
    var progressImage = new Image();
    progressImage.src = __getApplicationUrl() + "Images/fileUploadProgress.gif";
    // specify that the image viewer must use the progress image for indicating the image loading progress
    imageViewer1.set_ProgressImage(progressImage);

    // create the composite visual tool, which allows to highligh barcode recongition results in image viewer, select rectangular region on image in image viewer and pan image in image viewer
    var compositeTool = _docViewer.getVisualToolById("HighlightTool,PanTool,RectangularSelectionTool");
    // set the composite visual tool as active visual tool in image viewer
    _docViewer.set_CurrentVisualTool(compositeTool);

    // copy the default file to the uploaded image files directory and open the file
    _openFileHelper = new OpenFileHelperJS(_docViewer, __showErrorMessage);
    _openFileHelper.openDefaultImageFile("VintasoftBarcodeDemo.png");
}



// run main function
__main();
