using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Vintasoft.Barcode.AspNetCore.ApiControllers;
using Vintasoft.Barcode.Web.Services;
using Vintasoft.Data;

namespace AspNetCoreBarcodeAdvancedDemo.Controllers
{
    /// <summary>
    /// A Web API controller that handles HTTP requests from clients and
    /// allows to read barcodes from web image.
    /// </summary>
    public class MyVintasoftBarcodeApiController : VintasoftBarcodeApiController
    {

        /// <summary>
        /// Initializes a new instance of the <see cref="MyVintasoftBarcodeApiController"/> class.
        /// </summary>
        public MyVintasoftBarcodeApiController(IWebHostEnvironment hostingEnvironment)
            : base(hostingEnvironment)
        {
        }



        /// <summary>
        /// Reads information about barcodes from web image.
        /// </summary>
        /// <param name="requestParams">Parameters for barcode reader.</param>
        /// <returns>Information about searched barcodes.</returns>
        [HttpPost]
        public override WebBarcodeReadResponseParams ReadBarcodes(
            [FromBody] WebBarcodeReadRequestParams requestParams)
        {
            MyVintasoftBarcodeWebService service = (MyVintasoftBarcodeWebService)CreateWebService(requestParams.sessionId);
            service.RenderingSettings = requestParams.renderingSettings;
            return service.ReadBarcodes(requestParams);
        }

        /// <summary>
        /// Creates the <see cref="VintasoftBarcodeWebService"/>
        /// that handles HTTP requests from clients and allows to read and write barcodes.
        /// </summary>
        /// <returns>
        /// The <see cref="VintasoftBarcodeWebService"/>
        /// that handles HTTP requests from clients and allows to read and write barcodes.
        /// </returns>
        protected override VintasoftBarcodeWebService CreateWebService(string sessionId)
        {
            IDataStorage storage = CreateSessionDataStorage(sessionId);
            return new MyVintasoftBarcodeWebService(storage);
        }

    }
}