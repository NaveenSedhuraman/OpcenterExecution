/*********************************************************************************************************
* FileName         : dexDisAssociate.cs  
* Description      : Added for dexDisAssociate
* Change History   : 
*********************************************************************************************************/
using System;
using System.Linq;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using OM = Camstar.WCF.ObjectStack;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WCF.ObjectStack;
using Camstar.WCF.Services;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.Personalization;

namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    /// <summary>
    /// Summary description for dexDisAssociate
    /// </summary>
    public class dexDisAssociate : MatrixWebPart
    {
     
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            //changed label name for lot to..
            ContainerName.LabelText = "Pallet Id";
            ChildContainersToSelect.DataChanged += ChildContainersToSelect_DataChanged;
        }

        protected virtual void ChildContainersToSelect_DataChanged(object sender, EventArgs e)
        {

            if (!ChildContainersToSelect.IsEmpty)
            {

                var containerCtrl = Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid;
                var data = new OM.Disassociate
                {
                    DisassociateCandidate = new ContainerRef(ChildContainersToSelect.Data.ToString()),
                    Container = containerCtrl.Data as OM.ContainerRef
                };
                var request = new Disassociate_Request
                {
                    Info = new Disassociate_Info
                    {
                        ChildContainers = FieldInfoUtil.RequestSelectionValue()
                    }
                };
                var service = new DisassociateService(FrameworkManagerUtil.GetFrameworkSession().CurrentUserProfile);
                Disassociate_Result result;
                ResultStatus status = service.GetEnvironment(data, request, out result);
                if (status.IsSuccess)
                {
                    RecordSet selectionValues = result.Environment.ChildContainers.SelectionValues;
                    string containerColumnName = ChildContainersToDisassociate.Settings.Columns.Where(column => column.IsRowID ?? false).Select(col => col.Name).FirstOrDefault();
                    if (containerColumnName != null && ChildContainersToDisassociate.Data != null)
                    {
                        int nameColumn = selectionValues.Headers.ToList().IndexOf(selectionValues.Headers.FirstOrDefault(header => header.Name.Equals(containerColumnName)));
                        ChildContainersToDisassociate.GridContext.SelectRow((selectionValues.Rows[0].Values[nameColumn]), true);
                        if (!(ChildContainersToDisassociate.GridContext as DataGridContext).SelectedRowsTable.Rows.Contains(selectionValues.Rows[0].Values[nameColumn]))
                            (ChildContainersToDisassociate.GridContext as DataGridContext).SelectedRowsTable.ImportRow(selectionValues.GetAsDataTable().Rows[0]);
                    }
                    ChildContainersToSelect.ClearData();
                }
                else
                    Page.DisplayWarning(WarningLabel.Text);
            }
        }

        #region Properties

        protected virtual CWC.Label WarningLabel
        {
            get { return FindControl("WarningLabel") as CWC.Label; }
        }
        protected virtual CWC.TextBox ChildContainersToSelect
        {
            get { return FindControl("ContainerToFind") as CWC.TextBox; }
        }

        protected virtual JQDataGrid ChildContainersToDisassociate
        {
            get { return FindControl("ChildContainersGrid") as JQDataGrid; }
        }

        protected virtual ContainerListGrid ContainerName
        {
            get { return Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid; }
        }
        #endregion

        public override void WebPartCustomAction(object sender, CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);
            var action = e.Action as CustomAction;

            if(action != null && action.Parameters == "Reset")
            {
                resetBtn();
            }
        }

        public void resetBtn()
        {
            ContainerName.ClearData();
            ChildContainersToDisassociate.ClearData();
        }
    }
}
