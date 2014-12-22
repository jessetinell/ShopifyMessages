using ShopifyMessages.Core;
using ShopifyMessages.Core.Models;
using System.Collections.Generic;
using System.Linq;

namespace ShopifyMessages.Api.Models
{
    public class MessageJsonResponse
    {
        public string Id { get; set; }
        public string Html { get; set; }
        public int MaxWidth { get; set; }
        public int MinHeight { get; set; }
        public Position Position { get; set; }
        public DisplayRules DisplayRules { get; set; }
        public bool UseModalBackground { get; set; }
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
                    placeholderValues.Add("messageId",message.Id);

                    list.Add(new MessageJsonResponse
                    {
                        MinHeight = message.MinHeight,
                        MaxWidth = message.MaxWidth,
                        Id = message.Id,
                        Html = TemplateParser.Parse(message,template.Html),
                        Position = message.Position,
                        DisplayRules = message.DisplayRules,
                        UseModalBackground = message.UseModalBackground
                    });
                }

            }
            return list;
        }

    }
}