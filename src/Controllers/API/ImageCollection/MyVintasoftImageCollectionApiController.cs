using Microsoft.AspNetCore.Hosting;
using Vintasoft.Imaging.AspNetCore.ApiControllers;

namespace AspNetCoreBarcodeAdvancedDemo.Controllers
{
    /// <summary>
    /// A Web API controller that handles HTTP requests from clients and
    /// allows to manage an image collection.
    /// </summary>
    public class MyVintasoftImageCollectionApiController : VintasoftImageCollectionApiController
    {

        /// <summary>
        /// Initializes a new instance of the <see cref="MyVintasoftImageCollectionApiController"/> class.
        /// </summary>
        public MyVintasoftImageCollectionApiController(IWebHostEnvironment hostingEnvironment)
            : base(hostingEnvironment)
        {
            // specify that converter from CSV/TSV file to XLSX file should automatically calculate the column widths
            Vintasoft.Imaging.Codecs.Decoders.XlsxConverterSettings.Default.ColumnAutoFit = true;
        }

    }
}