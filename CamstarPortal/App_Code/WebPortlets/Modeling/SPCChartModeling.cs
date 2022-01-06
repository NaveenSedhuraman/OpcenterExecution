
using System;
using System.Linq;
using System.Web;

using Camstar.WCF.ObjectStack;
using Camstar.WCF.Services;

using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.Utilities;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using System.Collections.Generic;
/// <summary>
/// Summary description for SPCChartModeling
/// </summar
namespace Camstar.WebPortal.WebPortlets.Modeling
{
    public class SPCChartModeling : MatrixWebPart
    {
        #region Properties
        private NamedObject SPCChartType { get { return Page.FindCamstarControl("SPCChartType") as CWC.NamedObject; } }

        private NamedObject SPCQuery { get { return Page.FindCamstarControl("ObjectChanges_SPCQuery") as CWC.NamedObject; } }

        private NamedObject SPCConnection { get { return Page.FindCamstarControl("ObjectChanges_SPCConnection") as CWC.NamedObject; } }
        private JQDataGrid SPCChartTypeParams { get { return Page.FindCamstarControl("Details_Params") as JQDataGrid; } }
        private JQDataGrid SPCQueryParams { get { return Page.FindCamstarControl("SPCQueryParams") as JQDataGrid; } }
        private ToggleContainer Params { get { return Page.FindCamstarControl("ParametersGroupToggle") as ToggleContainer; } }
        private ToggleContainer ParamsSPC { get { return Page.FindCamstarControl("SPCParametersGroupToggle") as ToggleContainer; } }
        private ToggleContainer ViolationsToggleSPC { get { return Page.FindCamstarControl("SPCRulesToggle") as ToggleContainer; } }
        
        private TextBox IndustryRule { get { return Page.FindCamstarControl("RuleControl_IndustryRule") as TextBox; } }

        private Camstar.WCF.ObjectStack.UserProfile UserProfile
        {
            get
            {
                return HttpContext.Current.Session[Camstar.WebPortal.Constants.SessionConstants.UserProfile] as Camstar.WCF.ObjectStack.UserProfile;
            }
        }

        protected virtual TextBox ChartVariable
        { get { return Page.FindCamstarControl("ChartVariable") as TextBox; } }

        protected virtual TextBox ChartType
        { get { return Page.FindCamstarControl("ChartType") as TextBox; } }

        protected virtual FileBrowse ChartMacroField
        { get { return Page.FindCamstarControl("ChartMacro") as FileBrowse; } }

        protected virtual FileBrowse ChartProperties
        { get { return Page.FindCamstarControl("ChartProperties") as FileBrowse; } }

        protected virtual TextBox ChartHeight
        { get { return Page.FindCamstarControl("ChartHeight") as TextBox; } }
        protected virtual TextBox ChartWidth
        { get { return Page.FindCamstarControl("ChartWidth") as TextBox; } }


        protected virtual CheckBox IsNewSPC
        { get { return Page.FindCamstarControl("ObjectChanges_IsNewSPC") as CheckBox; } }

        private Dictionary<string, string> chartTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                {"GRChart", "Range"},
                {"GSChart", "Standard Deviation"},
                {"GMVRNG", "Moving Range"},
                {"GMEDCHART","Median"},
                {"GXCHART", "X-Bar"},
                {"GCUSUM", "Cumulative sum"},
                {"GCCHART", "Nonconformity"},
                {"GNPCHART", "Number of Defects"},
                {"GUCHART", "Nonconformity Per Unit"},
                {"GPCHART", "Percent Defects"},
            };


        #endregion
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            IsNewSPC.DataChanged += IsNewSPC_DataChanged;
            SPCChartType.DataChanged += new EventHandler(DetailsSPCChart_DataChanged);
            SPCQuery.DataChanged += new EventHandler(SPCQuery_DataChanged);
        }
        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);
            ClearsControlsData();
        }
        private void InitSPCConnectionSelVal()
        {
            var result = new ResultStatus("", true);
            var serv = new SPCConnectionMaintService(UserProfile);
            var maint = new SPCConnectionMaint();
            SPCConnectionMaint_Request req = new SPCConnectionMaint_Request();
            req.Info = new SPCConnectionMaint_Info()
            {
                ObjectListInquiry = new Info()
                {

                    RequestSelectionValues = true
                }
            };

            SPCConnectionMaint_Result res;
            result = serv.GetEnvironment(maint, req, out res);
            if (result.IsSuccess && res.Environment != null && res.Environment.ObjectListInquiry != null && res.Environment.ObjectListInquiry.SelectionValues != null && res.Environment.ObjectListInquiry.SelectionValues.Rows != null)
            {
                var util = new WCFUtilities.SelectionValuesExUtil(res.Environment.ObjectListInquiry.SelectionValues);
                Row[] pageRow = res.Environment.ObjectListInquiry.SelectionValues.Rows;
                if (pageRow.Count() == 1)
                {
                    SPCConnection.Data = pageRow[0].Values.FirstOrDefault();
                }
            }
        }

        private void InitSPCChartTypeSelVal(string value)
        {
            var result = new ResultStatus("", true);
            var serv = new SPCChartTypeMaintService(UserProfile);
            var maint = new SPCChartTypeMaint();
            var req = new SPCChartTypeMaint_Request();

            req.Info = new SPCChartTypeMaint_Info()
            {
                ObjectListInquiry = new Info()
                {

                    RequestSelectionValues = true
                }
            };

            SPCChartTypeMaint_Result res;
            result = serv.GetEnvironment(maint, req, out res);
            if (result.IsSuccess && res.Environment != null && res.Environment.ObjectListInquiry != null && res.Environment.ObjectListInquiry.SelectionValues != null && res.Environment.ObjectListInquiry.SelectionValues.Rows != null)
            {
                var util = new WCFUtilities.SelectionValuesExUtil(res.Environment.ObjectListInquiry.SelectionValues);
                Row[] pageRow = res.Environment.ObjectListInquiry.SelectionValues.Rows;

                SPCChartType.Data = pageRow?.FirstOrDefault(x => x.Values?.FirstOrDefault() == value)?.Values?.FirstOrDefault();

            }
        }

        private void ChangeControlState(FieldControl control, bool state, bool required)
        {
            control.Visible = state;
            control.Data = state ? control.Data : null;
            control.Required = required;
        }

        protected virtual void IsNewSPC_DataChanged(object sender, EventArgs e)
        {

            if (!(bool)IsNewSPC.Data)
            {
                ClearsControlsData();
                return;
            }

            if (ChartType.Data != null)
            {
                chartTypes.TryGetValue(ChartType.Data.ToString(), out var value);

                if (value != null)
                {
                    InitSPCChartTypeSelVal(value);
                }

            }

            if (SPCConnection.Data == null)
            {
                InitSPCConnectionSelVal();
            }

        (SPCQueryParams.GridContext as BoundContext).Data = GetResultQueryParams();
            SPCQueryParams.GridContext.LoadData();

            CamstarWebControl.SetRenderToClient(SPCQueryParams);

            ClearsControlsData();

        }
        private void ClearsControlsData()
        {
            var isNewSPC = (bool)IsNewSPC.Data;

            ChangeControlState(ChartType, !isNewSPC, !isNewSPC);
            ChangeControlState(ChartMacroField, !isNewSPC, !isNewSPC);
            ChangeControlState(ChartProperties, !isNewSPC, false);
            ChangeControlState(SPCChartType, isNewSPC, isNewSPC);
            ChangeControlState(SPCQuery, isNewSPC, isNewSPC);
            ChangeControlState(SPCConnection, isNewSPC, isNewSPC);
            ChangeControlState(IndustryRule, isNewSPC, false);

            SPCChartTypeParams.Visible = isNewSPC;
            SPCQueryParams.Visible = isNewSPC;
            Params.Visible = !isNewSPC;
            ParamsSPC.Visible = isNewSPC;
            ViolationsToggleSPC.Visible = isNewSPC;

            if (isNewSPC)
            {

                Page.FindCamstarControls<TextBox>().ForEach(UserParm =>
                {
                    if (UserParm.ID.StartsWith("UserParm"))
                    {
                        UserParm.ClearData();
                    }
                });

            }
            else
            {
                SPCChartTypeParams.ClearData();
                SPCQueryParams.ClearData();
            }
            CamstarWebControl.SetRenderToClient(Params);
            CamstarWebControl.SetRenderToClient(ParamsSPC);
            CamstarWebControl.SetRenderToClient(ViolationsToggleSPC);
        }
        private SPCChartQueryParamsChanges[] GetResultQueryParams()
        {
            var userParams = GetUserParams();

            var spcChartQueryParams = (SPCQueryParams.GridContext as BoundContext).Data as SPCChartQueryParamsChanges[];

            if (spcChartQueryParams == null || userParams == null || userParams.Count == 0)
            {
                return spcChartQueryParams;
            }

            var removeList = new HashSet<string>();
            var resultParams = new List<SPCChartQueryParamsChanges>(spcChartQueryParams);

            foreach (var item in resultParams)
            {
                userParams.TryGetValue(item.ParamName?.ToString(), out var newvalue);

                if (newvalue != null)
                {
                    item.ParamValue = newvalue;
                    removeList.Add(item.ParamName?.ToString());
                }

            }

            resultParams.AddRange(userParams.Where(x => !removeList.Contains(x.Key)).Select(x => new SPCChartQueryParamsChanges()
            {
                DataType = DataTypeEnum.String,
                ParamName = x.Key,
                ParamValue = x.Value

            }));

            return resultParams?.ToArray();
        }
        private Dictionary<string, string> GetUserParams()
        {
            var userParams = Page.FindCamstarControls<TextBox>()
            .Where(up => up.ID.StartsWith("UserParm") && up.Data != null)
            .Select(x => x.Data as string)
            .Select(y => y.Split('='))
            .Select(m => new { Key = m.First().Trim(), Value = m.Last().Trim() })
            .GroupBy(x => x.Key)
            .ToDictionary(x => x.Key, y => y.First().Value);

            return userParams;
        }



        protected void SPCQuery_DataChanged(object sender, EventArgs e)
        {

            if (SPCQuery.Data == null)
            {
                SPCQueryParams.ClearData();
                return;
            }

            var uQMS = new UserQueryMaintService(UserProfile);

            var uQueryMaint = new UserQueryMaint
            {
                ObjectToChange = new NamedObjectRef(SPCQuery.Data.ToString()),
                ObjectChanges = new UserQueryChanges
                {
                    Name = SPCQuery.Data.ToString()
                }
            };


            var request = new UserQueryMaint_Request
            {
                Info = new UserQueryMaint_Info
                {
                    ObjectChanges = new UserQueryChanges_Info
                    {
                        UserQueryParameters = new UserQueryParameterChanges_Info
                        {
                            DataType = FieldInfoUtil.RequestValue(),
                            DefaultValue = FieldInfoUtil.RequestValue(),
                            DisplayText = FieldInfoUtil.RequestValue(),
                            Name = FieldInfoUtil.RequestValue()
                        }
                    }
                }
            };

            ResultStatus oRS = uQMS.Load(uQueryMaint, request, out var oResult);

            UserQueryParameterChanges[] uQueryParams = oResult?.Value?.ObjectChanges?.UserQueryParameters;
            if (oRS.IsSuccess && uQueryParams != null)
            {

                var spcChartQueryParams = uQueryParams
                .Select(p => new SPCChartQueryParamsChanges
                {
                    DataType = p.DataType,
                    ParamValue = p.DefaultValue,
                    DisplayText = p.DisplayText,
                    ParamName = p.Name
                })
                .ToArray();

                (SPCQueryParams.GridContext as BoundContext).Data = spcChartQueryParams;
                SPCQueryParams.GridContext.LoadData();

                CamstarWebControl.SetRenderToClient(SPCQueryParams);
            }


        }

        protected void DetailsSPCChart_DataChanged(object sender, EventArgs e)
        {

            if (SPCChartType.Data == null)
            {
                SPCChartTypeParams.ClearData();
                return;
            }
            var oSvc = new SPCChartTypeMaintService(UserProfile);

            var oChartTypeChanges = new SPCChartTypeChanges
            {
                Name = SPCChartType.Data.ToString()
            };


            var oChartTypeChangesInfo = new SPCChartTypeChanges_Info
            {
                Params = new SPCChartTypeParamsChanges_Info
                {
                    ParamName = FieldInfoUtil.RequestValue(),
                    DefaultValue = FieldInfoUtil.RequestValue()
                }
            };

            var oChartType = new SPCChartTypeMaint
            {
                ObjectToChange = new NamedObjectRef(SPCChartType.Data.ToString()),
                ObjectChanges = oChartTypeChanges
            };

            var oChartTypeInfo = new SPCChartTypeMaint_Info
            {
                ObjectChanges = oChartTypeChangesInfo
            };

            SPCChartTypeMaint_Result oResult = new SPCChartTypeMaint_Result();
            ResultStatus oRS = oSvc.Load(oChartType, new SPCChartTypeMaint_Request { Info = oChartTypeInfo }, out oResult);

            SPCChartTypeParamsChanges[] oChartTypeParams = oResult?.Value?.ObjectChanges?.Params;
            if (oRS.IsSuccess && oChartTypeParams != null)
            {



                if (oResult.Value.ObjectChanges.Params != null)
                {
                    var oChartDefParams = oChartTypeParams.Select(y => new SPCChartParamsChanges
                    {
                        ParamName = y.ParamName,
                        ParamValue = y.DefaultValue

                    }).ToArray();

                    (SPCChartTypeParams.GridContext as BoundContext).Data = oChartDefParams;
                    SPCChartTypeParams.GridContext.LoadData();
                    CamstarWebControl.SetRenderToClient(SPCChartTypeParams);
                }
            }

        }

    }

}



