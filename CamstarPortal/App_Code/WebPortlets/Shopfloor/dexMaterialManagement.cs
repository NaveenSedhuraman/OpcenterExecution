// Copyright Siemens 2022  
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
    public class dexMaterialManagement : MatrixWebPart
    {
        protected virtual JQDataGrid ServiceDetailsGrid
        {
            get { return Page.FindCamstarControl("dexMaterialMgmt_ServiceDetails") as JQDataGrid; }
        }

        protected virtual JQDataGrid LoadedMaterialDetailsGrid
        {
            get { return Page.FindCamstarControl("dexMaterialMgmt_dexLoadedMaterialDetails") as JQDataGrid; }
        }
        protected virtual CWC.NamedObject dexCell
        {
            get { return Page.FindCamstarControl("dexMaterialMgmt_dexCell") as CWC.NamedObject; }
        }

        public void ReloadGridData()
        {
           FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(Page.Session);
            dexMaterialMgmtService serv = Page.Service.GetService<Camstar.WCF.Services.dexMaterialMgmtService>();
            var data = new OM.dexMaterialMgmt();
            List<OM.dexMaterialMgmtDetails> lstServiceDetails = new List<OM.dexMaterialMgmtDetails>();
            int iGridTotalRows = ((ServiceDetailsGrid as JQDataGrid).GridContext as BoundContext).GetTotalRows();
            if (iGridTotalRows > 0)
            {
                //Get the selected consumed component to perform the submit action
                for (int iRow = 0; iRow < iGridTotalRows; iRow++)
                {
                    DataRow dr = (ServiceDetailsGrid.GridContext as BoundContext).DataWindow.Rows[iRow];
                    OM.dexMaterialMgmtDetails loadedMaterialItem = new OM.dexMaterialMgmtDetails();
                    loadedMaterialItem.dexBulkLot = Convert.ToString(dr["dexBulkLot"]);
                    if (dr["dexCell"] != null && Convert.ToString(dr["dexCell"]) != "")
                    {
                        loadedMaterialItem.dexCell = (NamedObjectRef)dr["dexCell"];
                    }
                    if (dr["dexMTLot.Name"] != null && Convert.ToString(dr["dexMTLot.Name"]) != "")
                    {
                        loadedMaterialItem.dexMTLot = new ContainerRef(Convert.ToString(dr["dexMTLot.Name"]));
                    }
                    loadedMaterialItem.dexMTLotName = Convert.ToString(dr["dexMTLotName"]);
                    if (dr["dexLoadQty"] != null && Convert.ToString(dr["dexLoadQty"]) != "")
                    {
                        loadedMaterialItem.dexLoadQty = Convert.ToDouble(dr["dexLoadQty"]);
                    }
                    loadedMaterialItem.dexSubfeederId = Convert.ToString(dr["dexSubfeederId"]);
                    dexMaterialEventEnum matEnum = new dexMaterialEventEnum();
                    Enum.TryParse(dr["dexMaterialEvent"].ToString(), out matEnum);
                    loadedMaterialItem.dexMaterialEvent = matEnum;
                    lstServiceDetails.Add(loadedMaterialItem);
                }
            }

            data.ServiceDetails = lstServiceDetails.ToArray();
            var req = new dexMaterialMgmt_Request();
            var result = new dexMaterialMgmt_Result();
            //Request service details
            req.Info = new OM.dexMaterialMgmt_Info
            {
                ServiceDetails = new OM.dexMaterialMgmtDetails_Info
                {
                    dexMTLot = new Info(true),
                    dexBulkLot = new Info(true),
                    dexSubfeederId = new Info(true),
                    dexIsHopperMaterial = new Info(true),
                    dexMTProduct = new Info(true),
                    dexLoadQty = new Info(true),
                    dexMaterialEvent = new Info(true)
                }
            };
            //Get response
            var res = serv.Load(data, req, out result);
            if (res.IsSuccess)
            {
                try
                {
                    ServiceDetailsGrid.Data = result.Value.ServiceDetails;
                    foreach (var item in result.Value.ServiceDetails)
                    {
                        item.dexCell = (NamedObjectRef)dexCell.Data;
                    }
                    CamstarWebControl.SetRenderToClient(ServiceDetailsGrid);
                }
                catch (Exception ex)
                {
                }
            }
            else
            {
                Page.DisplayMessage(res);
            } 
        }

        #region Get Input Data
        public override void GetInputData(OM.Service serviceData)
        {
            base.GetInputData(serviceData);
            int iGridTotalRows = ((LoadedMaterialDetailsGrid as JQDataGrid).GridContext as BoundContext).GetTotalRows();
            if (iGridTotalRows > 0)
            {
                bool rowSelected = false;
                List<OM.dexLoadedMaterialDetail> lstLoadedMaterialDetails = new List<OM.dexLoadedMaterialDetail>();
                if ((LoadedMaterialDetailsGrid.GridContext as BoundContext).GetSelectedItems(false) != null)
                {

                    //Get the selected consumed component to perform the submit action
                    foreach (OM.dexLoadedMaterialDetail loadedMaterial in (LoadedMaterialDetailsGrid.GridContext as BoundContext).GetSelectedItems(false))
                    {
                        OM.dexLoadedMaterialDetail loadedMaterialItem = new OM.dexLoadedMaterialDetail();
                        loadedMaterialItem.dexBulkLot = loadedMaterial.dexBulkLot;
                        loadedMaterialItem.dexCell = loadedMaterial.dexCell;
                        loadedMaterialItem.dexExpirationDate = loadedMaterial.dexExpirationDate;
                        loadedMaterialItem.dexLoadDate = loadedMaterial.dexLoadDate;
                        loadedMaterialItem.dexMaterialUnloadEvent = loadedMaterial.dexMaterialUnloadEvent;
                        loadedMaterialItem.dexMTLot = loadedMaterial.dexMTLot;
                        loadedMaterialItem.dexMTLotName = loadedMaterial.dexMTLotName;
                        loadedMaterialItem.dexMTProduct = loadedMaterial.dexMTProduct;
                        loadedMaterialItem.dexQty = loadedMaterial.dexQty;
                        loadedMaterialItem.dexRejectCode = loadedMaterial.dexRejectCode;
                        loadedMaterialItem.dexSubfeederId = loadedMaterial.dexSubfeederId;
                        lstLoadedMaterialDetails.Add(loadedMaterialItem);
                        rowSelected = true;
                    }
                }
                if (rowSelected)
                {
                    (serviceData as OM.dexMaterialMgmt).dexLoadedMaterialDetails = lstLoadedMaterialDetails.ToArray();
                }
else
{
 (serviceData as OM.dexMaterialMgmt).dexLoadedMaterialDetails = lstLoadedMaterialDetails.ToArray();
}
            }
        }
        #endregion

        public override bool PreExecute(Info serviceInfo, Service serviceData)
        {
            bool result = base.PreExecute(serviceInfo, serviceData);
            int iServiceGridTotalRows = ((ServiceDetailsGrid as JQDataGrid).GridContext as BoundContext).GetTotalRows();
            if (iServiceGridTotalRows > 0)
            {
                for (int iRow = 0; iRow < iServiceGridTotalRows; iRow++)
                {
                    DataRow dr = (ServiceDetailsGrid.GridContext as BoundContext).DataWindow.Rows[iRow];
                    if (dr["dexMTLot.Name"] == null || Convert.ToString(dr["dexMTLot.Name"]).Trim() == "")
                    {
                        Page.DisplayMessage("MT Lot is required.", false);
                        result = false;
                        break;
                    }
                    if (dr["dexLoadQty"] == null || Convert.ToString(dr["dexLoadQty"]).Trim() == "")
                    {
                        Page.DisplayMessage("Load Qty is required.", false);
                        result = false;
                        break;
                    }
                }
                if (!result)
                {
                    return result;
                }
            }
            int iGridTotalRows = ((LoadedMaterialDetailsGrid as JQDataGrid).GridContext as BoundContext).GetTotalRows();
            if (iGridTotalRows > 0)
            {
                if ((LoadedMaterialDetailsGrid.GridContext as BoundContext).GetSelectedItems(false) != null)
                {
                    foreach (OM.dexLoadedMaterialDetail loadedMaterial in (LoadedMaterialDetailsGrid.GridContext as BoundContext).GetSelectedItems(false))
                    {
                        if (loadedMaterial.dexMTLot == null || loadedMaterial.dexMTLot.Name == "")
                        {
                            Page.DisplayMessage("Material Lot is required.", false);
                            result = false;
                            break;
                        }
                        if (loadedMaterial.dexMaterialUnloadEvent == null || loadedMaterial.dexMaterialUnloadEvent.Value.Trim() == "")
                        {
                            Page.DisplayMessage("Unload Action is required.", false);
                            result = false;
                            break;
                        }
                        if (loadedMaterial.dexQty == null || loadedMaterial.dexQty.ToString().Trim() == "")
                        {
                            Page.DisplayMessage("Load Qty is required.", false);
                            result = false;
                            break;
                        }
                        if (!((loadedMaterial.dexMaterialUnloadEvent != null && loadedMaterial.dexMaterialUnloadEvent.Value == "ClearToScrap") ? ((loadedMaterial.dexRejectCode != null && loadedMaterial.dexRejectCode.Name.ToString() != "") ? true : false) : true))
                        {
                            Page.DisplayMessage("Please Enter Reject code if selected Purge type.", false);
                            result = false;
                            break;
                        }
                    }
                }
            }
            return result;
        }
    }
}
