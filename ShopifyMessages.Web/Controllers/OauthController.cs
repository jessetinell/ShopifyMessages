using System;
using System.Configuration;
using System.Dynamic;
using System.Web.Mvc;
using Newtonsoft.Json;
using ShopifyAPIAdapterLibrary;
using ShopifyMessages.Web.Infrastructure;

namespace ShopifyMessages.Web.Controllers
{
    public class OauthController : Controller
    {
        [HttpGet]
        public ActionResult ShopifyAuthCallback(string code, string shop, string error)
        {
            if (!string.IsNullOrEmpty(error))
            {
                this.TempData["Error"] = error;
                return RedirectToAction("Login");
            }
            if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(shop))
                return RedirectToAction("Index", "Home");

            var shopName = shop.Replace(".myshopify.com", String.Empty);
            var authorizer = new ShopifyAPIAuthorizer(shopName, ConfigurationManager.AppSettings["Shopify.ConsumerKey"], ConfigurationManager.AppSettings["Shopify.ConsumerSecret"]);

            var authState = authorizer.AuthorizeClient(code);
            if (authState != null && authState.AccessToken != null)
            {
                ShopifyAuthorize.SetAuthorization(HttpContext, authState);
                //var shopifyApi = new ShopifyAPIClient(authState);
                //dynamic a = new ExpandoObject();
                //a.script_tag = new ExpandoObject();
                //a.script_tag.@event = "onload";
                //a.script_tag.src = ConfigurationManager.AppSettings["ApiUrl"] + "/api/shopify/" + shopName;
                //var json = JsonConvert.SerializeObject(a);

                //if (!System.Diagnostics.Debugger.IsAttached)
                //{
                //    shopifyApi.Post("/admin/script_tags.json", json);
                //}
            }

            return RedirectToAction("Index", "Home");
        }

        public ActionResult ShopifyConnect(string shop)
        {
            // strip the .myshopify.com in case they added it
            var shopName = shop.Replace(".myshopify.com", string.Empty);

            // prepare the URL that will be executed after authorization is requested
            var requestUrl = Url.RequestContext.HttpContext.Request.Url;
            var returnUrl = new Uri(string.Format("{0}://{1}{2}",
                                                    requestUrl.Scheme,
                                                    requestUrl.Authority,
                                                    Url.Action("ShopifyAuthCallback", "Oauth")));

            var authorizer = new ShopifyAPIAuthorizer(shopName, ConfigurationManager.AppSettings["Shopify.ConsumerKey"], ConfigurationManager.AppSettings["Shopify.ConsumerSecret"]);
            var authUrl = authorizer.GetAuthorizationURL(new[] { ConfigurationManager.AppSettings["Shopify.Scope"] }, returnUrl.ToString());
            return Redirect(authUrl);
        }

    }
}