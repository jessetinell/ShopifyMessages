using System.Collections.Generic;
using ShopifyMessages.Core.Models;

namespace ShopifyMessages.Core
{
    interface ITemplateSettings
    {
        List<PlaceholderValue> PlaceholderValues { get; set; }
        int Height { get; set; }
        int Width { get; set; }
    }
}
