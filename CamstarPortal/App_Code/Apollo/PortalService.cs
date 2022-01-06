// © Siemens 2019 Siemens Product Lifecycle Management Software Inc.
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.Web;

using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.PortalConfiguration;
using Camstar.WebPortal.Constants;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.Personalization;
using System.ServiceModel.Channels;

namespace WebClientPortal
{

    [ServiceContract(Namespace = "")]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class ApolloPortalService
    {
        [OperationContract]
        public virtual ResultStatus Logon(ref LoginFormModel profile, string domain)
        {
            var request = OperationContext.Current.IncomingMessageProperties[HttpRequestMessageProperty.Name] as HttpRequestMessageProperty;
            var cookieSessionId = request.Headers["Cookie"]?.Split(';').FirstOrDefault(s => s.StartsWith("ASP.NET_SessionId="))?.Substring("ASP.NET_SessionId=".Length);

            // If current cookie session id is equal to internal session - don't do login
            var keepSession = HttpContext.Current.Session?.SessionID == (cookieSessionId ?? "");

            if (keepSession)
                return new ResultStatus("Logon OK!", true);

            string status = "Logon Failed!";
            var res = false;
            System.Web.Security.FormsAuthentication.SignOut();
            HttpContext.Current.Session.RemoveAll();  
            var fs = new FrameworkSession();    
            var userProfile = new UserProfile(profile.Name, profile.Password);
            if (fs != null)
            {
                var password = userProfile.Password.Value;
                if (password.Length > CamstarPortalSection.Settings.DefaultSettings.PasswordLengthLimit)
                {
                    // Kill the session if available
                    HttpContext.Current.Session?.Abandon();
                    HttpContext.Current.Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", ""));
                    return new ResultStatus("Login Failed - invalid user name or password", false);
                }

                var offset = TimeSpan.FromMinutes(int.Parse(profile.UTCOffset ?? "0"));
                res = fs.Login(domain, userProfile.Name, password, "CamstarPortal", HttpContext.Current.Application, HttpContext.Current.Session,
                    offset, profile.Dictionary, ref status);
                if (res)
                {
                    System.Web.Security.FormsAuthentication.SetAuthCookie(profile.Name, true);
                    URIConstantsBase.InitializeForAbsoluteURI(HttpContext.Current.Request);
                    userProfile.Name = fs.CurrentUserProfile.Name;
                    userProfile.SessionID = fs.CurrentUserProfile.SessionID;
                    userProfile.UTCOffset = fs.CurrentUserProfile.UTCOffset;
                    if (userProfile.SessionID != null && !userProfile.SessionID.IsEmpty)
                        userProfile.Password = null;

                    // Get primary language
                    var language = fs.SessionValues.LanguageName;
                    if (!string.IsNullOrEmpty(language))
                    {
                        // Use profile as the language is set after login
                        profile.Dictionary = language;
                    }
                }
                else
                {
                    // Kill the session if available
                    HttpContext.Current.Session?.Abandon();
                    HttpContext.Current.Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", ""));
                }
            }
            return new ResultStatus(status, res);
        }

        [OperationContract]
        public virtual ResultStatus GetApolloNavigationLabels(ref TranslationLabelsModel[] labelsToTranslate)
        {
            var res = new ResultStatus("Error Getting Translations", false);
            var fs = FrameworkManagerUtil.GetFrameworkSession();
            if (fs != null)
            {
                var labels = fs.GetLabelCache();
                if (labels != null)
                {
                    //Get all labels in one request
                    labels.GetLabels(TransationLabelsToLableList(labelsToTranslate));

                    foreach (var label in labelsToTranslate)
                    {
                        var currentLabel = labels.GetLabelByName(label.LabelName) ?? null;
                        if (currentLabel != null)
                        {
                            label.LabelValue = currentLabel.Value; 
                        }
                    }
                }
                res.IsSuccess = true;

            }
            return res;
        }

        private LabelList TransationLabelsToLableList(TranslationLabelsModel[] labelsToTranslate)
        {
            LabelList labelList = new LabelList();
            labelList.AddRange(labelsToTranslate.Select(translationLabels => new Label(translationLabels.LabelName)));
            return labelList;
        }
        
        [OperationContract]
        public virtual ResultStatus Logout()
        {
            var session = FrameworkManagerUtil.GetFrameworkSession();
            session.Logout();
            System.Web.Security.FormsAuthentication.SignOut();
           HttpContext.Current.Session.RemoveAll();
            return new ResultStatus("", true);
        }

        [OperationContract]
        public virtual ResultStatus VerifyLogon(out UserProfile profile)
        {
            var request = OperationContext.Current.IncomingMessageProperties[HttpRequestMessageProperty.Name] as HttpRequestMessageProperty;
            // If hash set - it's return from studio
            var keepSession = (request.Headers["Hash"] != null && request.Headers["Hash"] == "#/screen/apollo");
            if (!keepSession)
            {
                if (request.Headers["Referer"] != null && request.Headers["Referer"].Contains("redirectToPage="))
                    keepSession = true;
            }

            ResultStatus res = new ResultStatus("Logon Failed!", false);
            profile = null;
            if (IsSessionValid() && keepSession)
            {            
                res = new ResultStatus("Logon OK", true);
                FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession();
                profile = new UserProfile
                {
                    Name = session.CurrentUserProfile.Name,
                    UTCOffset = session.CurrentUserProfile.UTCOffset,
                    SessionID = session.CurrentUserProfile.SessionID
                };
            }
            else
            {
                HttpContext.Current.Session.Abandon();
                HttpContext.Current.Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", ""));
            }
            return res;
        }

        [OperationContract]
        public ResultStatus GetApolloSettings(out ApolloSettings settings)
        {
            var res = new ResultStatus("Error retrieving Apollo settings!", false);
            var session = FrameworkManagerUtil.GetFrameworkSession();
            settings = new ApolloSettings();

            var contract = HttpContext.Current.Session[SessionConstants.SessionDataContract] as UIComponentDataContract;
            if (contract != null)
            {
                settings.Resource = getContractSafeText(contract, DataMemberConstants.Resource);
                settings.Workstation = getContractSafeText(contract, DataMemberConstants.WorkStation);
                settings.Workcenter = getContractSafeText(contract, DataMemberConstants.WorkCenter);
                settings.Operation = getContractSafeText(contract, DataMemberConstants.Operation);
            }

            settings.PortalStudioAccess = (bool)HttpContext.Current.Session[SessionConstants.PortalStudioAccess];
            res = new ResultStatus("Apollo settings retrieved successfully", true);
            return res;
        }

        private static string getContractSafeText(UIComponentDataContract contract, string name)
        {
            var ret = string.Empty;
            var v = contract.GetValueByName(name);
            if (v != null)
            {
                ret = System.Net.WebUtility.HtmlEncode(v.ToString());
            }
            return ret;
        }

        [OperationContract]
        public PortalSettings GetLoginSettings()
        {
            // Kill the session if available
            HttpContext.Current.Session?.Abandon();
            HttpContext.Current.Response.Cookies.Add(new HttpCookie("ASP.NET_SessionId", ""));

            return CamstarPortalSection.GetSettings();
        }

        [OperationContract]
        public virtual ResultStatus GetMenuItems(out ApolloMenuItem[] menuItems)
        {
            var res = new ResultStatus("Get Menu Items Failed!", false);
            menuItems = null;
            if (IsSessionValid())
            {
                var menuList = new List<ApolloMenuItem>();
                var session = FrameworkManagerUtil.GetFrameworkSession();
                var menuName = session.SessionValues.UserPortalV8MenuName;
                var mItems = CamstarPortal.WebControls.NavigationMenu.GetMenuRows();
                var items = GetChildMenuItems(menuName, mItems);
                menuItems = items.Where(x => x.Children.Length > 0 || x.IsHomePage).ToArray();
                res = new ResultStatus("Menu Items retrieved successfully", true);
            }
            return res;
        }

        private ApolloMenuItem[] GetChildMenuItems(string parentName, Row[] menuItems)
        {
            var resultMenuItems = new List<ApolloMenuItem>();
            if (string.IsNullOrEmpty(parentName))
                return resultMenuItems.ToArray();
            var session = FrameworkManagerUtil.GetFrameworkSession();
            var items = menuItems.Where(i => i.Values[11] == parentName).ToArray();
            foreach (var item in items)
            {
                var pageFlowName = item.Values[7];
                var virtualPageName = item.Values[9];

                var navigateToUrl = !string.IsNullOrEmpty(virtualPageName) ? virtualPageName : pageFlowName;
                var queryString = string.Empty;
                if (item.Values[4] != null)
                {
                    queryString += item.Values[4].ToString();
                }
                if (item.Values[5] != null)
                {
                    queryString += queryString.EndsWith("&") ? "" : "&";
                    queryString += "ServiceName=" + item.Values[5];
                }


                var newItem = new ApolloMenuItem()
                {
                    Id = item.Values[0],
                    DisplayName = item.Values[1],
                    DisplayValue = item.Values[2],
                    QueryString = queryString,
                    UIPageFlowName = item.Values[7],
                    UIVirtualPageName = navigateToUrl,
                    ParentName = item.Values[11],
                    Order = item.Values[16],
                    ApolloIcon = item.Values[17]
                };
                var children = this.GetChildMenuItems(newItem.DisplayValue, menuItems);
                if (children != null)
                    newItem.Children = children;
                if (string.IsNullOrEmpty(newItem.UIVirtualPageName) || session.GetAuthorizationManager().IsUIComponentAuthorized(newItem.UIVirtualPageName) || !string.IsNullOrEmpty(pageFlowName))
                {
                    resultMenuItems.Add(newItem);
                }
            }

            // Set home page
            var homePage = session.SessionValues.UserPortalProfile.PortalV8HomePage;
            var rootMenuName = session.SessionValues.UserPortalV8MenuName;
            var homePageLbl = FrameworkManagerUtil.GetLabelValue(_homePageLbl) ?? "Home Page";
            if (!string.IsNullOrEmpty(homePage))
            {
                var homeMenuItem = resultMenuItems.FirstOrDefault(hmi => hmi.UIVirtualPageName == homePage) ?? null;
                if (homeMenuItem != null)
                {
                    homeMenuItem.IsHomePage = true;
                    homeMenuItem.DisplayValue = homePageLbl;
                }
                else if (resultMenuItems != null && parentName == rootMenuName) // add home menu item if configured and parent is root and not included in menu items
                {
                    resultMenuItems.Add(new ApolloMenuItem
                    {
                        UIVirtualPageName = homePage,
                        DisplayName = homePageLbl,
                        DisplayValue = homePageLbl,
                        Children = new ApolloMenuItem[0],
                        ParentName = rootMenuName,
                        IsHomePage = true
                    });
                }
            }

            return resultMenuItems.ToArray();
        }

        protected virtual bool IsSessionValid()
        {
            FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession();
            return session != null && session.CurrentUserProfile != null;
        }

        private const string _homePageLbl = "HomePageLbl";

        public class ApolloMenuItem
        {
            public string Id;
            public string DisplayName;
            public string DisplayValue;
            public string QueryString;
            public string ParentName;
            public string Order;
            public string UIVirtualPageName;
            public string UIPageFlowName;
            public string ApolloIcon;
            public bool IsHomePage;
            public ApolloMenuItem[] Children;
        }

        public class ApolloSettings
        {
            public string Operation;
            public string Resource;
            public string Workcenter;
            public string Workstation;

            public bool PortalStudioAccess;
        }

        public class LoginFormModel
        {
            public string Name;
            public EncryptedField Password;
            public string Dictionary;
            public string UTCOffset;
        }

        public class TranslationLabelsModel
        {
            public string LabelName;
            public string LabelValue;
        }
    }
}
