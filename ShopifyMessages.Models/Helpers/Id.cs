namespace ShopifyMessages.Core.Helpers
{
    public class Id
    {
        public const string TemplatePrefix = "templates/";
        public static string Messages(string shop)
        {
            // Messages/affär
            return string.Format("message/{0}/", shop);
        }

        public static string Shop(string shopName)
        {
            return string.Format("shop/{0}", shopName);
        }

        public static string Template(string id)
        {
            return TemplatePrefix + id;
        }

        public static string TemplateIdentifier(string templateId)
        {
            return templateId.Replace(TemplatePrefix, string.Empty);
        }

    }
}
