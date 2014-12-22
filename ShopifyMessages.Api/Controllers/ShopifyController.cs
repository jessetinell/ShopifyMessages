using System.Net.Http.Headers;
using Raven.Imports.Newtonsoft.Json;
using Raven.Imports.Newtonsoft.Json.Serialization;
using ShopifyMessages.Api.Models;
using ShopifyMessages.Core.Helpers;
using ShopifyMessages.Core.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using ShopifyMessages.Core;
using System.Dynamic;
using System.Collections.Specialized;

namespace ShopifyMessages.Api.Controllers
{
    public class ShopifyController : RavenDbController
    {
        [HttpGet]
        public HttpResponseMessage Script(string id)
        {
            var script = GetScriptString();
            var messages = Session.Advanced.LoadStartingWith<Message>(Id.Messages(id)).Where(m => m.IsLive);

            var templates = Session.Load<Template>(messages.Select(m => m.TemplateId).ToList()).ToList();

            var messageResponse = ResponseHelper.ToJsonResponse(messages, templates);

            var messagesJson = JsonConvert.SerializeObject(messageResponse, Formatting.Indented, new JsonSerializerSettings
                                                                                                {
                                                                                                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                                                                                                });
            script = string.Format("var appenMessages={0};", messagesJson) + script;
            var response = new HttpResponseMessage
            {
                Content = new StringContent(script)
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/javascript");
            return response;
        }

        private static string GetScriptString()
        {
            using (var sr = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + "/Messages.js"))
            {
                return sr.ReadToEnd();
            }
        }

        [Route("api/shopify/formpost")]
        [HttpPost]
        public HttpResponseMessage FormPost(FormValues form)
        {
            var host = Request.Headers.Host;
            /*
             * Lite saftey stuff. Rätt host, max 254 läng på email o typ max 70 på namn(?)
             * */
            Session.Store(form);
            Session.SaveChanges();

            var responseObj = new NameValueCollection();
            responseObj.Add("yea", "yea");
            var json = JsonConvert.SerializeObject(responseObj);

            var response = new HttpResponseMessage
            {
                Content = new StringContent(json),
                StatusCode = HttpStatusCode.OK

            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            return response;
        }

        //[HttpGet]
        //[Route("api/shopify/html/{*id}")]
        //public HttpResponseMessage Html(string id)
        //{
        //    string html;
        //    try
        //    {
        //        var message = Session.Include<Message>(p => p.TemplateId).Load(id);
        //        var template = Session.Load<Template>(message.TemplateId);

        //        html = Helper.ParseTemplate(template.Html, message.PlaceholderValues);
        //    }
        //    catch
        //    {
        //        html = "!";
        //    }

        //    var response = new HttpResponseMessage
        //    {
        //        Content = new StringContent(html)
        //    };
        //    response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/html");
        //    return response;
        //}


        //public Task<Messages> GetDocs(string id)
        //{
        //    var a = Session.LoadAsync<Messages>(string.Format("Messages/{0}", id));
        //    return a;
        //}



        //public async Task<HttpResponseMessage> Put([FromBody]string value)
        //{
        //    await Session.StoreAsync(new Messages { Name = value });

        //    return new HttpResponseMessage(HttpStatusCode.Created);
        //}
    }
}