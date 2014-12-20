using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(ShopifyMessages.Api.Startup))]
namespace ShopifyMessages.Api
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
