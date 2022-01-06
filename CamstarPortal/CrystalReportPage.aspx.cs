// Copyright Siemens 2019  
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.WebPortlets;
using CrystalDecisions.Shared;
using CREngine = CrystalDecisions.CrystalReports.Engine;
using CRShared = CrystalDecisions.Shared;

public partial class CrystalReportPage : System.Web.UI.Page
{
    /// <summary>
    /// Sets Viewercontrol's properties.
    /// </summary>
    protected void AssignReportDocParameters(CREngine.ReportDocument doc)
    {
        foreach (CrystalDecisions.CrystalReports.Engine.ParameterFieldDefinition repParam in doc.DataDefinition.ParameterFields)
        {
            if (repParam.ParameterType != CRShared.ParameterType.ConnectionParameter)
            {
                string key;
                if (repParam.ParameterFieldName.StartsWith("csrpt_"))
                    key = repParam.ParameterFieldName.Substring(6);
                else
                    key = repParam.ParameterFieldName;

                if (RuntimeParameters.ContainsKey(key))
                {
                    RuntimeParameter parm = RuntimeParameters[key];
                    object paramValue = parm.GetNormalizedValue();
                    if (paramValue == null)
                        if (repParam.ValueType == CrystalDecisions.Shared.FieldValueType.StringField)
                            paramValue = string.Empty;

                    if (paramValue != null)
                    {
                        if (string.IsNullOrEmpty(repParam.ReportName))
                        {
                            doc.SetParameterValue(repParam.ParameterFieldName, paramValue);
                        }
                        else
                        {
                            // TEMP try/catch to avoid exception during report refactoring
                            try
                            {
                                doc.SetParameterValue(repParam.ParameterFieldName, paramValue, repParam.ReportName);
                            }
                            catch
                            { 
                            }
                        }
                    }
                }
            }
        }
    } //AssignReportDocParameters

    protected override void OnPreInit(EventArgs e)
    {
        base.OnPreInit(e);
        this.Response.Cache.SetCacheability(HttpCacheability.NoCache);
        this.Response.Cache.SetNoServerCaching();
    }

    private int floatingMode = 0;
    private bool IsFloating = false;
    
    protected override void OnInit(EventArgs e)
    {
        base.OnInit(e);

        if (Request.QueryString["ContextKey"] == null)
        {
            return;
        }

        if (Request.QueryString["IsFloating"] != null)
        {
            floatingMode = int.Parse(Request.QueryString["IsFloating"] as string);
        }

        _Context = new CallStack().Context.LocalSession[Request.QueryString["ContextKey"]] as CrystalReportContext;
        if (_Context != null)
        {
            _Message = _Context.ErrorMessage;
            IsFloating = _Context.IsFloating;
            if (floatingMode == 2)
                IsFloating = true;

            if (_Context.Report != null)
            {
                _reportName = _Context.Report.FileName.Substring(_Context.Report.FileName.LastIndexOf('\\')); ;
                if (!IsPostBack && !IsFloating)
                {
                    bool success = true;
                    RuntimeParameters = _Context.RuntimeParameters as RuntimeParameterCollection;
                    if (RuntimeParameters == null)
                        RuntimeParameters = new RuntimeParameterCollection();
                    List<TableLogOnInfo> logOnInfos = null;

                    _directDbAccess = true;

                    if (LoadDataSources(_Context.Report, (_Context.DataSourceConnections as Array).GetValue(0) as CRShared.DataSourceConnections) &&
                        ReAssignADODataSources(_Context.Report, logOnInfos))
                    {
                        int index = 1;
                        foreach (CREngine.ReportDocument subReport in _Context.Report.Subreports)
                        {
                            if (!(LoadDataSources(subReport, (_Context.DataSourceConnections as Array).GetValue(index) as CRShared.DataSourceConnections) &&
                                ReAssignADODataSources(subReport, (_Context.TableLogOnInfos as Array).GetValue(index++) as List<CRShared.TableLogOnInfo>)))
                            {
                                success = false;
                                break;
                            }
                        }
                    }
                    else
                        success = false;
                    if (success)
                    {
                        if (_Context.IsOpened)
                        {
                            _Context.Report.Refresh();
                        }
                        AssignReportDocParameters(_Context.Report);
                        CrystalReportViewer1.ReportSource = _Context.Report;
                        _Context.IsOpened = true;
                    }
                }
                else
                    CrystalReportViewer1.ReportSource = _Context.Report;
            }
            if (CrystalReportViewer1.ReportSource != null)
            {
                if (Request.QueryString["width"] != null)
                {
                    CrystalReportViewer1.Width = int.Parse(Request.QueryString["width"] as string);
                }
                else
                {
                    CrystalReportViewer1.Width = _Context.Width;
                }
                if (Request.QueryString["height"] != null)
                {
                    CrystalReportViewer1.Height = int.Parse(Request.QueryString["height"] as string);
                }
                else
                {
                    CrystalReportViewer1.Height = _Context.Height;
                }
                if (Request.QueryString["factor"] != null)
                {
                    CrystalReportViewer1.PageZoomFactor = int.Parse(Request.QueryString["factor"] as string);
                }
                else
                {
                    CrystalReportViewer1.PageZoomFactor = _Context.PageZoomFactor;
                }
                CrystalReportViewer1.HasDrilldownTabs = _Context.HasDrilldownTabs;
                CrystalReportViewer1.HasToggleGroupTreeButton = _Context.HasToggleGroupTreeButton;
                CrystalReportViewer1.HasToggleParameterPanelButton = _Context.HasToggleParameterPanelButton;
                CrystalReportViewer1.HasCrystalLogo = false;
                CrystalReportViewer1.DisplayToolbar = _Context.DisplayToolbar;
                CrystalReportViewer1.Error += CrystalReportViewer1_Error;


                // Go back and force to determine total number of pages
                //CrystalReportViewer1.ShowLastPage();
                //CrystalReportViewer1.ShowFirstPage();

                Controls.Remove(Message);
            }
            else
            {
                Message.Text = _Message;
                Message.Width = _Context.Width;
                Message.Height = _Context.Height;
                Controls.Remove(CrystalReportViewer1);
            }
        }
    }

    // Don't clean it up. It is required for BI SDK to avaoid blank report rendering.
    void CrystalReportViewer1_Error(object source, CrystalDecisions.Web.ErrorEventArgs e){}
    
    private bool ReAssignADODataSources(CREngine.ReportDocument doc, List<TableLogOnInfo> loginfos)
    {
        bool isSuccess = true;
        
        if (_directDbAccess)
        {
            var conn = GetDBConnections();
            if (conn != null)
            {
                string decryptedPassword = !string.IsNullOrEmpty(conn.LoginPassword) ? Camstar.Util.CryptUtil.Decrypt(conn.LoginPassword) : conn.LoginPasswordDecrypted;
                bool isOracle = false;
                doc.DataSourceConnections.OfType<CRShared.IConnectionInfo>().ToList().ForEach(c =>
                {
                    if ((c.Attributes.Collection[0] as NameValuePair2).Value.ToString() == "crdb_oracle.dll")
                    {
                        isOracle = true;
                        c.SetConnection("//" + conn.Host + "/" + conn.Database, "", conn.LoginName, decryptedPassword);
                    }
                    else
                    {
                        c.SetConnection(conn.Host, conn.Database, conn.LoginName, decryptedPassword);
                    }
                });

                if (doc.Database.Tables != null)
                {
                    foreach (CrystalDecisions.CrystalReports.Engine.Table table in doc.Database.Tables)
                    {
                        var tableLogOnInfo = table.LogOnInfo;
                        if (isOracle)
                            tableLogOnInfo.ConnectionInfo.ServerName = string.Format("(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = {0})(PORT = 1521))(CONNECT_DATA = (SERVICE_NAME = {1})))", conn.Host, conn.Database);
                        else // use OleDb provider for MS SQL Server.
                        {
                            var provider = tableLogOnInfo.ConnectionInfo.LogonProperties.LookupNameValuePair("Provider");
                            if (provider != null)
                                provider.Value = "SQLOLEDB";
                        }
                        tableLogOnInfo.ConnectionInfo.UserID = conn.LoginName;
                        tableLogOnInfo.ConnectionInfo.Password = decryptedPassword;
                        table.ApplyLogOnInfo(tableLogOnInfo);
                    }
                }
            }
        }
        else
        {
            // Regular ADO connections
            foreach (CREngine.Table t in doc.Database.Tables)
            {
                CRShared.NameValuePair2 conPair = t.LogOnInfo.ConnectionInfo.LogonProperties.LookupNameValuePair((object)_logonPropertyInternalConnection);
                string key = (conPair != null) ? conPair.Value as string : null;

                if (key != null && _adoDataSets != null && _adoDataSets.ContainsKey(key))
                {
                    CrystalReportADODataSourceBase ds = _adoDataSets[key];
                    if (ds != null)
                    {
                        System.Data.DataTable tbl;
                        if (t.Location == "StaticLabels")
                            tbl = ds.GetStaticLabelsTable();
                        else
                            tbl = ds.GetDataTable(t.Location);
                        if (tbl != null)
                        {
                            t.SetDataSource(tbl);
                        }
                        else
                        {
                            isSuccess = false;
                            if (ds.QueryStatus != null)
                                _Message = ds.QueryStatus.ToString();
                        }
                    }
                }
            }
        }
        return isSuccess;
    }

    private bool LoadDataSources(CREngine.ReportDocument doc, CRShared.DataSourceConnections connections)
    {
        bool isSuccess = true;

        if (!_directDbAccess)
        {
        var queryParameters = new System.Collections.Specialized.NameValueCollection();
        foreach (var p in RuntimeParameters)
        {
            if (p.Value != null)
            {
                if ( p.Value.Value is DateTime)
                    queryParameters.Add(p.Key, ((DateTime)p.Value.Value).ToString());
                else if (p.Value.Value is bool)
                    queryParameters.Add(p.Key, ((bool)p.Value.Value).ToString());
                else if (p.Value.Type == TypeCode.String || p.Value.Type == TypeCode.Empty)
                    queryParameters.Add(p.Key, (p.Value.Value as string) ==null ? "" : p.Value.Value as string);
            }
        }

            foreach (CrystalDecisions.Shared.IConnectionInfo con in connections)
            {
                CRShared.NameValuePairs2 logonInfo = con.LogonProperties;
                if (logonInfo != null)
                {
                    if (con.Type == CRShared.ConnectionInfoType.CRQE)
                    {
                        string key = null;

                        if (logonInfo.ContainsKey(_logonPropertyInternalConnection))
                        {
                            key = logonInfo.LookupNameValuePair(_logonPropertyInternalConnection).Value as string;
                        }

                        if (key != null)
                        {
                            if (!_adoDataSets.ContainsKey(key))
                            {
                                var ds = new CrystalReportADODataSource(UserProfile, queryParameters);
                                ds.LoadStaticLabels(GetLabelNames(doc));
                                _adoDataSets.Add(key, ds);
                            }
                        }
                    }
                }
            }
        }
        return isSuccess;
    }


    private string[] GetLabelNames(CREngine.ReportDocument doc)
    {
        var tbl = doc.Database.Tables.OfType<CREngine.Table>().Where(t => t.Name == "StaticLabels").FirstOrDefault();
        if (tbl != null)
        {
            return (from f in tbl.Fields.OfType<CREngine.DatabaseFieldDefinition>() 
                     select f.Name).ToArray();            
        }
        return null;
    }

    private Camstar.WCF.ObjectStack.UserProfile UserProfile
    {
        get
        {
            Camstar.WebPortal.FormsFramework.Utilities.FrameworkSession session = Camstar.WebPortal.FormsFramework.Utilities.FrameworkManagerUtil.GetFrameworkSession(Page.Session);
            if (session != null)
                return session.CurrentUserProfile;
            else
                return null;
        }
    }

    private Camstar.WebPortal.PortalConfiguration.DataSource GetDBConnections()
    {
        string source = Camstar.WebPortal.Utilities.CamstarPortalSection.Settings.IntelligenceSettings.DefaultSource;
        if (_Context != null && !string.IsNullOrEmpty(_Context.DataSource))
            source = _Context.DataSource;
        return Camstar.WebPortal.Utilities.CamstarPortalSection.Settings.IntelligenceSettings.DataSources.SingleOrDefault(ds => ds.Name == source);
    }

    protected override void Render(HtmlTextWriter writer)
    {
        StringWriter sw = new StringWriter();
        HtmlTextWriter hw = new HtmlTextWriter(sw);

        base.Render(hw);

        Response.Write(sw.ToString());
    }

    private RuntimeParameterCollection RuntimeParameters { get; set; }
    private CrystalReportContext _Context;
    private Dictionary<string, CrystalReportADODataSourceBase> _adoDataSets = new Dictionary<string, CrystalReportADODataSourceBase>();
    private const string _logonPropertyClassName = "Class Name";
    private const string _logonPropertyMethodName = "DataSet Names";
    private const string _logonPropertyInternalConnection = "Internal Connection ID";
    private string _Message;
    private string _reportName;
    private bool _directDbAccess = true;
}
