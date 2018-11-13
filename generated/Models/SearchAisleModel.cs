// <auto-generated>
// Code generated by Microsoft (R) AutoRest Code Generator.
// Changes may cause incorrect behavior and will be lost if the code is
// regenerated.
// </auto-generated>

namespace Result.Models
{
    using Newtonsoft.Json;
    using System.Linq;

    public partial class SearchAisleModel
    {
        /// <summary>
        /// Initializes a new instance of the SearchAisleModel class.
        /// </summary>
        public SearchAisleModel()
        {
            CustomInit();
        }

        /// <summary>
        /// Initializes a new instance of the SearchAisleModel class.
        /// </summary>
        public SearchAisleModel(string content = default(string), int pageIndex = default(int), int recordsPerPage = default(int), int? totalPages = default(int?), int? totalRecord = default(int?))
        {
            Content = content;
            PageIndex = pageIndex;
            RecordsPerPage = recordsPerPage;
            TotalPages = totalPages;
            TotalRecord = totalRecord;
            CustomInit();
        }

        /// <summary>
        /// An initialization method that performs custom operations like setting defaults
        /// </summary>
        partial void CustomInit();

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "Content")]
        public string Content { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "PageIndex")]
        public int PageIndex { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "RecordsPerPage")]
        public int RecordsPerPage { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "TotalPages")]
        public int? TotalPages { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "TotalRecord")]
        public int? TotalRecord { get; set; }

    }
}