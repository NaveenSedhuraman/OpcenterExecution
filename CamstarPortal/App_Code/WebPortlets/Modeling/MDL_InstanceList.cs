// Copyright Siemens 2019  
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using Camstar.WebPortal.PortalConfiguration;
using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using CamstarPortal.WebControls.Accordion;
using OM = Camstar.WCF.ObjectStack;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.FormsFramework.Utilities;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using PERS = Camstar.WebPortal.Personalization;
using CamstarPortal.WebControls;
using System.Collections;
using Camstar.WebPortal.Constants;
using Camstar.WebPortal.WCFUtilities;
using System.Web.UI;

namespace Camstar.WebPortal.WebPortlets.Modeling
{
    public class MDL_InstanceList : MatrixWebPart
    {

        #region Controls

        protected virtual CWC.TextBox InstanceNameTxt { get { return Page.FindCamstarControl("InstanceNameTxt") as CWC.TextBox; } }
        protected virtual CWC.TextBox DescriptionTxt { get { return Page.FindCamstarControl("DescriptionFilter") as CWC.TextBox; } }
        protected virtual CWC.NamedObject LastEditNDO { get { return Page.FindCamstarControl("LastEditNDO") as CWC.NamedObject; } }
        protected virtual CWC.CheckBox ShowActiveChk { get { return Page.FindCamstarControl("ShowActiveChk") as CWC.CheckBox; } }
        protected virtual CWC.CheckBox ShowRORChk { get { return Page.FindCamstarControl("ShowRORChk") as CWC.CheckBox; } }
        protected virtual JQDataGrid InstanceGrid { get { return Page.FindCamstarControl("InstanceGrid") as JQDataGrid; } }
        protected virtual CWC.Button ClearAllBtn { get { return Page.FindCamstarControl("ClearAllBtn") as CWC.Button; } }

        protected virtual CWC.TextBox AssociatedPackagesTxt { get { return Page.FindCamstarControl("AssociatedPackagesTxt") as CWC.TextBox; } }
        protected virtual CWC.CheckBox InstanceLockedChk { get { return Page.FindCamstarControl("InstanceLockedChk") as CWC.CheckBox; } }

        protected virtual Accordion CollapsibleSectionsAccordion
        {
            get
            {
                return Page.FindIForm("CollapsibleSectionsAccordion") as Accordion;
            }
        }
        #endregion

        #region WebParts
        protected virtual WebPartBase FilterWebPart { get { return Page.FindIForm("MDL_Filter_WP") as WebPartBase; } }

        #endregion


        protected override void OnInit(EventArgs e)
        {
            base.OnInit(e);
            if (HttpContext.Current.CurrentHandler != null && !(HttpContext.Current.CurrentHandler is AjaxEntry))
            {
                CDOData? data = null;
                if (!Page.IsPostBack)
                {
                    // page was loaded from Studio directly and there is no PrimaryServiceType specified.
                    if (string.IsNullOrEmpty(Page.PrimaryServiceType) && string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.Maint_Mod]))
                    {
                        if (CamstarPortalSection.Settings.CDOFormsSettings != null && CamstarPortalSection.Settings.CDOFormsSettings.CDOForms != null)
                        {
                            var pageName = PERS.PageMapping.ExtractPageName(Page.Request.Path);
                            var formInfo = CamstarPortalSection.Settings.CDOFormsSettings.CDOForms.FirstOrDefault(cdoForm => string.Equals(cdoForm.PageName, pageName, StringComparison.OrdinalIgnoreCase));
                            if (formInfo != null && !string.IsNullOrEmpty(formInfo.Service))
                                Page.PrimaryServiceType = formInfo.Service;
                        }
                    }
                    if (!string.IsNullOrEmpty(Page.PrimaryServiceType))
                    {
                        var cache = new MaintCDOCache();
                        data = cache.GetMaintCDOData(Page.PrimaryServiceType);
                    }
                }

                var pc = (Page.PortalContext as MaintenanceBehaviorContext);

                if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.Id_Mod]))
                    pc.CDOID = Page.Request.QueryString[QueryStringConstants.Id_Mod];
                else if (data.HasValue)
                    pc.CDOID = data.Value.CDODefID;

                if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.IsRDO_Mod]))
                    pc.IsRDO = bool.Parse(Page.Request.QueryString[QueryStringConstants.IsRDO_Mod]);
                else if (data.HasValue)
                    pc.IsRDO = data.Value.IsRDO.HasValue && data.Value.IsRDO.Value;

                if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.Name_Mod]))
                    pc.CDODisplayName = Page.Request.QueryString[QueryStringConstants.Name_Mod];
                else if (data.HasValue)
                    pc.CDODisplayName = data.Value.CDODisplayName;

                if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.CDOName_Mod]))
                    pc.CDOTypeName = Page.Request.QueryString[QueryStringConstants.CDOName_Mod];
                else if (data.HasValue)
                    pc.CDOTypeName = data.Value.CDOName;

                if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.Maint_Mod]))
                    pc.MaintService = Page.Request.QueryString[QueryStringConstants.Maint_Mod];
                else if (data.HasValue)
                    pc.MaintService = data.Value.MaintService;

                if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.MaintTypeId_Mod]))
                    pc.MaintenanceTypeID = Page.Request.QueryString[QueryStringConstants.MaintTypeId_Mod];
                else if (data.HasValue)
                    pc.MaintenanceTypeID = data.Value.MaintTypeID;

                if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.WIP_Mod]))
                    pc.WIPAvailable = bool.Parse(Page.Request.QueryString[QueryStringConstants.WIP_Mod]);
                else if (data.HasValue)
                    pc.WIPAvailable = data.Value.IsWIPSupported;

                if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.PStackId_Mod]))
                    pc.ParentStackId = Page.Request.QueryString[QueryStringConstants.PStackId_Mod];

                if (Page.EventArgument.Contains("UIAction"))
                {
                    if (Page.EventArgument.Contains("GridView")) pc.ViewMode = InstanceListMode.Grid.ToString();
                    else if (Page.EventArgument.Contains("List")) pc.ViewMode = InstanceListMode.List.ToString();
                    else if (Page.EventArgument.Contains("Bulk")) pc.ViewMode = InstanceListMode.Edit.ToString();
                }

                if( pc.ViewMode == null || (pc.ViewMode == "Grid" && Page.EventArgument == "OnRowSelected") )
                    pc.ViewMode = InstanceListMode.List.ToString();

                if (!Page.IsPostBack)
                {
                    if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.InstanceName_Mod]))
                    {
                        var instName = Page.Request.QueryString[QueryStringConstants.InstanceName_Mod];
                        if (!pc.IsRDO)
                        {
                            pc.Current = new OM.NamedObjectRef(instName);
                        }
                        else
                        {
                            var revision = Page.Request.QueryString[QueryStringConstants.InstanceRev_Mod];
                            pc.Current = new OM.RevisionedObjectRef(instName, revision);
                        }
                        pc.State = MaintenanceBehaviorContext.MaintenanceState.Edit;
                        _fromExternalPage = true;
                    }
                    else if (!string.IsNullOrEmpty(Page.Request.QueryString[QueryStringConstants.InstanceId_Mod]))
                    {
                        pc.Current = new OM.BaseObjectRef(Page.Request.QueryString[QueryStringConstants.InstanceId_Mod]);
                        _fromExternalPage = true;
                    }
                }
            }
        }
        public override void RequestSelectionValues(OM.Info serviceInfo, OM.Service serviceData)
        {
            (InstanceGrid.GridContext as SelValGridContext).RequestSpecificTypeOnly = true;
            base.RequestSelectionValues(serviceInfo, serviceData);
        }
        public override void LoadPersonalization()
        {
            base.LoadPersonalization();
            var pc = (Page.PortalContext as MaintenanceBehaviorContext);
            if (pc != null && !string.IsNullOrEmpty(pc.MaintService))
                Page.PrimaryServiceType = pc.MaintService;
        }

        public virtual ResponseData InstanceGrid_RowSelected(object sender, JQGridEventArgs args)
        {
            var pc = Page.PortalContext as MaintenanceBehaviorContext;
            var selectedItems = InstanceGrid.GridContext.GetSelectedItems(false);
            if (selectedItems != null && selectedItems.Count() > 0)
            {
                var row = selectedItems.First() as DataRow;
                OM.RecordSet recordSet;
                var rowsCount = InstanceGrid.TotalRowCount;
                var totalPagesCount = (InstanceGrid.TotalRowCount / InstanceGrid.GridContext.RowsPerPage) + (InstanceGrid.TotalRowCount % InstanceGrid.GridContext.RowsPerPage == 0 ? 0 : 1);
                int valueIndex = -1;
                var selValContext = InstanceGrid.GridContext as SelValGridContext;
                //search for the instance, in case it is located on some other page, to go there
                for (int i = 1; i <= totalPagesCount && row == null; i++)
                {
                    InstanceGrid.GridContext.CurrentPage = i;
                    selValContext.GetSelectionValuesData(out recordSet, -1);
                    string instanceIdName = "InstanceId";
                    string headerName = instanceIdName;
                    var value = pc.Current.ID;
                    bool isRdoNotResolved = false;
                    if (string.IsNullOrEmpty(value))
                    {
                        headerName = "Name";
                        var ndo = pc.Current as OM.NamedObjectRef;
                        if (ndo != null && !string.IsNullOrEmpty(ndo.Name))
                            value = ndo.Name;
                        else
                        {
                            var rdo = pc.Current as OM.RevisionedObjectRef;
                            if (rdo != null && !string.IsNullOrEmpty(rdo.Name))
                            {
                                isRdoNotResolved = true;
                                value = rdo.Name;
                            }
                        }
                    }
                    valueIndex = Array.IndexOf(recordSet.Headers, recordSet.Headers.FirstOrDefault(h => h.Name.Equals(headerName)));
                    OM.Row selectedRow = null;
                    if (isRdoNotResolved)
                    {
                        var rdo = (OM.RevisionedObjectRef) pc.Current;
                        if (!string.IsNullOrEmpty(rdo.Revision))
                        {
                            var revisionIndex = Array.IndexOf(recordSet.Headers, recordSet.Headers.FirstOrDefault(h => h.Name.Equals("Revision")));
                            if (revisionIndex > -1)
                                selectedRow = recordSet.Rows.FirstOrDefault(r =>r.Values[valueIndex].Equals(value) && r.Values[revisionIndex].Equals(rdo.Revision));
                        }
                        else // revision of record.
                        {
                            var rorId = Array.IndexOf(recordSet.Headers, recordSet.Headers.FirstOrDefault(h => h.Name.Equals("RevOfRcd")));
                            var instanceId = Array.IndexOf(recordSet.Headers, recordSet.Headers.FirstOrDefault(h => h.Name.Equals(instanceIdName)));
                            if (rorId > -1 && instanceId > -1)
                                selectedRow = recordSet.Rows.FirstOrDefault(r => r.Values[valueIndex].Equals(value) && r.Values[rorId].Equals(r.Values[instanceId]));
                        }
                    }
                    else
                        selectedRow = recordSet.Rows.FirstOrDefault(r => r.Values[valueIndex].Equals(value));

                    if (selectedRow == null)
                        continue;
                    recordSet.TotalCount = rowsCount;
                    InstanceGrid.SetSelectionValues(recordSet);
                    InstanceGrid.GridContext.CurrentPage = i;
                    InstanceGrid.BoundContext.SelectRow(selectedRow.Values[Array.IndexOf(recordSet.Headers, recordSet.Headers.FirstOrDefault(h => h.Name.Equals(instanceIdName)))], true);
                    selectedItems = InstanceGrid.GridContext.GetSelectedItems(false);
                    row = selectedItems.First() as DataRow;

                }

                var prevItem = pc.Current;

                if (row != null)
                    SetupPage(pc, row);

                if (CollapsibleSectionsAccordion != null && (prevItem ?? new OM.BaseObjectRef()).ID != pc.Current.ID)
                    CollapsibleSectionsAccordion.RestoreExpandedSections();
            }


            if (_mode == InstanceListMode.Grid)
                pc.ViewMode = InstanceListMode.List.ToString();

            Page.SetDefaultFocus();

            return null;
        }

        protected virtual InstanceListMode _mode
        {
            get { return (InstanceListMode)Enum.Parse(typeof(InstanceListMode), (Page.PortalContext as MaintenanceBehaviorContext).ViewMode); }
        }


        protected override void OnLoad(EventArgs e)
        {
            FilterWebPart.PrimaryServiceType = (Page.PortalContext as MaintenanceBehaviorContext).MaintService;

            if (Page.EventArgument == "FloatingFrameSubmitParentPostBackArgument")
            {
                var popupCmd = Page.PortalContext.DataContract.GetValueByName<string>("InstancePopupCommand");
                Page.PortalContext.DataContract.SetValueByName("InstancePopupCommand", "");
                if (!string.IsNullOrEmpty(popupCmd))
                {
                    if (popupCmd == "copy")
                    {
                        var name = Page.PortalContext.DataContract.GetValueByName<string>("SuggestedInstanceName");
                        var rev = Page.PortalContext.DataContract.GetValueByName<string>("SuggestedInstanceRevision");
                        Page.CopyCDO(name, rev, true);
                    }
                    else if (popupCmd == "delete")
                    {
                        Page.DeleteCDO(true);
                    }

                    else if (popupCmd == "addtopkg")
                    {
                        Page.OnMaintSubmitButtonClicked(true);
                    }

                    (Page.PortalContext as MaintenanceBehaviorContext).ReloadInstanceList = true;
                }
            }
            base.OnLoad(e);
            SetupControls();
            SetupGrid();
        }

        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);
            var pc = Page.PortalContext as MaintenanceBehaviorContext;

            var currentPage = InstanceGrid.GridContext.CurrentPage;
            var selValContext = InstanceGrid.GridContext as SelValGridContext;
            OM.RecordSet recordSet = null;
            if (selValContext != null)
            {
                selValContext.GetSelectionValuesData(out recordSet, -1);
                if (recordSet != null && !Page.IsPostBack)
                {
                    ReloadInstanceList(pc);
                }
            }
            string currentId = null;
            if (pc != null && pc.Current != null)
                currentId = pc.Current.ID;

            if (pc != null)
            {
                if (pc.ReloadInstanceList)
                {
                    ReloadInstanceList(pc);
                }

                if (pc.State == MaintenanceBehaviorContext.MaintenanceState.New || pc.State == MaintenanceBehaviorContext.MaintenanceState.NewRev || pc.State == MaintenanceBehaviorContext.MaintenanceState.None)
                {
                    if (InstanceGrid.BoundContext.SelectedRowIDs != null)
                    {
                        InstanceGrid.BoundContext.SelectedRowIDs.Clear();
                        InstanceGrid.BoundContext.SelectedRowID = null;
                        RenderToClient = true;
                    }
                }
                else if (pc.State == MaintenanceBehaviorContext.MaintenanceState.Edit && pc.Current != null && !InstanceGrid.IsRowSelected)
                {
                    _clearStatusMessage = false; // keeps status message after new instance was created.
                    if (pc.IsSuccessMessage)
                        NavigateToItemPage(recordSet, currentPage, currentId);
                    RenderToClient = true;
                }

            }

            if (!string.IsNullOrEmpty(Page.Request.QueryString["InstanceID"]))
            {
                InstanceGrid.GridContext.SelectedRowIDs = new List<string>() { Page.Request.QueryString["InstanceID"] };
                InstanceGrid_RowSelected(null, null);
            }
        }

        private void ReloadInstanceList(MaintenanceBehaviorContext ctx)
        {
            if (ctx != null)
            {
                InstanceGrid.ClearData();
                InstanceGrid.Action_Reload("");
                ctx.ReloadInstanceList = false;
                RenderToClient = true;
            }
        }

        private void NavigateToItemPage(OM.RecordSet recordSet, int currentPage, string currentId)
        {
            recordSet.TotalCount = InstanceGrid.TotalRowCount;
            InstanceGrid.SetSelectionValues(recordSet);
            InstanceGrid.GridContext.CurrentPage = currentPage;
            InstanceGrid.BoundContext.SelectRow(currentId, true);
            MaintenanceBehaviorContext pc = Page.PortalContext as MaintenanceBehaviorContext;
            var selectedItems = InstanceGrid.GridContext.GetSelectedItems(false);
            var row = selectedItems.First() as DataRow;
            if (row != null)
            {
                SetupPage(pc, row);
            }
            else
            {
                //It's not in our current recordset. This means the item was likely renamed so that it is on a different
                //page. In that case, reset and begin looking from the start.
                InstanceGrid_RowSelected(null, null);
            }
        }
        void SetupPage(MaintenanceBehaviorContext pc, DataRow row)
        {
            //The item is in our current recordset, so set up the Page
            if (pc.IsRDO)
            {
                pc.Current = new OM.RevisionedObjectRef(row[0] as string, row[1] as string);
                (pc.Current as OM.RevisionedObjectRef).ID = row[4] as string;
                pc.IsROR = string.Compare(row[2] as string, row[4] as string) == 0;
                (pc.Current as OM.RevisionedObjectRef).RevisionOfRecord = pc.IsROR;
            }
            else
            {
                pc.Current = new OM.NamedObjectRef(row[0] as string);
                (pc.Current as OM.NamedObjectRef).ID = row[2] as string;
            }
            if (!string.IsNullOrEmpty(pc.CDOTypeName))
                pc.Current.CDOTypeName = pc.CDOTypeName;

            Page.PortalContext.DataContract.SetValueByName("SelectedInstanceRef", pc.Current.Clone());

            Page.LoadModelingValues(_clearStatusMessage);

            int id = int.Parse(pc.MaintenanceTypeID);
            Page.UpdateChangeMgtSaveButtonState(id, pc.Current.ID);

            // Setup data contracts to use them in copy function
            Page.PortalContext.DataContract.SetValueByName("InstanceName", row[0] as string);
            var descr = Page.FindCamstarControl("DescriptionField") as CWC.TextBox;
            var notes = Page.FindCamstarControl("NotesField") as CWC.TextBox;

            Page.PortalContext.DataContract.SetValueByName("InstanceDescription", descr != null ? descr.Data : string.Empty);
            Page.PortalContext.DataContract.SetValueByName("InstanceNotes", notes != null ? notes.Data : string.Empty);
            Page.PortalContext.DataContract.SetValueByName("SuggestedInstanceName", "Copy of " + (row[0] as string));

            Page.PortalContext.DataContract.SetValueByName("InstanceCSS", pc.IsRDO ? "rdo" : "ndo");
            Page.PortalContext.DataContract.SetValueByName("InstancePopupCommand", "");

            Page.PortalContext.DataContract.SetValueByName("CDOTypeName", pc.CDOTypeName);
            Page.PortalContext.DataContract.SetValueByName("InstanceId", pc.Current.ID);
            Page.PortalContext.DataContract.SetValueByName("CDODisplayName", pc.CDODisplayName);

            Page.PortalContext.DataContract.SetValueByName("whereCame", "Modeling");
            Page.PortalContext.DataContract.SetValueByName("IsChangeMgtSettingsRequired", false);

            if (pc.IsRDO)
            {
                Page.PortalContext.DataContract.SetValueByName("InstanceRevision", row[1] as string);
                Page.PortalContext.DataContract.SetValueByName("InstanceIsROR", pc.IsROR);
                Page.PortalContext.DataContract.SetValueByName("SuggestedInstanceRevision", "Copy of " + (row[1] as string));
                Page.PortalContext.DataContract.SetValueByName("InstanceNameDisable", true);
            }
        }

        protected virtual void SetupControls()
        {
            bool isGrid = _mode == InstanceListMode.Grid;

            DescriptionTxt.Visible = isGrid;
            LastEditNDO.Visible = isGrid;
            ShowActiveChk.Visible = isGrid;
            ShowRORChk.Visible = isGrid;
            ClearAllBtn.Visible = isGrid;

            InstanceGrid.Visible = (_mode != InstanceListMode.Undefined);
            InstanceNameTxt.Visible = (_mode != InstanceListMode.Undefined);

            Width = isGrid ? 950 : 230;

            if (_mode == InstanceListMode.List)
                InstanceNameTxt.LabelText = "Instances";

            if ((_mode == InstanceListMode.Undefined || _mode == InstanceListMode.List) && Page.FindIForm("ActionsControl") != null)
                (Page.FindIForm("ActionsControl") as ActionsControl).SelectedActions.Add("ListViewBtn");
        }

        protected virtual void SetupGrid()
        {
            var pc = (Page.PortalContext as MaintenanceBehaviorContext);

            InstanceGrid.BoundContext.Fields.ForEach(f => { if (f.Width > 1) f.Visible = (_mode == InstanceListMode.Grid); });
            InstanceGrid.BoundContext.IdentityField.Visible = false;

            if (_mode == InstanceListMode.Grid)
            {
                InstanceGrid.BoundContext.Fields["Name"].Visible = true;
                InstanceGrid.BoundContext.Fields["Displayed"].Visible = pc.IsRDO;

                InstanceGrid.BoundContext.Width = 950;
                InstanceGrid.LabelPosition = PERS.LabelPositionType.Top;
                InstanceGrid.BoundContext.Attributes["listViewMode"] = ("list " + (pc.IsRDO ? "rdo" : "ndo"));

                var st = InstanceGrid.BoundContext.Settings as PERS.GridDataSettingsSelVal;
                st.Layout.ZebraRows = true;
                st.Layout.ShowSelectedRows = true;

                st.Automation.ShrinkColumnWidthToFit = false;

                if (st.Pager == null)
                    st.Pager = new PERS.JQGridPagerSettings();

                st.Pager.Mode = PERS.GridPagerModes.AlwaysVisible;
                st.Pager.DisplayTotalRecords = true;
                st.Pager.Position = PERS.HorizontalAlignment.Left;
                st.Pager.RecordTextFormat = null;

                st.NavigatorActions = new PERS.JQNavigatorAction[] { new PERS.JQNavigatorAction { Action = PERS.JQGridNavActionType.Refresh, Visible = true } };
                if (pc.IsRDO)
                {
                    st.Grouping = new PERS.GroupingView()
                    {
                        GroupFields = new PERS.GroupField[] { new PERS.GroupField { DataField = "Name" } }
                    };
                }
                else
                {
                    st.Grouping = null;
                }
            }
            else if (_mode == InstanceListMode.List)
            {
                if (pc.IsRDO)
                {
                    InstanceGrid.BoundContext.Fields["Name"].Visible = false;
                    InstanceGrid.BoundContext.Fields["Displayed"].Visible = true;
                }
                else
                {
                    InstanceGrid.BoundContext.Fields["Name"].Visible = true;
                }

                InstanceGrid.BoundContext.Width = 230;
                InstanceGrid.LabelPosition = PERS.LabelPositionType.Hidden;
                InstanceGrid.BoundContext.Attributes["listViewMode"] = "list " + (pc.IsRDO ? "rdo" : "ndo");
                InstanceGrid.BoundContext.Attributes["keepwrapper"] ="true";

                var st = InstanceGrid.BoundContext.Settings as PERS.GridDataSettingsSelVal;
                st.Layout.ZebraRows = false;
                st.Layout.ShowSelectedRows = false;

                st.Automation.ShrinkColumnWidthToFit = true;

                if (st.Pager == null)
                    st.Pager = new PERS.JQGridPagerSettings();

                st.Pager.Mode = PERS.GridPagerModes.AlwaysVisible;
                st.Pager.DisplayTotalRecords = false;
                st.Pager.Position = PERS.HorizontalAlignment.Middle;
                st.Pager.RecordTextFormat = "";

                st.NavigatorActions = new PERS.JQNavigatorAction[] { new PERS.JQNavigatorAction { Action = PERS.JQGridNavActionType.Refresh, Visible = false } };

                if (pc.IsRDO)
                {
                    st.Grouping = new PERS.GroupingView()
                    {
                        GroupFields = new PERS.GroupField[] { new PERS.GroupField { DataField = "Name" } }
                    };
                }

                // Keep state of filter of Instance Grid on postback
                var filter = InstanceNameTxt.Data != null ? InstanceNameTxt.Data.ToString() : string.Empty;
                InstanceGrid.GridContext.Filter = filter;                
                InstanceGrid.GridContext.FilterAllowed = true;
            }
        }
        private bool _clearStatusMessage = true;
        private bool _fromExternalPage = false;
    }

    public enum InstanceListMode { Undefined, Grid, List, Edit };
}
