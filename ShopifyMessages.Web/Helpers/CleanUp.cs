using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace ShopifyMessages.Web.Helpers
{
    public class CleanUp
    {
        public static string CssBgUrl(string css)
        {
            css = css.Replace("url('", string.Empty);
            css = css.Replace("url(\"", string.Empty);
            css = css.Replace("url(", string.Empty);

            css = css.Replace("')", string.Empty);
            css = css.Replace("\")", string.Empty);
            css = css.Replace(")", string.Empty);

            return css;
        }

        public static string MinifyHtml(string html)
        {
            string cleanedHtml;

            // Remove mulitple whitespace and new \r\n
            //cleanedHtml = Regex.Replace(html, @"\s+", " ");

            return html;
        }
    }
}