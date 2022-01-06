using System;
using System.Data;
using System.Linq;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.PortalFramework;
using OM = Camstar.WCF.ObjectStack;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.FormsFramework.Utilities;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WCF.ObjectStack;
using System.Collections.Generic;
using Camstar.WebPortal.FormsFramework;

namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class dexSolutionCombineQty : MatrixWebPart
    {
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            if (!Page.IsPostBack && EligibleContainerGrid.GridContext is ItemDataContext)
            {
                if (Page.Session["OriginalQty"] == null)
                    Page.Session["OriginalQty"] = new Dictionary<string, object>();
            }

            JQDataGrid containerGrid = EligibleContainerGrid;
            //if (containerGrid.GridContext as ItemDataContext != null)
            //    (containerGrid.GridContext as ItemDataContext).GetRowSnapItem += EligibleContainerGrid_GetRowSnapItem;
            containerGrid.GridContext.GridReloading += delegate { LoadContainersGrid(); return null; };
            SelectedContainer.DataChanged += SelectedContainer_DataChanged;
        }

        public override FormsFramework.ValidationStatus ValidateInputData(Service serviceData)
        {
            ValidationStatus status = base.ValidateInputData(serviceData);

            JQDataGrid grid = EligibleContainerGrid;
            List<string> selectedIDs = grid.GridContext.SelectedRowIDs;
            if (selectedIDs == null || selectedIDs.Count < 1)
            {
                string validationLabel = ((GridDataSettingsItemList)(grid.Settings)).IsRequiredLabelName;
                string validationMessage = grid.BoundContext.LBL(validationLabel, null);
                ValidationStatusItem statusItem = new FormsFramework.ValidationStatusItem(null, null, validationMessage);
                status.Add(statusItem);
            }

            return status;
        }

        protected virtual void SelectedContainer_DataChanged(object sender, EventArgs e)
        {
            if (SelectedContainer.Data == null)
            {
                Page.ShopfloorReset(null, null);
                Page.ClearDataValues();
            }
            else
            {
                LoadContainersGrid();
            }
        }

        public void LoadContainersGrid()
        {
            EligibleContainerGrid.ClearData();
            JQDataGrid containerGrid = EligibleContainerGrid;
            ContainerRef manualContainer = SelectedContainer.Data as ContainerRef;
            if (manualContainer == null || (manualContainer != null && manualContainer.IsEmpty))
                EligibleContainerGrid.Data = null; // clear up values
            else
                Page.Service.ExecuteFunction("dexSolutionCombine", "Load");

        }

        public void CombineContainerControl_DataChanged(object sender, EventArgs e)
        {
            var containerCtrl = Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid;
            string contName = CombineContainerControl.Data as string;
            if (string.IsNullOrEmpty(contName))
                return;

            var data = new OM.dexSolutionCombine()
            {
                EligibleContainersInquiry = new OM.dexSolEligibleContInquiry
                {
                    EligibleContainer = new OM.ContainerRef(contName),
                },
                Container = containerCtrl.Data as OM.ContainerRef
            };

            var request = new dexSolutionCombine_Request()
            {
                Info = new dexSolutionCombine_Info()
                {
                    EligibleContainersInquiry = new OM.dexSolEligibleContInquiry_Info { EligibleContainer = FieldInfoUtil.RequestSelectionValue() }
                }
            };

            var fs = FrameworkManagerUtil.GetFrameworkSession();
            var service = new dexSolutionCombineService(fs.CurrentUserProfile);
            dexSolutionCombine_Result result;
            OM.ResultStatus rs = service.GetEnvironment(data, request, out result);
            if (rs.IsSuccess)
            {
                var details = EligibleContainerGrid.Data as CombineFromDetail[];
                if (details != null)
                {
                    for (int i = 0; i < details.Count(); i++)
                    {
                        if (details[i].FromContainer.Name.ToString() == contName.ToString())
                        {
                            string autoRowID = (EligibleContainerGrid.GridContext as BoundContext).MakeAutoRowId(i);
                            EligibleContainerGrid.GridContext.SelectRow(autoRowID, true);
                            EligibleContainerGrid.GridContext.AdjustCurrentPage(autoRowID);
                        }
                    }
                }
            }
            else
                DisplayMessage(rs);
        }

        public override void GetInputData(Service serviceData)
        {
            base.GetInputData(serviceData);

            List<CombineFromDetail> list = new List<CombineFromDetail>();
            if (EligibleContainerGrid.Data != null && EligibleContainerGrid.GridContext.SelectedRowIDs != null)
            {
                EligibleContainerGrid.GridContext.SelectedRowIDs.ForEach(n => { list.Add((EligibleContainerGrid.GridContext as ItemDataContext).GetItem(n) as CombineFromDetail); });

                for (int i = 0; i < list.Count; i++)
                {
                    list[i].CombineAllQty = false;
                    if (OriginalQty[list[i].FromContainer.ToString()].ToString().CompareTo(list[i].Qty.ToString()) == 0 && list[i].CloseWhenEmpty == true)
                        list[i].CombineAllQty = true;
                }

                (serviceData as OM.dexSolutionCombine).FromContainerDetails = list.Select(n => new CombineFromDetail()
                {
                    ListItemAction = ListItemAction.Add,
                    FromContainer = new ContainerRef(n.FromContainer.Name),
                    CombineAllQty = n.CombineAllQty,
                    CloseWhenEmpty = n.CloseWhenEmpty,
                    Qty = (n.CombineAllQty.Value) ? null : n.Qty
                }).ToArray();
            }
        }

        public override void DisplayValues(Service serviceData)
        {
            base.DisplayValues(serviceData);
            if ((serviceData as OM.dexSolutionCombine).FromContainerDetails != null)
            {
                foreach (var detail in (serviceData as OM.dexSolutionCombine).FromContainerDetails)
                    OriginalQty[detail.FromContainer.ToString()] = detail.Qty;
            }
        }

        protected void EligibleContainerGrid_GetRowSnapItem(object item, IEnumerable<DataColumn> dataColumns, DataRow row)
        {
            if (item is OM.CombineFromDetail)
            {
                if ((item as OM.CombineFromDetail).FromContainer != null)
                {
                    row["Qty"] = OriginalQty[(item as OM.CombineFromDetail).FromContainer.ToString()];
                    row["FromContainer"] = (item as OM.CombineFromDetail).FromContainer.Name;
                }
            }
        }

        public override void ClearValues(Service serviceData)
        {
            base.ClearValues();
            CombineContainerControl.ClearData();
        }

        private CWC.TextBox CombineContainerControl
        {
            get { return Page.FindCamstarControl("CombineContainer") as CWC.TextBox; }
        }

        private JQDataGrid EligibleContainerGrid
        {
            get { return Page.FindCamstarControl("EligibleContainersGrid") as JQDataGrid; }
        }

        private CWC.ContainerList SelectedContainer
        {
            get { return Page.FindCamstarControl("ContainerStatus_ContainerName") as CWC.ContainerList; }
        }

        protected Dictionary<string, object> OriginalQty
        {
            get { return Page.Session["OriginalQty"] as Dictionary<string, object>; }
            set { Page.Session["OriginalQty"] = value; }
        }
    }
}
