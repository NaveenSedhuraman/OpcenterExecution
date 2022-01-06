// Copyright Siemens 2020  
using System;
using System.Web;
using System.Web.Optimization;
using System.Web.UI;
using Camstar.WebPortal.Constants;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.PortalFramework;

namespace Camstar.Portal
{
    public partial class AJAXMasterPageMobile : System.Web.UI.MasterPage
    {
        public string PageName
        {
            get
            {
                string sPagePath = HttpContext.Current.Request.Url.AbsolutePath;
                return System.IO.Path.GetFileNameWithoutExtension(sPagePath);
            }
        }

        public string Query
        {
            get
            {
                var res = string.Empty;
                if (!string.IsNullOrEmpty(HttpContext.Current.Request.Url.Query))
                    res = HttpContext.Current.Request.Url.Query.TrimStart(new[] {'?'});
                return res;
            }
        }

        public string RedirectPageflow
        {
            get
            {
                string res = null;
                string redirectTo = Request.QueryString["redirectToPageflow"];
                if (!string.IsNullOrEmpty(redirectTo))
                    res = redirectTo;
                return res;
            }
        }

        public string ResumeWorkflow
        {
            get
            {
                return !string.IsNullOrEmpty(Request.QueryString["ResumeWorkflow"]) ? "1" : null;
            }
        }

        public string QualityObject
        {
            get
            {
                string res = null;
                string qualityObject = Request.QueryString["QualityObject"];
                if (!string.IsNullOrEmpty(qualityObject))
                    res = qualityObject;
                return res;
            }
        }

        public string RedirectPage
        {
            get
            {
                string res = null;
                string redirectTo = Request.QueryString["redirectToPage"];
                if (!string.IsNullOrEmpty(redirectTo))
                    res = string.Format("{0}.aspx?{1}=true", redirectTo, QueryStringConstants.IsTestMode);
                return res;
            }
        }

        public string CallStackKey
        {
            get
            {
                string res = null;
                string callStackKey = Request.QueryString[QueryStringConstants.CallStackKey];
                if (!string.IsNullOrEmpty(callStackKey))
                    res = callStackKey;
                return res;
            }
        }
        public string styleSheetString { get; set; }
        public string currentTheme { get; set; }

        protected override void OnInit(EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                var pageMapping = new PageMapping();

                /* Rolling back due to P1 STBL bug 52709 (Reopening bug 49835)
                 * pageMapping.ClearCache();
                */
                pageMapping.EnsurePageCache();
            }

            base.OnInit(e);

            // build styles
            currentTheme = Session["CurrentTheme"].ToString() ?? "camstar";
            styleSheetString = "<link href=\"assets/images/sie-logo-favicon.ico\" rel=\"SHORTCUT ICON\" />";
            styleSheetString += Styles.Render(
                        string.Format("~/themes/{0}/AJAXTabMasterPage", currentTheme),
                        string.Format("~/themes/{0}/AJAXMasterPage", currentTheme),
                        string.Format("~/themes/{0}/mobile/MobileCss", currentTheme),
                        string.Format("~/themes/{0}/workspaceoverride", currentTheme),
                        string.Format("~/themes/{0}/UserAll", currentTheme),
                        string.Format("~/themes/{0}/jstree/default/jstreeCSS", currentTheme)
                    ).ToHtmlString();

            WebPartPageBase page = this.AJAXContentPlaceHolder.Page as WebPartPageBase;
            if (page != null)
            {
                page.RegisteringDescriptors += Page_RegisteringDescriptors;
            }
            

        }
        protected virtual void Page_RegisteringDescriptors(object sender, ScriptDescriptorEventArgs e)
        {
            LabelCache labelCache = FrameworkManagerUtil.GetLabelCache(Page.Session);

            if (labelCache != null)
            {
                YesLabel.Text = labelCache.GetLabelByName("Web_Yes").Value;
                NoLabel.Text = labelCache.GetLabelByName("Web_No").Value;
                OkLabel.Text = labelCache.GetLabelByName("OKButton").Value;
                MessageTitleLabel.Text = labelCache.GetLabelByName("ConfirmationMessageTitle").Value;
                CloseLabel.Text = labelCache.GetLabelByName("Web_Close").Value;
            }

            ScriptComponentDescriptor scd = e.Descriptor as ScriptComponentDescriptor;
            if (scd != null)
            {
                scd.AddComponentProperty("workflowProgress", WorkflowProgressButtonsBar.UIComponentID);

                scd.AddProperty("labels", new
                {
                    YesLabel = YesLabel.Text,
                    NoLabel = NoLabel.Text,
                    OkLabel = OkLabel.Text,
                    MessageTitle = MessageTitleLabel.Text,
                    CloseLabel = CloseLabel.Text
                });
                scd.AddProperty("pageType", "ajax-master-mobile");

            }
        }
    }
}
