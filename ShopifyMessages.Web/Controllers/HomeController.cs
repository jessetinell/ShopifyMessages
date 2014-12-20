using System.Web.Mvc;

namespace ShopifyMessages.Web.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}