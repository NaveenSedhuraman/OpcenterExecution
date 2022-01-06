using System.Collections.Generic;
using System.Data;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.Personalization;
using OM = Camstar.WCF.ObjectStack;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using System.Web;
using System;
using Camstar.WebPortal.FormsFramework;

/// <summary>
/// Summary description for dexRecordDeviceInfo
/// </summary>
/// 
namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    public class dexRecordDeviceInfo : MatrixWebPart
    {
        protected JQDataGrid _gridRejectGrid { get { return Page.FindCamstarControl("dexRecordDeviceSN_dexTXSNRejectDetails") as JQDataGrid; } }
        protected CWC.NamedObject drpRejectReason { get { return _gridRejectGrid.FindControl("dexRecordDeviceSN_dexTXSNRejectDetails_dexRejectReason_InlineEditorControl") as CWC.NamedObject; } }
        protected CWC.TextBox txtTXSN { get { return _gridRejectGrid.FindControl("dexRecordDeviceSN_dexTXSNRejectDetails_dexTXSN_InlineEditorControl") as CWC.TextBox; } }
        protected CWC.DateChooser dtRejectDate { get { return _gridRejectGrid.FindControl("dexRecordDeviceSN_dexTXSNRejectDetails_dexRejectDate_InlineEditorControl") as CWC.DateChooser; } }
        protected CWC.NamedObject drpdexCell { get { return _gridRejectGrid.FindControl("dexRecordDeviceSN_dexTXSNRejectDetails_dexCell_InlineEditorControl") as CWC.NamedObject; } }

        protected override void OnLoad(System.EventArgs e)
        {
            base.OnLoad(e);
            drpRejectReason.AutoPostBack = true;
           
            if (drpRejectReason != null)
            {
                drpRejectReason.DataChanged += _drpRejectReason_DataChanged;
            }
            
        }

        protected virtual void _drpRejectReason_DataChanged(object sender, EventArgs e)
        {
            try
            {
                if (drpRejectReason.Data != null)
                {
                    int rowid = Convert.ToInt32(_gridRejectGrid.SelectedRowID);
                   // OM.dexTXSNRejectDetail[] dexTXSNRejectDetails = (_gridRejectGrid.GridContext as BoundContext).Data as OM.dexTXSNRejectDetail[];
                   // dexRecordRejectDetails[] odexExistingList = (_gridRejectGrid.GridContext as BoundContext).Data as dexRecordRejectDetails[];
                   // List<OM.dexTXSNRejectDetail> odexNewList = new List<OM.dexTXSNRejectDetail>();

                    string strReason = drpRejectReason.Data.ToString();
                   
                    string strRejectDescription = GetRejectDescription(strReason);
                    //_gridRejectGrid.ClearData();
                    int iRowCount = 0;
                  //  if (dexTXSNRejectDetails != null)
                   // {
                        
                          
                      //  }
                   // }

                   
                    //Page.RenderToClient = true;
                }
            }
            catch (Exception ex)
            {
                Page.DisplayMessage(ex.Message.ToString(), false);
            }
        }

        public string GetRejectDescription(string reason)
        {
            string description = "";
            try
            {
                FrameworkSession qrysession = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
                {
                    OM.QueryOptions _queryOptions = new OM.QueryOptions()
                    {
                        QueryType = Camstar.WCF.ObjectStack.QueryType.User,
                        ChangeCount = 0
                    };
                    QueryService QueryService = new QueryService(qrysession.CurrentUserProfile);
                    OM.RecordSet recordset = new OM.RecordSet();

                    OM.QueryParameters queryparam = new OM.QueryParameters()
                    {
                        Parameters = new OM.QueryParameter[1]
                                      {
                            new OM.QueryParameter("LossReasonName",reason),
                                      }
                    };
                    OM.ResultStatus res = QueryService.Execute("dexGetRejectDescription", queryparam, _queryOptions, out recordset);

                    if (res.IsSuccess)
                    {
                        DataTable dt = new DataTable();
                        dt = recordset.GetAsDataTable();
                        if (dt.Rows[0]["Description"] != "")
                        {
                            description = dt.Rows[0]["Description"].ToString();
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                Page.DisplayMessage(ex.Message.ToString(), false);
            }
            return description;
        }


        //public override void PostExecute(OM.ResultStatus status, OM.Service serviceData)
        //{
        //    base.PostExecute(status, serviceData);
        //    if (status.IsSuccess)
        //    {

        //    }
        //    else
        //    {
        //        Page.DisplayMessage(status);
        //    }
        //}

        private class dexRecordRejectDetails
        {
            private string sdexTXSN;
            private string sdexsRejecDate;
            private string sdexCell;
            private string sdexRejectReason;
            private string sdexRejectReasonDescription;
            private bool bisCopy;

            public dexRecordRejectDetails()
            {
                bisCopy = false;
            }
            public string dexTXSN
            {
                get { return sdexTXSN; }
                set { sdexTXSN = value; }
            }

            public string dexRejectDate
            {
                get { return sdexsRejecDate; }
                set { sdexsRejecDate = value; }
            }

            public string dexCell
            {
                get { return sdexCell; }
                set { sdexCell = value; }
            }

            public string dexRejectReason
            {
                get { return sdexRejectReason; }
                set { sdexRejectReason = value; }
            }

            public string dexRejectReasonDescription
            {
                get { return sdexRejectReasonDescription; }
                set { sdexRejectReasonDescription = value; }
            }
        }
    }


}