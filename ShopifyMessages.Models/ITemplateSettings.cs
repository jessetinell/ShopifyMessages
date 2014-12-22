using System.Collections.Generic;
using ShopifyMessages.Core.Models;

namespace ShopifyMessages.Core
{
    interface ITemplateSettings
    {
        //List<PlaceholderValue> PlaceholderValues { get; set; }
        Dictionary<string,string> PlaceholderValues { get; set; }
        int MinHeight { get; set; }
        int MaxWidth { get; set; }
        bool UseModalBackground { get; set; }

        Position Position { get; set; }
        DisplayRules DisplayRules { get; set; }

        FormSettings FormSettings { get; set; }
    }
}
