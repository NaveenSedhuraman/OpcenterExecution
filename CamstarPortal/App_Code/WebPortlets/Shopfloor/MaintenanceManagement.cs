// Copyright Siemens 2019  
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Camstar.WebPortal.WebPortlets;
using CamstarPortal.WebControls;
using Camstar.WCF.Services;
using Camstar.WCF.ObjectStack;
using OM = Camstar.WCF.ObjectStack;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.FormsFramework.WebControls;

namespace Camstar.WebPortal.WebPortlets.Shopfloor
{

    public class MaintenanceManagement : MatrixWebPart
    {
        #region Properties

        protected virtual CWC.RevisionedObject DataCollectionDef
        {
            get
            {
                return Page.FindCamstarControl("DataCollectionDef") as CWC.RevisionedObject;
            }
        }

        protected virtual ShopFloorDCControl DataCollection
        {
            get
            {
                return Page.FindCamstarControl("DataCollection") as ShopFloorDCControl;
            }
        }

        protected virtual CWC.NamedSubentity MaintenanceStatus
        {
            get
            {
                return Page.FindCamstarControl("MaintenanceStatus") as CWC.NamedSubentity;
            }
        }

        #endregion

        #region Methods

       

        public override void DisplayValues(WCF.ObjectStack.Service serviceData)
        {
            ShopFloorDCControl dataCollection = DataCollection;
            ShopFloor data = (ShopFloor)serviceData;
            dataCollection.DisplayValues(data);

            base.DisplayValues(serviceData);
           
           
        }

        public override void RequestValues(Info serviceInfo, Service serviceData)
        {
            base.RequestValues(serviceInfo, serviceData);
            ShopFloor_Info info = (ShopFloor_Info)serviceInfo;

            Camstar.WCF.ObjectStack.CompleteMaintenance data = (Camstar.WCF.ObjectStack.CompleteMaintenance)serviceData;
            if (dataPointsRequested)
                DataCollection.RequestValues(data, info);
            data.DataCollectionDef = DataCollectionDef.Data as RevisionedObjectRef;
        }

        public override void GetInputData(Service serviceData)
        {
            base.GetInputData(serviceData);
            DataPointSummary[] dataPointSummary = DataCollection.GetDataPointSummary();
            if (dataPointSummary != null && dataPointSummary.Length > 0)
                ((ShopFloor)serviceData).ParametricData = dataPointSummary[0];
        }

        public override void ClearValues(Service serviceData)
        {
            base.ClearValues(serviceData);
            DataCollection.Clean();
            DataCollection.IterationCount = 1;
            MaintenanceStatus.ClearData();
            
        }

        public virtual void SetDataCollection(object sender, EventArgs arg)
        {
            
            FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
             CompleteMaintenanceService service = new CompleteMaintenanceService(session.CurrentUserProfile);
            if((MaintenanceStatus.IsEmpty))
                return;

                CompleteMaintenance data = new CompleteMaintenance()
                           {

                               ServiceDetails = new CompleteMaintDetails[] 
                        {
                            
                            new CompleteMaintDetails() { MaintenanceStatus = WSObjectRef.AssignSubentity((MaintenanceStatus.Data as NamedSubentityRef).Name) }
                        }
                           };

                CompleteMaintenance_Request request = new CompleteMaintenance_Request()
                {
                    Info = new CompleteMaintenance_Info()
                    {
                        DataCollectionDef = new Info(true, false)
                    }
                };

                CompleteMaintenance_Result res;
                ResultStatus rs = service.ResolveParametricData(data, request, out res);
                if (rs.IsSuccess)
                    DataCollectionDef.Data = res.Value.DataCollectionDef;


                dataPointsRequested = true;
                Service.LoadServiceValues("CompleteMaintenance", "GetDataPoints");//loaded DisplayValues method is called
                dataPointsRequested = false;
            
        }

        #endregion

        private bool dataPointsRequested = false;
        
    }
}
