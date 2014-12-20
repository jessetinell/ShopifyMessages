using System.Configuration;
using System.Dynamic;
using System.IO;
using System.Net;
using Newtonsoft.Json;
using ShopifyAPIAdapterLibrary;
using ShopifyMessages.Core;
using ShopifyMessages.Core.Helpers;
using ShopifyMessages.Core.Models;
using ShopifyMessages.Web.Helpers;
using ShopifyMessages.Web.Infrastructure;
using ShopifyMessages.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ShopifyMessages.Web.ViewModels;

namespace ShopifyMessages.Web.Controllers
{
    [ShopifyAuthorize]
    public class MessagesController : BaseController
    {
        public PartialViewResult Index()
        {
            var messagesId = Id.Messages(ShopName);
            var messages = RavenSession.Advanced.LoadStartingWith<Message>(messagesId);

            return PartialView("_Index", new MessagesViewModel { MyMessages = messages.ToList() });
        }

        public ActionResult Create()
        {
            //ViewBag.ScriptTags = ShopifyApi.Get("/admin/script_tags.json");

            var templates = RavenSession.Query<Template>().Where(t => !t.Obsolete).ToList();

            var viewModel = new CreateViewModel
            {
                Templates = TemplateHelper.CreateTemplateViewModel(templates)
            };

            return View(viewModel);
        }

        public ActionResult Edit(string id)
        {
            var templateIdentifier = "";
            var placeholderValues = new List<PlaceholderValue>();
            var message = new Message();

            if (id.StartsWith(Id.TemplatePrefix))
            {
                // Create new message
                templateIdentifier = Id.TemplateIdentifier(id);
                var template = RavenSession.Load<Template>(id);
                placeholderValues = template.PlaceholderValues;
                message.Width = template.Width;
                message.Height = template.Height;
                message.PlaceholderValues = template.PlaceholderValues;
                message.TemplateId = id;
            }
            else
            {
                // Edit existing message
                var myMessage = RavenSession.Load<Message>(id);
                if (myMessage != null)
                {
                    placeholderValues = myMessage.PlaceholderValues;
                    message = myMessage;
                    templateIdentifier = Id.TemplateIdentifier(myMessage.TemplateId);
                }
            }


            var rawTemplate = Helper.FileAsString(string.Format("/MessageTemplates/{0}/template.html", templateIdentifier));

            var viewModel = new EditViewModel
            {
                Id = id,
                TemplateIdentifier = templateIdentifier,
                Message = message,
                EditableTemplate = Helper.CompileEditableTemplate(rawTemplate, placeholderValues)
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public RedirectToRouteResult Edit(EditViewModel viewModel)
        {
            if (viewModel.Id.StartsWith(Id.TemplatePrefix))
            {
                // Create new message
                viewModel.Message.Id = Id.Messages(ShopName);
            }

            RavenSession.Store(viewModel.Message);
            RavenSession.SaveChanges();

            return RedirectToAction("Index","Home");
        }

        public RedirectToRouteResult SyncNewTemplates()
        {  
            var newTemplateFolder = new DirectoryInfo(Server.MapPath("~/MessageTemplates"));
            var folders = newTemplateFolder.GetDirectories().ToList().Select(d => d.Name);
            foreach (var folder in folders)
            {
                TemplateHelper.SaveTemplateToDb(RavenSession, folder);
            }

            return RedirectToAction("Index", "Home");
        }
    }
}