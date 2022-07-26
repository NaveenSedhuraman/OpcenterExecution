using System;
using System.Data;
using System.Linq;
using System.Web;
using System.Collections.Generic;

using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebGridControls;

using OM = Camstar.WCF.ObjectStack;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.PortalFramework;
using CamstarPortal.WebControls;
using System.Web.UI.WebControls.WebParts;
using Camstar.WebPortal.Constants;
using Camstar.WCF.ObjectStack;
using Camstar.WCF.Services;
using Camstar.WebPortal.Utilities;

/// <summary>
/// Summary description for dexMaterialsRequirementAdvanced
/// </summary>
/// 
namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class dexMaterialsRequirementAdvanced : dexMaterialsRequirement
    {
        public dexMaterialsRequirementAdvanced() { } // MaterialsRequirementAdvanced()

        #region Protected properties

        protected virtual CWC.Button AddToPendingBtn
        {
            get
            {
                return Page.FindCamstarControl("AddToPending") as CWC.Button;
            }
        } // AddToPendingBtn

        protected virtual CWC.Button IssueComponentBtn
        {
            get
            {
                return Page.FindCamstarControl("IssueComponentButton") as CWC.Button;
            }
        } // AddToPendingBtn

        protected virtual CWC.CheckBox AutoAddToPending
        {
            get { return Page.FindCamstarControl("ComponentIssue_AutoAddToPending") as CWC.CheckBox; }
        } // AutoAddToPending       

        protected virtual JQDataGrid MaterialsRequirementSubGrid
        {
            get { return FindCamstarControl("MaterialRequirementsSubGrid") as JQDataGrid; }
        } // MaterialsRequirementSubGrid

        protected virtual List<OM.IssueActualDetail> ExecuteDataList
        {
            get
            {
                var session = new CallStack(MaterialsRequirementGrid.CallStackKey).Context.LocalSession;
                List<OM.IssueActualDetail> resultList = null;

                if (session != null)
                {
                    if (session[mkComponentIssueExecuteDataList] == null)
                        session[mkComponentIssueExecuteDataList] = new List<OM.IssueActualDetail>();

                    resultList = session[mkComponentIssueExecuteDataList] as List<OM.IssueActualDetail>;
                }

                return resultList;
            }
        } // ExecuteDataList

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

        #endregion

        #region Public methods

        public ResultStatus AddToPending(object sender, EventArgs e)
        {
            ResultStatus validationStatus = new ResultStatus();
            try
            {
                if (ExecuteData != null && ExecuteData.IssueDetails != null)
                {
                    var issueActualDetail = CreateIssueActualDetail();
                    validationStatus = ValidateInputData(new OM.ComponentIssue { IssueActualDetails = new OM.IssueActualDetail[] { issueActualDetail } });
                    if (validationStatus.IsSuccess)
                    {
                        ExecuteDataList.Add(issueActualDetail);

                        var uniqueID = 0;
                        ExecuteDataList.ForEach(item => item.UniqueID = uniqueID++);

                        if (MaterialsRequirementGrid.Data != null)
                        {
                            foreach (OM.IssueDetails item in (MaterialsRequirementGrid.Data as Array))
                            {
                                if (item.BOMLineItem.Equals(issueActualDetail.BOMLineItem))
                                {
                                    if (issueActualDetail.QtyIssued != null)
                                    {
                                        item.QtyIssued = (item.QtyIssued != null ? item.QtyIssued.Value : 0) + issueActualDetail.QtyIssued.Value;
                                        item.NetQtyRequired = (item.NetQtyRequired != null ? item.NetQtyRequired.Value : 0) - issueActualDetail.QtyIssued.Value;
                                    }

                                    break;
                                }
                            }
                        }
                        SetSelectedRow(issueActualDetail.BOMLineItem);
                        ClearUserDataEntryAreaControls();
                        SetUserDataEntryLayout(IssueDetailsType);
                    }
                    else
                        Page.DisplayMessage(validationStatus);
                }
            }
            catch (Exception ex)
            {
                validationStatus = new OM.ResultStatus
                {
                    IsSuccess = false,
                    ExceptionData = new OM.ExceptionDataType
                    {
                        Description = ex.Message.ToString(),
                        ExceptionLevel = OM.ExceptionLevel.Client
                    }
                };
            }
            return validationStatus;
        } // AddToPending(object sender, EventArgs e)

        public override void WebPartCustomAction(object sender, Personalization.CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);
            var action = e.Action as CustomAction;
            if (action != null)
            {
                switch (action.Parameters)
                {
                    case "AddToPending":
                        {
                            ResultStatus rs = new ResultStatus();
                            rs = AddToPending(sender, e);
                            if (!rs.IsSuccess)
                            {
                                e.Result = rs;
                            }
                            break;
                        }
                }
            }
        } // WebPartCustomAction(object sender, CustomActionEventArgs e)

        public override void ScanFieldChanged(object sender, EventArgs e)
        {
            e = new CustomActionEventArgs();

            base.ScanFieldChanged(sender, e);

            if (e is CustomActionEventArgs && (e as CustomActionEventArgs).Result != null && (e as CustomActionEventArgs).Result.IsSuccess)
            {
                if (AutoAddToPending.IsChecked && !IsIssueDifferenceReasonRequired())
                    AddToPending(sender, e);
            }
        } // ScanFieldChanged(object sender, EventArgs e)

        #endregion

        #region Protected methods

        protected override void OnLoad(EventArgs e)
        {
            MaterialsRequirementGrid.GridContext.RowExpanded += MaterialsRequirementGrid_RowExpanded;
            MaterialsRequirementSubGrid.GridContext.RowDeleting += MaterialsRequirementSubGrid_RowDeleting;
            MaterialsRequirementSubGrid.GridContext.RowDeleted += MaterialsRequirementSubGrid_RowDeleted;
            base.OnLoad(e);
        } // OnLoad(EventArgs e)

        protected override void OnPreRender(EventArgs e)
        {
            AddToPendingBtn.Enabled = AddToPendingBtn.Enabled && (!AutoAddToPending.IsChecked && ExecuteData != null);
            IssueComponentBtn.Enabled = (ExecuteDataList != null && ExecuteDataList.Count() > 0) || ExecuteData != null;

            if (IsRenderWebPart)
            {
                this.RenderToClient = true;
                IsRenderWebPart = false;
            }

            if (IssueComponentBtn.Enabled)
                IssueComponentBtn.Attributes[ControlAttributeConstants.IsTimersConfirmationRequired] = "true";

            base.OnPreRender(e);
        } // OnPreRender(EventArgs e)

        protected virtual ResponseData MaterialsRequirementSubGrid_RowDeleted(object sender, JQGridEventArgs args)
        {
            var resp = args.Response as DirectUpdateData;
            resp.PropertyValue = System.Text.RegularExpressions.Regex.Replace(resp.PropertyValue, "PostBackRequested:false", "PostBackRequested:true");
            IsRenderWebPart = true;
            return resp;
        }

        protected virtual ResponseData MaterialsRequirementSubGrid_RowDeleting(object sender, JQGridEventArgs args)
        {
            if (args.Context.SelectedRowID != null)
            {
                var rowItem = (OM.IssueActualDetail)args.Context.GetItem(args.Context.SelectedRowID);
                if (rowItem != null)
                {
                    if (rowItem.Comments.ToString().ToUpper() != "ISSUED")
                    {
                        var selectedBomLineItem = rowItem.BOMLineItem;
                        var selectedUniqueID = rowItem.UniqueID;
                        ExecuteDataList.RemoveAll(delegate (OM.IssueActualDetail removeItem)
                        {
                            var result = false;

                            if (removeItem.BOMLineItem.Equals(selectedBomLineItem) && removeItem.UniqueID.Equals(selectedUniqueID))
                            {
                                if (MaterialsRequirementGrid.Data != null)
                                {
                                    foreach (OM.IssueDetails item in (MaterialsRequirementGrid.Data as Array))
                                    {
                                        if (item.BOMLineItem.Equals(selectedBomLineItem))
                                        {
                                            if (removeItem.QtyIssued != null)
                                            {
                                                item.QtyIssued = (item.QtyIssued != null ? item.QtyIssued.Value : 0) - removeItem.QtyIssued.Value;
                                                item.NetQtyRequired = (item.NetQtyRequired != null ? item.NetQtyRequired.Value : 0) + removeItem.QtyIssued.Value;
                                            }
                                            break;
                                        }
                                    }
                                }
                                result = true;
                            }

                            return result;
                        });

                    }
                    else
                    {
                        Page.DisplayMessage("Cannot delete Issued Component", false);
                    }
                }
            }
            return null;
        } // MaterialsRequirementSubGrid_RowDeleting(object sender, JQGridEventArgs args)

        protected override void IssueComponentAction(CustomActionEventArgs e)
        {
            var executeDataList = ExecuteDataList;
            if (executeDataList != null && executeDataList.Count > 0)
            {
                FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
                var service = new Camstar.WCF.Services.ComponentIssueService(session.CurrentUserProfile);

                var serviceData = new OM.ComponentIssue
                {
                    Container = (OM.ContainerRef)ContainerName.Data,
                    IssueActualDetails = executeDataList.ToArray()
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
                    serviceData.ESigDetails = tuple.Item1;

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
                    errorMessage = labelCache.GetLabelByName("Alert_ComponentIssue_PendingQueueIsEmpty");

                e.Result = new OM.ResultStatus
                {
                    IsSuccess = false,
                    ExceptionData = new OM.ExceptionDataType
                    {
                        Description = errorMessage != null && !string.IsNullOrEmpty(errorMessage.Value) ? errorMessage.Value : "Pending queue is empty. Use \"Add To Pending\" button.",
                        ExceptionLevel = OM.ExceptionLevel.Client
                    }
                };
            }

            Page.SetFocus(ScanContainer.ClientID);
        } // IssueComponentAction(CustomActionEventArgs e)

        protected virtual ResponseData MaterialsRequirementGrid_RowExpanded(object sender, FormsFramework.WebGridControls.JQGridEventArgs args)
        {
            var parentBomLineItem = ((OM.IssueDetails)MaterialsRequirementGrid.GridContext.GetItem(args.Context.ExpandedRowID)).BOMLineItem;




            var result = ExecuteDataList.FindAll(item => item.BOMLineItem.Equals(parentBomLineItem));
            var newConextId = args.InputData[mkSubGridContextID].ToString();
            var subContext = new CallStack(args.Context.CallStackKey).Context.LocalSession[newConextId] as BoundContext;
            var subResponse = args.Response as DirectUpdateData;
            var subState = args.State;

            var subGridTemplateContext = MaterialsRequirementSubGrid.GridContext as BoundContext;

            subGridTemplateContext.AssociatedChildData = new Dictionary<string, object>();
            //if (result.Count == 0)
            //{
            string[] prd = ((OM.IssueDetails)MaterialsRequirementGrid.GridContext.GetItem(args.Context.ExpandedRowID)).Product.ToString().Split(':');
            RecordSet rs = GetIssuedComponenetList(prd[0], prd[1]);
            DataTable dt = rs.GetAsDataTable();
            List<OM.IssueActualDetail> lstIAH = new List<IssueActualDetail>();
            foreach (OM.IssueActualDetail item in result)
            {
                item.Comments = "ISSUE PENDING";

            }

            for (int i = 0; i < dt.Rows.Count; i++)
            {
                OM.IssueActualDetail ObjIAH = new OM.IssueActualDetail();

                //Container
                OM.ContainerRef cr = new OM.ContainerRef();
                cr.Name = dt.Rows[i]["lot"].ToString();

                ObjIAH.FromContainer = cr;
                //product
                OM.RevisionedObjectRef Ror = new OM.RevisionedObjectRef();
                Ror.Name = dt.Rows[i]["productname"].ToString();
                Ror.Revision = dt.Rows[i]["productrevision"].ToString();
                ObjIAH.Product = Ror;
                //Qty
                double qtyIssued;
                double.TryParse(dt.Rows[i]["qty"].ToString(), out qtyIssued);
                ObjIAH.QtyIssued = qtyIssued;
                //IssureDifferenceReason
                if (dt.Rows[i]["IssueDifferenceReasonName"] != null)
                {
                    OM.NamedObjectRef NRF = new OM.NamedObjectRef();
                    NRF.Name = dt.Rows[i]["IssueDifferenceReasonName"].ToString();
                    ObjIAH.IssueDifferenceReason = NRF;
                }
                ObjIAH.Comments = "ISSUED";
                result.Add(ObjIAH);
            }
            subGridTemplateContext.AssociatedChildData.Add(args.Context.ExpandedRowID, result.ToArray());
            //}
            //else
            //{
            //    subGridTemplateContext.AssociatedChildData.Add(args.Context.ExpandedRowID, result.ToArray());
            //}

            subResponse.PropertyValue = "(" + Newtonsoft.Json.JsonConvert.SerializeObject(new DirectUpdateReponseData(subState, "ok", "{data:" + subContext.GetClientData(null) + "}")) + ")";

            return subResponse;
        } // GridContext_RowExpanded(object sender, JQGridEventArgs args)        



        public RecordSet GetIssuedComponenetList(string prd, string rev)
        {
            OM.RecordSet recordset = new OM.RecordSet();
            try
            {
                string container = ContainerName.Data.ToString();
                FrameworkSession qrysession = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
                {
                    OM.QueryOptions _queryOptions = new OM.QueryOptions()
                    {
                        QueryType = Camstar.WCF.ObjectStack.QueryType.User,
                        ChangeCount = 0
                    };
                    QueryService QueryService = new QueryService(qrysession.CurrentUserProfile);




                    OM.QueryParameters queryparam = new OM.QueryParameters()
                    {
                        Parameters = new OM.QueryParameter[3]
                    {
                            new OM.QueryParameter("Container",container),
                            new OM.QueryParameter("Prd",prd),
                            new OM.QueryParameter("Rev",rev)
                    }
                    };
                    OM.ResultStatus res = QueryService.Execute("dexGetIssuedComponentList", queryparam, _queryOptions, out recordset);



                    if (res.IsSuccess)
                    {
                        return recordset;
                    }

                }
            }
            catch (Exception ex)
            {
                Page.DisplayMessage(ex.Message.ToString(), false);
            }
            return recordset;
        }






        protected override void ClearGridData()
        {
            base.ClearGridData();
            ExecuteDataList.RemoveAll(item => true);
        } // ClearGridData()

        protected override void SetSelectedRow(OM.NamedSubentityRef bOMLineItem)
        {
            base.SetSelectedRow(bOMLineItem);

            if (MaterialsRequirementGrid.Data != null && MaterialsRequirementGrid.GridContext != null)
            {
                MaterialsRequirementGrid.SelectedRowID = null;
                MaterialsRequirementGrid.GridContext.SelectedRowID = null;
                MaterialsRequirementGrid.GridContext.SelectedRowIDs = new List<string>();

                MaterialsRequirementGrid.GridContext.ExpandedRowID = null;
                MaterialsRequirementGrid.GridContext.ExpandedRowIDs = new List<string>();
            }
        } // SetSelectedRow(NamedSubentityRef bOMLineItem)

        protected override bool IsIssueDifferenceReasonRequired()
        {
            bool result = false;

            if (IssueDetailsType != IssueDetailsTypeEnum.DisplayOnly &&
                IssueDetailsType != IssueDetailsTypeEnum.Nothing)
            {
                bool res1 = false;
                double issueQtyValue;
                double netQtyValue = ExecuteData != null && ExecuteData.IssueDetails != null ? (double)ExecuteData.IssueDetails.NetQtyRequired : double.NaN;

                IEnumerable<OM.IssueActualDetail> executeDataList = null;
                if (Product.Data != null)
                    executeDataList = ExecuteDataList.Where(row => string.Format("{0}:{1}", row.Product.Name, row.Product.Revision) == Product.Data.ToString());

                if (executeDataList != null)
                {
                    foreach (var item in executeDataList)
                    {
                        if (item.QtyIssued != null)
                            netQtyValue -= (double)item.QtyIssued;
                    }
                }

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
            }

            IssueDifferenceReason.Required = result;
            return result;
        }

        #endregion

        #region Fields        

        #endregion

        #region Constants

        private const string mkComponentIssueExecuteDataList = "ComponentIssueExecuteDataList";
        private const string mkComponentIssueIsRenderWP = "ComponentIssueIsRenderWP";
        private const string mkIsAutoAddToPendingCheckedKey = "MaterialsRequirementAutoAddToPendingCheckedKey";
        private const string mkSubGridContextID = "SubGridContextID";

        #endregion
    }

}