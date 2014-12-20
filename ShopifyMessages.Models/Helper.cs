using System.Configuration;
using System.Web;
using ShopifyMessages.Core.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace ShopifyMessages.Core
{
    public class Helper
    {
        public static string FileUrl(string path)
        {
            return ConfigurationManager.AppSettings["AppPath"] + path;
        }

        public static string FileAsString(string path)
        {
            using (var sr = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + path))
            {
                return sr.ReadToEnd();
            }
        }

        public static string ParseTemplate(string html, List<PlaceholderValue> placeholderValues)
        {
            return Regex.Replace(html, "\\{{(.+)\\}}", m => GetMatch(m, placeholderValues));
        }
        private static string GetMatch(Match m, List<PlaceholderValue> placeholderValues)
        {
            if (m.Success)
            {
                string key = m.Result("$1");
                var placeholder = placeholderValues.FirstOrDefault(p => p.Id == key);
                if(placeholder != null)
                    return placeholder.Content;
                return string.Empty;
            }
            return string.Empty;
        }

        //public static string CompileTemplate(string html, List<PlaceholderValues> placeholderValues)
        //{
        //    foreach (var p in placeholderValues)
        //    {
        //        var placeholder = "{{" + p.Id + "}}";
        //        html = html.Replace(placeholder, p.Content);
        //    }
        //    return html;
        //}


        public static IHtmlString CompileEditableTemplate(string html, List<PlaceholderValue> placeholderValues)
        {
            foreach (var p in placeholderValues)
            {
                var placeholder = "{{" + p.Id + "}}";

                var content = p.Content;
                if (p.Id.StartsWith("editor"))
                {
                    content = string.Format("<div id=\"{0}\" class=\"editable\">{1}</div>", p.Id, p.Content);
                }
                html = html.Replace(placeholder, content);
            }
            return new HtmlString(html);
        }
    }
}
