// Copyright Siemens 2019  
using System;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using OM = Camstar.WCF.ObjectStack;
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.PortalFramework;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.WebControls.PickLists;
using System.Data;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Web.UI.WebControls;
using Camstar.WebPortal.Constants;
using System.Web;
using CamstarPortal.WebControls;
using Camstar.WebPortal.Utilities;

namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class ComponentReplace : MatrixWebPart
    {

        #region SessionVars

        protected virtual OM.ComponentReplaceInquiry IssueData
        {
            get { return Page.SessionVariables[mkComponentIssueExecuteData] as OM.ComponentReplaceInquiry; }
            set { Page.SessionVariables[mkComponentIssueExecuteData] = value; }
        } // ExecuteData

        protected virtual OM.ComponentReplaceDetail SelectedData
        {
            get { return Page.SessionVariables[mkComponentIssueExecuteData] as OM.ComponentReplaceDetail; }
            set { Page.SessionVariables[mkComponentIssueExecuteData] = value; }
        } // ExecuteData

        protected virtual string CurrentContainerID
        {
            get { return Page.SessionVariables[mkCurrentContainerID] as string; }
            set { Page.SessionVariables[mkCurrentContainerID] = value; }
        } // CurrentContainerID

        protected virtual bool IsTreeChangedFromScan
        {
            get
            {
                var session = new CallStack(MaterialsRequirementGrid.CallStackKey).Context.LocalSession;
                bool result = false;

                if (session != null && session[isTreeChangedFromScan] != null)
                    result = (bool)session[isTreeChangedFromScan];

                return result;
            }
            set
            {
                var session = new CallStack(MaterialsRequirementGrid.CallStackKey).Context.LocalSession;
                if (session != null)
                    session[isTreeChangedFromScan] = value;
            }
        } // IsTreeChangedFromScan

        protected virtual DataTable ComponentReplaceTreeData
        {
            get { return Page.PortalContext.LocalSession["ComponentReplace"] as DataTable; }
            set { Page.PortalContext.LocalSession["ComponentReplace"] = value; }
        }

        protected virtual bool IsRenderWebPart
        {
            get
            {
                var session = new CallStack(MaterialsRequirementGrid.CallStackKey).Context.LocalSession;
                bool result = false;

                if (session != null && session[mkComponentIssueIsRenderWP] != null)
                    result = (bool)session[mkComponentIssueIsRenderWP];

                return result;
            }
            set
            {
                var session = new CallStack(MaterialsRequirementGrid.CallStackKey).Context.LocalSession;
                if (session != null)
                    session[mkComponentIssueIsRenderWP] = value;
            }
        } // IsRenderWebPart

        protected virtual List<OM.ComponentReplaceDetail> ExecuteDataList
        {
            get
            {
                var session = new CallStack(MaterialsRequirementGrid.CallStackKey).Context.LocalSession;
                List<OM.ComponentReplaceDetail> resultList = null;

                if (session != null)
                {
                    if (session[mkComponentIssueExecuteDataList] == null)
                        session[mkComponentIssueExecuteDataList] = new List<OM.ComponentReplaceDetail>();

                    resultList = session[mkComponentIssueExecuteDataList] as List<OM.ComponentReplaceDetail>;
                }

                return resultList;
            }
        } // ExecuteDataList

        #endregion

        private DataTable treeDataSource; //todo

        protected virtual IssueDetailsTypeEnum IssueDetailsType
        {
            get
            {
                var issueDetails = (IssueData != null && IssueData.IssueDetails != null)
                    ? IssueData.IssueDetails
                    : null;
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
        } //IssueDetailsTypeEnum IssueDetailsType

        #region Events

        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);

            if (SelectedData != null)
            {
                MaterialsRequirementGrid.SelectedRowID = GetRowIdByIssueActualHistory(SelectedData.IssueActualHistory);
                SelectedData = null;
            }

            if (IssueData == null)
            {
                ClearUserDataEntryAreaControls();
            }

            if (ScanContainer.Data == null)
            {
                SetUserDataEntryLayout(IssueDetailsType);

                UpdateDependentControls();
            }

            var submitAction = Page.ActionDispatcher.GetActionByName("ReplaceAction");

            if (submitAction != null)
            {
                var button = submitAction.Control as WebControl;

                if (button != null)
                {
                    button.Attributes[ControlAttributeConstants.IsTimersConfirmationRequired] = "true";
                }
            }

            Page.RenderToClient = true;
        } // void OnPreRender(EventArgs e)

        protected override void OnLoad(EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                Page.SessionVariables[IsAddToPendingButtonDisabled] = true;
                Page.SessionVariables[IsReplaceButtonDisabled] = true;
            }

            CurrentContainer.DataChanged += CurrentContainer_DataChanged;

            ComponentReplaceTree.HideFilter = true;

            ComponentReplaceTree.DisplayingData += ComponentReplaceTree_DisplayingData;
            ComponentReplaceTree.DataChanged += ComponentReplaceTree_DataChanged;
            ComponentReplaceTree.PickListPanelControl.PostProcessData += PickListPanelControl_PostProcessData;

            MaterialsRequirementGrid.GridContext.RowExpanded += MaterialsRequirementGrid_RowExpanded;
            MaterialsRequirementGrid.GridContext.RowSelected += MaterialsRequirementGrid_RowSelected;

            MaterialsRequirementSubGrid.GridContext.RowDeleting += MaterialsRequirementSubGrid_RowDeleting;
            MaterialsRequirementSubGrid.GridContext.RowDeleted += MaterialsRequirementSubGrid_RowDeleted;

            ReplaceReason.DataChanged += ReplaceReason_DataChanged;

            base.OnLoad(e);
        } // void OnLoad(EventArgs e)

        #region ControlEvents

        protected virtual void CurrentContainer_DataChanged(object sender, EventArgs e)
        {
            var container = CurrentContainer.Data as ContainerRef;

            if (container == null)
            {
                CurrentContainerID = "";
                Page.ClearValues();
            }

            ReloadComponentReplaceTree();
            ScanField.ClearData();
            ExecuteDataList.Clear();
            ComponentReplaceTree.PickListPanelControl.ReloadData();
            CamstarWebControl.SetRenderToClient(ComponentReplaceTree);
        }

        protected virtual void ComponentReplaceTree_DataChanged(object sender, EventArgs e)
        {
            if (e == EventArgs.Empty && !IsTreeChangedFromScan)
            {
                return;
            }

            LoadServiceDetails();
            ScanField.ClearData();
            ExecuteDataList.Clear();

            IsTreeChangedFromScan = false;
        }

        protected virtual void ComponentReplaceTree_DisplayingData(object sender, DataRequestEventArgs e)
        {
            e.ViewMode = "tree";
            treeDataSource = e.OriginalData as DataTable;

            if (treeDataSource == null || treeDataSource.Rows.Count <= 0)
            {
                return;
            }

            var container = CurrentContainer.Data as ContainerRef;

            if (container == null)
            {
                e.Data = null;
                return;
            }

            var item = new tree_row(container.Name, CurrentContainerID, "", "", false);

            CollectChildren(item, CurrentContainerID);

            e.Data = item.children;
        }

        protected virtual void PickListPanelControl_PostProcessData(object sender, DataRequestEventArgs e)
        {
            if (ComponentReplaceTreeData != null)
            {
                e.Data = ComponentReplaceTreeData;
                e.TotalRecords = ComponentReplaceTreeData.Rows.Count;
            }
        }

        protected virtual ResponseData MaterialsRequirementGrid_RowExpanded(object sender, JQGridEventArgs args) //todo: null ref exception possible
        {
            var parentItem = (ComponentReplaceDetail)MaterialsRequirementGrid.GridContext.GetItem(args.Context.ExpandedRowID);
            var result = ExecuteDataList.FindAll(item => item.IssueActualHistory.ID.Equals(parentItem.IssueActualHistory.ID));

            var newConextId = args.InputData[mkSubGridContextID].ToString();
            var subContext = new CallStack(args.Context.CallStackKey).Context.LocalSession[newConextId] as BoundContext;
            var subResponse = args.Response as DirectUpdateData;
            var subState = args.State;

            var subGridTemplateContext = MaterialsRequirementSubGrid.GridContext as BoundContext;
            subGridTemplateContext.AssociatedChildData = new Dictionary<string, object>
            {
                {
                    args.Context.ExpandedRowID,
                    result.ToArray()
                }
            };

            var dataStr = "{data:" + subContext.GetClientData(null) + "}";
            var str = Newtonsoft.Json.JsonConvert.SerializeObject(new DirectUpdateReponseData(subState, "ok", dataStr));

            subResponse.PropertyValue = string.Format("({0})", str);

            return subResponse;
        }

        protected virtual ResponseData MaterialsRequirementGrid_RowSelected(object sender, JQGridEventArgs e)
        {
            ScanField.ClearData(); // todo: if material type changes or...
            IssueData = null;
            SetUserDataEntryLayout(IssueDetailsTypeEnum.Nothing);

            return null;
        }

        protected virtual ResponseData MaterialsRequirementSubGrid_RowDeleting(object sender, JQGridEventArgs args)
        {
            if (args.Context.SelectedRowID == null)
            {
                return null;
            }

            var rowItem = (OM.ComponentReplaceDetail)args.Context.GetItem(args.Context.SelectedRowID);

            if (rowItem == null)
            {
                return null;
            }

            var removedItem = ExecuteDataList.Single(removeItem => removeItem.UniqueID.Equals(rowItem.UniqueID));

            ExecuteDataList.Remove(removedItem);

            var uniqueID = 0;
            ExecuteDataList.ForEach(item => item.UniqueID = uniqueID++);

            if (removedItem.QtyIssued != null)
            {
                RecalculateMaterialsRequirementGrid(removedItem.IssueActualHistory, -removedItem.QtyIssued.Value);
            }

            return null;
        } 

        protected virtual ResponseData MaterialsRequirementSubGrid_RowDeleted(object sender, JQGridEventArgs args)
        {
            var resp = args.Response as DirectUpdateData;

            if (resp != null)
            {
                resp.PropertyValue = Regex.Replace(resp.PropertyValue,
                    "PostBackRequested:false",
                    "PostBackRequested:true");
            }

            IsRenderWebPart = true;
            return resp;
        }

        protected virtual void ReplaceReason_DataChanged(object sender, EventArgs e)
        {
            if (ReplaceReason.Data == null)
            {
                return;
            }

            var maint = new OM.ReplaceReasonMaint
            {
                ObjectToChange = new OM.NamedObjectRef(ReplaceReason.Data.ToString())
            };
            var info = new OM.ReplaceReasonMaint_Info
            {
                ObjectChanges = new OM.ReplaceReasonChanges_Info
                {
                    IsScrapRemoved = new OM.Info(true)
                }
            };

            OM.Service output = new OM.ReplaceReasonMaint();
            OM.ResultStatus status = Service.ExecuteFunction(maint, info, "Load", ref output);
            OM.ReplaceReasonMaint output2 = output as OM.ReplaceReasonMaint;

            if (status.IsSuccess && output2 != null && output2.ObjectChanges != null)
            {
                IsScrapReplaced.Data = IsScrapReplaced.IsChecked = output2.ObjectChanges.IsScrapRemoved.Value;
            }
        }

        #endregion

        #region Scan Product/Container methods 

        public virtual void ScanNewContainerOrProduct(object sender, EventArgs e)
        {
            var scanValue = ScanField.Data as string;

            if (scanValue == null)
            {
                return;
            }

            if (ComponentReplaceTreeData == null)
            {
                return;
            }

            var searchQuery =
                string.Format("IssuedFrom='{0}' OR Product='{0}' OR ReferenceDesignator='{0}'", scanValue);

            var scannedContainer = ComponentReplaceTreeData.Select(searchQuery).FirstOrDefault();

            if (scannedContainer == null)
            {
                WriteError(alertContainerNotFound);
                return;
            }

            IsTreeChangedFromScan = true;
            ComponentReplaceTree.Data = scannedContainer["IssueActualHistoryId"];

            var expandedKeys = GetExpandedKeys(scannedContainer);
            ComponentReplaceTree.PickListPanelControl.SetExpandedPath(expandedKeys);
        } //void ScanNewContainerOrProduct(object sender, EventArgs e)

        public virtual void ScanIssueItem(object sender, EventArgs e)
        {
            var objectName = ScanContainer.Data != null ? ScanContainer.Data.ToString() : string.Empty;

            SelectedData = SelectionGridData;

            if (string.IsNullOrEmpty(objectName) || SelectedData == null)
            {
                return;
            }

            FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
            var service = new ComponentReplaceInquiryService(session.CurrentUserProfile);
            var isRowSelected = SelectedData != null;

            var serviceData = new OM.ComponentReplaceInquiry
            {
                BOMLineItem = isRowSelected ? SelectedData.BOMLineItem : null,
                ParentContainer = ScannedContainer.Data as ContainerRef,
                ObjectName = objectName
            };

            var serviceInfo = new OM.ComponentReplaceInquiry_Info
            {
                IssueDetails = new OM.IssueDetails_Info
                {
                    RequestValue = true
                },
                Container = new Info(true),
                Product = new Info(true),
                Qty = new Info(true),
                Qty2 = new Info(true),
                UOM = new Info(true),
                UOM2 = new Info(true),
            };

            var request = new ComponentReplaceInquiry_Request { Info = serviceInfo };

            var result = new Camstar.WCF.Services.ComponentReplaceInquiry_Result();
            var resultStatus = new OM.ResultStatus();

            resultStatus = service.ExecuteTransaction(serviceData, request, out result);

            if (e == null)
            {
                e = new CustomActionEventArgs();
            }
            if (e is CustomActionEventArgs)
            {
                (e as CustomActionEventArgs).Result = resultStatus;
            }

            if (!resultStatus.IsSuccess)
            {
                ClearUserDataEntryAreaControls();
                Page.DisplayMessage(resultStatus);
                Page.SessionVariables[IsAddToPendingButtonDisabled] = true;
                return;
            }

            IssueData = result.Value;

            if (result.IsEmpty)
            {
                return;
            }

            ContainerQty.Data = IssueData.Qty;
            IssueQty.Data = IssueData.Qty;
            UOM.Data = IssueData.UOM;
            UOM2.Data = IssueData.UOM2;

            if (IssueData.IssueDetails != null)
            {
                Product.Data = IssueData.IssueDetails.Product;
            }

            Page.SessionVariables[IsAddToPendingButtonDisabled] = false;

            SetUserDataEntryLayout(IssueDetailsType);
            UpdateDependentControls();
        } //void ScanFieldChanged(object sender, EventArgs e)       

        #endregion

        #endregion

        private void UpdateDependentControls()
        {
            if (SelectionGridData != null)
            {
                Product.Data = SelectionGridData.Product;

                double oldValue;
                var issueQty = SelectionGridData.QtyIssued.Value - SelectionGridData.QtyReplaced.Value;

                if (IssueQty.Data != null && double.TryParse(IssueQty.Data.ToString(), out oldValue))
                {
                    IssueQty.Data = (oldValue < issueQty) ? oldValue : issueQty;
                }
                else
                {
                    IssueQty.Data = issueQty;
                }

                ComponentReplaceTree.Data = SelectionGridData.IssueActualHistory.ID;

                if (IssueDetailsType == IssueDetailsTypeEnum.Lot || IssueDetailsType == IssueDetailsTypeEnum.Serial)
                {
                    DestinationContainer.Data = SelectionGridData.RemoveContainer;
                }
            }
        } //void UpdateDependentControls()

        protected virtual void CollectChildren(tree_row parent, string type)
        {
            type = type ?? "";
            foreach (var o in treeDataSource.Rows)
            {
                var row = o as DataRow;

                if (row == null)
                {
                    continue;
                }

                var rowType = row["ParentContainerId"].ToString();

                if (rowType != type)
                {
                    continue;
                }

                var name = string.Format("{0} | {1} | {2} | {3}",
                        row["Product"],
                        row["IssuedFrom"],
                        row["QtyIssued"],
                        row["ReferenceDesignator"]);

                var item = new tree_row(name.TrimEnd(), row["IssueActualHistoryId"].ToString(), "", "", true);
                parent.AddChild(item);
                CollectChildren(item, row["ContainerId"].ToString());
            }
        } //void CollectChildren(tree_row parent, string type)

        public override void WebPartCustomAction(object sender, CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);

            var action = e.Action as CustomAction;

            if (action == null)
            {
                return;
            }

            switch (action.Parameters)
            {
                case "AddToPending":
                    {
                        ResultStatus result = AddToPending();
                        e.Result = result;
                        break;
                    }
                case "Clear":
                    {
                        Page.ShopfloorReset(sender, e as CustomActionEventArgs);
                        ExecuteDataList.Clear();
                        break;
                    }
                case "ExecuteTransaction":
                    {
                        ResultStatus result = ExecuteTransaction();
                        e.Result = result;

                        if (result.IsSuccess)
                        {
                            ExecuteDataList.Clear();
                            Page.ClearValues();

                            var container = (ContainerRef)CurrentContainer.Data;

                            if (container != null)
                            {
                                LoadServiceDetails();
                            }
                        }

                        break;
                    }
            }
        } //void WebPartCustomAction(object sender, CustomActionEventArgs e)

        protected virtual ResultStatus AddToPending()
        {
            if (IssueData == null || IssueData.IssueDetails == null || SelectionGridData == null)
            {
                return null;
            }

            var issueActualDetail = CreateComponentReplaceDetail();

            if (IssueDetailsType == IssueDetailsTypeEnum.Lot &&
                IssueData.Qty != null &&
                IssueData.Qty.Value < issueActualDetail.QtyIssued.Value)
            {
                var message = GetLabelValueByLabelName(alertLabelQtyWarning);
                return CreateExceptionResultStatus(message);
            }

            bool isAlreadyAdded = ExecuteDataList.Count(x => x.IssueContainer != null && issueActualDetail.IssueContainer != null && x.IssueContainer.Name == issueActualDetail.IssueContainer.Name) != 0;

            if (isAlreadyAdded)
            {
                var message = string.Format(GetLabelValueByLabelName(alertLabelContainerAlreadyAdded), IssueData.Container.Name);
                return CreateExceptionResultStatus(message);
            }

            var validationStatus = ValidateInputData(new OM.ComponentReplace
            {
                ServiceDetails = new OM.ComponentReplaceDetail[] { issueActualDetail }
            });

            if (!validationStatus.IsSuccess)
            {
                return validationStatus;
            }

            if ((IssueDetailsType == IssueDetailsTypeEnum.Lot ||
                IssueDetailsType == IssueDetailsTypeEnum.Serial) &&
                IssueData.Qty == null)
            {
                var message = GetLabelValueByLabelName(alertLabelContainerRequried);
                return CreateExceptionResultStatus(message);
            }

            ExecuteDataList.Add(issueActualDetail);

            var uniqueID = 0;
            ExecuteDataList.ForEach(item => item.UniqueID = uniqueID++);

            if(issueActualDetail.QtyIssued != null) 
                RecalculateMaterialsRequirementGrid(issueActualDetail.IssueActualHistory, issueActualDetail.QtyIssued.Value);

            ClearUserDataEntryAreaControls();
            SetUserDataEntryLayout(IssueDetailsType);

            return new ResultStatus();
        } // ResultStatus AddToPending()

        private void RecalculateMaterialsRequirementGrid(OM.SubentityRef issueActualHistory, double qty)
        {
            var materialsArray = MaterialsRequirementGrid.Data as Array;

            if (materialsArray == null || issueActualHistory == null)
            {
                return;
            }

            foreach (OM.ComponentReplaceDetail item in materialsArray)
            {
                if (item.IssueActualHistory.ID.Equals(issueActualHistory.ID))
                {
                    item.QtyReplaced = (item.QtyReplaced.IsEmpty ? 0 : item.QtyReplaced.Value) + qty;
                }
            }
        } //RecalculateMaterialsRequirementGrid(OM.SubentityRef issueActualHistory, double qty)

        protected virtual string GetRowIdByIssueActualHistory(OM.SubentityRef issueActualHistory)
        {
            var context = MaterialsRequirementGrid.GridContext as SubentityDataContext;

            if (context == null || issueActualHistory == null)
            {
                return string.Empty;
            }

            return context.GetRowIdByCellValue("IssueActualHistory", issueActualHistory.ToString());
        } //GetRowIdByIssueActualHistory(OM.SubentityRef issueActualHistory)

        protected virtual OM.ComponentReplaceDetail CreateComponentReplaceDetail()
        {
            var componentReplaceDetail = new OM.ComponentReplaceDetail();

            if (IssueData == null || IssueData.IssueDetails == null)
            {
                return componentReplaceDetail;
            }

            double qtyIssued, qty2Issued;

            componentReplaceDetail = new OM.ComponentReplaceDetail
            {
                FieldAction = OM.Action.Create,
                BOMLineItem = IssueData.IssueDetails.BOMLineItem,
                Product = IssueData.Product,
                IssueActualHistory = SelectionGridData.IssueActualHistory,

                OpenClosedContainer = (bool) OpenClosedContainer.Data,
                IsScrapReplaced = (bool) IsScrapReplaced.Data,

                ReplaceReason = ReplaceReason.Data as OM.NamedObjectRef,
                Vendor = Vendor.Data as NamedObjectRef,
                VendorItem = VendorItem.Data as NamedSubentityRef,

                IssueStockPoint = StockPoint.Data != null ? StockPoint.Data.ToString() : null,
                Comments = Comments.Data != null ? Comments.Data.ToString() : null,

                IssueLot = (LotNumber.Data != null && !string.IsNullOrEmpty(LotNumber.Data.ToString()))
                    ? LotNumber.Data.ToString()
                    : null,

                IssueContainer = IssueData.Container != null
                    ? new OM.ContainerRef
                    {
                        Name = IssueData.Container.Name
                    }
                    : null,

                QtyIssued = IssueDetailsType != IssueDetailsTypeEnum.Serial
                    ? (IssueQty.Data != null && double.TryParse(IssueQty.Data.ToString(), out qtyIssued)
                        ? (OM.Primitive<double>) qtyIssued
                        : 0)
                    : IssueData.Qty,

                Qty2Issued = IssueDetailsType != IssueDetailsTypeEnum.Serial
                    ? (IssueQty2.Data != null && double.TryParse(IssueQty2.Data.ToString(), out qty2Issued)
                        ? (OM.Primitive<double>) qty2Issued
                        : 0)
                    : IssueData.Qty2,

                SubstitutionReason =
                    SubstitutionReason.Data != null && !(SubstitutionReason.Data as OM.NamedObjectRef).IsEmpty
                        ? new OM.NamedObjectRef
                        {
                            Name = (SubstitutionReason.Data as OM.NamedObjectRef).Name
                        }
                        : null,

                DestinationLot = (IssueDetailsType == IssueDetailsTypeEnum.LotAndStockpoint &&
                                  DestinationContainer.Data != null)
                    ? DestinationContainer.Data.ToString()
                    : null,
                DestinationStockPoint = (IssueDetailsType == IssueDetailsTypeEnum.LotAndStockpoint ||
                                         IssueDetailsType == IssueDetailsTypeEnum.Stockpoint) &&
                                        DestinationLocation.Data != null
                    ? DestinationLocation.Data.ToString()
                    : null,

                ToWorkflow = ToWorkflow.Data as OM.RevisionedObjectRef,
                ToStep = ToWorkflow.StepControl.Data as OM.NamedSubentityRef
            };

            if (IssueDetailsType == IssueDetailsTypeEnum.Serial || IssueDetailsType == IssueDetailsTypeEnum.Lot)
            {
                componentReplaceDetail.DestinationContainer =
                    WSObjectRef.AssignContainer((string) DestinationContainer.Data);
                object factory = new NamedObjectRef(Page.SessionDataContract.GetValueByName(Camstar.WebPortal.Constants.DataMemberConstants.Factory) as string);
                componentReplaceDetail.DestinationLocation = WSObjectRef.AssignNamedSubentity((string)DestinationLocation.Data, factory);
            }

            return componentReplaceDetail;
        } //OM.ComponentReplaceDetail CreateIssueActualDetail()

        protected virtual void SetUserDataEntryLayout(IssueDetailsTypeEnum type)
        {
            ContainerQty.Visible = UOM.Visible = ToWorkflow.Visible = (type == IssueDetailsTypeEnum.Lot ||
                                                                       type == IssueDetailsTypeEnum.Serial);

            OpenClosedContainer.Visible = (type == IssueDetailsTypeEnum.Lot);

            IssueQty.Visible = IssueQty.Required = (type != IssueDetailsTypeEnum.Serial &&
                                                    type != IssueDetailsTypeEnum.DisplayOnly &&
                                                    type != IssueDetailsTypeEnum.Nothing);

            StockPoint.Visible = (type == IssueDetailsTypeEnum.LotAndStockpoint ||
                                  type == IssueDetailsTypeEnum.Stockpoint);

            Vendor.Visible = VendorItem.Visible = (type == IssueDetailsTypeEnum.LotAndStockpoint ||
                                                   type == IssueDetailsTypeEnum.Stockpoint ||
                                                   type == IssueDetailsTypeEnum.Qty);

            ScanContainer.Required = ScanContainer.PageFlowRequired = (type == IssueDetailsTypeEnum.Serial ||
                                                                       type == IssueDetailsTypeEnum.Stockpoint);

            IssueQty2.Visible = UOM2.Visible = (type != IssueDetailsTypeEnum.Serial &&
                                                type != IssueDetailsTypeEnum.Nothing);

            LotNumber.Visible = LotNumber.Required = (type == IssueDetailsTypeEnum.LotAndStockpoint);

            DestinationLocation.Visible = DestinationContainer.Visible = (type == IssueDetailsTypeEnum.Lot ||
                                                                          type == IssueDetailsTypeEnum.Serial ||
                                                                          type == IssueDetailsTypeEnum.LotAndStockpoint);

            DestinationLocation.Visible = (DestinationLocation.Visible || type == IssueDetailsTypeEnum.Stockpoint);

            SubstitutionReason.Visible = Comments.Visible = (type != IssueDetailsTypeEnum.Nothing);

            LabelCache labelCache = FrameworkManagerUtil.GetLabelCache(System.Web.HttpContext.Current.Session);

            if (labelCache == null)
            {
                return;
            }

            OM.Label lbl = null;

            switch (type)
            {
                case IssueDetailsTypeEnum.Lot:
                case IssueDetailsTypeEnum.Serial:
                    lbl = labelCache.GetLabelByName("Lbl_ScanContainer");
                    break;
                case IssueDetailsTypeEnum.LotAndStockpoint:
                case IssueDetailsTypeEnum.Stockpoint:
                    lbl = labelCache.GetLabelByName("Lbl_ScanProduct");
                    break;
                case IssueDetailsTypeEnum.Qty:
                case IssueDetailsTypeEnum.DisplayOnly:
                case IssueDetailsTypeEnum.Nothing:
                    lbl = labelCache.GetLabelByName("Lbl_ScanContainerProduct");
                    break;
            }

            if (lbl != null)
            {
                ScanContainer.LabelText = lbl.Value;
            }
        } //void SetUserDataEntryLayout(IssueDetailsTypeEnum type) 

        protected virtual void ClearAllAction()
        {
            ClearPageData();
            ClearUserDataEntryAreaControls();
            MaterialsRequirementGrid.ClearData();
            SetUserDataEntryLayout(IssueDetailsType);
        } //void ClearAllAction()

        protected virtual void ClearPageData()
        {
            Page.ClearValues();
            CurrentContainer.ClearData();
            CurrentContainer.OriginalData = null;
        } //void ClearPageData()

        #region Service methods

        public override ValidationStatus ValidateInputData(Service serviceData)
        {
            ValidationStatus status = base.ValidateInputData(serviceData);

            return status;
        } //ValidationStatus ValidateInputData(Service serviceData)

        protected virtual ResultStatus ExecuteTransaction()
        {
            //Perform value validation
            var executeDataList = ExecuteDataList;

            if (executeDataList == null || executeDataList.Count <= 0)
            {
                ExecuteDataList.Clear();

                var message = GetLabelValueByLabelName(alertLabelPendingQueueIsEmpty);

                return CreateExceptionResultStatus(message);
            }

            OM.ComponentReplace input = new OM.ComponentReplace();
            Page.GetInputData(input);

            OM.ComponentReplace inputForExecute = input.Clone() as OM.ComponentReplace;
            inputForExecute.ServiceDetails = executeDataList.ToArray();

            ResultStatus resultStatus = Service.Form.ValidateInputData(input);

            if (!resultStatus.IsSuccess)
            {
                return resultStatus;
            }

            ComponentReplaceService service = Page.Service.GetService<ComponentReplaceService>();
            service.BeginTransaction();

            var tuple = ESigCaptureUtil.CollectESigServiceDetailsAll();

            if (tuple != null)
            {
                inputForExecute.ESigDetails = tuple.Item1;
            }

            Page.GetLineAssignment(inputForExecute);
            service.ExecuteTransaction(inputForExecute);

            resultStatus = service.CommitTransaction();

            ESigCaptureUtil.CleanESigCaptureDM();

            return resultStatus;
        } //ResultStatus ExecuteTransaction()

        private string GetLabelValueByLabelName(string labelName)
        {
            LabelCache labelCache = FrameworkManagerUtil.GetLabelCache(System.Web.HttpContext.Current.Session);

            var label = (string.IsNullOrWhiteSpace(labelName) || labelCache == null)
                ? null
                : labelCache.GetLabelByName(labelName);

            if (label == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(label.Value))
            {
                return label.Value;
            }

            return label.DefaultValue;
        } //string GetLabelValueByLabelName(string labelName)

        private OM.ResultStatus CreateExceptionResultStatus(string message)
        { 
            return new OM.ResultStatus
            {
                IsSuccess = false,
                ExceptionData = new OM.ExceptionDataType
                {
                    ExceptionLevel = OM.ExceptionLevel.Client,
                    Description = message
                }
            };
        } //OM.ResultStatus CreateExceptionResultStatus(string message)

        protected virtual void ReloadComponentReplaceTree()
        {
            FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(Page.Session);
            var service = Page.Service.GetService<ComponentReplaceInquiryService>();

            var container = CurrentContainer.Data as ContainerRef;

            var data = new ComponentReplaceInquiry()
            {
                Container = container,
                ShowAsBuilt = true
            };
            var request = new ComponentReplaceInquiry_Request()
            {
                Info = new ComponentReplaceInquiry_Info()
                {
                    Container = new Info()
                    {
                        RequestSelectionValues = true
                    }
                }
            };

            ComponentReplaceInquiry_Result result = null;
            var rs = service.GetEnvironment(data, request, out result);

            ComponentReplaceTreeData = null;

            if (rs.IsSuccess)
            {
                CurrentContainerID = result.Value.Container.ID;
                ComponentReplaceTreeData = result.Environment.Container.SelectionValues.GetAsExplicitlyDataTable();
                ComponentReplaceTree.PickListPanelControl.ClearViewData();
                ClearUserDataEntryAreaControls();
                MaterialsRequirementGrid.ClearData();
            }
        } //void ReloadComponentReplaceTree()

        protected virtual void LoadServiceDetails()
        {
            if (ComponentReplaceTree.Data == null)
            {
                ClearUserDataEntryAreaControls();

                MaterialsRequirementGrid.ClearData();
                return;
            }

            Page.SessionVariables[IsAddToPendingButtonDisabled] = true;

            var issueHistoryId = ComponentReplaceTree.Data.ToString();
            var serviceData = Page.Service.Form.CreateServiceData("ComponentReplace") as OM.ComponentReplace;
            var serviceInfo = Page.Service.Form.CreateServiceInfo("ComponentReplace") as ComponentReplace_Info;

            if (serviceInfo == null || serviceData == null)
            {
                return;
            }

            serviceInfo.Container = new Info(true);
            serviceInfo.ServiceDetails = new ComponentReplaceDetail_Info { RequestValue = true };

            if (ComponentReplaceTreeData == null)
            {
                return;
            }

            var currentRow = ComponentReplaceTreeData.Select("IssueActualHistoryId='" + issueHistoryId + "'")
                .FirstOrDefault();

            if (currentRow == null)
            {
                WriteError(alertContainerNotFound);
                return;
            }

            serviceData.Container = new ContainerRef() { Name = currentRow["ParentContainerName"].ToString() };

            RequestValues(serviceInfo, serviceData);

            Service data = null;
            var resultStatus = Page.Service.ExecuteFunction(serviceData, serviceInfo, "Load", ref data);

            var componentReplaceData = data as OM.ComponentReplace;

            if (!resultStatus.IsSuccess ||
                componentReplaceData == null ||
                componentReplaceData.ServiceDetails == null ||
                componentReplaceData.ServiceDetails[0] == null)
            {
                DisplayMessage(resultStatus);
                return;
            }

            SelectedData = componentReplaceData.ServiceDetails
                .FirstOrDefault(s => s.IssueActualHistory.ID == ComponentReplaceTree.Data.ToString());

            ScannedContainer.Data = serviceData.Container;

            DisplayValues(new OM.ComponentReplace { ServiceDetails = new[] { SelectedData } });

            MaterialsRequirementGrid.Data = componentReplaceData.ServiceDetails;
            MaterialsRequirementGrid.GridContext.LoadData();

            SetUserDataEntryLayout(IssueDetailsTypeEnum.Nothing);
        } //void LoadServiceDetails()

        public override void RequestValues(Info serviceInfo, Service serviceData)
        {
            base.RequestValues(serviceInfo, serviceData);

            var data = serviceData as OM.ComponentRemove;

            if (data != null && ComponentReplaceTree.Data != null)
            {
                data.Container = new ContainerRef
                {
                    ID = ComponentReplaceTree.Data.ToString()
                };
            }
        } //RequestValues(Info serviceInfo, Service serviceData)

        #endregion

        #region protected methods

        protected virtual string GetExpandedKeys(DataRow row)
        {
            if (row == null || ComponentReplaceTreeData == null)
                return "";

            var value = ";" + row["IssueActualHistoryId"].ToString();
            var parentContainer = row["ParentContainerId"].ToString();
            var scannedContainer = ComponentReplaceTreeData.Select("ContainerId='" + parentContainer + "'")
                .FirstOrDefault();

            value += GetExpandedKeys(scannedContainer);

            return value;
        } //string GetExpandedKeys(DataRow row)

        protected virtual void ClearUserDataEntryAreaControls()
        {
            Product.ClearData();
            ScanContainer.TextControl.Text = "";
            ContainerQty.ClearData();
            UOM.ClearData();
            LotNumber.ClearData();
            IssueQty.ClearData();
            IssueQty.OriginalData = null;
            StockPoint.ClearData();
            UOM2.ClearData();
            IssueQty2.ClearData();
            IssueQty2.OriginalData = null;
            SubstitutionReason.ClearData();
            Comments.ClearData();
            IssueData = null;
            ReplaceReason.ClearData();
            IsScrapReplaced.ClearData();
            DestinationContainer.ClearData();
            DestinationLocation.ClearData();
            ToWorkflow.ClearData();
            OpenClosedContainer.ClearData();
            Vendor.ClearData();
            VendorItem.ClearData();

        } // ClearUserDataEntryAreaControls()

        protected virtual void WriteError(string labelName)
        {
            LabelCache labelCache = FrameworkManagerUtil.GetLabelCache(Page.Session);
            OM.Label label = labelCache.GetLabelByName(labelName);

            if (label.IsEmpty)
            {
                Page.StatusBar.WriteError(label.DefaultValue);
            }
            else
            {
                Page.StatusBar.WriteError(label.Value);
            }
        } //void WriteError(string labelName)

        #endregion

        #region Controls

        protected virtual OM.ComponentReplaceDetail SelectionGridData
        {
            get { return MaterialsRequirementGrid.SelectionData as OM.ComponentReplaceDetail; }
        }

        protected virtual StatusMessage StatusControl
        {
            get { return FindCamstarControl("StatusControl") as StatusMessage; }
        }

        protected virtual JQDataGrid MaterialsRequirementGrid
        {
            get { return FindCamstarControl("MaterialRequirementsGrid") as JQDataGrid; }
        }

        protected virtual JQDataGrid MaterialsRequirementSubGrid
        {
            get { return FindCamstarControl("MaterialRequirementsSubGrid") as JQDataGrid; }
        }

        protected virtual CWC.DropDownList ComponentReplaceTree
        {
            get { return Page.FindCamstarControl("ComponentReplaceTree") as CWC.DropDownList; }
        }

        protected virtual ContainerListGrid CurrentContainer
        {
            get { return Page.FindCamstarControl("HiddenSelectedContainer") as ContainerListGrid; }
        }

        protected virtual ContainerListGrid ScannedContainer
        {
            get { return Page.FindCamstarControl("ComponentReplace_Container") as ContainerListGrid; }
        }

        protected virtual CWC.TextBox ScanField
        {
            get { return Page.FindCamstarControl("ContainerScan") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox ScanContainer
        {
            get { return FindCamstarControl("ComponentIssueUDA_ScanContainer") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox DestinationContainer
        {
            get { return Page.FindCamstarControl("DestinationContainer") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox DestinationLocation
        {
            get { return Page.FindCamstarControl("DestinationLocationField") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox Product
        {
            get { return Page.FindCamstarControl("ComponentIssueUDA_Product") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox IssueQty
        {
            get { return Page.FindCamstarControl("ServiceDetails_IssueQty") as CWC.TextBox; }
        }

        protected virtual CWC.NamedObject ReplaceReason
        {
            get { return Page.FindCamstarControl("ServiceDetails_ReplaceReason") as CWC.NamedObject; }
        }

        protected virtual CWC.CheckBox IsScrapReplaced
        {
            get { return Page.FindCamstarControl("ServiceDetails_IsScrapReplaced") as CWC.CheckBox; }
        }

        protected virtual CWC.TextBox LotNumber
        {
            get { return Page.FindCamstarControl("ComponentIssueUDA_LotNumber") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox UOM
        {
            get { return Page.FindCamstarControl("ComponentIssueUDA_UOM") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox UOM2
        {
            get { return Page.FindCamstarControl("AdditionalFields_UOM2") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox ContainerQty
        {
            get { return FindCamstarControl("ComponentIssueUDA_ContainerQty") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox StockPoint
        {
            get { return Page.FindCamstarControl("ActualsStock_FromStockPoint") as CWC.TextBox; }
        } 

        protected virtual CWC.NamedObject Vendor
        {
            get { return Page.FindCamstarControl("Vendor") as CWC.NamedObject; }
        } 

        protected virtual CWC.NamedSubentity VendorItem
        {
            get { return Page.FindCamstarControl("VendorItem") as CWC.NamedSubentity; }
        } 

        protected virtual CWC.CheckBox OpenClosedContainer
        {
            get { return Page.FindCamstarControl("OpenClosedContainer") as CWC.CheckBox; }
        }

        protected virtual CWC.TextBox IssueQty2
        {
            get { return Page.FindCamstarControl("AdditionalFields_Qty2Issued") as CWC.TextBox; }
        } 

        protected virtual CWC.NamedObject SubstitutionReason
        {
            get { return Page.FindCamstarControl("AdditionalFields_SubstitutionReason") as CWC.NamedObject; }
        } 

        protected virtual CWC.TextBox Comments
        {
            get { return Page.FindCamstarControl("AdditionalFields_Comments") as CWC.TextBox; }
        } 

        //protected virtual CWC.ContainerList DCContainer
        //{
        //    get { return Page.FindCamstarControl("DCContainer") as CWC.ContainerList; }
        //} 

        protected virtual CWC.WorkflowNavigator ToWorkflow
        {
            get { return Page.FindCamstarControl("ToWorkflow") as CWC.WorkflowNavigator; }
        } 

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

        #region ConstStrings

        private const string isTreeChangedFromScan = "IsTreeChangedFromScan";
        private const string mkComponentIssueIsRenderWP = "ComponentIssueIsRenderWP";
        private const string mkComponentIssueExecuteDataList = "ComponentIssueExecuteDataList";
        private const string mkIssueStatusColumn = "IssueStatus";
        private const string mkQtyIssuedColumn = "QtyIssued";
        private const string mkDisplayOnlyQtyIssuedValue = "---";
        private const string mkNetQtyRequiredColumn = "NetQtyRequired";
        private const string mkBOMLineItemColumn = "BOMLineItem";
        private const string mkContainerQty2 = "ContainerQty2";
        private const string mkComponentIssueExecuteData = "ComponentIssueExecuteData";
        private const string mkServiceDetailsStorageKey = "ServiceDetailsStorage";
        private const string mkSubGridContextID = "SubGridContextID";
        private const string IsReplaceButtonDisabled = "IsReplaceButtonDisabled";
        private const string IsAddToPendingButtonDisabled = "IsAddToPendingButtonDisabled";
        private const string mkCurrentContainerID = "CurrentContainerID";

        private const string alertContainerNotFound = "Err_ComponentRemove_NonexistentContainer";
        private const string alertLabelPendingQueueIsEmpty = "Alert_ComponentReplace_PendingQueueIsEmpty";
        private const string alertLabelContainerAlreadyAdded = "Alert_ComponentReplace_AddWarning";
        private const string alertLabelQtyWarning = "Alert_ComponentReplace_QtyWarning";
        private const string alertLabelContainerRequried = "Alert_ComponentReplace_ContainerRequired";

        #endregion
    }
}
