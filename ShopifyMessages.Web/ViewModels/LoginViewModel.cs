using System.ComponentModel.DataAnnotations;

namespace ShopifyMessages.Web.ViewModels
{
    public class LoginViewModel
    {
        [Required]
        [Display(Name = "Shop name", Description = "Just the shop name part of shopname.myshopify.com")]
        public string ShopName { get; set; }
    }
}
