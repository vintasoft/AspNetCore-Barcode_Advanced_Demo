using System.IO;
using System.Text;
using Vintasoft.Data;
using Vintasoft.Imaging.Codecs.Decoders;
using Vintasoft.Imaging.Web.Services;
using Vintasoft.Shared.Web;

namespace AspNetCoreBarcodeAdvancedDemo.Controllers
{
    /// <summary>
    /// A platform-independent web service that
    /// handles HTTP requests from clients and allows to manipulate files on a server.
    /// </summary>
    public class MyVintasoftFileWebService : VintasoftFileWebService
    {

        /// <summary>
        /// Initializes a new instance of the <see cref="MyVintasoftFileWebService"/> class.
        /// </summary>
        /// <param name="dataStorage">Data storage that allows to store images in multipage image files.</param>
        public MyVintasoftFileWebService(IDataStorage dataStorage)
            : base(dataStorage)
        {
        }



        /// <summary>
        /// Validates that specified stream can be saved on a server.
        /// </summary>
        /// <param name="responseParams">Response from the server.</param>
        /// <param name="fileStream">Stream with file data.</param>
        /// <returns>
        /// <b>true</b> - file stream contains image/document, which can be decoded by SDK, and can be saved on server;
        /// <b>false</b> - file stream cannot be saved on server.
        /// </returns>
        protected override bool FileValidation(WebImageFileResponseParams responseParams, Stream fileStream)
        {
            // get decoder for uploaded file
            using (DecoderBase decoder = AvailableDecoders.CreateDecoder(fileStream))
            {
                // if decoder is not found
                if (decoder == null)
                {
                    StringBuilder errorMessage = new StringBuilder("The selected file cannot be decoded. Supported decoders:");
                    foreach (string decoderName in AvailableDecoders.DecoderNames)
                    {
                        errorMessage.Append(string.Format(" {0}", decoderName));
                    }
                    errorMessage.Append(".");

                    responseParams.errorMessage = errorMessage.ToString();
                    responseParams.success = false;
                    return false;
                }
            }
            return true;
        }

    }
}