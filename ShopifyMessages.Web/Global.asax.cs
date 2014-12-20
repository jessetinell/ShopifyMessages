using Raven.Client.Document;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace ShopifyMessages.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        public static DocumentStore Store { get; private set; }

        protected void Application_Start()
        {
            Store = new DocumentStore { ConnectionStringName = "RavenDb" };
            Store.Initialize();

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}
