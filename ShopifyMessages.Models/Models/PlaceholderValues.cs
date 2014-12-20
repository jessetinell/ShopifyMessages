using System.Web.Mvc;
namespace ShopifyMessages.Core.Models
{
    public class PlaceholderValue
    {
        public string Id { get; set; }
        [AllowHtml]
        public string Content { get; set; }
    }
}
