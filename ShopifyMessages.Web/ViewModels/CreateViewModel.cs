using System.Collections.Generic;

namespace ShopifyMessages.Web.ViewModels
{
    public class CreateViewModel
    {
        public bool First { get; set; }
        public List<TemplateViewModel> Templates { get; set; }
    }
}