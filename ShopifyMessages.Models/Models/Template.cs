using System.Collections.Generic;

namespace ShopifyMessages.Core.Models
{
    public class Template : ITemplateSettings
    {
        public string Id { get; set; }

        //If true: ska man inte kunna välja den. Lista inte under Create
        public bool Obsolete { get; set; }

        public string Html { get; set; }

        public List<PlaceholderValue> PlaceholderValues { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
    }
}
