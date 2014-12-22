using System.Configuration;

namespace ShopifyMessages.Core
{
    public class Globals
    {
        public static bool IsLive()
        {
            return ConfigurationManager.AppSettings["Environment"] == "Live";
        }
    }
}
