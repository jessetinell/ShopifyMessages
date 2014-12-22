using System;
using System.Collections.Generic;

namespace ShopifyMessages.Core.Models
{
    [Serializable]
    public class Message : ITemplateSettings
    {
        public Message()
        {
            CustomCss = string.Empty;
        }

        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsLive { get; set; }
        public string TemplateId { get; set; }

        public Dictionary<string, string> PlaceholderValues { get; set; }
        public int MinHeight { get; set; }
        public int MaxWidth { get; set; }

        public Position Position { get; set; }

        public DisplayRules DisplayRules { get; set; }
        public bool UseModalBackground { get; set; }

        public FormSettings FormSettings { get; set; }

        public string CustomCss { get; set; }
    }

    [Serializable]
    public class FormSettings
    {
        public FormSettings()
        {
            SubmitButtonText = "Send";
            UseForm = true;
            Inputs = new List<FormInput>
                     {
                         new FormInput
                         {
                             Active = true,
                             Name = "email",
                             NiceNameInEditMode = "Email",
                             Placeholder = "Your email",
                             Type = "email"
                         },
                         new FormInput
                         {
                             Active = false,
                             Name = "name",
                             NiceNameInEditMode = "Name",
                             Placeholder = "Your name",
                             Type = "text"
                         }
                     };
        }
        public bool UseForm { get; set; }
        public string SubmitButtonText { get; set; }
        public List<FormInput> Inputs { get; set; }
    }

    [Serializable]
    public class FormInput
    {
        public string NiceNameInEditMode { get; set; }
        public string Name { get; set; }
        public string Placeholder { get; set; }
        public string Type { get; set; }
        public bool Active { get; set; }
    }

    [Serializable]
    public class Position
    {
        public Position()
        {
            HorizontalAlign = "center";
            VerticalAlign = "center";
        }
        public string VerticalAlign { get; set; }
        public string HorizontalAlign { get; set; }
    }

    [Serializable]
    public class DisplayRules
    {
        public DisplayRules()
        {
            Clicks = 3;
        }
        public int Clicks { get; set; }
        public int ScrollPosition { get; set; }
        public int Seconds { get; set; }
    }
}