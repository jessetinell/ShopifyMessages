using System;
using System.Configuration;
using System.Web.Mvc;
using ShopifyAPIAdapterLibrary;
using ShopifyMessages.Web.Models;
using ShopifyMessages.Web.ViewModels;

namespace ShopifyMessages.Web.Controllers
{
    [Authorize]
    public class AccountController : BaseController
    {
        [AllowAnonymous]
        public ActionResult Login()
        {
            return View();
        }

        /// <summary>
        /// posted from the login form
        /// </summary>
        /// <param name="model"></param>
        /// <param name="returnUrl"></param>
        /// <returns></returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        [AllowAnonymous]
        public ActionResult Login(LoginViewModel model, string returnUrl)
        {
            if (!ModelState.IsValid) return View(model);

            // strip the .myshopify.com in case they added it
            var shopName = model.ShopName.Replace(".myshopify.com", string.Empty);

            // prepare the URL that will be executed after authorization is requested
            var requestUrl = Url.RequestContext.HttpContext.Request.Url;
            var oauthReturnUrl = new Uri(string.Format("{0}://{1}{2}",
                requestUrl.Scheme,
                requestUrl.Authority,
                Url.Action("ShopifyAuthCallback", "Oauth")));

            var authorizer = new ShopifyAPIAuthorizer(shopName, ConfigurationManager.AppSettings["Shopify.ConsumerKey"], ConfigurationManager.AppSettings["Shopify.ConsumerSecret"]);
            var authUrl = authorizer.GetAuthorizationURL(new[] { ConfigurationManager.AppSettings["Shopify.Scope"] }, oauthReturnUrl.ToString());
            return Redirect(authUrl);
        }
    }
}