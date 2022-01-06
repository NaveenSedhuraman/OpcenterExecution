// Copyright Siemens 2019  
using System;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Collections.Generic;
using Camstar.WebPortal.Constants;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.WCFUtilities;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using CamstarPortal.WebControls;

using OM = Camstar.WCF.ObjectStack;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;

namespace Camstar.WebPortal.WebPortlets.ComponentIssue
{
    public class MaterialsRequirement : MatrixWebPart
    {
        public MaterialsRequirement() { }

        #region Protected properties

        protected virtual OM.IssueDetails[] MaterialRequirements
        {
            get
            {
                OM.IssueDetails[] reqs = Page.DataContract.GetValueByName<OM.IssueDetails[]>(mkServiceDetailsStorageKey);
                return reqs ?? new OM.IssueDetails[0];
            }
            set
            {
                Page.DataContract.SetValueByName(mkServiceDetailsStorageKey, value);
            }
        }

        protected virtual CWC.ContainerList DCContainer
        {
            get { return Page.FindCamstarControl("DCContainer") as CWC.ContainerList; }
        } // DataColection

        protected virtual CWC.RevisionedObject DataColection
        {
            get { return Page.FindCamstarControl("DCCollectionDef") as CWC.RevisionedObject; }
        } // DataColection

        protected virtual JQDataGrid MaterialsRequirementGrid
        {
            get { return FindCamstarControl("MaterialRequirementsGrid") as JQDataGrid; }
        } // MaterialsRequirementGrid

        protected virtual OM.IssueDetails SelectionGridData
        {
            get { return MaterialsRequirementGrid.SelectionData as OM.IssueDetails; }
        } // SelectionGridData

        protected virtual CWC.TextBox Product
        {
            get { return Page.FindCamstarControl("ComponentIssueUDA_Product") as CWC.TextBox; }
        } // Product

        protected virtual CWC.TextBox ProductDescription
        {
            get { return Page.FindCamstarControl("ComponentIssueUDA_ProductDescription") as CWC.TextBox; }
        } // ProductDescription

        protected virtual CWC.DropDownList IssueControl
        {
            get { return Page.FindCamstarControl("ComponentIssueUDA_IssueControl") as CWC.DropDownList; }
        } // IssueControl

        protected virtual CWC.TextBox NetQtyRequired
        {
            get { return Page.FindCamstarControl("ComponentIssueUDA_NetQtyRequired") as CWC.TextBox; }
        } // NetQtyRequired

        protected virtual CWC.TextBox ScanContainer
        {
            get { return FindCamstarControl("ComponentIssueUDA_ScanContainer") as CWC.TextBox; }
        } // ScanContainer

        protected virtual ContainerListGrid ContainerName
        {
            get { return Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid; }
        } // ContainerName

        protected virtual CWC.TextBox MaterialsRequirementContainerName
        {
            get { return FindCamstarControl("MaterialRequirements_ContainerName") as CWC.TextBox; }
        } // MaterialsRequirementContainerName

        protected virtual CWC.TextBox ContainerQty
        {
            get { return FindCamstarControl("ComponentIssueUDA_ContainerQty") as CWC.TextBox; }
        } // ContainerQty

        protected virtual object ContainerQty2
        {
            get { return ViewState[mkContainerQty2]; }
            set { ViewState.Add(mkContainerQty2, value); }
        } // ContainerQty2

        protected virtual CWC.TextBox UOM
        {
            get { return Page.FindCamstarControl("ComponentIssueUDA_UOM") as CWC.TextBox; }
        } // UOM

        protected virtual CWC.TextBox UOM2
        {
            get { return Page.FindCamstarControl("AdditionalFields_UOM2") as CWC.TextBox; }
        } // UOM2

        protected virtual CWC.TextBox IssueQty
        {
            get { return Page.FindCamstarControl("ServiceDetails_IssueQty") as CWC.TextBox; }
        } // IssueQty

        protected virtual CWC.TextBox IssueQty2
        {
            get { return Page.FindCamstarControl("AdditionalFields_Qty2Issued") as CWC.TextBox; }
        } // IssueQty2

        protected virtual CWC.TextBox LotNumber
        {
            get { return Page.FindCamstarControl("ComponentIssueUDA_LotNumber") as CWC.TextBox; }
        } // LotNumber

        protected virtual CWC.TextBox StockPoint
        {
            get { return Page.FindCamstarControl("ActualsStock_FromStockPoint") as CWC.TextBox; }
        } // StockPoint

        protected virtual CWC.NamedObject IssueDifferenceReason
        {
            get { return Page.FindCamstarControl("ServiceDetails_IssueDifferenceReason") as CWC.NamedObject; }
        } // IssueDifferenceReason

        protected virtual CWC.NamedObject IssueReason
        {
            get { return Page.FindCamstarControl("AdditionalFields_IssueReason") as CWC.NamedObject; }
        } // IssueReason

        protected virtual CWC.NamedObject SubstitutionReason
        {
            get { return Page.FindCamstarControl("AdditionalFields_SubstitutionReason") as CWC.NamedObject; }
        } // SubstitutionReason

        protected virtual CWC.TextBox Comments
        {
            get { return Page.FindCamstarControl("AdditionalFields_Comments") as CWC.TextBox; }
        } // Comments

        protected virtual CWC.CheckBox HideSatisfiedReq
        {
            get { return Page.FindCamstarControl("HideSatisfiedReq") as CWC.CheckBox; }
        } // HideSatisfiedReq

        protected virtual CWC.TextBox SatisfiedWidgetCount
        {
            get { return Page.FindCamstarControl("SatisfiedWidgetCount") as CWC.TextBox; }
        } // SatisfiedWidgetCount

        /// <summary>
        /// EProcedure specific hidden controls
        /// </summary>
        protected virtual ContainerListGrid EProcTaskContainer
        {
            get { return Page.FindCamstarControl("ShopFloor_TaskContainer") as ContainerListGrid; }
        } // EProcTaskContainer

        protected virtual CWC.RevisionedObject EProcTaskList
        {
            get { return Page.FindCamstarControl("ExecuteTask_TaskList") as CWC.RevisionedObject; }
        } // EProcTaskList

        protected virtual CWC.NamedSubentity EProcTask
        {
            get { return Page.FindCamstarControl("ShopFloor_CalledByTransactionTask") as CWC.NamedSubentity; }
        } // EProcTask

        protected virtual CWC.NamedObject Vendor
        {
            get { return Page.FindCamstarControl("Vendor") as CWC.NamedObject; }
        }//Vendor

        protected virtual CWC.NamedSubentity VendorItem
        {
            get { return Page.FindCamstarControl("VendorItem") as CWC.NamedSubentity; }
        }//VendorItem

        protected virtual OM.ComponentIssueInquiry ExecuteData
        {
            get
            {
                return ViewState[mkComponentIssueExecuteData] as OM.ComponentIssueInquiry;
            }
            set
            {
                ViewState[mkComponentIssueExecuteData] = value;
            }
        } // ExecuteData

        protected virtual IssueDetailsTypeEnum IssueDetailsType
        {
            get
            {
                var issueDetails = (ExecuteData != null && ExecuteData.IssueDetails != null) ? ExecuteData.IssueDetails : null;
                var type = IssueDetailsTypeEnum.Nothing;

                if (issueDetails != null && issueDetails is OM.IssueDetails)
                {
                    if (issueDetails is OM.IssueDetailsBulk)
                        type = IssueDetailsTypeEnum.Lot;
                    else if (issueDetails is OM.IssueDetailsSerial)
                        type = IssueDetailsTypeEnum.Serial;
                    else if (issueDetails is OM.IssueDetailsLotStock)
                        type = IssueDetailsTypeEnum.LotAndStockpoint;
                    else if (issueDetails is OM.IssueDetailsStock)
                        type = IssueDetailsTypeEnum.Stockpoint;
                    else if (issueDetails is OM.IssueDetailsQuantity)
                        type = IssueDetailsTypeEnum.Qty;
                    else if (issueDetails is OM.IssueDetailsDisplayOnly)
                        type = IssueDetailsTypeEnum.DisplayOnly;
                }

                return type;
            }
        } // IssueDetailsType

        #endregion

        #region Public methods

        public virtual void ScanFieldChanged(object sender, EventArgs e)
        {
            var objectName = ScanContainer.Data != null ? ScanContainer.Data.ToString() : string.Empty;

            if (!string.IsNullOrEmpty(objectName))
            {
                FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
                var service = new Camstar.WCF.Services.ComponentIssueInquiryService(session.CurrentUserProfile);
                var isRowSelected = SelectionGridData != null;

                var serviceData = new OM.ComponentIssueInquiry
                {
                    BOMLineItem = isRowSelected ? SelectionGridData.BOMLineItem : null,
                    ParentContainer = (OM.ContainerRef)ContainerName.Data,
                    ObjectName = objectName
                };

                var serviceInfo = new OM.ComponentIssueInquiry_Info
                {
                    IssueDetails = new OM.IssueDetails_Info
                    {
                        RequestValue = true
                    },
                    Container = new OM.Info(true),
                    Product = new OM.Info(true),
                    Qty = new OM.Info(true),
                    UOM = new OM.Info(true),
                    Qty2 = new OM.Info(true),
                    UOM2 = new OM.Info(true)
                };

                var request = new Camstar.WCF.Services.ComponentIssueInquiry_Request();
                request.Info = serviceInfo;

                var result = new Camstar.WCF.Services.ComponentIssueInquiry_Result();
                var resultStatus = new OM.ResultStatus();

                resultStatus = service.ExecuteTransaction(serviceData, request, out result);

                if (resultStatus.IsSuccess)
                {
                    ExecuteData = result.Value;
                    if (!result.IsEmpty)
                    {
                        if (result.Value.Qty != null)
                            ContainerQty.Data = result.Value.Qty;
                        if (result.Value.UOM != null)
                            UOM.Data = result.Value.UOM;
                        if (result.Value.UOM2 != null)
                            UOM2.Data = result.Value.UOM2;
                        if (result.Value.Qty2 != null)
                            ContainerQty2 = result.Value.Qty2;

                        SetSelectedRow(result.Value.IssueDetails.BOMLineItem);
                        SetFocusToControl(IssueDetailsType);
                    }
                }

                if (e == null)
                    e = new CustomActionEventArgs();

                if (e is CustomActionEventArgs)
                    (e as CustomActionEventArgs).Result = resultStatus;

                if (!resultStatus.IsSuccess)
                    Page.DisplayMessage(resultStatus);
            }
        } // ScanFieldChanged(object sender, EventArgs e)        

        public virtual void CheckControl_CheckedChanged(object sender, EventArgs e)
        {
            FilterMaterialReqs();
        } // CheckControl_CheckedChanged(object sender, EventArgs e)

        public virtual void MaterialsRequirement_GetRowSnapItem(object item, IEnumerable<DataColumn> dataColumns, DataRow row)
        {
            if (item is OM.IssueDetailsDisplayOnly)
            {
                foreach (var c in dataColumns)
                    if (c.ColumnName.Equals(mkQtyIssuedColumn))
                        row[c] = mkDisplayOnlyQtyIssuedValue;
            }
        } // MaterialsRequirement_GetRowSnapItem(object item, IEnumerable<DataColumn> dataColumns, DataRow row)        

        public virtual ResponseData MaterialsRequirementGrid_RowSelected(object sender, JQGridEventArgs args)
        {
            if (SelectionGridData != null)
            {
                var issueDetails = (SelectionGridData as OM.IssueDetails);

                if (mkIsNeedClearControls)
                {
                    ClearUserDataEntryAreaControls();

                    ExecuteData = new OM.ComponentIssueInquiry
                    {
                        Product = issueDetails.Product,
                        IssueDetails = issueDetails
                    };
                }

                SetUserDataEntryLayout(IssueDetailsType);
                SetIssueQtyControl(IssueDetailsType, issueDetails);

                var serviceData = new OM.ComponentIssue
                {
                    ServiceDetails = new[] { issueDetails }
                };

                this.DisplayValues(serviceData);
            }
            mkIsNeedClearControls = true;
            return null;
        } // MaterialsRequirementGrid_RowSelected(object sender, JQGridEventArgs args)

        public virtual void ContainerNameControl_DataChanged(object sender, EventArgs e)
        {
            ReloadMaterialsRequirementGrid();
        } // ContainerNameControl_DataChanged(object sender, EventArgs e)    

        public override void WebPartCustomAction(object sender, Personalization.CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);
            var action = e.Action as CustomAction;
            if (action != null)
            {
                switch (action.Parameters)
                {
                    case "Clear":
                        {
                            Page.ShopfloorReset(sender, e as CustomActionEventArgs);
                            ReloadMaterialsRequirementGrid();
                            break;
                        }
                    case "IssueComponent":
                        {
                            IssueComponentAction(e);
                            break;
                        }
                    case "Close":
                        {
                            Page.CloseFloatingFrame(false);
                            break;
                        }
                }
            }
        } // WebPartCustomAction(object sender, CustomActionEventArgs e)

        #endregion

        #region Protected methods

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);

            if (!Page.IsPostBack)
                SetSatisfiedWidgetCountControl(null);

            if (Page.IsFloatingFrame && !Page.IsPostBack)
                ReloadMaterialsRequirementGrid();

            HideSatisfiedReq.CheckControl.CheckedChanged += CheckControl_CheckedChanged;
            MaterialsRequirementGrid.RowSelected += MaterialsRequirementGrid_RowSelected;
            (MaterialsRequirementGrid.GridContext as SubentityDataContext).GetRowSnapItem += MaterialsRequirement_GetRowSnapItem;
        } // OnLoad(EventArgs e)

        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);

            SetUserDataEntryLayout(IssueDetailsType);

            Page.SetFocus(ScanContainer.ClientID);
            DataColection.Hidden = true;

            var submitAction = Page.ActionDispatcher.GetActionByName("IssueComponentButton");
            if (submitAction != null)
            {
                var button = submitAction.Control as WebControl;
                if (button != null)
                    button.Attributes[ControlAttributeConstants.IsTimersConfirmationRequired] = "true";
            }

        } // void OnPreRender(EventArgs e)

        protected virtual void IssueComponentAction(Personalization.CustomActionEventArgs e)
        {
            if (ExecuteData != null)
            {
                FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
                var service = new Camstar.WCF.Services.ComponentIssueService(session.CurrentUserProfile);

                var serviceData = new OM.ComponentIssue
                {
                    Container = (OM.ContainerRef)ContainerName.Data,
                    IssueActualDetails = new OM.IssueActualDetail[] { CreateIssueActualDetail() }
                };

                Page.GetInputData(serviceData);
                GetLineAssignment(serviceData);
                serviceData.ServiceDetails = null;

                var request = new Camstar.WCF.Services.ComponentIssue_Request();
                var result = new Camstar.WCF.Services.ComponentIssue_Result();
                var resultStatus = new OM.ResultStatus();

                if (EProcTaskContainer.Data != null)
                {
                    serviceData.TaskContainer = (OM.ContainerRef)EProcTaskContainer.Data;
                    serviceData.CalledByTransactionTask = (OM.NamedSubentityRef)EProcTask.Data;
                    serviceData.CalledByTransactionTask.Parent = (OM.BaseObjectRef)EProcTaskList.Data;
                }

                var tuple = ESigCaptureUtil.CollectESigServiceDetailsAll();
                if (tuple != null)
                    serviceData.ESigDetails = ESigCaptureUtil.CollectESigServiceDetailsAll().Item1;

                ShopFloorDCControl dcControl = Page.FindCamstarControl("ParamDataField") as ShopFloorDCControl;
                if (dcControl != null)
                {
                    OM.DataPointSummary[] dataPointSummary = dcControl.GetDataPointSummary();
                    if (dataPointSummary != null && dataPointSummary.Length > 0)
                        serviceData.ParametricData = dataPointSummary[0];
                }

                e.Result = service.ExecuteTransaction(serviceData, request, out result);

                if (e.Result.IsSuccess)
                {
                    WebPart paramDataWP = (Page as WebPartPageBase).Manager.WebParts["ParametricDataWP"];
                    (paramDataWP as WebPartBase).ClearValues(serviceData);
                    DCContainer.Data = ContainerName.Data;

                    if (!Page.IsFloatingFrame)
                        ReloadMaterialsRequirementGrid();
                    else
                        e.IsSubmitted = true;
                }

                ESigCaptureUtil.CleanESigCaptureDM();
            }
            else if (e.Result == null)
            {
                LabelCache labelCache = FrameworkManagerUtil.GetLabelCache(System.Web.HttpContext.Current.Session);

                OM.Label errorMessage = null;
                if (labelCache != null)
                    errorMessage = labelCache.GetLabelByName("ScanField_RequiredErrorMessage");

                e.Result = new OM.ResultStatus
                {
                    IsSuccess = false,
                    ExceptionData = new OM.ExceptionDataType
                    {
                        Description = errorMessage != null && !string.IsNullOrEmpty(errorMessage.Value) ? errorMessage.Value : "Field \"Scan Container/Product\" requires input.",
                        ExceptionLevel = OM.ExceptionLevel.Client
                    }
                };
            }

            Page.SetFocus(ScanContainer.ClientID);
        } // IssueComponentAction()

        protected virtual void ReloadMaterialsRequirementGrid()
        {
            ClearGridData();
            ClearUserDataEntryAreaControls();

            FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
            var service = new Camstar.WCF.Services.ComponentIssueService(session.CurrentUserProfile);

            var serviceData = new OM.ComponentIssue();

            Page.ProcessingContext[ProcessingFlagType.RequestOnSubmit] = true;
            Page.RequestValues(new OM.ComponentIssue_Info(), serviceData);
            Page.ProcessingContext[ProcessingFlagType.RequestOnSubmit] = false;

            if (MaterialsRequirementContainerName.Data != null)
                serviceData.Container = new OM.ContainerRef(MaterialsRequirementContainerName.Data.ToString());

            var request = new Camstar.WCF.Services.ComponentIssue_Request();
            var result = new Camstar.WCF.Services.ComponentIssue_Result();
            var resultStatus = new OM.ResultStatus();

            request.Info = new OM.ComponentIssue_Info
            {
                RequestValue = true,
                ServiceDetails = new OM.IssueDetails_Info
                {
                    RequestValue = true
                }
            };

            resultStatus = service.GetRequirements(serviceData, request, out result);

            if (resultStatus != null && resultStatus.IsSuccess)
            {
                MaterialRequirements = result.Value.ServiceDetails;
                FilterMaterialReqs();
                SetSatisfiedWidgetCountControl(result.Value);
            }
            else
                DisplayMessage(resultStatus);

            SetUserDataEntryLayout(IssueDetailsTypeEnum.Nothing);
            Page.SetFocus(ScanContainer.ClientID);
        } // ReloadMaterialsRequirementGrid()

        protected virtual void FilterMaterialReqs()
        {
            OM.IssueDetails[] reqs = MaterialRequirements;
            if (HideSatisfiedReq.IsChecked)
                reqs = reqs.Where(item => item.QtyIssued.Value < (item.QtyRequired != null ? item.QtyRequired.Value : 0)).ToArray();
            MaterialsRequirementGrid.Data = reqs;
        }

        protected virtual bool IsIssueDifferenceReasonRequired()
        {
            bool result = false;

            if (IssueDetailsType != IssueDetailsTypeEnum.DisplayOnly &&
                IssueDetailsType != IssueDetailsTypeEnum.Nothing)
            {
                bool res1 = false;
                double issueQtyValue;
                double netQtyValue = ExecuteData != null && ExecuteData.IssueDetails != null ? (double)ExecuteData.IssueDetails.NetQtyRequired : double.NaN;

                if (IssueQty.Data != null && netQtyValue != double.NaN && double.TryParse(IssueQty.Data.ToString(), out issueQtyValue))
                    res1 = issueQtyValue != netQtyValue;
                else
                    res1 = true;

                bool res2 = false;
                double issueQty2Value;
                double netQty2Value = ExecuteData != null && ExecuteData.IssueDetails != null ? (double)ExecuteData.IssueDetails.NetQty2Required : double.NaN;

                if (IssueQty2.Data != null && netQty2Value != double.NaN && double.TryParse(IssueQty2.Data.ToString(), out issueQty2Value))
                    res2 = issueQty2Value != netQty2Value;

                result = res1 || res2;

                if (ExecuteData.IssueDetails is OM.IssueDetailsSerial && ContainerQty.Data != null)
                {
                    double containerQty;
                    if (double.TryParse(ContainerQty.Data.ToString(), out containerQty))
                    {
                        result = ExecuteData.IssueDetails.QtyRequired != containerQty;
                    }
                }
            }

            IssueDifferenceReason.Required = result;
            return result;
        } // IsIssueDifferenceReasonRequired()

        public virtual void IsIssueDifferenceReasonRequired(object sender, EventArgs e)
        {
            IssueDifferenceReason.Visible = IsIssueDifferenceReasonRequired();
        } // IsIssueDifferenceReasonRequired(object sender, EventArgs e)

        protected virtual void SetUserDataEntryLayout(IssueDetailsTypeEnum type)
        {
            ContainerQty.Visible = UOM.Visible = (type == IssueDetailsTypeEnum.Lot || type == IssueDetailsTypeEnum.Serial);
            LotNumber.Visible = type == IssueDetailsTypeEnum.LotAndStockpoint;
            IssueQty.Visible = (type != IssueDetailsTypeEnum.Serial) && (type != IssueDetailsTypeEnum.DisplayOnly) && (type != IssueDetailsTypeEnum.Nothing);
            StockPoint.Visible = (type == IssueDetailsTypeEnum.LotAndStockpoint) || (type == IssueDetailsTypeEnum.Stockpoint);
            IssueDifferenceReason.Visible = IsIssueDifferenceReasonRequired();
            Vendor.Visible = (type == IssueDetailsTypeEnum.LotAndStockpoint || type == IssueDetailsTypeEnum.Stockpoint || type == IssueDetailsTypeEnum.Qty);
            VendorItem.Visible = (type == IssueDetailsTypeEnum.LotAndStockpoint || type == IssueDetailsTypeEnum.Stockpoint || type == IssueDetailsTypeEnum.Qty);
            ScanContainer.Required = ScanContainer.PageFlowRequired = (type == IssueDetailsTypeEnum.Serial || type == IssueDetailsTypeEnum.Stockpoint);
            IssueQty2.Visible = UOM2.Visible = type != IssueDetailsTypeEnum.Serial;

            LabelCache labelCache = FrameworkManagerUtil.GetLabelCache(System.Web.HttpContext.Current.Session);
            OM.Label Lbl = null;
            if (labelCache != null)
            {
                switch (type)
                {
                    case IssueDetailsTypeEnum.Lot:
                    case IssueDetailsTypeEnum.Serial:
                        {
                            Lbl = labelCache.GetLabelByName("Lbl_ScanContainer");
                            if (Lbl != null)
                                ScanContainer.LabelText = Lbl.Value;
                            break;
                        }
                    case IssueDetailsTypeEnum.LotAndStockpoint:
                    case IssueDetailsTypeEnum.Stockpoint:
                        {
                            Lbl = labelCache.GetLabelByName("Lbl_ScanProduct");
                            if (Lbl != null)
                                ScanContainer.LabelText = Lbl.Value;
                            break;
                        }
                    case IssueDetailsTypeEnum.Qty:
                    case IssueDetailsTypeEnum.DisplayOnly:
                    case IssueDetailsTypeEnum.Nothing:
                        {
                            Lbl = labelCache.GetLabelByName("Lbl_ScanContainerProduct");
                            if (Lbl != null)
                                ScanContainer.LabelText = Lbl.Value;
                            break;
                        }
                }

            }
        } // SetUserDataEntryLayout(IssueDetailsTypeEnum type)

        protected virtual void SetSatisfiedWidgetCountControl(OM.ComponentIssue componentIssue)
        {
            var labelCache = LabelCache.GetRuntimeCacheInstance();
            var label = labelCache.GetLabelByName("Lbl_SatisfiedOf");
            if (componentIssue != null && componentIssue.ServiceDetails != null)
                SatisfiedWidgetCount.Data = string.Format(label.Value, componentIssue.ServiceDetails.Where(item => (!(item is OM.IssueDetailsDisplayOnly) && item.QtyIssued != null && item.QtyRequired != null) ? ((double)item.QtyIssued >= (double)item.QtyRequired) : false).Count(), componentIssue.ServiceDetails.Count());
            else
                SatisfiedWidgetCount.Data = string.Format(label.Value, 0, 0);
        } // SetSatisfiedWidgetCountControl(ComponentIssue componentIssue)

        protected virtual void SetFocusToControl(IssueDetailsTypeEnum type)
        {
            switch (type)
            {
                case IssueDetailsTypeEnum.Lot:
                case IssueDetailsTypeEnum.Stockpoint:
                case IssueDetailsTypeEnum.Qty:
                    {
                        Page.SetFocus(IssueQty.ClientID);
                        break;
                    }
                case IssueDetailsTypeEnum.Serial:
                    {
                        Page.SetFocus(IssueDifferenceReason.ClientID);
                        break;
                    }
                case IssueDetailsTypeEnum.LotAndStockpoint:
                    {
                        Page.SetFocus(LotNumber.ClientID);
                        break;
                    }
            }
            //Performance issue
            //Page.RenderToClient = true;
        } // SetIssueQtyControl(IssueDetailsTypeEnum type)

        protected virtual void SetIssueQtyControl(IssueDetailsTypeEnum type, OM.IssueDetails issueDetails)
        {
            switch (type)
            {
                case IssueDetailsTypeEnum.Lot:
                    {
                        double containerQty;
                        double containerQty2;

                        if (issueDetails.NetQtyRequired != null && ContainerQty.Data != null && double.TryParse(ContainerQty.Data.ToString(), out containerQty))
                            IssueQty.Data = (double)issueDetails.NetQtyRequired >= containerQty ? containerQty : issueDetails.NetQtyRequired;

                        if (issueDetails.NetQty2Required != null && ContainerQty2 != null && double.TryParse(ContainerQty2.ToString(), out containerQty2))
                            IssueQty2.Data = (double)issueDetails.NetQty2Required >= containerQty2 ? containerQty2 : issueDetails.NetQty2Required;

                        break;
                    }
                case IssueDetailsTypeEnum.Serial:
                    {
                        double containerQty;
                        double containerQty2;

                        if (ContainerQty.Data != null && double.TryParse(ContainerQty.Data.ToString(), out containerQty))
                            IssueQty.Data = containerQty;

                        if (ContainerQty2 != null && double.TryParse(ContainerQty2.ToString(), out containerQty2))
                            IssueQty2.Data = containerQty2;

                        break;
                    }
                case IssueDetailsTypeEnum.LotAndStockpoint:
                case IssueDetailsTypeEnum.Stockpoint:
                case IssueDetailsTypeEnum.Qty:
                case IssueDetailsTypeEnum.DisplayOnly:
                    {
                        IssueQty.Data = issueDetails.NetQtyRequired;
                        IssueQty2.Data = issueDetails.NetQty2Required;
                        break;
                    }
            }
        } // SetIssueQtyControl(IssueDetailsTypeEnum type, IssueDetails issueDetails)        

        protected virtual OM.IssueActualDetail CreateIssueActualDetail()
        {
            var issueActualDetail = new OM.IssueActualDetail();

            if (ExecuteData != null && ExecuteData.IssueDetails != null)
            {
                double qtyIssued, qty2Issued;

                issueActualDetail = new OM.IssueActualDetail
                {
                    FieldAction = OM.Action.Create,
                    BOMLineItem = ExecuteData.IssueDetails.BOMLineItem,
                    Product = ExecuteData.Product,
                    FromLot = LotNumber.Data != null && !string.IsNullOrEmpty(LotNumber.Data.ToString()) ? LotNumber.Data.ToString() : null,
                    FromContainer = ExecuteData.Container != null ?
                    new OM.ContainerRef
                    {
                        Name = ExecuteData.Container.Name
                    } : null,
                    IssueDifferenceReason = IssueDifferenceReason.Data != null ?
                    new OM.NamedObjectRef
                    {
                        Name = (IssueDifferenceReason.Data as OM.NamedObjectRef).Name
                    } : null,

                    QtyIssued = IssueDetailsType != IssueDetailsTypeEnum.Serial ?
                    (IssueQty.Data != null && double.TryParse(IssueQty.Data.ToString(), out qtyIssued) ? (OM.Primitive<double>)qtyIssued : null) :
                    ExecuteData.Qty,

                    Qty2Issued = IssueDetailsType != IssueDetailsTypeEnum.Serial ?
                    (IssueQty2.Data != null && double.TryParse(IssueQty2.Data.ToString(), out qty2Issued) ? (OM.Primitive<double>)qty2Issued : null) :
                    ExecuteData.Qty2,

                    FromStockPoint = StockPoint.Data != null ? StockPoint.Data.ToString() : null,
                    IssueReason = IssueReason.Data != null && !(IssueReason.Data as OM.NamedObjectRef).IsEmpty ?
                    new OM.NamedObjectRef
                    {
                        Name = (IssueReason.Data as OM.NamedObjectRef).Name
                    } : null,
                    SubstitutionReason = SubstitutionReason.Data != null && !(SubstitutionReason.Data as OM.NamedObjectRef).IsEmpty ?
                    new OM.NamedObjectRef
                    {
                        Name = (SubstitutionReason.Data as OM.NamedObjectRef).Name
                    } : null,
                    Comments = Comments.Data != null ? Comments.Data.ToString() : null
                };
            }

            return issueActualDetail;
        } // CreateIssueActualDetail()

        protected virtual void ClearPageData()
        {
            Page.ClearValues();
            MaterialsRequirementContainerName.ClearData();
            MaterialsRequirementContainerName.OriginalData = null;
        } // ClearPageData()

        protected virtual void ClearGridData()
        {
            MaterialsRequirementGrid.ClearData();
            MaterialsRequirementGrid.OriginalData = null;
            MaterialsRequirementGrid.GridContext.CurrentPage = 1;
            SetSatisfiedWidgetCountControl(null);
        } // ClearGridData()

        protected virtual void SetSelectedRow(OM.NamedSubentityRef bOMLineItem)
        {
            if (MaterialsRequirementGrid.Data != null)
            {
                mkIsNeedClearControls = false;
                MaterialsRequirementGrid.SelectedRowID = GetRowIdByBOMLineItem(bOMLineItem);
            }
        } // SetSelectedRow(NamedSubentityRef bOMLineItem)

        protected virtual string GetRowIdByBOMLineItem(OM.NamedSubentityRef bOMLineItem)
        {
            string bOMLineItemStr = bOMLineItem.Name;
            return (MaterialsRequirementGrid.GridContext as SubentityDataContext).GetRowIdByCellValue(mkBOMLineItemColumn, bOMLineItemStr);
        } // GetRowIdByBOMLineItem(NamedSubentityRef bOMLineItem)

        protected virtual void ClearUserDataEntryAreaControls()
        {
            Product.ClearData();
            ProductDescription.ClearData();
            IssueControl.ClearData();
            NetQtyRequired.ClearData();
            NetQtyRequired.OriginalData = null;
            ScanContainer.ClearData();
            ContainerQty.ClearData();
            UOM.ClearData();
            LotNumber.ClearData();
            IssueQty.ClearData();
            IssueQty.OriginalData = null;
            IssueDifferenceReason.ClearData();
            StockPoint.ClearData();
            UOM2.ClearData();
            IssueQty2.ClearData();
            IssueQty2.OriginalData = null;
            IssueReason.ClearData();
            SubstitutionReason.ClearData();
            Comments.ClearData();
            ExecuteData = null;
        } // ClearUserDataEntryAreaControls()      

        #endregion

        #region Privet methods        

        protected virtual void ClearAllAction()
        {
            ClearPageData();
            ClearGridData();
            ClearUserDataEntryAreaControls();
            SetUserDataEntryLayout(IssueDetailsType);
        } // ClearAllAction()

        #endregion

        #region Fields

        private bool mkIsNeedClearControls = true;

        #endregion

        #region Constants

        protected const string mkIssueStatusColumn = "IssueStatus";
        protected const string mkQtyIssuedColumn = "QtyIssued";
        protected const string mkDisplayOnlyQtyIssuedValue = "---";
        protected const string mkNetQtyRequiredColumn = "NetQtyRequired";
        protected const string mkBOMLineItemColumn = "BOMLineItem";
        protected const string mkContainerQty2 = "ContainerQty2";
        protected const string mkComponentIssueExecuteData = "ComponentIssueExecuteData";
        protected const string mkServiceDetailsStorageKey = "ServiceDetailsStorage";

        #endregion

        protected enum IssueDetailsTypeEnum
        {
            Nothing,
            Lot,
            Serial,
            LotAndStockpoint,
            Stockpoint,
            Qty,
            DisplayOnly
        }
    }
}
