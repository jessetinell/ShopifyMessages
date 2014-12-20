using System;
using System.Web.Mvc;
using System.Web.Security;
using ShopifyAPIAdapterLibrary;

namespace ShopifyMessages.Web.Infrastructure
{
    public class ShopifyAuthorize : AuthorizeAttribute
    {
        private const string AuthSessionKey = "shopify_auth_state";

        /// <summary>
        /// 
        /// </summary>
        /// <param name="httpContext"></param>
        /// <param name="state"></param>
        public static void SetAuthorization(System.Web.HttpContextBase httpContext, ShopifyAuthorizationState state)
        {
            httpContext.Session[AuthSessionKey] = state;
        }

        /// <summary>
        /// Test to see if the current http context is authorized for access to Shopify API
        /// </summary>
        /// <param name="httpContext">current httpContext</param>
        /// <returns>true if the current http context is authorized for access to Shopify API, otherwise false</returns>
        protected override bool AuthorizeCore(System.Web.HttpContextBase httpContext)
        {
            var authState = GetAuthorizationState(httpContext);
            return authState != null && !String.IsNullOrWhiteSpace(authState.AccessToken);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="httpContext"></param>
        /// <returns></returns>
        public static ShopifyAuthorizationState GetAuthorizationState(System.Web.HttpContextBase httpContext)
        {
            return httpContext.Session[AuthSessionKey] as ShopifyAuthorizationState;
        }
    }
}