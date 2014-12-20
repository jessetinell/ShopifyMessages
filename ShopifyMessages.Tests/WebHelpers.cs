using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ShopifyMessages.Web.Helpers;

namespace ShopifyMessages.Tests
{
    [TestFixture]
    public class WebHelpers
    {
        [Test]
        public void CssBgUrl()
        {
            const string url = "http://.jpg";
            var c1 = CleanUp.CssBgUrl("url(http://.jpg)");
            Assert.AreEqual(url,c1);
            var c2 = CleanUp.CssBgUrl("url(\"http://.jpg\")");
            Assert.AreEqual(url, c2);
            var c3 = CleanUp.CssBgUrl("url('http://.jpg')");
            Assert.AreEqual(url, c3);
            //var c4 = CleanUp.CssBgUrl("url(http://.jpg)");
        }
    }
}
