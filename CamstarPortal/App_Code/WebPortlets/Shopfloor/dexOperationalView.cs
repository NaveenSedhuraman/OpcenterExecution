// Copyright Siemens 2019  
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
    public class dexOperationalView : MatrixWebPart
    {
        #region Events

        public event EventHandler ReloadData;

        public event EventHandler ReloadActions;

        public event EventHandler FirstPageLoading;

        public event EventHandler FirstPagePreRendering;

        public event EventHandler SetInProcessType;

        #endregion

        #region Controls

        protected virtual CWC.TextBox ExecutedContainerName
        {
            get { return FindCamstarControl("ExecutedContainerName") as CWC.TextBox; }
        } // ExecutedContainerName

  protected virtual ContainerListGrid ContainerName
        {
            get { return Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid; }
        } // ContainerName

        protected virtual CWGC.JQDataGrid InQueueContainersGrid
        {
            get { return FindCamstarControl("InQueueContainersGrid") as CWGC.JQDataGrid; }
        } // InQueueContainersGrid

        protected virtual CWGC.JQDataGrid InProcessContainersGrid
        {
            get { return FindCamstarControl("InProcessContainersGrid") as CWGC.JQDataGrid; }
        } // InProcessContainersGrid

        protected virtual CWC.CheckBox IsQueueChecked
        {
            get { return FindCamstarControl("IsQueueChecked") as CWC.CheckBox; }
        } // IsQueueChecked

        protected virtual JQTabContainer StatusTabs
        {
            get
            {
                return Page.FindCamstarControl("ContainerStatus_StatusTabs") as JQTabContainer;
            }
        }

        protected CWC.TextBox _txtActionToggle { get { return Page.FindCamstarControl("ActionToggle") as CWC.TextBox; } }
        protected CWC.TextBox _txtSpecDPConfig { get { return Page.FindCamstarControl("SpecDPConfig") as CWC.TextBox; } }
        protected CWC.TextBox _txtSelectedDC { get { return Page.FindCamstarControl("SelectedDC") as CWC.TextBox; } }
        #endregion

        #region Public methods

        public override void PostExecute(WCF.ObjectStack.ResultStatus status, WCF.ObjectStack.Service serviceData)
        {
            base.PostExecute(status, serviceData);

            if (status.IsSuccess)
            {
                isReload = true;
                OnReloadActions(this, EventArgs.Empty);

                (InProcessContainersGrid.GridContext as CWGC.SelValGridContext).ClearCache();
            }
        } // void PostExecute(ResultStatus status, Service serviceData)

        public override void ChildPostExecute(WCF.ObjectStack.ResultStatus status, WCF.ObjectStack.Service serviceData)
        {
            base.ChildPostExecute(status, serviceData);

            if (status.IsSuccess)
            {
                isReload = true;
                OnReloadActions(this, EventArgs.Empty);
            }
        } // void ChildPostExecute(ResultStatus status, Service serviceData)

        public virtual void SetReloadActions()
        {
            isReloadAction = true;
        } // void SetReloadActions()

        #endregion

        #region Protected methods

        protected override void OnLoad(EventArgs e)
        {
            Page.LoadComplete += Page_LoadComplete;
            base.OnLoad(e);

            if (!Page.IsPostBack)
                isReload = true;

            (InProcessContainersGrid.GridContext as CWGC.SelValGridContext).SnapCompleted += OperationalView_SnapCompleted;
            (InQueueContainersGrid.GridContext as CWGC.SelValGridContext).SnapCompleted += OperationalView_SnapCompleted;

            if (StatusTabs != null)
                StatusTabs.LoadAllTabs = true;
            ScriptManager.RegisterStartupScript(this, GetType().GetType(), "updateSideBar", "UpdateSideBarIcons();", true);
            //Bind selected data source into data contract member
            if (_txtSelectedDC.Data != null)
            {
                Page.DataContract.SetValueByName("SelectedDCFromAction", _txtSelectedDC.Data);
                _txtSelectedDC.Data = null;
            }
 if (ContainerName.Data != null)
            {
                bool bDocument = EnableDocumentIcon(ContainerName.Data.ToString());
                string sNew = "Documents:F";
                if (bDocument)
                {
                    sNew = "Documents:T";
                }
                _txtActionToggle.Data = sNew;
                //Get configured data collection in spec modeling
                _txtSpecDPConfig.Data = "Collect Data|" + GetDCTxnMap(ContainerName.Data.ToString());
            }
        }

        protected virtual void OperationalView_SnapCompleted(DataTable dataWindowTable)
        {
            var profile = FrameworkManagerUtil.GetFrameworkSession().CurrentUserProfile;
            if (profile != null)
                TimersSupport.AdjustGridSnapData(dataWindowTable, profile.UTCOffset);
        }

        protected virtual void Page_LoadComplete(object sender, EventArgs e)
        {
            if (!Page.IsPostBack)
                OnFirstPageLoading(sender, e);
            //this should be caled prior to ActionDispatcher.SetActionsVisibility(); in WebPartPageBase's OnPreRender(), where actions are made visible/hidden
            if (isReloadAction)
                OnReloadActions(this, e);
           if (ExecutedContainerName.Data != null && !string.IsNullOrEmpty(ExecutedContainerName.Data.ToString()))
            {
                bool bDocument = EnableDocumentIcon(ExecutedContainerName.Data.ToString());
                string sNew = "Documents:F";
                if (bDocument)
                {
                    sNew = "Documents:T";
                }
                _txtActionToggle.Data = sNew;
                //Get configured data collection in spec modeling
                _txtSpecDPConfig.Data = "Collect Data|" + GetDCTxnMap(ExecutedContainerName.Data.ToString());
            }

        } // void OnLoad(EventArgs e)

        protected virtual void OnFirstPageLoading(object sender, EventArgs e)
        {
            if (FirstPageLoading != null)
                FirstPageLoading(sender, e);
        } // void OnFirstPageLoading(object sender, EventArgs e)

        protected virtual void OnFirstPagePreRendering(object sender, EventArgs e)
        {
            if (FirstPagePreRendering != null)
                FirstPagePreRendering(sender, e);
        } // void FirstPagePreRendering(object sender, EventArgs e)        

        protected virtual void OnReloadData(object sender, EventArgs e)
        {
            if (ReloadData != null)
                ReloadData(sender, e);
            isReload = false;
            isReloadAction = true;
        } // void OnReloadData(object sender, EventArgs e)

        protected virtual void OnReloadActions(object sender, EventArgs e)
        {
            if (ReloadActions != null)
                ReloadActions(sender, e);
            isReloadAction = false;
        } // void OnReloadActions(object sender, EventArgs e)

        protected virtual void OnSetInProcessType(object sender, EventArgs e)
        {
            if (SetInProcessType != null)
                SetInProcessType(sender, e);
        } // void SetInProcessType(object sender, EventArgs e)

        protected override void OnPreRender(EventArgs e)
        {
            if (isReload)
            {
                OnReloadData(this, e);
                if (ExecutedContainerName.Data != null && !string.IsNullOrEmpty(ExecutedContainerName.Data.ToString()))
                {
                    if (IsQueueChecked.IsChecked)
                        OnSetInProcessType(this, e);

                    InProcessContainersGrid.Action_SelectRow(ExecutedContainerName.Data.ToString(), "select");
                }
            }

            if (!Page.IsPostBack)
                OnFirstPagePreRendering(this, e);

            var actions = Page.ActionDispatcher.ActionPanelActions();
            if (actions != null)
            {
                foreach (var submitAction in actions.OfType<SubmitAction>())
                {
                    submitAction.TimersConfirmationRequired = true;
                }
            }

            base.OnPreRender(e);

            if (TypeInQueueFilterChecked)
                InQueueContainersGrid.GridContext.VisibleRows = InQueueContainersGrid.GridContext.RowsPerPage; // extend to the bottom of the page.
            else if (TypeInProcessFilterChecked)
                InProcessContainersGrid.GridContext.VisibleRows = InProcessContainersGrid.GridContext.RowsPerPage; // extend to the bottom of the page.
        } // void OnPreRender(EventArgs e)

        public virtual void SelectContainerInQueue(object container)
        {
            if (container != null && container is OM.ContainerRef && !(container as OM.ContainerRef).IsEmpty)
            {
                InQueueContainersGrid.Action_SelectRow((container as OM.ContainerRef).Name, "select");
                InProcessContainersGrid.Action_SelectRow((container as OM.ContainerRef).Name, "select");
            }
            else
            {
                InQueueContainersGrid.Action_SelectRow(null, "deselect");
                InProcessContainersGrid.Action_SelectRow(null, "deselect");
            }
        }

        #endregion

        protected virtual bool TypeInQueueFilterChecked
        {
            get
            {
                var control = Page.FindCamstarControl("ContainerStatus_TypeInQueue");
                if (control != null && control is CWC.RadioButton)
                    return Convert.ToBoolean((control as CWC.RadioButton).Data);
                return false;
            }
        }

        protected virtual bool TypeInProcessFilterChecked
        {
            get
            {
                var control = Page.FindCamstarControl("ContainerStatus_TypeInProcess");
                if (control != null && control is CWC.RadioButton)
                    return Convert.ToBoolean((control as CWC.RadioButton).Data);
                return false;
            }
        }
        protected bool EnableDocumentIcon(string containerName)
        {
            bool rtnVal = false;
            try
            {


                var frmSess = FrameworkManagerUtil.GetFrameworkSession();
                var svc = new ContainerTxnService(frmSess.CurrentUserProfile);
                var data = new OM.ContainerTxn { Container = new OM.ContainerRef(containerName) };
                var req = new ContainerTxn_Request
                {
                    Info = new OM.ContainerTxn_Info { CurrentContainerStatus = new OM.CurrentContainerStatus_Info(), Factory = new OM.Info(true), DataCollectionDef = new OM.Info(true) }
                };
                req.Info.CurrentContainerStatus = new OM.CurrentContainerStatus_Info { DocumentSets = new OM.DocumentSet_Info { RequestValue = true } };
                ContainerTxn_Result res;
                var state = svc.Load(data, req, out res);
                if (state.IsSuccess && res.Value.CurrentContainerStatus != null)
                {
                    var s = res.Value.CurrentContainerStatus;
                    if (s.DocumentSets != null)
                    {
                        rtnVal = true;
                    }
                }
            }
            catch
            {
                rtnVal = false;
            }
            return rtnVal;
        }

        #region Get configured data collection in spec modeling
        protected string GetDCTxnMap(string containerName)
        {
            string sDCList = string.Empty;
            try
            {
                var frmSess = FrameworkManagerUtil.GetFrameworkSession();
                var svc = new CollectDataService(frmSess.CurrentUserProfile);
                var data = new OM.CollectData { Container = new OM.ContainerRef(containerName) };
                var req = new CollectData_Request
                {
                    Info = new OM.CollectData_Info { DataCollectionDef = FieldInfoUtil.RequestSelectionValue() }
                };
                CollectData_Result res;
                var state = svc.GetEnvironment(data, req, out res);
                if (state.IsSuccess && res.Environment.DataCollectionDef != null && res.Environment.DataCollectionDef.SelectionValues != null && res.Environment.DataCollectionDef.SelectionValues.Rows.Count() > 0)
                {
                    DataTable dtRow = res.Environment.DataCollectionDef.SelectionValues.GetAsDataTable();
                    var dclist = dtRow.AsEnumerable().Select(r => r.Field<string>("Name") + ": " + r.Field<string>("Revision")).ToArray();
                    sDCList = string.Join(",", dclist);
                }
            }
            catch
            {
                sDCList = string.Empty;
            }
            return sDCList;
        }
        #endregion

        #region Fields

        private bool isReload = false;
        private bool isReloadAction = false;

        #endregion
    }
}
