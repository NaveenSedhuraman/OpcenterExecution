// Copyright Siemens 2019  
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.UI;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.Utilities;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using OM = Camstar.WCF.ObjectStack;
using PERS = Camstar.WebPortal.Personalization;


namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
    /// <summary>
    /// Summary description for SPCAnnotation
    /// </summary>
    public class SPCAnnotation : MatrixWebPart
    {
        public virtual PERS.SPCChartData SPCChartParams { get; set; }

        protected override void OnLoad(EventArgs e)
        {
            DataPointIDField = Page.FindCamstarControl("DataPointID") as CWC.TextBox;
            MetricNameField = Page.FindCamstarControl("MetricName") as CWC.TextBox;
            AnnotationField = Page.FindCamstarControl("TextToAppend") as CWC.TextEditor;
            ExistingAnnotationField = Page.FindCamstarControl("ExistingAnnotation") as CWC.TextEditor;
            ExcludeDataPointField = Page.FindCamstarControl("ExcludeDataPoint") as CWC.CheckBox;
            IsCustomDataSource = Page.FindCamstarControl("IsCustomDataSource") as CWC.CheckBox;
            base.OnLoad(e);

            var page = Page as IActionContainer;
            if (page != null)
            {
                SPCChartParams = page.ActionDispatcher.DataContract.GetValueByName<PERS.SPCChartData>("SPCChartParams");
            }
            if (!Page.IsPostBack)
                LoadAnnotation();
        }

        protected override object SaveViewState()
        {
            return new Pair { First = base.SaveViewState(), Second = SPCChartParams };
        }

        protected override void LoadViewState(object savedState)
        {
            var pair = savedState as Pair;
            SPCChartParams = pair.Second as PERS.SPCChartData;
            base.LoadViewState(pair.First);
        }

        public override void WebPartCustomAction(object sender, PERS.CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);

            var id = DataPointIDField.Data as string;
            var metric = MetricNameField.Data as string;
            var annotation = AnnotationField.Data as string;
            var AnnotationTextRequired = FrameworkManagerUtil.GetLabelCache().GetLabelByName("Lbl_AnnotationTextRequired");

            if (string.IsNullOrEmpty(annotation))
            {
                e.Result = new OM.ResultStatus(AnnotationTextRequired.Value, false);
                return;
            }

            OM.RecordSet annotationList;
            var status = _annotation.SaveAnnotation(id, metric, annotation, ExcludeDataPointField.IsChecked, out annotationList);
            var AnnotationExclusionSuccessful = FrameworkManagerUtil.GetLabelCache().GetLabelByName("Lbl_AnnonationExclusionSuccessful");

            if (status.IsSuccess)
            {
                PopulateAnnotation(annotationList);
                AnnotationField.Data = string.Empty;
                status.Message = AnnotationExclusionSuccessful.Value;
                AddDataPointToLocalSession(id);
                ScriptManager.RegisterStartupScript(Page.Form, Page.Form.GetType(), "setNotifyParent",
                    "if(window['__page']) window['__page'].set_notifyParentOnClose(true);", true);

                RenderToClient = true;
            }
            e.Result = status;
        }

        public virtual void LoadAnnotation()
        {
            var id = DataPointIDField.Data.ToString();
            var metric = MetricNameField.Data.ToString();

            OM.RecordSet rs;
            var status = _annotation.LoadAnnotations(id, metric, out rs);
            if (status.IsSuccess)
                PopulateAnnotation(rs);
            else
                DisplayMessage(status);
        }

        protected virtual void PopulateAnnotation(OM.RecordSet rs)
        {
            if (rs != null && rs.Rows != null && rs.Rows.Length > 0)
            {
                var annotations = string.Empty;
                rs.Rows.ToList().ForEach(r => annotations = string.Format("{0}\n{1}", annotations, r.Values[1]));

                var maxIndex = rs.Rows.Last().Values.Count() - 1;
                bool exclude = false;
                bool.TryParse(rs.Rows.Last().Values[maxIndex] ?? "false", out exclude);

                ExistingAnnotationField.Data = annotations;
                ExcludeDataPointField.Data = exclude;
            }
        }

        protected virtual void AddDataPointToLocalSession(string datapointIDs)
        {
            var ids = datapointIDs.Split(',');
            var parentCallStack = Page.PortalContext.LocalSession["ParentCallStack"] as CallStack;
            var annotatedDataPointList = parentCallStack.Context.LocalSession["LatestAnnotatedDataPointID"] as List<string> ?? new List<string>();

            annotatedDataPointList.AddRange(ids);
            parentCallStack.Context.LocalSession["LatestAnnotatedDataPointID"] = annotatedDataPointList;
        }

        protected virtual FormsFramework.ISPCAnnotation _annotation
        {
            get
            {
                var annotation = Page.PortalContext.LocalSession["LatestAnnotation"] as ISPCAnnotation;
                if (annotation == null)
                {
                    var serviceRepository = new SPCRepository();
                    annotation = new FormsFramework.SPCAnnotation(serviceRepository, IsCustomDataSource.IsChecked);
                    Page.PortalContext.LocalSession["LatestAnnotation"] = annotation;
                }
                return annotation;
            }
        }

        CWC.TextBox DataPointIDField;
        CWC.TextBox MetricNameField;
        CWC.TextEditor AnnotationField;
        CWC.TextEditor ExistingAnnotationField;
        CWC.CheckBox ExcludeDataPointField;
        CWC.CheckBox IsCustomDataSource;
    }
}
