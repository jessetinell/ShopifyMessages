using ShopifyMessages.Core;
using ShopifyMessages.Core.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace ShopifyMessages.Api.Models
{
    public class MessageJsonResponse
    {
        public string id { get; set; }
        public string html { get; set; }
    }
    public class ResponseHelper
    {
        public static List<MessageJsonResponse> ToJsonResponse(IEnumerable<Message> messages, List<Template> templates)
        {
            var list = new List<MessageJsonResponse>();
            foreach (var message in messages)
            {
                var template = templates.FirstOrDefault(t => t.Id == message.TemplateId);
                if (template != null)
                {
                    var placeholderValues = message.PlaceholderValues;
                    placeholderValues.Add(new PlaceholderValue { Id = "messageId", Content = message.Id });

                    list.Add(new MessageJsonResponse
                    {
                        //url = ConfigurationManager.AppSettings["ApiUrl"] + "/api/shopify/html/" + message.Id,
                        //height = message.Height,
                        //width = message.Width,
                        id = message.Id,
                        html = Helper.ParseTemplate(template.Html, placeholderValues)
                    });
                }

            }
            return list;
        }

    }
}