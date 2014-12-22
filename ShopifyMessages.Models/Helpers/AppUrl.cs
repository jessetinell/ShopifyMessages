using System.Configuration;

namespace ShopifyMessages.Core.Helpers
{
    public class AppUrl
    {
        public static string ShopScript(string shopName)
        {
            /*
             * Example: //appen.com/api/shopify/name
             * */
            var apiUrl = ConfigurationManager.AppSettings["ApiUrl"].Replace("http:", "").Replace("https:", "");
            return string.Format("{0}/shopify/{1}", apiUrl, shopName);
        }
    }
}
