// Copyright Siemens 2020  
using System;
using System.Web;
using System.Web.UI;
using Camstar.WebPortal.Constants;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.PortalFramework;
using CamstarPortal.WebControls;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.FormsFramework;
using Camstar.WCF.Services;
using Camstar.WCF.ObjectStack;
using System.Collections.Specialized;
using Camstar.WebPortal.Utilities;
using System.Web.Optimization;

namespace Camstar.Portal
{
    public partial class AJAXTabMasterPage : MasterPage
    {
        public string PortalHomePage
        {
            get { return portalHomePage; }
        }

        public string PortalQuery
        {
            get { return portalQuery; }
        }

        public string RedirectPage
        {
            get
            {
                return Request.QueryString["redirectToPage"];
            }
        }

        public bool TestMode
        {
            get
            {
                bool testit = false;
                return bool.TryParse(Request.QueryString[QueryStringConstants.IsTestMode], out testit) && testit;
            }
        }

        public string RedirectPageCaption
        {
            get
            {
                return string.IsNullOrEmpty(RedirectPage) ? string.Empty : new PageMapping().GetPageDescription(RedirectPage);
            }
        }

        public string HomePageCaption
        {
            get
            {
                return string.IsNullOrEmpty(PortalHomePage) ? string.Empty : new PageMapping().GetPageDescription(PortalHomePage);
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

        public string CloseLabel_GenMessage
        {
            get
            {
                string closeLabel = "Close";
                LabelCache labelCache = LabelCache.GetRuntimeCacheInstance();
                closeLabel = labelCache.GetLabelTextByName("LblMenuClose", "Close", val => closeLabel = val);
                return closeLabel;
            }

        }

        public string GeneralMessageLabel
        {
            get
            {
                string generalMessageLabel = "General Message";
                LabelCache labelCache = LabelCache.GetRuntimeCacheInstance();
                generalMessageLabel = labelCache.GetLabelTextByName( "Factory_GeneralMessage", "General Message", val => generalMessageLabel = val );
                return generalMessageLabel;
            }

        }

        public string MessageLabel
        {
            get
            {
                string messageLabel = "Message";
                LabelCache labelCache = LabelCache.GetRuntimeCacheInstance();
                messageLabel = labelCache.GetLabelTextByName( "EMailMessage_Message", "Message", val => messageLabel = val );
                return messageLabel;
            }

        }

        public string BodyCssClass
        {
            get
            {
                var cssClass = "body-tabbed";
                if (IsClassicMobile)
                    cssClass += " mobile";
                if (CamstarPortalSection.Settings.DefaultSettings.FullScreenMode || IsClassicMobile)
                    cssClass += " body-fullScreenMode";
                return cssClass;
            }
        }

        public bool IsResponsive
        {
            get 
            { 
                return Session[SessionConstants.RenderMode].ToString() == SessionConstants.Responsive;
            }
        }

        public bool IsClassicDesktop
        {
            get
            {
                return Session[SessionConstants.EntryPoint].ToString() == SessionConstants.Classic &&
                    Session[SessionConstants.RenderMode].ToString() == SessionConstants.Fixed;
            }
        }
        public bool IsClassicMobile
        {
            get
            {
                return Session[SessionConstants.EntryPoint].ToString() == SessionConstants.Classic &&
                    Session[SessionConstants.RenderMode].ToString() == SessionConstants.Responsive;
            }
        } 

        public bool IsApollo
        {
            get
            {
                return Session[SessionConstants.EntryPoint].ToString() == SessionConstants.Apollo;
            }
        }

        public bool ShowGeneralMessage
        {
            get
            {
                if (Session["ShowGeneralMessage"] != null )
                    return false;

                bool retVal = false;                
                var session = FrameworkManagerUtil.GetFrameworkSession( HttpContext.Current.Session );

                if ( session != null )
                {
                    GetGeneralMessageService service = new GetGeneralMessageService( session.CurrentUserProfile );

                    var request = new GetGeneralMessage_Request()
                    {
                        Info = new GetGeneralMessage_Info()
                        {
                            DisplayGeneralMessage = new Info( true, false )
                        }
                    };

                    var result = new GetGeneralMessage_Result();
                    ResultStatus resultStatus = service.GetEnvironment( request, out result );
                    if ( resultStatus != null && resultStatus.IsSuccess )
                    {
                        if ( result.Value.DisplayGeneralMessage != null )
                            retVal = result.Value.DisplayGeneralMessage.Value;
                    }
                }
                Session["ShowGeneralMessage"] = retVal;
                return retVal;
            }
        }

        public string GenMessage
        {
            get
            {
                var session = FrameworkManagerUtil.GetFrameworkSession( HttpContext.Current.Session );
                string message = "";
                if ( session != null )
                {
                    GetGeneralMessageService service = new GetGeneralMessageService( session.CurrentUserProfile );

                    var request = new GetGeneralMessage_Request()
                    {
                        Info = new GetGeneralMessage_Info()
                        {
                            GeneralMessage = new Info( true, false )
                        }
                    };

                    var result = new GetGeneralMessage_Result();
                    ResultStatus resultStatus = service.GetEnvironment( request, out result );
                    if ( resultStatus != null && resultStatus.IsSuccess )
                        message = Convert.ToString( result.Value.GeneralMessage );
                }
                return message;
            }
        }

        private string portalHomePage;
        private string portalQuery;
        public string styleSheetString { get; set; }
        public string currentTheme { get; set; }
        protected override void OnInit(EventArgs e)
        {
            base.OnInit(e);

            currentTheme = Session["CurrentTheme"].ToString();
            styleSheetString = "<link href=\"assets/images/sie-logo-favicon.ico\" rel=\"SHORTCUT ICON\" />";
            styleSheetString += Styles.Render(
                        string.Format("~/themes/{0}/AJAXChildMaster", currentTheme),
                        string.Format("~/themes/{0}/workspaceoverride", currentTheme),
                        string.Format("~/themes/{0}/UserAll", currentTheme),
                        string.Format("~/themes/{0}/jstree/default/jstreeCSS", currentTheme)
                    ).ToHtmlString();

            if (IsClassicMobile)
            {
                if (currentTheme == "camstar")
                {
                    styleSheetString += Styles.Render(
                        string.Format("~/themes/{0}/mobile/MobileCss", currentTheme)
                    ).ToHtmlString();
                }
                else
                {
                    styleSheetString += Styles.Render(
                        string.Format("~/themes/{0}/bootstrapCss", currentTheme)
                    ).ToHtmlString();
                }
                    
            }

            WebPartPageBase page = this.AJAXContentPlaceHolder.Page as WebPartPageBase;
            if (page != null)
            {
                page.RegisteringDescriptors += Page_RegisteringDescriptors;
            }

            var directLinkParameters = (NameValueCollection)Session["DirectLink"];
            if (directLinkParameters!=null)
            {
                var directLink = directLinkParameters["directLink"];
                portalQuery = directLinkParameters.ToString();
                portalHomePage = directLink != null ? directLink : GetHomePage();
                Session.Remove("DirectLink");
            }
            else
            {
                portalHomePage = GetHomePage();
            }

            Session.Remove(SessionConstants.IsMobileLineAssignmentRedirect);
        }

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            ButtonsBar.Hidden = true;
            NavigationButtonsBar.Hidden = true;
            if (IsClassicMobile)
            {
                ScriptManager.Scripts.Add(new ScriptReference { Name = "bootstrap" });
                ScriptManager.Scripts.Add(new ScriptReference { Name = "mobileControls" });
            }
            if (IsApollo)
            {
                ScriptManager.Scripts.Add(new ScriptReference { Name = "apollo" });
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
                LoadingLabel.Text = labelCache.GetLabelByName("Lbl_PopupLoadingTitle").Value;
            }

            ScriptComponentDescriptor scd = e.Descriptor as ScriptComponentDescriptor;
            if (scd != null)
            {
                if (IsClassicDesktop)
                {
                    scd.AddComponentProperty("header", Header.UIComponentID);                    
                }
                scd.AddProperty("labels", new
                {
                    YesLabel = YesLabel.Text,
                    NoLabel = NoLabel.Text,
                    OkLabel = OkLabel.Text,
                    MessageTitle = MessageTitleLabel.Text,
                    CloseLabel = CloseLabel.Text
                });


                scd.AddProperty("LoadingLabelText", LoadingLabel.Text);

                var startInfo = new {
                    RedirectPage, RedirectPageCaption,
                    PortalQuery,HomePageCaption, PortalHomePage, RedirectPageflow,
                    TestMode, ShowGeneralMessage,
                    GeneralMessageLabel, CloseLabel_GenMessage, GenMessage
                };

                scd.AddProperty("startInfo", startInfo);
                scd.AddProperty("pageType", "ajax-tab-master");
            }
        }

        protected string GetHomePage()
        {
            string homePage = FrameworkManagerUtil.GetHomePage();
            if (IsClassicMobile)
            {
                if (Session[SessionConstants.IsMobileLineAssignmentRedirect] != null)
                {
                    Session[SessionConstants.ReturnToMobileHomePage] = homePage;
                    homePage = PageMapping.ExtractPageName(FrameworkManagerUtil.MobileLineAssignmentPage);
                }
            }
            else if (IsApollo)
            {
                homePage = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session).SessionValues.UserPortalProfile.PortalV8HomePage;
            }
            return homePage;
        }
    }
}
