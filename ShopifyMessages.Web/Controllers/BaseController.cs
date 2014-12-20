using Raven.Client;
using System.Web.Mvc;
using ShopifyAPIAdapterLibrary;
using ShopifyMessages.Web.Infrastructure;

namespace ShopifyMessages.Web.Controllers
{
    public class BaseController : Controller
    {
        public IDocumentSession RavenSession { get; protected set; }
        public ShopifyAPIClient ShopifyApi;
        public bool IsAuthenticated { get; set; }
        public string ShopName { get; set; }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            IsAuthenticated = false;
            ShopName = string.Empty;
            base.OnActionExecuting(filterContext);
            RavenSession = MvcApplication.Store.OpenSession();

            var authState = ShopifyAuthorize.GetAuthorizationState(HttpContext);

            // ONLY DEV!!!!!!!!!
            if (authState == null)
            {
                authState = new ShopifyAuthorizationState
                {
                    AccessToken = "363fa17b9d1a23b2ebaa53f1ff374c01",
                    ShopName = "jesse-9"
                };
                ShopifyAuthorize.SetAuthorization(HttpContext, authState);
            }

            if (authState != null)
            {
                ShopifyApi = new ShopifyAPIClient(authState);
                IsAuthenticated = true;
                ShopName = authState.ShopName;
            }
            ViewBag.IsAuthenticated = IsAuthenticated;
            ViewBag.ShopName = ShopName;
        }

        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;

            using (RavenSession)
            {
                if (filterContext.Exception != null)
                    return;

                if (RavenSession != null)
                    RavenSession.SaveChanges();
            }
        }
    }
}