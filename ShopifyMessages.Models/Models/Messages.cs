using System.Collections.Generic;

namespace ShopifyMessages.Core.Models
{
    //public class Messages
    //{
    //    public string Id { get; set; }
    //    public List<Message> MessageList { get; set; }
    //}

    public class Message : ITemplateSettings
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsLive { get; set; }
        public string TemplateId { get; set; }

        public List<PlaceholderValue> PlaceholderValues { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
    }
}