<%-- Copyright Siemens 2019   --%>
<%@ WebHandler Language="C#" Class="SessionHandler" %>

using System;
using System.Linq;
using System.Web;
using System.Web.Security;
using Camstar.WebPortal.Constants;
using Camstar.WebPortal.PortalConfiguration;

public class SessionHandler : IHttpHandler, System.Web.SessionState.IRequiresSessionState
{
    public void ProcessRequest (HttpContext context)
    {
        context.Response.ClearContent();
        context.Response.Cache.SetCacheability(HttpCacheability.NoCache);
        context.Response.Cache.SetNoServerCaching();

        if (context.Session != null && context.Request.QueryString["keyId"] != null)
        {
            var keyId = context.Request.QueryString["keyId"];
            var keysToRemove = context.Session.Keys.Cast<string>().Where(key => key.StartsWith(keyId)).ToList();
            foreach (var key in keysToRemove)
            {
                if (context.Session[key] is System.IDisposable)
                    (context.Session[key] as System.IDisposable).Dispose();
                context.Session.Remove(key);

                context.Response.Write("Session key " + key + " removed\n");
            }
        }
        else if (context.Session != null && context.Request.QueryString["refresh"] != null)
        {
            context.Session["SessionRefreshTime"] = DateTime.Now;
        }
        else
        {
            if (context.Session != null)
            {
                var keysToDispose = context.Session.Keys.Cast<string>().ToList();
                foreach (var key in keysToDispose)
                {
                    if (context.Session[key] is System.IDisposable)
                        (context.Session[key] as System.IDisposable).Dispose();
                }
                context.Session.Abandon();
                context.Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", ""));

                if (context.Request.QueryString["callback"] != null)
                {
                    CallBackResponse(context);
                }
                else
                {
                    context.Response.Write("Session closed");
                }
            }
            else
            {
                context.Response.Write("Session empty");
            }
        }
    }

    public bool IsReusable
    {
        get { return true; }
    }

    private void CallBackResponse(HttpContext context)
    {
        context.Response.Write(
            "s111 _ig_start[[\"" + context.Request.QueryString["callback"] + "\",\"SessionClosed\"]]_ig_end");
    }
}
