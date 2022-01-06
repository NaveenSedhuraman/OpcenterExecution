// Copyright Siemens 2019  
//#define __crdebug__ 

using System;
using System.Collections.Generic;
using System.IO;
using System.Web.UI.WebControls;
using System.Web.UI;
using System.Linq;
using System.Data;
using System.Collections.Specialized;

using Camstar.WebPortal.Constants;
using Camstar.WebPortal.Utilities;

using CRShared = CrystalDecisions.Shared;
using CREngine = CrystalDecisions.CrystalReports.Engine;

using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.FormsFramework;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.FormsFramework.Utilities;
using OM = Camstar.WCF.ObjectStack;
using Camstar.Portal;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.Personalization;

namespace Camstar.WebPortal.WebPortlets
{
    [PortalStudio(true, "Crystal Report", "Intelligence")]
    public class CrystalWebPart : WebPartBase
    {
        public CrystalWebPart()
            : base()
        {
            Title = "Crystal Report";
            TitleLabel = "UIWebPart_CrystalReport";
            ReportTemplate = null;
            ZoomFactor = 2;
            DisplayToolbar = true;
            HasToggleGroupTreeButton = false;
        }

        [WebProperty(Enabled = false)]
        public override Unit Width
        {
            get { return base.Width; }
            set { base.Width = value; }
        }

        [WebProperty(Enabled = false)]
        public override Unit Height
        {
            get { return base.Height; }
            set { base.Height = value; }
        }

        [WebProperty(LabelName = "ReportTemplate_Name", CDOTypeName = "ReportTemplate", Notify = true)]
        public virtual OM.RevisionedObjectRef ReportTemplate { get; set; }

        [WebProperty(Enabled = false)]
        new public string PrimaryServiceType
        {
            get { return null; }
            set { }
        }

        [WebProperty(LabelName = "ZoomFactor")]
        public virtual double ZoomFactor { get; set; }

        [WebProperty(LabelName = "WebProperty_HasToggleGroupTreeButton")]
        public virtual bool HasToggleGroupTreeButton { get; set; }

        [WebProperty(LabelName = "WebProperty_DisplayToolbar")]
        public virtual bool DisplayToolbar { get; set; }

        [WebProperty(LabelName = "WebProperty_ReportParameter", ExtraLabels = new string[] { "WebProperty_DisplayParameter" })]
        public virtual ToggledItemList ReportParameterList { get; set; }

        protected virtual CREngine.ReportDocument OldDocument
        {
            get
            {
                return (Page.IsFloatingFrame ? (Page.PortalContext.LocalSession["Context"] as CrystalReportContext).Report :
                    Page.PortalContext.LocalSession[ID + "_ReportDocument"]) as CREngine.ReportDocument;
            }
            set
            {
                if (!Page.IsFloatingFrame)
                    Page.PortalContext.LocalSession[ID + "_ReportDocument"] = value;
            }
        }

        [CrystalReportProvider(ConnectionConstants.CrystalReportConnectionName, ConnectionConstants.CrystalReportConnectionID, typeof(CamstarProviderConnectionPoint), AllowsMultipleConnections = true, ConnectionDataType = typeof(CrystalReportData), ActivationType = ConnectionActivationType.OnDemand)]
        public override object GetGenericConnectionData(Type connectionDataType)
        {
            CrystalReportData result = null;
            GetInputParameterData();
            if (connectionDataType == typeof(CrystalReportData))
                result = new CrystalReportData(RuntimeParameters);
            return result;
        }

        [CrystalReportConsumer(ConnectionConstants.CrystalReportConnectionName, ConnectionConstants.CrystalReportConnectionID, typeof(CamstarConsumerConnectionPoint), AllowsMultipleConnections = true, ConnectionDataType = typeof(CrystalReportData))]
        public override void SetGenericConnectionData(object consumerData, Type connectionDataType)
        {
            if (connectionDataType == typeof(CrystalReportData))
            {
                if (consumerData != null && consumerData is CrystalReportData)
                {
                    CrystalReportData data = consumerData as CrystalReportData;
                    foreach (RuntimeParameter parameter in data.Parameters.Values)
                    {
                        if (RuntimeParameters.ContainsKey(parameter.Name) && parameter.IsShared)
                            RuntimeParameters[parameter.Name] = parameter;
                    }
                    LoadControlsData();
                    _ParametersSection.Collapse();
                }
            }
        }

        protected override WebPartWrapperBase CreateWebPartWrapper()
        {
            _Wrapper = new EnlargeWebPartWrapper(this);
            _Wrapper.Enlarged += new CommandEventHandler(Wrapper_Enlarged);
            return _Wrapper;
        }

        public virtual void Wrapper_Enlarged(object sender, CommandEventArgs e)
        {
            FloatingPageCallStackMethod target = new FloatingPageCallStackMethod("EnlargedReportPage.aspx");
            target.Title = "Report";
            target.Width = (int)(_CrystalViewer.Width.Value * ZoomFactor + 60);
            target.Height = (int)(_CrystalViewer.Height.Value * ZoomFactor + 116);
            Camstar.Portal.QualityObjectContext context = new Camstar.Portal.QualityObjectContext();
            if ((Page.PortalContext as QualityObjectContext) != null)
            {
                context.QualityObject = (Page.PortalContext as QualityObjectContext).QualityObject;
            }
            context.LocalSession["Parameters"] = RuntimeParameters;
            context.LocalSession["ReportTemplate"] = ReportTemplate;
            CrystalReportContext crContext = _CrystalViewer.GetReportContext();
            crContext.IsFloating = true;
            context.LocalSession["Context"] = crContext;
            context.LocalSession["ZoomFactor"] = ZoomFactor;
            context.LocalSession["QualityRecordData"] = Page.PortalContext.LocalSession["QualityRecordData"];
            target.Context = context;
            Page.CallFloatingPage(target);
        }

        protected override void OnInit(EventArgs e)
        {
            base.OnInit(e);

            _CrystalViewer.ID = "CrystalViewer";
            _CrystalViewer.Width = 468;
            _CrystalViewer.Height = 328;
            _CrystalViewer.IsFloating = Page.IsFloatingFrame;

            _RefreshButton.ID = "RefreshButton";
            _RefreshButton.LabelName = "RefreshButton";
            _RefreshButton.Click += new EventHandler(RefreshButton_Click);

            _currentError = null;
        }

        public virtual void UpdateWebProperties(OM.RevisionedObjectRef tempate)
        {
            if (tempate != null && !tempate.IsEmpty)
            {
                DownloadReportDocument();
                LoadReportDocument(tempate);
                if (this.ReportDocument != null)
                {
                    RuntimeParameters = new RuntimeParameterCollection(this.ReportDocument, null);
                }
                else
                {
                    return;
                }

                ReportParameterList = new ToggledItemList();
                ReportParameterList.Items = 
                            (from p in RuntimeParameters where p.Value.Interactive == true
                            select new ToggledItem(){ Item=p.Value.Name, IsTurnedOn=p.Value.Interactive}).ToArray();
            }
            else
            {
                ReportParameterList = null;
            }

            var ctx =
                (from wp in this.WebProperties
                 where wp.PropertyDescriptor.Name == "ReportParameterList"
                 select wp).FirstOrDefault();
            if (ctx != null)
                ctx.Editor.Value = ReportParameterList;
        }

        protected virtual Control CreateParametersPanel()
        {
            _ParametersSection.LabelText = "Parameters";
            _ParametersSection.AddControl(_ParametersTable, 0, 0);
            _ParametersSection.AddControl(_RefreshButton, 1, 1);

            return _ParametersSection as Control;
        }

        protected virtual void GetInputParameterData()
        {
            if (RuntimeParameters != null)
            {
                foreach (FieldControl control in _ParameterControls)
                {
                    RuntimeParameter parameter = RuntimeParameters[control.ID] as RuntimeParameter;
                    parameter.Value = control.Data;
                }
            }
        }

        public virtual void RefreshButton_Click(object sender, EventArgs e)
        {
            _inputRequired = false;
            GetInputParameterData();
            _ParametersSection.Collapse();
        }

        protected virtual OM.QualityObjectInquiry GetQualityObjectDetails(OM.NamedObjectRef qo)
        {
            OM.UserProfile profile = FrameworkManagerUtil.GetFrameworkSession().CurrentUserProfile;
            OM.QualityObjectInquiry details = null;
            OM.QualityObjectInquiry cdo = new Camstar.WCF.ObjectStack.QualityObjectInquiry();
            cdo.QualityObject = qo;
            Camstar.WCF.Services.QualityObjectInquiry_Request request = new Camstar.WCF.Services.QualityObjectInquiry_Request();
            OM.QualityObjectInquiry_Info info = new Camstar.WCF.ObjectStack.QualityObjectInquiry_Info();
            request.Info = info;
            info.QualityObject = new OM.Info(true);
            info.QualityObjectInquiryDetail = new Camstar.WCF.ObjectStack.QualityObjectStatusDetail_Info();
            info.QualityObjectInquiryDetail.RequestValue = true;

            Camstar.WCF.Services.QualityObjectInquiry_Result result;
            Camstar.WCF.Services.QualityObjectInquiryService service = new Camstar.WCF.Services.QualityObjectInquiryService(profile);
            OM.ResultStatus res = service.GetEnvironment(cdo, request, out result);
            if (res.IsSuccess)
                details = result.Value;
            else
                _currentError = res;
            return details;
        }

        protected override void CreateContentControls(ControlCollection contentControls)
        {
            if (!Page.IsCallStackReturning)
            {
                contentControls.Add(CreateParametersPanel());
                contentControls.Add(_CrystalViewer);
            }
        }

        protected override void OnLoadPersonalization()
        {
            base.OnLoadPersonalization();

            if (Page.IsFloatingFrame)
            {
                ReportTemplate = Page.PortalContext.LocalSession["ReportTemplate"] as OM.RevisionedObjectRef;
                ViewState["Enlarged"] = true;
            }

            if (OldDocument == null)
            {
                if (ReportTemplate != null && !ReportTemplate.IsEmpty)
                {
                    DownloadReportDocument();
                }
            }
            else
            {
                this.ReportDocument = OldDocument;
                RuntimeParameters = new RuntimeParameterCollection(this.ReportDocument, null);
            }
        }

        protected virtual void LoadQualityRecordData()
        {
            if (Page.PortalContext is QualityObjectContext)
            {
                if (Page.PortalContext.LocalSession["QualityRecordData"] == null)
                {
                    OM.NamedObjectRef qo = Page.PortalContext.DataContract.GetValueByName<OM.NamedObjectRef>("QualityObject");
                    OM.QualityObjectInquiry details = GetQualityObjectDetails(qo);
                    string productName = null;
                    string productRev = null;
                    if (_currentError == null)
                    {
                        OM.CategoryEnum cat = (Page.PortalContext as QualityObjectContext).GetCategory();
                        if (cat == OM.CategoryEnum.Event || cat == OM.CategoryEnum.Nonconformance /*|| cat == OM.CategoryEnum.Complaint*/)
                        {
                            OM.UpdateEvent cdo = new OM.UpdateEvent();
                            OM.UpdateEvent_Info info = new OM.UpdateEvent_Info();
                            cdo.QualityObject = qo;
                            string productFieldExppression = "ServiceDetail.EventDataDetail.Product";

                            Camstar.WebPortal.WCFUtilities.WCFObject wcf = new Camstar.WebPortal.WCFUtilities.WCFObject(cdo);
                            wcf.SetValue(productFieldExppression + "Name", null);
                            new Camstar.WebPortal.WCFUtilities.WCFObject(info).SetValue(productFieldExppression + "Name", new OM.Info(true));
                            new Camstar.WebPortal.WCFUtilities.WCFObject(info).SetValue(productFieldExppression + "Rev", new OM.Info(true));
                            Camstar.WCF.Services.UpdateEvent_Request request = new Camstar.WCF.Services.UpdateEvent_Request();
                            request.Info = info;
                            Camstar.WCF.Services.UpdateEvent_Result result;
                            Camstar.WCF.Services.UpdateEventService service = new Camstar.WCF.Services.UpdateEventService(UserProfile);
                            OM.ResultStatus res = service.GetEventDetails(cdo, request, out result);
                            if (res.IsSuccess)
                            {
                                productName = (string)new Camstar.WebPortal.WCFUtilities.WCFObject(result.Value).GetValue(productFieldExppression + "Name");
                                productRev = (string) new Camstar.WebPortal.WCFUtilities.WCFObject(result.Value).GetValue(productFieldExppression + "Rev");
                            }
                            else
                            {
                                _currentError = res;
                            }
                        }
                        Page.PortalContext.LocalSession["QualityRecordData"] = new QualityRecordData(details, new OM.RevisionedObjectRef(productName, productRev));
                    }
                }
            }
        }

        protected virtual void LoadParameters()
        {
            if (ReportParameterList != null)
            {
                foreach (var rtp in RuntimeParameters.Values)
                {
                    if (rtp.Interactive)
                    {
                        var found = (from wp in ReportParameterList.Items where wp.Item == rtp.Name select wp).FirstOrDefault();
                        if (found != null)
                        {
                            rtp.IsDisplayed = found.IsTurnedOn;
                        }
                    }
                }
            }

            if (Page.PortalContext is QualityObjectContext)
            {
                QualityRecordData data = Page.PortalContext.LocalSession["QualityRecordData"] as QualityRecordData;
                AssignPredefinedParameters(data.Details, data.Product.Name, data.Product.Revision);

                _inputRequired = CheckIsInputRequired();
            }
            else
            {
                if (RuntimeParameters.HasPredefinedParameters)
                {
                    // Suppress rendering report if the quality object environment is required
                    this.ReportDocument = null;
                }
            }
        }

        protected virtual bool CheckIsInputRequired()
        {
            var unsetParameters = from p in RuntimeParameters.Values
                                  where p.Required == true && (p.Value == null || (p.Value is string && (p.Value as string).Length == 0))
                                  select p;
            return false;
            // Temporary 
            //// return unsetParameters.Count() > 0;
        }

        protected virtual void AssignPredefinedParameters(OM.QualityObjectInquiry details, string productName, string productRev)
        {
            System.Collections.Generic.Dictionary<string, object> customParameters = new Dictionary<string, object>();
            if (Page.PortalContext is CustomActionContext && (Page.PortalContext as CustomActionContext).ActionParameters != null)
            {
                Array.ForEach<CustomActionParameter>((Page.PortalContext as CustomActionContext).ActionParameters,
                    delegate(CustomActionParameter p) { customParameters.Add(p.Name, p.Value); });
            }
            OM.NamedSubentityRef procModelItemObject = null;
            if (customParameters.ContainsKey("ProcessObject"))
            {
                procModelItemObject = (customParameters["ProcessObject"] as OM.NamedSubentityRef);
            }

            string processModelId = null;
            if (details != null && details.QualityObjectInquiryDetail != null && details.QualityObjectInquiryDetail.ProcessModel != null)
                processModelId = details.QualityObjectInquiryDetail.ProcessModel.ID;

            foreach (var f in new string[] { "EventId", "QualityObjectId", "User"})
            {
                if (!RuntimeParameters.ContainsKey(f))
                {
                    RuntimeParameters.Add(f, new RuntimeParameter(f) { Type = TypeCode.String });
                }
            }

            foreach (RuntimeParameter param in RuntimeParameters.Values)
            {
                switch (param.Name)
                {
                    case "EventId":
                    case "CAPAId":
                    case "QualityObjectId":
                        param.Value = details.QualityObject.ID;
                        break;
                    case "ProcessModelId":
                        param.Value = processModelId;
                        break;

                    case "OrganizationId":
                        param.Value = null;
                        break;
                    case "User":
                        param.Value = FrameworkManagerUtil.GetFrameworkSession().CurrentUserProfile.Name;
                        break;
                    case "Product":
                        param.Value = productName;
                        break;
                    case "ProductRev":
                        param.Value = productRev;
                        param.Required = false;
                        break;
                    case "PlanId":
                        if (procModelItemObject != null)
                            if (procModelItemObject.CDOTypeName.StartsWith("Plan"))
                                param.Value = procModelItemObject.ID;
                            else if (procModelItemObject.Parent.CDOTypeName.StartsWith("Plan"))
                                param.Value = procModelItemObject.Parent.ID;
                            else
                                param.Value = processModelId;
                        else
                            param.Value = processModelId;
                        break;

                    case "ActivityId":
                    case "Activity":
                        if (procModelItemObject != null)
                            if (procModelItemObject.CDOTypeName.StartsWith("Activity"))
                                param.Value = procModelItemObject.ID;
                            else if (procModelItemObject.Parent.CDOTypeName.StartsWith("Activity"))
                                param.Value = procModelItemObject.Parent.ID;
                            else
                                param.Value = processModelId;
                        else
                            param.Value = processModelId;
                        break;
                    case "PlanOrActivityId":
                        if (procModelItemObject != null)
                        {
                            if (procModelItemObject.CDOTypeName.StartsWith("Activity") || procModelItemObject.CDOTypeName.StartsWith("Plan"))
                                param.Value = procModelItemObject.ID;
                            else if (procModelItemObject.Parent.CDOTypeName.StartsWith("Activity") || procModelItemObject.Parent.CDOTypeName.StartsWith("Plan"))
                                param.Value = procModelItemObject.Parent.ID;
                            else
                                param.Value = processModelId;
                        }
                        else
                            param.Value = processModelId;
                        break;
                    case "TemplateId":
                        param.Value = _templateId;
                        break;
                    case "DateGenerated":
                        param.Value = DateTime.Now.ToString();
                        break;
                    case "StartDate":
                        param.Value = DateTime.Now.AddMonths(-6).ToString();
                        break;
                    case "EndDate":
                        param.Value = DateTime.Now.ToString();
                        break;
                    default:
                        if (customParameters != null && customParameters.ContainsKey(param.Name))
                        {
                            WCFUtilities.WCFObject det = new Camstar.WebPortal.WCFUtilities.WCFObject(details.QualityObjectInquiryDetail);
                            object val = null;
                            try
                            {
                                val = det.GetValue(customParameters[param.Name] as string);
                            }
                            catch (Exception) { }
                            if (val != null)
                            {
                                param.Value = val;
                            }
                        }
                        break;
                }

            }
        }

        protected virtual void BuildParameterEditControls()
        {
            if (RuntimeParameters != null)
            {
                foreach (RuntimeParameter param in RuntimeParameters.Values)
                {
                    if (param.Interactive && param.IsDisplayed)
                    {
                        FieldControl control = null;
                        switch (param.Type)
                        {
                            case TypeCode.String:
                                if (param.SelValues == null)
                                    control = new CWC.TextBox();
                                else
                                    control = new CWC.DropDownList();
                                break;
                            case TypeCode.DateTime:
                                control = new CWC.DateChooser();
                                break;
                            case TypeCode.Boolean:
                                control = new CWC.CheckBox();
                                break;
                            default:
                                control = new CWC.TextBox();
                                break;
                        }
                        CreateField(control, param.Name, "", param.LabelName);
                        control.LabelPosition = Camstar.WebPortal.Personalization.LabelPositionType.Hidden;
                        TableRow row = new TableRow();
                        TableCell cell = new TableCell();
                        TableCell labelcell = new TableCell();
                        CWC.Label label = new CWC.Label();
                        if (!string.IsNullOrEmpty(param.LabelName))
                            label.Text = param.LabelName;
                        else
                            label.Text = param.Name;

                        labelcell.Controls.Add(label);
                        control.ID = param.Name;
                        cell.Controls.Add(control);
                        row.Cells.Add(labelcell);
                        row.Cells.Add(cell);
                        _ParametersTable.Rows.Add(row);
                        _ParameterControls.Add(control);
                    }
                }
            }
        }

        protected virtual Control CreateField(Control fieldControl, string id, string fieldEx, string labelText)
        {
            fieldControl.ID = id;
            if (fieldControl is IFieldInfo)
            {
                ((IFieldInfo)fieldControl).FieldExpressions = fieldEx;
            }
            if (fieldControl is FieldControl)
            {
                ((FieldControl)fieldControl).LabelControl.Text = labelText;
                ((FieldControl)fieldControl).LabelPosition = Camstar.WebPortal.Personalization.LabelPositionType.Left;
            }

            CWC.PickLists.PickListControl plc = fieldControl as CWC.PickLists.PickListControl;
            if (plc != null)
            {
                plc.DisplayMode = Camstar.WebPortal.Personalization.DisplayModeType.PickList;
                plc.DataLoadMode = DataLoadModeType.Bound;
                plc.RetrieveList = Camstar.WebPortal.Personalization.RetrieveListType.OnPageLoad;
                plc.TextEditControl.Style.Add(HtmlTextWriterStyle.BackgroundColor, "White");
                plc.InitializingPickListPanel += new Camstar.WebPortal.FormsFramework.WebControls.PickLists.PickListControl.InitializePickListPanelEventHandler(plc_InitializingPickListPanel);
            }
            if (fieldControl is CWC.DateChooser)
            {
                (fieldControl as CWC.DateChooser).Style.Add(HtmlTextWriterStyle.BackgroundColor, "White");
            }
            if (fieldControl is CWC.TextBox)
            {
                (fieldControl as CWC.TextBox).TextControl.Style.Add(HtmlTextWriterStyle.BackgroundColor, "White");
            }
            return fieldControl;
        }

        public virtual void plc_InitializingPickListPanel(object sender, Camstar.WebPortal.FormsFramework.WebControls.PickLists.PickListControl.InitializePickListPanelEventArgs e)
        {
            RuntimeParameter rtParam = RuntimeParameters[(sender as Control).ID];
            if (rtParam.SelValues != null)
            {
                e.DataProvider = new CWC.PickLists.StaticValuesDataProvider(rtParam.SelValues);
            }
        }

        protected override void LoadViewState(object savedState)
        {
            base.LoadViewState((savedState as Pair).First);
            _templateId = ((savedState as Pair).Second as object[])[0] as string;
            _displayedParameters = ((savedState as Pair).Second as object[])[1] as List<string>;
        }

        protected override object SaveViewState()
        {
            return new Pair(base.SaveViewState(), new object[] { _templateId, _displayedParameters });
        }


        protected override void OnPreLoad(object sender, EventArgs e)
        {
            if (!(Page.PortalContext is QualityObjectContext) && Page.PortalContext.DataContract != null)
            {
                QualityObjectContext context;
                if (Page.PortalContext.DataContract.DataMembers.Length == 0)
                {
                    context = CallStack.CurrentContext.Copy(typeof(QualityObjectContext)) as QualityObjectContext;
                }
                else
                {
                    context = Page.PortalContext.Copy(typeof(QualityObjectContext)) as QualityObjectContext;
                }
                context.QualityObject = context.DataContract.GetValueByName<OM.NamedObjectRef>("QualityObject");
                context.ClassificationName = context.DataContract.GetValueByName<string>("ClassificationDM");
                context.SubClassificationName = context.DataContract.GetValueByName<string>("SubClassificationDM");
                Page.PortalContext = context;
            }
            LoadQualityRecordData();
            if (_currentError == null)
            {
                if (OldDocument == null)
                {
                    if (ReportTemplate != null && !ReportTemplate.IsEmpty)
                    {
                        LoadReportDocument(ReportTemplate);
                    }
                }
                OldDocument = this.ReportDocument;

                _CrystalViewer.HasToggleGroupTreeButton = HasToggleGroupTreeButton;
                _CrystalViewer.DisplayToolbar = DisplayToolbar;
                if (! Width.IsEmpty)
                    _CrystalViewer.Width = (int)(Width.Value-20);
                if (!Height.IsEmpty)
                    _CrystalViewer.Height = (int)(Height.Value -20);

                if (!Page.IsCallStackReturning)
                {
                    double adjustedWidth = (double)_CrystalViewer.Width.Value - 44;
                    if (adjustedWidth > 0)
                        (_ParametersSection.Controls[0] as WebControl).Width = new Unit(adjustedWidth);
                }

                if (Page.IsFloatingFrame)
                {
                    RuntimeParameters = Page.PortalContext.LocalSession["Parameters"] as RuntimeParameterCollection;
                    CrystalReportContext context = Page.PortalContext.LocalSession["Context"] as CrystalReportContext;
                    double zoomFactor = (double)Page.PortalContext.LocalSession["ZoomFactor"];
                    _CrystalViewer.PageZoomFactor = (int)(context.PageZoomFactor * zoomFactor);
                    _CrystalViewer.Width = (int)(context.Width.Value * zoomFactor);
                    _CrystalViewer.Height = (int)(context.Height.Value * zoomFactor);
                    _CrystalViewer.DisplayToolbar = context.DisplayToolbar;
                    _ParametersSection.Visible = false;
                }
                if (this.ReportDocument != null)
                {
                    if (!Page.IsFloatingFrame)
                        LoadParameters();

                    BuildParameterEditControls();
                }
            }
            base.OnPreLoad(sender, e);
        }
        
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            if (this.IsEditing && _currentError == null)
            {
                OM.RevisionedObjectRef newTempate;

                var wpTemplate =
                    (from wp in this.WebProperties
                     where wp.PropertyDescriptor.Name == "ReportTemplate"
                     select wp)
                    .First();

                if (wpTemplate.Editor != null && wpTemplate.Editor.Value != null)
                    newTempate = wpTemplate.Editor.Value as OM.RevisionedObjectRef;
                else
                    newTempate = new OM.RevisionedObjectRef();

                if (!newTempate.Equals(ReportTemplate))
                {
                    ReportParameterList = null;
                }

                if (ReportParameterList == null)
                {
                    // Kill Report documnent in session
                    Page.PortalContext.LocalSession[this.ID + "_ReportDocument"] = null;
                    UpdateWebProperties(newTempate);
                }
            }

            if (!this.IsEditing && _currentError == null)
            {
                if (this.ReportDocument != null)
                {
                    if (!Page.IsPostBack)
                        LoadControlsData();

                    GetInputParameterData();
                    _inputRequired = CheckIsInputRequired();
                    if (this.ReportDocument != null && !_inputRequired)
                        _CrystalViewer.Report = this.ReportDocument;
                }
            }
            if (_currentError != null)
                DisplayMessage(_currentError);
        }

        protected virtual void SaveReportConnections()
        {
            if (ReportDocument != null)
            {
                if (Page.PortalContext.LocalSession[ID + "DataSourceConnections"] == null)
                {
                    List<object> connections = new List<object>();
                    connections.Add(ReportDocument.DataSourceConnections.Clone());
                    foreach (CREngine.ReportDocument subReport in ReportDocument.Subreports)
                        connections.Add(subReport.DataSourceConnections.Clone());
                    Page.PortalContext.LocalSession[ID + "DataSourceConnections"] = connections.ToArray();
                }
                if (Page.PortalContext.LocalSession[ID + "TableLogOnInfos"] == null)
                {
                    List<object> tableLogOnInfos = new List<object>();
                    List<CRShared.TableLogOnInfo> loginfos = new List<CRShared.TableLogOnInfo>();
                    foreach (CREngine.Table t in ReportDocument.Database.Tables)
                        loginfos.Add(t.LogOnInfo.Clone() as CRShared.TableLogOnInfo);
                    tableLogOnInfos.Add(loginfos);
                    foreach (CREngine.ReportDocument subReport in ReportDocument.Subreports)
                    {
                        loginfos = new List<CRShared.TableLogOnInfo>();
                        foreach (CREngine.Table t in subReport.Database.Tables)
                            loginfos.Add(t.LogOnInfo.Clone() as CRShared.TableLogOnInfo);
                        tableLogOnInfos.Add(loginfos);
                    }
                    Page.PortalContext.LocalSession[ID + "TableLogOnInfos"] = tableLogOnInfos.ToArray();
                }
                _CrystalViewer.CrystalContext.DataSourceConnections = Page.PortalContext.LocalSession[ID + "DataSourceConnections"];
                _CrystalViewer.CrystalContext.TableLogOnInfos = Page.PortalContext.LocalSession[ID + "TableLogOnInfos"];
            }
        }
        
        protected override void OnPreRender(EventArgs e)
        {
            if (ReportDocument != null)
            {
                SaveReportConnections();
                _CrystalViewer.CrystalContext.RuntimeParameters = RuntimeParameters;
            }
            _Wrapper.Update((bool)(ViewState["Enlarged"] ?? false));
            base.OnPreRender(e);
        }

        protected virtual void LoadControlsData()
        {
            foreach (FieldControl control in _ParameterControls)
            {
                RuntimeParameter eqp = RuntimeParameters[control.ID];
                if (eqp.SelValues != null)
                {
                    CWC.DropDownList ddl = control as CWC.DropDownList;
                    if (ddl.PickListPanelControl != null)
                        ddl.PickListPanelControl.ReloadData();
                }
                control.Data = eqp.GetValue();
            }
        }

        protected override void Render(HtmlTextWriter writer)
        {
            if (!Page.IsFloatingFrame)
            {
                if (_currentError == null && _inputRequired)
                {
                    _ParametersSection.Expand();
                }
                else
                {
                    if (!Page.IsPostBack)
                        _ParametersSection.Collapse();
                }
            }
            base.Render(writer);
        }

        protected virtual void DownloadReportDocument()
        {
            _ReportFilePath = GetReportFile(ReportTemplate);
            if (!string.IsNullOrEmpty(_ReportFilePath))
            {
                if (System.IO.File.Exists(_ReportFilePath) && new System.IO.FileInfo(_ReportFilePath).Length > 0)
                {
                    _ReportDocument = new CREngine.ReportDocument();
                    _ReportDocument.Load(_ReportFilePath);
                    foreach (CREngine.ReportDocument subReport in _ReportDocument.Subreports)
                        _ReportDocument.OpenSubreport(subReport.Name);

                    // Remove temp file with temp folder
                    try { System.IO.Directory.Delete(new System.IO.FileInfo(_ReportFilePath).DirectoryName, true); }
                    catch { }
                }
            }
        }

        protected virtual bool LoadReportDocument(OM.RevisionedObjectRef reportTemplate)
        {
            bool isSuccess = false;
            this.ReportDocument = null;

            if (reportTemplate != null && !reportTemplate.IsEmpty)
            {
                if (_ReportDocument != null)
                {
                    ReportDocument = _ReportDocument;
                    RuntimeParameters = new RuntimeParameterCollection(ReportDocument, null);
                    // Add plain parameters
                    foreach (CREngine.ParameterFieldDefinition pfield in ReportDocument.DataDefinition.ParameterFields)
                    {
                        if (pfield.Kind == CRShared.FieldKind.ParameterField && !pfield.ParameterFieldName.StartsWith("csrpt_"))
                        {
                            if (!RuntimeParameters.ContainsKey(pfield.ParameterFieldName))
                                RuntimeParameters.Add(pfield.ParameterFieldName, new RuntimeParameter(pfield.ParameterFieldName));
                        }
                    }
                    isSuccess = true;
                    new FileInfo(_ReportFilePath).Directory.Delete(true);
                }
                else
                {
                    _currentError = new Camstar.WCF.ObjectStack.ResultStatus("File " + _ReportFilePath + " for " + reportTemplate.ToString() + " is wrong", false);
                }
            }
            return isSuccess;
        }

        protected virtual Camstar.WCF.ObjectStack.UserProfile UserProfile
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

        protected virtual string GetReportFile(OM.RevisionedObjectRef reportTemplate)
        {
            string res = string.Empty;
            OM.ReportTemplateMaint data = new OM.ReportTemplateMaint();
            data.ObjectToChange = reportTemplate;
            string configFolder = CamstarPortalSection.Settings.DefaultSettings.UploadDirectory;
            string folder = null;
            if (Directory.Exists(configFolder))
            {
                folder = configFolder + (configFolder.EndsWith("\\") ? "" : "\\") + Guid.NewGuid().ToString("N");
                Directory.CreateDirectory(folder);

                data.ObjectChanges = new OM.ReportTemplateChanges();
                data.ObjectChanges.FileLocation = folder;

                Camstar.WCF.Services.ReportTemplateMaint_Request request = new Camstar.WCF.Services.ReportTemplateMaint_Request();
                request.Info = new OM.ReportTemplateMaint_Info();
                request.Info.ObjectChanges = new OM.ReportTemplateChanges_Info();
                request.Info.ObjectChanges.FileLocation = new OM.Info(true);
                request.Info.ObjectChanges.FileName = new OM.Info(true);
                request.Info.ObjectChanges.Identifier = new OM.Info(true);

                Camstar.WCF.Services.ReportTemplateMaintService serv = new Camstar.WCF.Services.ReportTemplateMaintService(UserProfile);
                Camstar.WCF.Services.ReportTemplateMaint_Result results;

                serv.BeginTransaction();
                serv.Load(data);
                serv.DownloadFile();
                OM.ResultStatus result = serv.CommitTransaction(request, out results);
                if (result.IsSuccess)
                {
                    string idFile = results.Value.ObjectChanges.Identifier != null ? results.Value.ObjectChanges.Identifier.Value : null;
                    if (idFile != null && (idFile.StartsWith("http:") || idFile.StartsWith("https:") || idFile.StartsWith("\\\\")))
                    {
                        results.Value.ObjectChanges.FileName = Guid.NewGuid().ToString("N");
                        try
                        {
                            new System.Net.WebClient().DownloadFile((string)results.Value.ObjectChanges.Identifier, string.Format("{0}\\{1}", folder, (string)results.Value.ObjectChanges.FileName));
                        }
                        catch (System.Net.WebException e)
                        {
                            result = new OM.ResultStatus(e.Message, false);
                        }
                    }
                    if (result.IsSuccess)
                    {
                        _templateId = reportTemplate.ToString();
                        res = string.Format("{0}\\{1}", folder, (string)results.Value.ObjectChanges.FileName);
                    }
                    else
                    {
                        _currentError = result;
                    }
                }
                else
                {
                    _currentError = result;
                }
            }
            else
            {
                LabelCache labelCache = LabelCache.GetRuntimeCacheInstance();
                string message = string.Format(labelCache.GetLabelByName("Lbl_SharedFolderDoesntExists").Value, configFolder);
                _currentError = new Camstar.WCF.ObjectStack.ResultStatus(message, false);
            }
            return res;
        }

        protected virtual CREngine.ReportDocument ReportDocument { get; set; }
        protected virtual RuntimeParameterCollection RuntimeParameters { get; set; }

        private CrystalViewer _CrystalViewer = new CrystalViewer();
        private EnlargeWebPartWrapper _Wrapper;
        private System.Web.UI.WebControls.Table _ParametersTable = new System.Web.UI.WebControls.Table();

        private CWC.Button _RefreshButton = new CWC.Button();
        private ToggleContainer _ParametersSection = new ToggleContainer();
        private List<FieldControl> _ParameterControls = new List<FieldControl>();
        private bool _inputRequired = false;
        private string _templateId = null;
        private OM.ResultStatus _currentError = null;
        private List<string> _displayedParameters = new List<string>();
        private CREngine.ReportDocument _ReportDocument;
        private string _ReportFilePath = null;

        const string _connectionURLKey = "Http(s) XML URL";
    }


    [Serializable]
    public class CrystalReportData
    {
        public CrystalReportData(RuntimeParameterCollection parameters)
        {
            Parameters = parameters;
        }
        public virtual RuntimeParameterCollection Parameters { get; set; }
    }

    [Serializable]
    public class QualityRecordData
    {
        public QualityRecordData(OM.QualityObjectInquiry details, OM.RevisionedObjectRef product)
        {
            Details = details;
            Product = product;
        }
        public virtual OM.QualityObjectInquiry Details { get; set; }
        public virtual OM.RevisionedObjectRef Product { get; set; }
    }


    public abstract class CrystalReportADODataSourceBase
    {
        /// <summary>
        /// Constructor 
        /// </summary>
        public CrystalReportADODataSourceBase(OM.UserProfile profile, NameValueCollection parameters)
        {
            QueryStringParameters = parameters;
            QueryType = OM.QueryType.User;

            Profile = profile;
            ParseParameters();
        }

        public virtual OM.ResultStatus QueryStatus { get; protected set; }
        public virtual OM.QueryType QueryType { get; protected set; }

        public abstract DataTable GetDataTable(string tableName);
        public virtual void LoadStaticLabels(string[] staticLabelNames)
        {
        }
        public virtual DataTable GetStaticLabelsTable()
        {
            return null;
        }

        protected virtual void ParseParameters()
        {
        }

        protected OM.QueryParameters _queryParams = null;
        protected System.Collections.Specialized.NameValueCollection QueryStringParameters = null;
        protected OM.UserProfile Profile = null;
    }

    public class CrystalReportADODataSource : CrystalReportADODataSourceBase
    {
        public CrystalReportADODataSource(OM.UserProfile profile, NameValueCollection parameters)
            : base(profile, parameters)
        { }

        protected override void ParseParameters()
        {
            base.ParseParameters();
            _queryParams = new OM.QueryParameters();
            if (QueryStringParameters != null)
            {
                _queryParams.Parameters = 
                    (from k in QueryStringParameters.AllKeys 
                    select new OM.QueryParameter(k, QueryStringParameters[k])).ToArray();
            }
        }

        public override DataTable GetDataTable(string tableName)
        {
            bool isLabelTable = false;
            if (tableName.EndsWith("_Labels"))
            {
                tableName = tableName.Replace("_Labels", "");
                isLabelTable = true;
            }

            OM.ResultStatus status = new OM.ResultStatus("", true);
            QueryDataSource qdef;
            if (!QueryDefinitions.ContainsKey(tableName))
            {
                qdef = new QueryDataSource(tableName, _queryParams);
                status = qdef.GetRecordSet(Profile, QueryType, 10000);
                QueryDefinitions.Add(tableName, qdef);
            }
            else
            {
                qdef = QueryDefinitions[tableName];
            }

            if (status.IsSuccess)
            {
                if (isLabelTable)
                    return qdef.GetLabelsTable();
                else
                    return qdef.GetDataTable();
            }
            else
                return null;
        }

        public override DataTable GetStaticLabelsTable()
        {
            DataTable tbl = null;
            var lblCache = FormsFramework.Utilities.FrameworkManagerUtil.GetLabelCache();
            OM.ResultStatus result = lblCache.GetLabels(staticLabelList);
            if (result.IsSuccess)
            {
                tbl = new DataTable("StaticLabels");

                // Create columns
                foreach (var l in staticLabelList)
                {
                    DataColumn col = new DataColumn(l.Name);
                    col.Caption = l.DefaultValue;
                    col.DataType = typeof(string);
                    tbl.Columns.Add(col);
                }

                DataRow row = tbl.NewRow();
                foreach (var l in staticLabelList)
                {
                    row[l.Name] = l.Value;
                }
                tbl.Rows.Add(row);
            }
            return tbl;
        }

        public override void LoadStaticLabels(string[] staticLabelNames)
        {
            staticLabelList = new FormsFramework.LabelList();
            if (staticLabelNames != null)
            {
                new List<string>(staticLabelNames).ForEach(l => staticLabelList.Add(new OM.Label(l) { LabelType = OM.LabelType.User }));
            }
        }

        private Dictionary<string, QueryDataSource> QueryDefinitions = new Dictionary<string, QueryDataSource>();
        private FormsFramework.LabelList staticLabelList = null;

    }


    public class QueryDataSource
    {
        public QueryDataSource(string qname, OM.QueryParameters qparm)
        {
            QueryName = qname;
            Parameters = qparm;
        }

        public virtual  OM.ResultStatus GetRecordSet(OM.UserProfile profile, OM.QueryType queryType, int rowsSize)
        {
            // We could use query service here. So we got the environment recordset too
            var qServ = new Camstar.WCF.Services.QueryService(profile);
            OM.QueryOptions qOptions = new OM.QueryOptions();
            qOptions.StartRow = 1;
            qOptions.RowSetSize = rowsSize;
            qOptions.QueryType = queryType;

            OM.RecordSet result;
            OM.ResultStatus status = qServ.Execute(QueryName, Parameters, qOptions, out result);
            if (status.IsSuccess)
            {
                _envRecordSet = result;
                if (_envRecordSet != null)
                {
                    _rows = _envRecordSet.Rows;
                    _headers = _envRecordSet.Headers;
                }
            }
            else
            {
                _envRecordSet = null;
                if (!string.IsNullOrEmpty(status.ExceptionData.Description))
                {
                    status.Message += (" " + status.ExceptionData.Description);
                }
            }
            return status;
        }

        public virtual  DataTable GetDataTable()
        {
            if (_envRecordSet != null)
                return _envRecordSet.GetAsExplicitlyDataTable();
            else
                return null;
        }

        public virtual  DataTable GetLabelsTable()
        {
            if (_envRecordSet != null)
            {
                DataTable tbl = _envRecordSet.GetAsDataTable().Clone();
                DataRow row = tbl.NewRow();
                foreach (OM.Header hdr in _envRecordSet.Headers)
                {
                    row[hdr.Name] = hdr.Label.DefaultValue;
                }
                tbl.Rows.Add(row);
                return tbl;
            }
            else
            {
                return null;
            }
        }

        public string QueryName;
        public OM.QueryParameters Parameters = null;

        private OM.RecordSet _envRecordSet = null;
        private OM.Row[] _rows;
        private OM.Header[] _headers;
    }


#if __crdebug__
    public static class DebugTrace
    {
        static DebugTrace()
        {
            debFile = System.Web.HttpContext.Current.Server.MapPath("Temp\\Debug.log");
            if (System.IO.File.Exists(debFile))
                System.IO.File.Delete(debFile);
        }

        public static DateTime Write(string txt)
        {
            if (!System.IO.File.Exists(debFile))
                startApp = DateTime.Now;

            DateTime now = DateTime.Now;
            TimeSpan diff = now - startApp;
            System.IO.File.AppendAllText(debFile, string.Format("{0:f03} {1}\n", diff.TotalSeconds,  txt ));
            return now;
        }

        public static void Write(string txt, DateTime startTime)
        {
            if (!System.IO.File.Exists(debFile))
                startApp = DateTime.Now;

            TimeSpan diff = DateTime.Now - startApp;
            TimeSpan diff2 = DateTime.Now - startTime;
            System.IO.File.AppendAllText(debFile, string.Format("{0:f03} {1} ({2:f03})\n\n", diff.TotalSeconds, txt, diff2.TotalSeconds));
        }
        private static string debFile;
        private static DateTime startApp;
    }
#endif
}
