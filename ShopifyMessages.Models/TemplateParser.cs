using System;
using System.Collections.Generic;
using System.IO;
using RazorEngine;
using ShopifyMessages.Core.Models;

namespace ShopifyMessages.Core
{
    public class TemplateParser
    {
        public static string Parse(Message message, string templateHtml)
        {
            var html = templateHtml;
            if (!string.IsNullOrEmpty(message.CustomCss))
                html += "<style>" + message.CustomCss + "</style>";
            return Razor.Parse(html, message);
        }

        public static string ParseEditableTemplate(string html, Message message)
        {
            var editableMessage = Helper.Clone(message);
            var editablePlaceholders = new Dictionary<string, string>();
            foreach (var placeholder in message.PlaceholderValues)
            {
                var value = placeholder.Value;
                if (placeholder.Key.StartsWith("editor"))
                {
                    value = string.Format("<div id=\"{0}\" class=\"editable\">{1}</div>", placeholder.Key,
                        placeholder.Value);
                }

                editablePlaceholders.Add(placeholder.Key, value);
            }

            editableMessage.PlaceholderValues = editablePlaceholders;

            return Parse(editableMessage, html);
        }
    }
}
