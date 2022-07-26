﻿using System;
using System.Collections.Generic;
using System.Linq;
using Camstar.WebPortal.WebPortlets;
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.Utilities;
using Camstar.WCF.Services;
using System.Web;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.FormsFramework.WebControls;

namespace Camstar.WebPortal.WebPortlets.Shopfloor
{

    public class dexContainerMaintenance : MatrixWebPart
    {
        protected ContainerListGrid ContainerControl
        {
            get
            {
                ContainerListGrid containerControl = Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid;
                return containerControl;
            }
        }

        protected DropDownList ChildProcessingControl
        {
            get { return Page.FindCamstarControl("ChildProcessingMode") as DropDownList; }
        }
  protected CheckBox QAHold
        {
            get { return Page.FindCamstarControl("ServiceDetail_dexQAHold") as CheckBox; }
        }

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            if (Page.IsPostBack)
                ContainerControl.DataChanged += delegate { LoadDependentControls(); };
            else
                LoadDependentControls();
            this.Page.PreRenderComplete += delegate { FillDataContract(); };
        }

        public override void WebPartCustomAction(object sender, Personalization.CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);
            var action = e.Action as Camstar.WebPortal.Personalization.CustomAction;
            if (action != null && action.Parameters == "Clear")
            {
                Page.ClearValues();
            }
        }

        private void LoadDependentControls()
        {
            if (ContainerControl == null)
                throw new ApplicationException("The control is not found");
            ContainerMaint inputData = new ContainerMaint { Container = ContainerControl.Data as ContainerRef, ServiceDetail = new ContainerMaintDetail() };
            ClearValues();

            ContainerMaint_Info info = new ContainerMaint_Info
            {
                ServiceDetail = new ContainerMaintDetail_Info
                {
                    Level = FieldInfoUtil.RequestValue(),
                    Owner = FieldInfoUtil.RequestValue(),
                    StartReason = FieldInfoUtil.RequestValue(),
                    UOM = FieldInfoUtil.RequestValue(),
                    UOM2 = FieldInfoUtil.RequestValue(),
                    Product = FieldInfoUtil.RequestValue(),
                    MfgOrder = FieldInfoUtil.RequestValue(),
                    DueDate = FieldInfoUtil.RequestValue(),
                    Customer = FieldInfoUtil.RequestValue(),
                    SalesOrder = FieldInfoUtil.RequestValue(),
                    RequestDate = FieldInfoUtil.RequestValue(),
                    PlannedProduct = FieldInfoUtil.RequestValue(),
                    PlannedQty = FieldInfoUtil.RequestValue(),
                    PlannedQtyUOM = FieldInfoUtil.RequestValue(),
                    PlannedQty2 = FieldInfoUtil.RequestValue(),
                    BillOfProcess = FieldInfoUtil.RequestValue(),
                    ExpirationDate = FieldInfoUtil.RequestValue(),
                    PlannedQtyUOM2 = FieldInfoUtil.RequestValue(),
                    ContainerComments = FieldInfoUtil.RequestValue(),
                    Priority = FieldInfoUtil.RequestValue(),
					dexEngineeringRun = FieldInfoUtil.RequestValue(),
                    dexLine = FieldInfoUtil.RequestValue(),
                    dexLineStatus = FieldInfoUtil.RequestValue(),
                    dexMfgDate = FieldInfoUtil.RequestValue(),
                    dexRollupHoldStatus = FieldInfoUtil.RequestValue(),
                    dexScrapAccount = FieldInfoUtil.RequestValue(),
                    dexSterilizationComplete = FieldInfoUtil.RequestValue(),
                    dexSupplyLocatorId = FieldInfoUtil.RequestValue(),
                    dexSupplySubinventory = FieldInfoUtil.RequestValue(),
                    dexQAHold = FieldInfoUtil.RequestValue(),
                    dexFGExpirationDate = FieldInfoUtil.RequestValue(),
                    dexFGManufactureDate = FieldInfoUtil.RequestValue(),
                    dexLastThruputDate = FieldInfoUtil.RequestValue(),
                    dexThruputRowVersionNumber = FieldInfoUtil.RequestValue(),
					dexSupplyType = FieldInfoUtil.RequestValue()		
                },
                ChildProcessingMode = FieldInfoUtil.RequestValue(),
                Container = FieldInfoUtil.RequestValue(),
                CurrentContainerStatus = new CurrentContainerStatus_Info
                {
                    NextOperationName = FieldInfoUtil.RequestValue(),
                    Qty = FieldInfoUtil.RequestValue(),
                    Qty2 = FieldInfoUtil.RequestValue()
                }
            };
            UserProfile profile = HttpContext.Current.Session[Camstar.WebPortal.Constants.SessionConstants.UserProfile] as UserProfile;
            ContainerMaintService serv = new ContainerMaintService(profile);
            ContainerMaint_Result result = null;
            ResultStatus resultStatus = serv.GetAttributes(inputData, new ContainerMaint_Request { Info = info }, out result);

            // if (resultStatus.IsSuccess)
             //   DisplayValues(result.Value);

// Based on LHR execution QA Hold or QA release check box should be checked in Lot Maint screen
	if (resultStatus.IsSuccess)
            {
                if (result.Value.ServiceDetail.dexQAHold == true)
                {
                    QAHold.DefaultValue = true;
                }
                else
                {
                    QAHold.DefaultValue = false;
                }

                DisplayValues(result.Value);
}
        }

        protected void FillDataContract()
        {
            if (IsFloatPage)
            {
                ContainerMaint data = new ContainerMaint();
                this.GetInputData(data);
                Page.DataContract.SetValueByName("ContainerMaintDetailDM", data.ServiceDetail);
            }
        }

    }
}