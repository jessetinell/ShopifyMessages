using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using Raven.Client;
using ShopifyMessages.Core;
using ShopifyMessages.Core.Helpers;
using ShopifyMessages.Core.Models;
using ShopifyMessages.Web.ViewModels;

namespace ShopifyMessages.Web.Helpers
{
    public class TemplateHelper
    {
        public static List<TemplateViewModel> CreateTemplateViewModel(List<Template> templates)
        {
            var list = new List<TemplateViewModel>();
            foreach (var template in templates)
            {
                var pathPrefix = string.Format("/MessageTemplates/{0}/", template.Id.Replace("templates/", ""));

                var vm = new TemplateViewModel
                {
                    Id = template.Id,
                    PreviewImageUrl = Helper.FileUrl(pathPrefix + "preview.jpg")
                };
                list.Add(vm);
            }
            return list;
        }

        public static void SaveTemplateToDb(IDocumentSession session, string folderName)
        {
            var settingsJson = Helper.FileAsString(string.Format("/MessageTemplates/{0}/settings.json", folderName));
            var html = Helper.FileAsString(string.Format("/MessageTemplates/{0}/template.cshtml", folderName));

            var template = JsonConvert.DeserializeObject<Template>(settingsJson);

            template.Id = Id.Template(folderName);
            template.Html = CleanUp.MinifyHtml(html);
            template.HasForm = html.Contains("</form>");
            if (template.HasForm)
                template.FormSettings = new FormSettings { UseForm = html.Contains("</form>") };
            session.Store(template);
            session.SaveChanges();
        }



    }
}