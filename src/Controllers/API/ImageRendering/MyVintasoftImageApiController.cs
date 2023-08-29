using System;

using Vintasoft.Imaging.Pdf;
using Vintasoft.Imaging.AspNetCore.ApiControllers;
using Microsoft.AspNetCore.Hosting;

namespace AspNetCoreBarcodeAdvancedDemo.Controllers
{
    /// <summary>
    /// A Web API controller that handles HTTP requests from clients and
    /// allows to get information about image or render image thumbnail/tile.
    /// </summary>
    public class MyVintasoftImageApiController : VintasoftImageApiController
    {

        /// <summary>
        /// Initializes a new instance of the <see cref="MyVintasoftImageApiController"/> class.
        /// </summary>
        public MyVintasoftImageApiController(IWebHostEnvironment hostingEnvironment)
            : base(hostingEnvironment)
        {
        }

    }
}