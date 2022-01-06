// Copyright Siemens 2019  
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


namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    /// <summary>
    /// Summary description for DisAssociate
    /// </summary>
    public class Disassociate : MatrixWebPart
    {
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);

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

        protected override void OnPreRender(System.EventArgs e)
        {
            base.OnPreRender(e);

            if (ContainerOperation.Data == null)
                ChildContainersToDisassociate.ClearData();
        }

        public override void PostExecute(OM.ResultStatus status, OM.Service serviceData)
        {
            base.PostExecute(status, serviceData);
            Page.ShopfloorReset(null, null);
        }

        #region Properties
        protected virtual CWC.Label WarningLabel
        {
            get { return FindControl("WarningLabel") as CWC.Label; }
        }

        protected virtual JQDataGrid ChildContainersToDisassociate
        {
            get { return FindControl("ChildContainersGrid") as JQDataGrid; }
        }

        protected virtual CWC.TextBox ChildContainersToSelect
        {
            get { return FindControl("ContainerToFind") as CWC.TextBox; }
        }

        protected virtual InquiryControl ContainerOperation
        {
            get { return Page.FindCamstarControl("ContainerStatus_Operation") as InquiryControl; }
        }
        #endregion

    }
}
