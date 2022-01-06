// Copyright Siemens 2019  
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using OM = Camstar.WCF.ObjectStack;
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.Personalization;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.PortalFramework;

namespace Camstar.WebPortal.WebPortlets.Shopfloor
{

    public class ComponentRemove : MatrixWebPart
    {
        #region Methods

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            JQDataGrid containerGrid = ContainerGrid;
            RemoveAllQty.DataChanged += new EventHandler(RemoveAllQty_DataChanged);
            CurrentContainer.DataChanged += new EventHandler(CurrentContainer_DataChanged);
            ContainerGrid.RowSelected += delegate { UpdateControlStatuses(); return null; };
            Page.OnClearValues += new EventHandler<FormsFramework.ServiceDataEventArgs>(Page_OnClearValues);
        }

        protected virtual void Page_OnClearValues(object sender, FormsFramework.ServiceDataEventArgs e)
        {
            DestinationContainer.Data = null;
            DestinationLocation.Data = null;
            RemoveAllQty.ClearData();
        }

        protected virtual void CurrentContainer_DataChanged(object sender, EventArgs e)
        {
            ContainerRef container = (ContainerRef)CurrentContainer.Data;

            var dcContainer = (Page.FindCamstarControl("DCContainer") as CWC.ContainerList);
            dcContainer.Data = null;

            if (container == null)
                Page.ClearValues();
            else
                ReloadMaterialIssueGrid();

            dcContainer.Data = container;
        }

        public override void WebPartCustomAction(object sender, Personalization.CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);
            var action = e.Action as CustomAction;
            if (action != null && action.Parameters == "ExecuteTransaction")
            {
                ResultStatus result = ExecuteTransaction();
                e.Result = result;
                if (result.IsSuccess)
                {
                    Page.ClearValues();
                    ContainerRef container = (ContainerRef)CurrentContainer.Data;
                    if (container != null)
                        ReloadMaterialIssueGrid();
                }
            }
        }

        protected virtual void RemoveAllQty_DataChanged(object sender, EventArgs e)
        {
            RemovalCandidate item = SelectedRowItem;

            bool removeAll = (bool)RemoveAllQty.Data;

            CWC.TextBox field = QtyRemoved;
            field.Data = removeAll && item != null ? item.NetQtyIssued : null;
            field.Enabled = !removeAll;

            field = Qty2Removed;
            field.Data = removeAll && item != null ? item.NetQty2Issued : null;
            field.Enabled = !removeAll;
        }


        /// <summary>
        /// Set initial control states when material issued is selected
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="args"></param>
        /// <returns></returns>
        protected virtual void UpdateControlStatuses()
        {
            DestinationContainer.Enabled = false;
            DestinationLocation.Enabled = false;

            DestinationContainer.ClearData();
            DestinationLocation.ClearData();

            RemovalCandidate selItem = SelectedRowItem;

            // For Issue Control of Issue Container (Serial), system shall automatically select the �Remove All Qty� 
            bool removeAllQtyChecked = selItem is RemovalCandidateSerial;
            RemoveAllQty.Data = removeAllQtyChecked;
            RemoveAllQty.Enabled = !removeAllQtyChecked;

            DestinationContainer.Enabled = selItem is RemovalCandidateSerial || selItem is RemovalCandidateBulk || selItem is RemovalCandidateLotStock;
            DestinationLocation.Enabled = selItem is RemovalCandidateSerial || selItem is RemovalCandidateBulk || selItem is RemovalCandidateLotStock || selItem is RemovalCandidateStock;
        }

        #region Service methods


        public override FormsFramework.ValidationStatus ValidateInputData(Service serviceData)
        {
            ValidationStatus status = base.ValidateInputData(serviceData);
            if (SelectedRowItem == null)
            {
                string validationMessage = FrameworkManagerUtil.GetLabelCache().GetLabelByName("Lbl_NoRowSelected").Value.ToString();
                ValidationStatusItem statusItem = new FormsFramework.ValidationStatusItem(null, null, validationMessage);
                status.Add(statusItem);
            }

            return status;
        }
        /// <summary>
        /// Perform submit transaction.
        /// </summary>
        /// <returns></returns>
        protected virtual ResultStatus ExecuteTransaction()
        {
            //Perform value validation
            OM.ComponentRemove input = new OM.ComponentRemove();
            Page.GetInputData(input);

            OM.ComponentRemove inputForExecute = input.Clone() as OM.ComponentRemove;
            
            ResultStatus resultStatus = Service.Form.ValidateInputData(input);
            if (!resultStatus.IsSuccess)
                return resultStatus;

            FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(Page.Session);
            Camstar.WCF.Services.ComponentRemoveService service = Page.Service.GetService<Camstar.WCF.Services.ComponentRemoveService>();

            service.BeginTransaction();
            service.GetRemovalCandidates(input);
            RemovalCandidate removalCandidate = GetUpdteadRemovalCandidate();
            if (removalCandidate != null)
                inputForExecute.ServiceDetails = new OM.RemovalCandidate[] { removalCandidate };

            var tuple = ESigCaptureUtil.CollectESigServiceDetailsAll();
            if (tuple != null)
                inputForExecute.ESigDetails = tuple.Item1;
            Page.GetLineAssignment(inputForExecute);


            if (EProcTaskContainer.Data != null)
            {
                inputForExecute.TaskContainer = (OM.ContainerRef)EProcTaskContainer.Data;
                inputForExecute.CalledByTransactionTask = (OM.NamedSubentityRef)EProcTask.Data;
                inputForExecute.CalledByTransactionTask.Parent = (OM.BaseObjectRef)EProcTaskList.Data;
            }

            service.ExecuteTransaction(inputForExecute);
            resultStatus = service.CommitTransaction();

            ESigCaptureUtil.CleanESigCaptureDM();
            return resultStatus;
        }

        protected virtual void ReloadMaterialIssueGrid()
        {
            Page.Service.ExecuteFunction("ComponentRemove", "GetRemovalCandidates");
        }

        #endregion

        #region Save Row Values methods

        protected virtual RemovalCandidate GetUpdteadRemovalCandidate()
        {
            RemovalCandidate selItem = SelectedRowItem;
            if (selItem == null) return null;

            //create a new empty one
            RemovalCandidate copyItem = (RemovalCandidate)selItem.GetType().GetConstructor(Type.EmptyTypes).Invoke(null);
            copyItem.ListItemAction = OM.ListItemAction.Change;
            copyItem.ListItemIndex = selItem.ListItemIndex;

            Type itemType = copyItem.GetType();
            if (itemType == typeof(RemovalCandidateBulk))
                SaveBulkDetail((RemovalCandidateBulk)copyItem);
            else if (itemType == typeof(RemovalCandidateSerial))
                SaveSerialDetail((RemovalCandidateSerial)copyItem);
            else if (itemType == typeof(RemovalCandidateLotStock))
                SaveLotStockDetail((RemovalCandidateLotStock)copyItem);
            else if (itemType == typeof(RemovalCandidateStock))
                SaveStockDetail((RemovalCandidateStock)copyItem);
            else if (itemType == typeof(RemovalCandidateQuantity))
                copyItem.RemovalDetail = new RemovalDetailQuantity();

            copyItem.RemovalDetail.FieldAction = OM.Action.Create;

            copyItem.RemovalDetail.FieldAction = OM.Action.Create;
            copyItem.RemovalDetail.RemovalReason = (NamedObjectRef)RemovalReason.Data;
            copyItem.RemovalDetail.RemoveDifferenceReason = (NamedObjectRef)RemoveDifferenceReason.Data;
            bool removeAllQty = (bool)RemoveAllQty.Data;
            copyItem.RemovalDetail.RemoveAllQty = removeAllQty;
            object qtyRemoved = QtyRemoved.Data;
            if (qtyRemoved != null && !removeAllQty)
                copyItem.RemovalDetail.QtyRemoved = (double)qtyRemoved;
            object qty2Removed = Qty2Removed.Data;
            if (qty2Removed != null)
                copyItem.RemovalDetail.Qty2Removed = (double)qty2Removed;
            return copyItem;
        }

        protected virtual void SaveBulkDetail(RemovalCandidateBulk item)
        {
            RemovalDetailBulk detail = item.RemovalDetail = new RemovalDetailBulk();
            bool openClosedContainer = (bool)OpenClosedContainer.Data;
            ContainerRef destinationContainer = WSObjectRef.AssignContainer((string)DestinationContainer.Data);
            object factory = new NamedObjectRef(Page.SessionDataContract.GetValueByName(Camstar.WebPortal.Constants.DataMemberConstants.Factory) as string);
            NamedSubentityRef destinationLocation = WSObjectRef.AssignNamedSubentity((string)DestinationLocation.Data, factory);
            detail.OpenClosedContainer = openClosedContainer;
            detail.DestinationContainer = destinationContainer;
            detail.DestinationLocation = destinationLocation;
        }

        protected virtual void SaveSerialDetail(RemovalCandidateSerial item)
        {
            RemovalDetailSerial detail = item.RemovalDetail = new RemovalDetailSerial();
            bool openClosedContainer = (bool)OpenClosedContainer.Data;
            ContainerRef destinationContainer = WSObjectRef.AssignContainer((string)DestinationContainer.Data);
            object factory = new NamedObjectRef(Page.SessionDataContract.GetValueByName(Camstar.WebPortal.Constants.DataMemberConstants.Factory) as string);
            NamedSubentityRef destinationLocation = WSObjectRef.AssignNamedSubentity((string)DestinationLocation.Data, factory);
            detail.OpenClosedContainer = openClosedContainer;
            detail.DestinationContainer = destinationContainer;
            detail.DestinationLocation = destinationLocation;
        }

        protected virtual void SaveLotStockDetail(RemovalCandidateLotStock item)
        {
            RemovalDetailLotStock detail = item.RemovalDetail = new RemovalDetailLotStock();
            detail.DestinationLot = (string)DestinationContainer.Data;
            detail.DestinationStockPoint = (string)DestinationLocation.Data;
        }

        protected virtual void SaveStockDetail(RemovalCandidateStock item)
        {
            RemovalDetailStock detail = item.RemovalDetail = new RemovalDetailStock();
            detail.DestinationStockPoint = (string)DestinationLocation.Data;
        }

        #endregion

        #region Scan Product/Container methods

        public virtual void ScanNewContainerOrProduct(object sender, EventArgs e)
        {
            string scanValue = (string)ScanField.Data;
            if (string.IsNullOrWhiteSpace(scanValue))
                return;
            JQDataGrid containerGrid = ContainerGrid;
            RemovalCandidate[] items = (RemovalCandidate[])containerGrid.Data;
            bool itemFound = false;
            if (items != null)
                for (int i = 0; i < items.Length; i++)
                {
                    RemovalCandidate currItem = items[i];
                    bool containerEqual = currItem.IssuedFrom != null
                        && string.Compare(currItem.IssuedFrom.Value, scanValue, true) == 0;
                    bool productEqual = string.Compare(currItem.Product.Name, scanValue, true) == 0;
                    if (containerEqual || productEqual)
                    {
                        itemFound = true;
                        SelectNewContainer(i);
                        break;
                    }
                }
            if (!itemFound)
                WriteError(ContainerNotFoundKey);
            else
                ScanField.Data = null;
        }

        protected virtual void SelectNewContainer(int index)
        {
            JQDataGrid containerGrid = ContainerGrid;
            string autoRowID = (containerGrid.GridContext as BoundContext).MakeAutoRowId(index);
            containerGrid.SelectedRowID = autoRowID;
            containerGrid.GridContext.AdjustCurrentPage(autoRowID);
        }

        protected virtual void WriteError(string labelName)
        {
            LabelCache labelCache = FrameworkManagerUtil.GetLabelCache(Page.Session);
            Label label = labelCache.GetLabelByName(labelName);
            if (label.IsEmpty)
                Page.StatusBar.WriteError(label.DefaultValue);
            else
                Page.StatusBar.WriteError(label.Value);
        }

        #endregion

        #endregion

        #region Properties

        #region Controls

        protected virtual ContainerListGrid CurrentContainer
        {
            get
            {
                return Page.FindCamstarControl("HiddenSelectedContainer") as ContainerListGrid;
            }
        }

        protected virtual JQDataGrid ContainerGrid
        {
            get
            {
                return Page.FindCamstarControl("MaterialIssueGrid") as JQDataGrid;
            }
        }

        protected virtual CWC.TextBox ScanField
        {
            get
            {
                return Page.FindCamstarControl("ContainerScan") as CWC.TextBox;
            }
        }

        protected virtual CWC.NamedObject RemovalReason
        {
            get
            {
                return Page.FindCamstarControl("RemovalReason") as CWC.NamedObject;
            }
        }

        protected virtual CWC.NamedObject RemoveDifferenceReason
        {
            get
            {
                return Page.FindCamstarControl("RemoveDifferenceReason") as CWC.NamedObject;
            }
        }

        protected virtual CWC.TextBox QtyRemoved
        {
            get
            {
                return Page.FindCamstarControl("QtyRemoved") as CWC.TextBox;
            }
        }

        protected virtual CWC.TextBox Qty2Removed
        {
            get
            {
                return Page.FindCamstarControl("Qty2Removed") as CWC.TextBox;
            }
        }

        protected virtual CWC.CheckBox RemoveAllQty
        {
            get
            {
                return Page.FindCamstarControl("RemoveAllQty") as CWC.CheckBox;
            }
        }

        protected virtual CWC.TextBox DestinationContainer
        {
            get
            {
                return Page.FindCamstarControl("DestinationContainer") as CWC.TextBox;
            }
        }

        protected virtual CWC.TextBox DestinationLocation
        {
            get
            {
                return Page.FindCamstarControl("DestinationLocationField") as CWC.TextBox;
            }
        }

        protected virtual CWC.CheckBox OpenClosedContainer
        {
            get
            {
                return Page.FindCamstarControl("OpenClosed") as CWC.CheckBox;
            }
        }

        #endregion

        protected virtual RemovalCandidate SelectedRowItem
        {
            get
            {
                JQDataGrid grid = ContainerGrid;
                string selecteRowID = grid.SelectedRowID;
                if (selecteRowID == null) return null;
                RemovalCandidate selectedItem = (RemovalCandidate)grid.GridContext.GetItem(selecteRowID);
                return selectedItem;
            }
        }
        protected virtual ContainerListGrid EProcTaskContainer
        {
            get { return Page.FindCamstarControl("ShopFloor_TaskContainer") as ContainerListGrid; }
        }
        protected virtual CWC.RevisionedObject EProcTaskList
        {
            get { return Page.FindCamstarControl("ExecuteTask_TaskList") as CWC.RevisionedObject; }
        } // EProcTaskList

        protected virtual CWC.NamedSubentity EProcTask
        {
            get { return Page.FindCamstarControl("ShopFloor_CalledByTransactionTask") as CWC.NamedSubentity; }
        } // EProcTask
        #endregion

        private const string ContainerNotFoundKey = "Err_ComponentRemove_NonexistentContainer";
    }
}
