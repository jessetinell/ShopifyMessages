using ShopifyMessages.Core.Models;

namespace ShopifyMessages.Web.ViewModels
{
    public class EditViewModel
    {
        public string Id { get; set; }
        public Message Message { get; set; }

        public string TemplateIdentifier { get; set; }
        public string EditableTemplate { get; set; }

        public Template Template { get; set; }
    }
}