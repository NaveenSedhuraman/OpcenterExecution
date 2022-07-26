// Copyright Siemens 2019  
using System;
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

    public class ContainerMaintenance : MatrixWebPart
    {
        protected virtual ContainerListGrid ContainerControl
        {
            get
            {
                ContainerListGrid containerControl = Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid;
                return containerControl;
            }
        }

        protected virtual DropDownList ChildProcessingControl
        {
            get { return Page.FindCamstarControl("ChildProcessingMode") as DropDownList; }
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

        protected virtual void LoadDependentControls()
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
                    SamplingLot = FieldInfoUtil.RequestValue(),
                    SamplingRequired = FieldInfoUtil.RequestValue(),
                    VendorItem = FieldInfoUtil.RequestValue(),
					/*
					Date: 07/Feb/2022
					VP page : dexLotViewMgrVP
					Purpose: Below field data not populated when lot trigger happen, 
					hence below fields are added to populate the data
					*/
					//start
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
					//end
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
            UserProfile profile = HttpContext.Current.Session[Constants.SessionConstants.UserProfile] as UserProfile;
            ContainerMaintService serv = new ContainerMaintService(profile);
            ContainerMaint_Result result;
            ResultStatus resultStatus = serv.GetAttributes(inputData, new ContainerMaint_Request { Info = info }, out result);

            if (resultStatus.IsSuccess)
                DisplayValues(result.Value);
        }

        protected virtual void FillDataContract()
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
