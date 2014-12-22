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

            if (!messages.Any())
                Response.Redirect(Url.Action("Create", new { first = true }));

            return PartialView("_Index", new MessagesViewModel { MyMessages = messages.ToList() });
        }

        public ActionResult Create(bool first = false)
        {
            //ViewBag.ScriptTags = ShopifyApi.Get("/admin/script_tags.json");

            var templates = RavenSession.Query<Template>().Where(t => !t.Obsolete).ToList();

            var viewModel = new CreateViewModel
            {
                First = first,
                Templates = TemplateHelper.CreateTemplateViewModel(templates)
            };

            return View(viewModel);
        }

        public ActionResult Edit(string id)
        {
            var templateIdentifier = "";
            var message = new Message();
            Template template;

            if (id.StartsWith(Id.TemplatePrefix))
            {
                // Create new message
                templateIdentifier = Id.TemplateIdentifier(id);
                template = RavenSession.Load<Template>(id);
                message.PlaceholderValues = template.PlaceholderValues;
                message.MaxWidth = template.MaxWidth;
                message.MinHeight = template.MinHeight;
                message.PlaceholderValues = template.PlaceholderValues;
                message.TemplateId = id;
                message.FormSettings = new FormSettings();
                message.Position = new Position();
                message.DisplayRules = new DisplayRules();
            }
            else
            {
                // Edit existing message
                var myMessage = RavenSession.Load<Message>(id);

                message = myMessage;
                templateIdentifier = Id.TemplateIdentifier(myMessage.TemplateId);

                template = RavenSession.Load<Template>(myMessage.TemplateId);
            }

            var viewModel = new EditViewModel
            {
                Id = id,
                TemplateIdentifier = templateIdentifier,
                Message = message,
                Template = template,
                EditableTemplate = TemplateParser.ParseEditableTemplate(template.Html, message)
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [ValidateInput(false)]
        public RedirectToRouteResult Edit(EditViewModel viewModel)
        {
            if (viewModel.Id.StartsWith(Id.TemplatePrefix))
            {
                // Create new message
                viewModel.Message.Id = Id.Messages(ShopName);
            }

            RavenSession.Store(viewModel.Message);
            RavenSession.SaveChanges();

            return RedirectToAction("Index", "Home");
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