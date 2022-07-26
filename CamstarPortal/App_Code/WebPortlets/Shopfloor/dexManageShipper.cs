// Copyright Siemens 2022  
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
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.Utilities;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.WebGridControls;

namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class dexManageShipper : MatrixWebPart
    {
        protected virtual JQDataGrid dexManageShipperGrid
        {
            get { return Page.FindCamstarControl("dexManageShipper_RemovalDetails") as JQDataGrid; }
        }
        #region Get Input Data
        public override void GetInputData(OM.Service serviceData)
        {
            base.GetInputData(serviceData);
            int iGridTotalRows = ((dexManageShipperGrid as JQDataGrid).GridContext as BoundContext).GetTotalRows();
            if (iGridTotalRows > 0)
            {
                List<OM.RemovalCandidate> lstRemovalCandidateDetails = new List<OM.RemovalCandidate>();
                if ((dexManageShipperGrid.GridContext as BoundContext).GetSelectedItems(false) != null)
                {
                    //Get the selected consumed component to perform the submit action
                    foreach (OM.RemovalCandidate loadedMaterial in (dexManageShipperGrid.GridContext as BoundContext).GetSelectedItems(false))
                    {
                        OM.RemovalCandidate removalCandidateItem = new OM.RemovalCandidate();
			removalCandidateItem.IssueActualHistory = loadedMaterial.IssueActualHistory;
                        removalCandidateItem.Product = loadedMaterial.Product;
                        removalCandidateItem.ProductDescription = loadedMaterial.ProductDescription;
                        lstRemovalCandidateDetails.Add(removalCandidateItem);
                    }
                }
                (serviceData as OM.dexManageShipper).RemovalDetails = lstRemovalCandidateDetails.ToArray();
            }
        }
        #endregion
    }
}
