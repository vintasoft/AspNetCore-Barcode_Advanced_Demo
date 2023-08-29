using System.IO;

using Vintasoft.Barcode.Web.Services;
using Vintasoft.Data;
using Vintasoft.Imaging;
using Vintasoft.Imaging.Codecs.Decoders;
using Vintasoft.Shared.Web;

namespace AspNetCoreBarcodeAdvancedDemo.Controllers
{
    /// <summary>
    /// A platform-independent web service
    /// that handles HTTP requests from clients and allows to read and write barcodes.
    /// </summary>
    public class MyVintasoftBarcodeWebService : VintasoftBarcodeWebService
    {

        /// <summary>
        /// Initializes a new instance of the <see cref="MyVintasoftBarcodeWebService"/> class.
        /// </summary>
        /// <param name="dataStorage">Data storage that stores images.</param>
        public MyVintasoftBarcodeWebService(IDataStorage dataStorage)
            : base(dataStorage)
        {
        }



        WebRenderingSettings _settings;
        /// <summary>
        /// Gets or sets a rendering settings for PDF documents.
        /// </summary>
        public WebRenderingSettings RenderingSettings
        {
            get { return _settings; }
            set { _settings = value; }
        }



        /// <summary>
        /// Returns a bitmap of the specified image from data storage.
        /// </summary>
        /// <param name="imageInfo">Web image info.</param>
        /// <param name="filePassword">A file password.</param>
        /// <param name="pageIndex">Zero based image index in image file.</param>
        /// <returns>A bitmap of the specified image.</returns>
        protected override VintasoftBitmap GetBitmapFromDataStorage(WebImageInfo imageInfo)
        {
            VintasoftBitmap bitmap = null;
            Stream stream = null;
            try
            {
                // get file stream from data storage
                stream = (Stream)SessionDataStorage.GetItemCopy(imageInfo.fileInfo.id);

                // create image collection
                using (ImageCollection images = new ImageCollection())
                {
                    // create a manager for authenticating document using password
                    DocumentPasswordManager documentPasswordManager = new DocumentPasswordManager(images, imageInfo.fileInfo.password);

                    // add file stream to the image collection
                    images.Add(stream);
                    // get image
                    VintasoftImage image = images[imageInfo.pageIndex];

                    if (_settings != null)
                    {
                        if (image.IsVectorImage && !_settings.IsEmpty)
                        {
                            image.RenderingSettings = new RenderingSettings(
                                _settings.resolution.x,
                                _settings.resolution.y,
                                (ImageInterpolationMode)_settings.interpolationMode,
                                (Vintasoft.Imaging.Drawing.DrawingSmoothingMode)_settings.smoothingMode);
                        }
                    }

                    // get image bitmap
                    bitmap = image.GetAsVintasoftBitmap();

                    // clear and dispose images in image collection
                    images.ClearAndDisposeItems();
                }
            }
            finally
            {
                if (stream != null)
                    stream.Close();
            }
            return bitmap;
        }

    }
}