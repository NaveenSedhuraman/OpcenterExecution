using System;
using System.Web;
using System.Linq;
using System.Collections.Generic;
using System.Data;
using Camstar.WebPortal.PortalFramework;
using System.Web.UI;
using Camstar.WebPortal.FormsFramework;
using OM = Camstar.WCF.ObjectStack;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using CWGC = Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.Personalization;


namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class ResourceSetup : MatrixWebPart
    {
        public ResourceSetup()
        {
        }

        #region Protected methods
        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);
            if (!Page.ClientScript.IsStartupScriptRegistered("ShowResourceSearchPanel"))
            {
                ScriptManager.RegisterStartupScript(Page.Form, Page.Form.GetType(), "ShowResourceSearchPanel", "ShowResourceSearchPanel()", true);
            }
        }
        #endregion
    }
}