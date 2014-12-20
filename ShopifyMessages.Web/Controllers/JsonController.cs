using ShopifyMessages.Core;
using ShopifyMessages.Core.Helpers;
using ShopifyMessages.Core.Models;
using ShopifyMessages.Web.Helpers;
using ShopifyMessages.Web.Infrastructure;
using ShopifyMessages.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;

namespace ShopifyMessages.Web.Controllers
{
    [ShopifyAuthorize]
    public class JsonController : BaseController
    {
        [HttpPost]
        public bool SaveTemplate(string templateId, List<PlaceholderValue> placeholders)
        {
            //var template = RavenSession.Load<Template>(Id.Template(templateId));

            //if (template != null)
            //{
            //    foreach (var placeholder in placeholders)
            //    {
            //        if (placeholder.Id.StartsWith("image-"))
            //        {
            //            // Remove the url() from the content
            //            placeholder.Content = CleanUp.CssBgUrl(placeholder.Content);
            //        }
            //    }

            //    template.PlaceholderValues = placeholders;
            //    RavenSession.SaveChanges();
            //}
            return false;
        }
    }
}