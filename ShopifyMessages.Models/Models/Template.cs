using System.Collections.Generic;

namespace ShopifyMessages.Core.Models
{
    public class Template : ITemplateSettings
    {
        public string Id { get; set; }

        public int Version { get; set; }

        //If true: ska man inte kunna välja den. Lista inte under Create
        public bool Obsolete { get; set; }

        public string Html { get; set; }

        public Dictionary<string, string> PlaceholderValues { get; set; }
        public int MinHeight { get; set; }
        public int MaxWidth { get; set; }


        public Position Position { get; set; }
        public DisplayRules DisplayRules { get; set; }
        public bool UseModalBackground { get; set; }

        public FormSettings FormSettings { get; set; }
        public bool HasForm { get; set; }

        // Set defaults
        public Template()
        {
            Version = 1;
        }
    }
}
