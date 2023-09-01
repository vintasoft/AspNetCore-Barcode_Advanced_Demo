using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

using System.Collections.Generic;

using Vintasoft.Data;
using Vintasoft.Imaging.AspNetCore.ApiControllers;


namespace AspNetCoreBarcodeAdvancedDemo.Controllers
{
    /// <summary>
    /// A Web API controller that handles HTTP requests from clients and
    /// allows to manipulate files on server.
    /// </summary>
    public class MyVintasoftFileApiController : VintasoftFileApiController
    {

        #region Constructors

        /// <summary>
        /// Initializes a new instance of the <see cref="MyVintasoftFileApiController"/> class.
        /// </summary>
        public MyVintasoftFileApiController(IWebHostEnvironment hostingEnvironment)
            : base(hostingEnvironment)
        {
        }

        #endregion



        #region Methods

        /// <summary>
        /// Returns a list of files uploaded during current HTTP session.
        /// </summary>
        /// <param name="session">Identifier of HTTP session.</param>
        /// <returns>Dictionary that provides a mapping from filename to URL of file.</returns>
        [HttpPost]
        public UploadedFilesListResponseParams GetUploadedFilesUrl([FromBody] string session)
        {
            UploadedFilesListResponseParams answer = new UploadedFilesListResponseParams();
            IDataStorage storage = CreateSessionDataStorage(session);
            if (storage != null)
            {
                List<string> files = new List<string>();
                string[] allFiles = storage.GetKeys();
                for (int i = 0; i < allFiles.Length; i++)
                {
                        files.Add(allFiles[i]);
                }
                answer.files = files.ToArray();
            }
            answer.success = true;
            return answer;
        }

        #endregion

    }
}
