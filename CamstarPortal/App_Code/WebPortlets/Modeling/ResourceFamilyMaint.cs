//
// Copyright Siemens 2019  
//
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.PortalFramework;

/// <summary>
/// Summary description for ResourceFamilyMaint
/// </summary>

namespace Camstar.WebPortal.WebPortlets.Modeling
{
    public class ResourceFamilyMaint : MatrixWebPart
    {
        #region Controls

        protected virtual ToggleContainer GeneralTab
        {
            get { return Page.FindCamstarControl("GeneralGroupToggle") as ToggleContainer; }
        }

        protected virtual CheckBox UseUIPreference
        {
            get { return Page.FindCamstarControl("UseUIPreference") as CheckBox; }
        }

        #endregion

        #region Overrided methods

        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);
            if (!(bool)UseUIPreference.Data && Page.IsPostBack)
                GeneralTab.Visible = false;
        }

        #endregion
    }
}
