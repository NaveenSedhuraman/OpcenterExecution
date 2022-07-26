// Copyright Siemens 2019  
using System.Collections.Generic;
using System.Data;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.Personalization;
using OM = Camstar.WCF.ObjectStack;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using System.Web;
using System.Web.UI;
namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class dexMoveIn : MatrixWebPart
    {
       
        protected override void OnLoad(System.EventArgs e)
        {
            base.OnLoad(e);
        }

        public override void PostExecute(OM.ResultStatus status, OM.Service serviceData)
        {
            base.PostExecute(status, serviceData);
            if (status.IsSuccess)
            {
		var selectedContainer = Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid;
		status.Message = "Lot " + selectedContainer.Data.ToString() + " has moved in successfully.";
		Page.DisplayMessage(status.Message, true);
            }
            else
            {
                Page.DisplayMessage(status);
            }
        }
    }
}
