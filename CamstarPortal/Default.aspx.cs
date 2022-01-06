// Copyright Siemens 2020  
using Camstar.Util;
using Camstar.WCF.ObjectStack;
using Camstar.WCF.Services;
using Camstar.WebPortal.Constants;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.Utilities;
using System;
using System.Linq;
using System.Web;
using System.Web.Optimization;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using OM = Camstar.WCF.ObjectStack;

namespace Camstar.Portal
{
    /// <summary>
    /// Summary description for Default
    /// </summary>
    partial class Default : Page
    {
        string year = DateTime.Today.Year.ToString();
        public string styleSheetString { get; set; }

        #region Overrides

        protected override void OnPreInit(EventArgs e)
        {
            base.OnPreInit(e);

            // For Classic the session is killed if it's not empty. For apollo it's killed in apollo service
            if (QueryDisplayMode == "classic")
            {
                if (Request.UrlReferrer == null && !string.IsNullOrEmpty(Request.Cookies["ASP.NET_SessionId"]?.Value) && Session?.Count > 0)
                {
                    Session.Abandon();
                    Response.Cookies["ASP.NET_SessionId"].Value = "";
                }
            }
        }

        protected override void OnInit(EventArgs e)
        {
            var currentTheme = Request.QueryString["Theme"];
            if (currentTheme == null)
            {
                if (QueryDisplayMode == "classic")
                    currentTheme = "Camstar";
                else
                {
                    var defaultTheme = CamstarPortalSection.Settings.DefaultSettings.DefaultTheme ?? "Camstar";
                    currentTheme = defaultTheme == "Classic" ? "Camstar" : defaultTheme;
                }

            }
            Session["CurrentTheme"] = currentTheme;

            if (IsMobile)
            {
                var session = FrameworkManagerUtil.GetFrameworkSession();
                NavigateToNext(session);
            }

            //Apollo Login page redirect
            if (IsApolloLink)
            {
                var session = FrameworkManagerUtil.GetFrameworkSession();
                var pageMapping = new PageMapping();
                pageMapping.EnsurePageCache();
                NavigateToNext(session);
            }

            base.OnInit(e);
            styleSheetString = "<link href=\"assets/images/sie-logo-favicon.ico\" rel=\"SHORTCUT ICON\" />";
            styleSheetString += Styles.Render(
                        string.Format("~/themes/{0}/login", currentTheme)
                    ).ToHtmlString();

            string autoComplete = WebConfigUtil.GetDefaultSettingsValue(WebConfigKeyConstants.LogonAutoComplete);

            if (!string.IsNullOrEmpty(autoComplete))
            {
                if (StringUtil.ToBool(autoComplete))
                    Form.Attributes.Add(HTMLConstants.AutoComplete, HTMLConstants.On);
                else
                    Form.Attributes.Add(HTMLConstants.AutoComplete, HTMLConstants.Off);
            }

            if (Session[mRedirectToLineAssignmentKey] != null)
            {
                Session[mRedirectToLineAssignmentKey] = null;
                Response.Redirect(FrameworkManagerUtil.LineAssignmentPage);
            }

            // Inittialize serializers
            ContentXmlSerializer<PageModel>.Instantiate();
            ContentXmlSerializer<WebPartModel>.Instantiate();
            ContentXmlSerializer<ControlModel>.Instantiate();
            ContentXmlSerializer<PageContent>.Instantiate();
            ContentXmlSerializer<WebPartDefinition>.Instantiate();
            ContentXmlSerializer<PageFlowContent>.Instantiate();
        }

        protected override void OnLoad(EventArgs e)
        {
            const string IsNotPostback = "isnotpostback";
            Year.Text = year;

            base.OnLoad(e);

            if (!this.IsPostBack)
            {
                FormsAuthentication.SignOut();
                HttpContext.Current.Session.RemoveAll();

                foreach (WebPortal.PortalConfiguration.Domain domain in CamstarPortalSection.Settings.DomainSettings.Domains)
                {
                    DomainDropDown.Items.Add(domain.Name);
                }

                LanguageDropDown.Items.Add(string.Empty); // add default language.
                foreach (WebPortal.PortalConfiguration.Language language in CamstarPortalSection.Settings.LanguageSettings.Languages)
                {
                    LanguageDropDown.Items.Add(language.Name);
                }

                TimeZoneDropDown.Items.Add(new ListItem(IsNotPostback, IsNotPostback));

                foreach (WebPortal.PortalConfiguration.TimeZone timeZone in CamstarPortalSection.Settings.TimeZoneSettings.TimeZones)
                {
                    TimeSpan timeSpanOffset = TimeSpan.Parse(timeZone.Offset);

                    TimeZoneDropDown.Items.Add(new ListItem("(GMT" + (timeSpanOffset.TotalMinutes > 0 ? "+" : "-") +
                        timeSpanOffset.Duration().ToString().Remove(5) + ") " + timeZone.Name, timeSpanOffset.TotalMinutes.ToString()));
                }
                if (CamstarPortalSection.Settings.TimeZoneSettings.TimeZones.Length == 0)
                    TimeZoneDropDown.Items.Add(new ListItem("(GMT-05:00) EST", "-300"));
                var path = string.Format("{0}://{1}{2}", Request.Url.Scheme, Request.Url.Authority, Request.ApplicationPath);
                ClientScript.RegisterStartupScript(Page.GetType(), "bodyload", string.Format("if(top != self) {{ window.open('{0}/', '_top'); }}", path), true);

                PasswordTextbox.MaxLength = CamstarPortalSection.Settings.DefaultSettings.PasswordLengthLimit;
            }
            else
            {
                TimeZoneDropDown.Items.Remove(IsNotPostback);
            }
        }

        #endregion

        #region Protected Methods

        protected void LoginButton_Click(object sender, EventArgs e)
        {
            FrameworkSession fs = new FrameworkSession();

            string dictionary = LanguageDropDown.SelectedValue;

            var authenticated = false;

            var password = PasswordTextbox.Text;
            if (password.Length <= CamstarPortalSection.Settings.DefaultSettings.PasswordLengthLimit)
                authenticated = fs.Login(DomainDropDown.SelectedValue, UsernameTextbox.Text, password, "CamstarPortal", Application, Session, TimeSpan.FromMinutes(int.Parse(TimeZoneDropDown.SelectedValue)), dictionary, ref mStatusMessage);

            if (!authenticated)
                LoginError();
            else
            {
                var pageMapping = new PageMapping();

                /* Rolling back due to P1 STBL bug 52709 (Reopening bug 49835)
                 * pageMapping.ClearCache();
                */
                pageMapping.EnsurePageCache();
                URIConstantsBase.InitializeForAbsoluteURI(Page);

                string userName = UsernameTextbox.Text;
                FormsAuthentication.SetAuthCookie(userName, false);

                NavigateToNext(fs);
            }
        }

        public bool showLineAssignmentOnLogOn
        {
            get
            {
                return Session[SessionConstants.ShowLineAssignmentOnLogon] != null ?
                Convert.ToBoolean(Session[SessionConstants.ShowLineAssignmentOnLogon]) : true;
            }
        }
        /// <summary>
        /// NavigateToNext - given a session that has been logged in, the method sets proper display settings and navigates to next step
        ///                  either navigating to to lineassignment page or main page.
        /// </summary>
        /// <param name="fs"></param>
        protected void NavigateToNext(FrameworkSession fs)
        {
            SetDisplayValues();
            SetEmployeeLogin(fs);

            var redirectPage = mDefaultPage;
            if (LineAssignmentPageCheck())
            {
                if (IsMobile)
                {
                    redirectPage = mMainPage;
                    Session[SessionConstants.IsMobileLineAssignmentRedirect] = true;
                }
                else if (IsApollo)
                {
                    redirectPage = mMainPage + "?openLineAssignmentPopup=true";
                }
                else
                    Session[mRedirectToLineAssignmentKey] = true;
            }
            else
            {
                //set directLink
                var directLink = Request.QueryString["directLink"];
                if (directLink != null)
                    Session["DirectLink"] = Request.QueryString;

                redirectPage = mMainPage;
            }
            Response.Redirect(redirectPage);
        }

        private void SetDisplayValues()
        {
            //Default to Display to ClassicDesktop
            Session[SessionConstants.EntryPoint] = SessionConstants.Classic;
            Session[SessionConstants.RenderMode] = SessionConstants.Fixed;
            if (IsApollo)
            {
                Session[SessionConstants.EntryPoint] = SessionConstants.Apollo;
                Session[SessionConstants.RenderMode] = SessionConstants.Responsive;
            }
            if (IsMobile)
            {
                Session[SessionConstants.RenderMode] = SessionConstants.Responsive;
            }
        }

        protected void LoginError()
        {
            if (!string.IsNullOrEmpty(mStatusMessage))
                ErrorLabel.Text = mStatusMessage;
            else
                ErrorLabel.Text = "Login Failed - invalid user name or password";
        }

        private string[] GetDefaultFilterTags(FrameworkSession session)
        {
            string[] filterTags = null;

            var service = new FilterTagInquiryService(session.CurrentUserProfile);
            var serviceData = new OM.FilterTagInquiry
            {
                CurrentEmployee = new OM.NamedObjectRef(session.CurrentUserProfile.Name)
            };

            var request = new FilterTagInquiry_Request
            {
                Info = new OM.FilterTagInquiry_Info()
                {
                    EmployeeSessionFilterTag = new OM.FilterTag_Info
                    {
                        InstanceID = new OM.Info(true)
                    },
                    FilterTagAccess = new OM.Info(true)
                }
            };

            FilterTagInquiry_Result result;

            var resultStatus = service.GetEmpSessionFilterTags(serviceData, request, out result);
            if (resultStatus.IsSuccess)
            {
                var ids = string.Empty;
                var filterTagAccess = string.Empty;
                if (result.Value != null)
                {
                    if (result.Value.FilterTagAccess != null)
                    {
                        filterTagAccess = result.Value.FilterTagAccess.Value.ToString();
                    }
                    else
                    {
                        filterTagAccess = "1";
                    }
                    if (result.Value.EmployeeSessionFilterTag != null && result.Value.EmployeeSessionFilterTag.Length > 0)
                    {
                        ids = string.Join(",", result.Value.EmployeeSessionFilterTag.Select(ft => ft.InstanceID.ID));
                    }
                }
                filterTags = new string[] { filterTagAccess, ids };
            }
            return filterTags;
        }

        private void SetEmployeeLogin(FrameworkSession fs)
        {
            if (fs == null || fs.CurrentUserProfile == null)
                return;

            //set filter tags
            var filterTags = GetDefaultFilterTags(fs);
            if (filterTags != null && filterTags.Length == 2)
            {
                fs.CurrentUserProfile.FilterTagAccess = filterTags[0];
                fs.CurrentUserProfile.FilterTags = filterTags[1];
            }

            var service = new EmployeeMaintService(fs.CurrentUserProfile);
            var serviceData = new EmployeeMaint
            {
                ObjectToChange = new NamedObjectRef { Name = fs.CurrentUserProfile.Name },
            };

            var request = new EmployeeMaint_Request();
            var result = new EmployeeMaint_Result();

            service.BeginTransaction();
            service.Load(serviceData);

            var utc = TimeZoneInfo.Local.GetUtcOffset(DateTime.UtcNow);
            var loginTime = fs.LoginDateTime.AddMilliseconds(-fs.LoginDateTime.Millisecond);
            serviceData = new EmployeeMaint
            {
                ObjectChanges = new EmployeeChanges
                {
                    EmployeeLoginInfo = new EmployeeLoginInfoChanges
                    {
                        LastLoginDateGMT = loginTime.Subtract(utc)
                    }
                }
            };
            service.ExecuteTransaction(serviceData);
            service.CommitTransaction(request, out result);
        }

        private bool LineAssignmentPageCheck()
        {
            bool isAuthorized = false;
            AuthorizationManager authManager = FrameworkManagerUtil.GetAuthorizationManager(Session);
            if (authManager != null)
            {
                string pageName = FrameworkManagerUtil.LineAssignmentPage;
                if (IsMobile)
                    pageName = FrameworkManagerUtil.MobileLineAssignmentPage;
                pageName = PageMapping.ExtractPageName(pageName);
                isAuthorized = authManager.IsUIComponentAuthorized(pageName);
            }
            Session[SessionConstants.LineAssignmentPageAuthorization] = isAuthorized;
            return isAuthorized && showLineAssignmentOnLogOn;
        }

        private bool IsMobileDevice
        {
            get
            {
                if (Request.Browser.IsMobileDevice)
                    return true;

                if (Request.Browser.Type == "Safari13")
                    return true;

                return false;
            }
        }

        private bool IsMobile
        {
            get
            {
                return this.QueryDisplayMode == "mobile" || IsMobileDevice;
            }
        }

        private bool IsApollo
        {
            get
            {
                return this.QueryDisplayMode == "apollo";
            }
        }

        private string QueryDisplayMode
        {
            get
            {
                var mode = Request.QueryString["mode"];
                return mode != null ? mode.ToLower() : "classic";
            }
        }

        private bool IsApolloLink
        {
            get
            {
                return Request["apolloLink"] != null;
            }
        }

        #endregion

        #region Private Member Variables

        private string mStatusMessage = string.Empty;
        private const string mRedirectToLineAssignmentKey = "redirectToLineAssignment";

        private const string mDefaultPage = "Default.aspx";
        private const string mMainPage = "Main.aspx";

        #endregion
    }
}
