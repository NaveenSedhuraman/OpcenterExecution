using System;
using System.Data;
using System.Linq;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using OM = Camstar.WCF.ObjectStack;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.FormsFramework.Utilities;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.Personalization;

/// <summary>
/// Summary description for DexAssociate
/// </summary>
/// 


namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class DexAssociate:MatrixWebPart
    {


        public DexAssociate()
        {
            //
            // TODO: Add constructor logic here
            //
        }



        #region Properties


        protected virtual ContainerListGrid ContainersGrid
        {
            get { return Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid; }
        } // ContainersGrid

        protected virtual JQDataGrid EligibleShipperCase
        {
            get { return Page.FindCamstarControl("EligibleContainersGrid") as JQDataGrid; }
        } // EligibleShipperCase

        protected virtual JQDataGrid AssociatedShipperCase
        {
            get { return Page.FindCamstarControl("AssociatedContainers") as JQDataGrid; }
        } // AssociatedContainers

        #endregion


        #region Protected Methods

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            ContainersGrid.LabelText = "Pallet ID";
        }

        #endregion

        #region Public Methods

        public override void WebPartCustomAction(object sender, CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);

            var act = e.Action as Camstar.WebPortal.Personalization.CustomAction;
            switch (act.Parameters)
            {
                case "ClearAll":
                    ClearData();
                    break;
            }
        }

        public void ClearData()
        {
            ContainersGrid.ClearData();
            EligibleShipperCase.ClearData();
            AssociatedShipperCase.ClearData();

        }
        #endregion
    }
}