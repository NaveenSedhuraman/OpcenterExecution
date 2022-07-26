// Copyright Siemens 2019  
using System;
using System.Collections.Generic;
using System.Data;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.Personalization;
using OM = Camstar.WCF.ObjectStack;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using System.Web;
using System.Web.UI;
using Camstar.WebPortal.FormsFramework;

namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class dexManagePallet : MatrixWebPart
    {
        protected virtual CWC.RadioButton StartPallet
        {
            get { return Page.FindCamstarControl("rdnStartPallet") as CWC.RadioButton; }
        }
 protected virtual CWC.Button BtnStartPallet
        {
            get { return Page.FindCamstarControl("StartPallet") as CWC.Button; }
        }
        protected virtual CWC.RadioButton UpdatePallet
        {
            get { return Page.FindCamstarControl("UpdatePallet") as CWC.RadioButton; }
        }
        protected virtual CWC.TextBox dexPalletName
        {
            get { return Page.FindCamstarControl("dexStartPallet_dexPalletName") as CWC.TextBox; }
        }
        protected virtual CWC.TextBox dexLastPalletName
        {
            get { return Page.FindCamstarControl("dexStartPallet_dexLastPalletName") as CWC.TextBox; }
        }
        protected virtual CWC.TextBox dexPalletId
        {
            get { return Page.FindCamstarControl("dexStartPallet_dexPalletId") as CWC.TextBox; }
        }
        protected virtual ContainerListGrid dexPallet
        {
            get { return Page.FindCamstarControl("dexStartPallet_dexPallet") as ContainerListGrid; }
        }
protected virtual JQDataGrid dexChildLots
        {
            get { return Page.FindCamstarControl("dexStartPallet_dexChildLots") as JQDataGrid; }
        }
	protected virtual CWC.NamedObject dexLine
        {
            get { return Page.FindCamstarControl("dexStartPallet_dexLine") as  CWC.NamedObject; }
        }
 	protected virtual CWC.TextBox Comments
        {
            get { return Page.FindCamstarControl("Shopfloor_Comments") as CWC.TextBox; }
        }

        protected override void OnLoad(System.EventArgs e)
        {
            base.OnLoad(e);
            if (!Page.IsPostBack)
            {
                StartPallet.RadioControl.Checked = true;
                UpdatePallet.RadioControl.Checked = false;
                dexPallet.Visible = false;
                dexPalletName.Visible = true;
Comments.Visible = false;
 CamstarWebControl.SetRenderToClient(BtnStartPallet);
dexChildLots.ClearData();
            }
else
{
if (UpdatePallet.RadioControl.Checked)
{
BtnStartPallet.LabelText="Update Pallet";
}
else
{
BtnStartPallet.LabelText="Start Pallet";
}
}
            StartPallet.DataChanged += StartPallet_CheckedChanged;
            UpdatePallet.DataChanged += UpdatePallet_CheckedChanged;
dexLine.DataChanged += dexLine_DataChanged;
        }

 protected virtual void dexLine_DataChanged(object sender, EventArgs e)
        {
dexChildLots.ClearData();
if(!StartPallet.RadioControl.Checked){
LoadInitPage();
}

}
        protected virtual void StartPallet_CheckedChanged(object sender, EventArgs e)
        {
           StartPallet.RadioControl.Checked = true;
                UpdatePallet.RadioControl.Checked = false;
            dexPallet.Visible = false;
		Comments.Visible = false;
            dexPalletName.Visible = true;
 CamstarWebControl.SetRenderToClient(BtnStartPallet);
            LoadInitPage();
dexChildLots.ClearData();
        }

        protected virtual void UpdatePallet_CheckedChanged(object sender, EventArgs e)
        {
            StartPallet.RadioControl.Checked = false;
                UpdatePallet.RadioControl.Checked = true;
            dexPallet.Visible = true;
            dexPalletName.Visible = false;
Comments.Visible = true;
            LoadInitPage();
CamstarWebControl.SetRenderToClient(BtnStartPallet);
        }

        private void LoadInitPage()
        {
	   dexPallet.ClearData();
            if (dexPalletId.Data != null && Convert.ToString(dexPalletId.Data) != "001")
            {
                dexPallet.Data = dexLastPalletName.Data;
            }
            else
            {
                dexPallet.ClearData();
            }
if (UpdatePallet.RadioControl.Checked)
{
BtnStartPallet.LabelText="Update Pallet";
}
else
{
BtnStartPallet.LabelText="Start Pallet";
}
        }


        #region Get Input Data
        public override void GetInputData(OM.Service serviceData)
        {
            try
            {
base.GetInputData(serviceData);
                if (UpdatePallet.RadioControl.Checked)
                    (serviceData as OM.dexStartAndUpdatePalletCmpd).dexUpdatePallet = true;
                else
                    (serviceData as OM.dexStartAndUpdatePalletCmpd).dexUpdatePallet = false;
            }
            catch
            {

            }
        }
        #endregion
    }
}
