// Copyright Siemens 2019  

using System;

using System.Web.UI;
using System.Configuration;
using System.ServiceModel.Configuration;
using System.IO;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.Utilities;

namespace Camstar.Portal
{
    /// <summary>
    /// The main application page
    /// </summary>
    partial class Main : Camstar.WebPortal.PortalFramework.WebPartPageBase
    {
        public override bool PageAuthorizationCheck()
        {
            return true;
        }

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            Page.ClientScript.RegisterHiddenField("SessionTimeoutType", "warn");
            Page.ClientScript.RegisterHiddenField("SessionTimeoutTime", Session.Timeout.ToString());

            if (Request.QueryString["openLineAssignmentPopup"] != null)
            {
                var setLineAssignmentText = FrameworkManagerUtil.GetLabelValue("Lbl_SetLineAssignment_Title") ?? "Set Line Assignment";
                var openLineAssignment = "pop.showAjax('./LineAssignmentPage.aspx?IsFloatingFrame=2','" + setLineAssignmentText + "', 520, 662, 0, 0, true, '', '', this, true, '', null, false, false, 'Loading ...');";
                Page.ClientScript.RegisterStartupScript(GetType(), "displayLineAssignemnt", JavascriptUtil.GetStartTag() + 
                    openLineAssignment + JavascriptUtil.GetEndTag());
            }

            var PrimaryPSVersion = ConfigurationManager.AppSettings["PortalStudioVersion"];
            Page.ClientScript.RegisterClientScriptBlock(typeof(string), "ps2ver", 
                $"top.primaryVisualStudioVersion = {PrimaryPSVersion}; top.wcfUrl = \"{GetWcfUrl()}\""
                , true);
        }

        private string GetWcfUrl()
        {
            var map = new ExeConfigurationFileMap
            {
                ExeConfigFilename = Path.Combine(MapPath("~"), "web.config") // the root web.config  
            };
            var cnf = ConfigurationManager.OpenMappedExeConfiguration(map, ConfigurationUserLevel.None);

            var section = cnf.GetSectionGroup("system.serviceModel") as ServiceModelSectionGroup;
            string address = section.Client.Endpoints[0].Address.OriginalString;
            var i = address.LastIndexOf('/');
            return address.Substring(0, i);
        }

    } // MainPage
}
