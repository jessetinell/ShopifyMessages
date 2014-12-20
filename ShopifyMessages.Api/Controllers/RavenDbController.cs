using Raven.Client;
using Raven.Client.Document;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace ShopifyMessages.Api.Controllers
{
    public class RavenDbController : ApiController
    {
        public IDocumentStore Store
        {
            get { return LazyDocStore.Value; }
        }

        private static readonly Lazy<IDocumentStore> LazyDocStore = new Lazy<IDocumentStore>(() =>
        {
            var docStore = new DocumentStore
            {
                ConnectionStringName = "RavenDb"
            };

            docStore.Initialize();
            return docStore;
        });

        public IDocumentSession Session { get; set; }

        public async override Task<HttpResponseMessage> ExecuteAsync(
            HttpControllerContext controllerContext,
            CancellationToken cancellationToken)
        {
            using (Session = Store.OpenSession())
            {
                var result = await base.ExecuteAsync(controllerContext, cancellationToken);
                //Session.SaveChanges();

                return result;
            }
        }

        //public IAsyncDocumentSession SessionAsync { get; set; }

        //public async override Task<HttpResponseMessage> ExecuteAsync(
        //    HttpControllerContext controllerContext,
        //    CancellationToken cancellationToken)
        //{
        //    using (SessionAsync = Store.OpenAsyncSession())
        //    {
        //        var result = await base.ExecuteAsync(controllerContext, cancellationToken);
        //        await SessionAsync.SaveChangesAsync();

        //        return result;
        //    }
        //}
    }
}