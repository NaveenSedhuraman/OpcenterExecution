// Copyright Siemens 2019  
using System;
using System.Data;
using System.Linq;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using OM = Camstar.WCF.ObjectStack;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.FormsFramework.Utilities;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.FormsFramework.WebControls;

namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class Associate : MatrixWebPart
    {
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);

            if (Page.IsFloatingFrame && !Page.IsPostBack)
            {
                EligibleContainerGrid.ClearData();
                Service.LoadSingleSelectionValues(EligibleContainerGrid);
            }
            SingleContainerControl.DataChanged += SingleContainerControl_DataChanged;
        }

        protected override void OnPreRender(System.EventArgs e)
        {
            base.OnPreRender(e);
            if (IsFloatPage)
                Page.DataContract.SetValueByName("EligibleContainersDM", EligibleContainerGrid.Data);
            if (ContainerOperation.Data == null)
            {
                EligibleContainerGrid.ClearData();
                AssociatedContainerGrid.ClearData();
            }
        }

      public override void PostExecute(OM.ResultStatus status, OM.Service serviceData)
        {
            base.PostExecute(status, serviceData);
            Page.ShopfloorReset(null, null);
        }

      protected virtual void SingleContainerControl_DataChanged(object sender, EventArgs e)
        {
            if (!SingleContainerControl.IsEmpty && ContainersGrid != null)
            {
                OM.Container[] containerArray = EligibleContainerGrid.Data as OM.Container[] ?? new OM.Container[0];

                var data = new OM.Associate
                {
                    Container = ContainersGrid.Data as ContainerRef,
                    ChildContainers = containerArray.Select(c => new ContainerRef(c.Name.Value)).ToArray(),
                    EligibleContainersInquiry = new EligibleContainersInquiry
                    {
                        EligibleContainer = new ContainerRef(SingleContainerControl.Data.ToString())
                    }

                };
                var request = new Associate_Request
                    {
                        Info = new Associate_Info
                        {
                            EligibleContainersInquiry = new EligibleContainersInquiry_Info
                            {
                                EligibleContainer = FieldInfoUtil.RequestSelectionValue()
                            }
                        }
                    };
                var service = new AssociateService(FrameworkManagerUtil.GetFrameworkSession().CurrentUserProfile);
                Associate_Result result;
                ResultStatus rs = service.GetEnvironment(data, request, out result);
                if (rs.IsSuccess && EligibleContainerGrid.Data as DataTable != null)
                {
                    RecordSet selectionValues = result.Environment.EligibleContainersInquiry.EligibleContainer.SelectionValues;
                    string continerColumnName = EligibleContainerGrid.Settings.Columns.Where(column => column.IsRowID ?? false).Select(col => col.Name).FirstOrDefault();
                    if (continerColumnName != null)
                    {
                        int nameColumn = selectionValues.Headers.ToList().IndexOf(selectionValues.Headers.Where(header => header.Name.Equals(continerColumnName)).FirstOrDefault());
                        EligibleContainerGrid.GridContext.SelectRow((selectionValues.Rows[0].Values[nameColumn]), true);
                        if (!(EligibleContainerGrid.GridContext as DataGridContext).SelectedRowsTable.Rows.Contains(selectionValues.Rows[0].Values[nameColumn]))
                            (EligibleContainerGrid.GridContext as DataGridContext).SelectedRowsTable.ImportRow(selectionValues.GetAsDataTable().Rows[0]);
                    }
                    SingleContainerControl.ClearData();
                }
                else
                    Page.DisplayWarning(WarningLabel.Text);
            }
        }

        #region Properties
      protected virtual TextBox SingleContainerControl
        {
            get
            {
                return Page.FindCamstarControl("SingleContainer") as TextBox;
            }
        }

      protected virtual JQDataGrid EligibleContainerGrid
        {
            get
            {
                return Page.FindCamstarControl("EligibleContainersGrid") as JQDataGrid;
            }
        }
      protected virtual JQDataGrid AssociatedContainerGrid
        {
            get
            {
                return Page.FindCamstarControl("AssociatedContainers") as JQDataGrid;
            }
        }
      protected virtual CWC.Label WarningLabel
        {
            get { return Page.FindCamstarControl("WarningLabel") as CWC.Label; }
        }
      protected virtual ContainerListGrid ContainersGrid
        {
            get { return Page.FindCamstarControl("ContainerStatus_ContainerName") as ContainerListGrid; }
        } // ContainersGrid
      protected virtual InquiryControl ContainerOperation
        {
            get { return Page.FindCamstarControl("ContainerStatus_Operation") as InquiryControl; }
        }
        #endregion
    }
}
