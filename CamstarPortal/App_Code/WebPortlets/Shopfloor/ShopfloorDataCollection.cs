// Copyright Siemens 2019  
using System;
using System.Linq;

using CamstarPortal.WebControls;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.Personalization;
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.FormsFramework;
using System.Web;
using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.FormsFramework.Utilities;

namespace Camstar.WebPortal.WebPortlets
{
    /// <summary>
    /// Summary description for ParametricDataControl
    /// </summary>
    public class ShopfloorDataCollection : MatrixWebPart
    {
        public ShopfloorDataCollection()
        {
            Title = "Parametric Data";
        }
        public override void DisplayValues(Service serviceData)
        {
            var data = serviceData as ShopFloor;
            if (serviceData is ContainerTxn && Page.ProcessingContext[ProcessingFlagType.RequestOnSubmit] != true)
            {
                if (Container != null)
                    (data as ContainerTxn).Container = Container.Data as ContainerRef;
                else if (HiddenSelectedContainer != null)
                    (data as ContainerTxn).Container = new ContainerRef(HiddenSelectedContainer.Data as string);
                else if (ContainerName != null)
                    (data as ContainerTxn).Container = new ContainerRef(ContainerName.Data as string);
            }
            var dataPoints = data.ParametricData as DataPointSummary;
            if (dataPoints != null && dataPoints.DataPointDetails != null || data.WebPart != null)
                ParamDataControl.DisplayValues(data);
            
            if (_ContainerChanged)
                CollectionDef.Visible = (data.HasDataCollection != null && data.HasDataCollection.Value);
            //make field readonly if only one DataCollectionDef is present
            CollectionDef.ReadOnly = data.DataCollectionDef != null;
            base.DisplayValues(serviceData);
        }

        public override void RequestValues(Info serviceInfo, Service serviceData)
        {                
            if (serviceData is ShopFloor)
            {
                if (Container != null)
                {
                    if (serviceData is ContainerTxn && !Container.IsEmpty)
                        (serviceData as ContainerTxn).Container = Container.Data as ContainerRef;
                }
                else if (HiddenSelectedContainer != null)
                {
                    if (serviceData is ContainerTxn && !HiddenSelectedContainer.IsEmpty)
                        (serviceData as ContainerTxn).Container = new ContainerRef(HiddenSelectedContainer.Data as string);
                }
                else if (ContainerName != null)
                {
                    if (serviceData is ContainerTxn && !ContainerName.IsEmpty)
                        (serviceData as ContainerTxn).Container = new ContainerRef(ContainerName.Data as string);
                }

                if (serviceData is ContainerTxn && !(CollectionDef.Data as RevisionedObjectRef).IsNullOrEmpty())
                    (serviceData as ShopFloor).DataCollectionDef = CollectionDef.Data as RevisionedObjectRef;
                (serviceData as ShopFloor).Factory = new NamedObjectRef(Page.SessionDataContract.GetValueByName("Factory") as string);
            }

            if (Page.ProcessingContext.Status != FormsFramework.ProcessingStatusType.SubmitTransaction)
            {
                if (serviceInfo is ShopFloor_Info)
                    (serviceInfo as ShopFloor_Info).HasDataCollection = new Info(true);

                ParamDataControl.RequestValues(serviceData as ShopFloor, serviceInfo as ShopFloor_Info);
            }
        }

        public override void ClearValues(Service serviceData)
        {
            base.ClearValues(serviceData);
            if (serviceData is ShopFloor)
            {
                ParamDataControl.Clear();
                ParamDataControl.IterationCount = 1;
                CollectionDef.Visible = false;
            }
        }

        protected override void OnLoad(EventArgs e)
        {
            if (HttpContext.Current.Session["DataCollectionServiceName"] != null)
                DCWebPart.PrimaryServiceType = HttpContext.Current.Session["DataCollectionServiceName"].ToString();

            base.OnLoad(e);

            if (Container != null)
                Container.DataChanged += _Container_DataChanged;
            else if (HiddenSelectedContainer != null)
                HiddenSelectedContainer.DataChanged += _HiddenSelectedContainer_DataChanged;
            else if (ContainerName != null)
            {
                if (CollectionDef.IsEmpty)
                    ContainerNameDataChanged();
            }

            if (CollectionDef != null)
            {
                //Collection Def control should be required on CollectData page only.
                CollectionDef.DataChanged += _CollectionDef_DataChanged;
                CollectionDef.Required = Page.PrimaryServiceType == typeof(CollectData).Name;
            }
        }

        public override void WebPartCustomAction(object sender, Personalization.CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);

            CustomAction action = e.Action as CustomAction;
            if (action != null)
            {
                if (action.Parameters == "DataCollection")
                {
                    if (string.IsNullOrEmpty(ParamDataControl.Validate().ToString()))
                    {
                        HttpContext.Current.Session["ParamDataControlValidate"] = ParamDataControl.Validate();
                        HttpContext.Current.Session["CollectionDefData"] = CollectionDef.Data;
                        HttpContext.Current.Session["ParamDataControlDataPointSummary"] = ParamDataControl.GetDataPointSummary();

                        e.IsSubmitted = true;
                        Page.CollectDataContract();
                    }
                    else
                    {
                        LabelCache labelCache = FrameworkManagerUtil.GetLabelCache(System.Web.HttpContext.Current.Session);
                        Label errorLabel = labelCache.GetLabelByName("MissingDataPoint");
                        if (errorLabel != null)
                            e.Result = new ResultStatus(errorLabel.Value ?? "MissingDataPoint", false);
                    }
                }
            }
        }

        public void ContainerNameDataChanged()
        {
            _ContainerChanged = true;
            CollectionDef.ClearData();
            ParamDataControl.Clear();
            if (!ContainerName.IsEmpty)
                Service.LoadServiceValues(PrimaryServiceType, "GetDataPoints");
        }

        protected virtual void _HiddenSelectedContainer_DataChanged(object sender, EventArgs e)
        {
            _ContainerChanged = true;
            CollectionDef.ClearData();
            ParamDataControl.Clear();
            if (!HiddenSelectedContainer.IsEmpty)
                Service.LoadServiceValues(PrimaryServiceType, "GetDataPoints");
        }

        protected virtual void _Container_DataChanged(object sender, EventArgs e)
        {
            _ContainerChanged = true;
            CollectionDef.ClearData();
            ParamDataControl.Clear();
            if (!Container.IsEmpty)
                Service.LoadServiceValues(PrimaryServiceType, "GetDataPoints");
        }

        protected virtual void _CollectionDef_DataChanged(object sender, EventArgs e)
        {
            if (!_ContainerChanged)
            {
                if (!CollectionDef.IsEmpty)
                    Service.LoadServiceValues(PrimaryServiceType, "GetDataPoints");
                else
                    ParamDataControl.Clear();
            }
        }

        public override ValidationStatus ValidateInputData(Service serviceData)
        {
            ValidationStatus status =  base.ValidateInputData(serviceData);
            status.Add(ParamDataControl.Validate());

            return status;
        }

        public override void GetInputData(Service serviceData)
        {
            base.GetInputData(serviceData);
            if(ParamDataControl != null)
            {
                DataPointSummary[] dataPointSummary = ParamDataControl.GetDataPointSummary();
                if (dataPointSummary != null && dataPointSummary.Length > 0)
                    ((ShopFloor)serviceData).ParametricData = dataPointSummary[0];
            }
        }

        private bool _ContainerChanged;

        protected virtual WebPartBase DCWebPart
        {
            get { return Page.FindIForm("ParametricDataWP") as WebPartBase; }
        }

        protected virtual CWC.RevisionedObject CollectionDef
        {
            get { return Page.FindCamstarControl("DCCollectionDef") as CWC.RevisionedObject; }
        }

        protected virtual ShopFloorDCControl ParamDataControl
        {
            get { return Page.FindCamstarControl("ParamDataField") as ShopFloorDCControl; }
        }

        protected virtual CWC.ContainerList Container
        {
            get { return Page.FindCamstarControls<CWC.ContainerList>().FirstOrDefault(c => c.ID == "ContainerStatus_ContainerName"); }
        }

        protected virtual CWC.TextBox HiddenSelectedContainer
        {
            get { return Page.FindCamstarControl("HiddenSelectedContainer") as CWC.TextBox; }
        }

        protected virtual CWC.TextBox ContainerName
        {
            get { return Page.FindCamstarControl("ContainerName") as CWC.TextBox; }
        }
    }
}

