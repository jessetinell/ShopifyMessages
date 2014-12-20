using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(ShopifyMessages.Web.Startup))]
namespace ShopifyMessages.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
