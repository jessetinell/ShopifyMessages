using System;
using System.Collections.Generic;
using System.Configuration;
using System.Dynamic;
using System.Web.Mvc;
using Newtonsoft.Json;
using ShopifyAPIAdapterLibrary;
using ShopifyMessages.Core;
using ShopifyMessages.Core.Helpers;
using ShopifyMessages.Web.Infrastructure;
using ShopifyMessages.Web.Models;

namespace ShopifyMessages.Web.Controllers
{
    public class OauthController : BaseController
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
                
                var shopId = Id.Shop(shopName);
                var shopInDb = RavenSession.Load<Shop>(shopId);
                var shopifyApi = new ShopifyAPIClient(authState);

                if (shopInDb == null)
                {
                    RavenSession.Store(new Shop
                                       {
                                           Id = shopId,
                                           Name = shopName
                                       });
                    RavenSession.SaveChanges();
                }

                var jsonResponse = shopifyApi.Get(string.Format("/admin/script_tags.json?src={0}", AppUrl.ShopScript(shopName))).ToString();

                if (Globals.IsLive() && !jsonResponse.Contains("created_at"))
                {
                    dynamic scriptTag = new ExpandoObject();
                    scriptTag.script_tag = new ExpandoObject();
                    scriptTag.script_tag.@event = "onload";
                    scriptTag.script_tag.src = "http://t.myvisitors.se/js/";//AppUrl.ShopScript(shopName);
                    var scriptTagJson = JsonConvert.SerializeObject(scriptTag);

                    try
                    {
                        var addScriptResponse = shopifyApi.Post("/admin/script_tags.json", scriptTagJson);
                        if (!addScriptResponse.ToString().Contains("created_at"))
                        {
                            // LOGGER ERROR
                        }
                    }
                    catch (Exception ex)
                    {
                        // LOGGER FATAL
                    }
                }
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