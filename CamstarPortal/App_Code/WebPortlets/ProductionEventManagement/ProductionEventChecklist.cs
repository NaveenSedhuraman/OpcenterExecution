// Copyright Siemens 2020  
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Camstar.WCF.ObjectStack;
using Camstar.WCF.Services;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.WebPortlets;

/// <summary>
/// Summary description for ProductionEventChecklist
/// </summary>
namespace Camstar.WebPortal.WebPortlets
{
    public class ProductionEventChecklist : MatrixWebPart
    {
        #region Properties

        protected virtual Button UpdateChecklist
        {
            get { return Page.FindCamstarControl("UpdateChecklist") as Button; }
        }

        protected virtual Camstar.WebPortal.FormsFramework.WebControls.NamedObject InstanceID
        {
            get
            {
                return Page.FindCamstarControl("InstanceID") as Camstar.WebPortal.FormsFramework.WebControls.NamedObject;
            }
        }
        protected virtual CamstarPortal.WebControls.Checklist ChecklistControl
        {
            get { return Page.FindCamstarControl("ChecklistControl") as CamstarPortal.WebControls.Checklist; }
        }

        protected virtual JQTabContainer TabContainer { get { return Page.FindCamstarControl("Tabs") as JQTabContainer; } }

        #endregion

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            UpdateChecklist.Click += UpdateChecklist_Click;

        }

        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);

            if (TabContainer.SelectedItem.Name == "Checklist")
                LoadChecklists();
        }

        protected virtual void LoadChecklists()
        {
            var session = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
            if (session != null)
            {
                var service = new UpdateEventChecklistService(session.CurrentUserProfile);
                var serviceData = new UpdateEventChecklist();

                serviceData.QualityObject = new NamedObjectRef()
                {
                    CDOTypeName = "Event",
                    Name = InstanceID.Data.ToString()
                };

                var request = new UpdateEventChecklist_Request()
                {
                    Info = new UpdateEventChecklist_Info()
                    {
                        QualityObject = new Info(true),
                        ExecuteChecklist = new ExecuteChecklist_Info()
                        {
                            ChecklistInstructions = new Info(true),
                            ServiceDetails = new ExecuteChecklistDetail_Info() {RequestValue = true}
                        }
                    }
                };

                var result = new UpdateEventChecklist_Result();

                ResultStatus resultStatus = service.Load(serviceData, request, out result);

                if (resultStatus != null && resultStatus.IsSuccess)
                {
                    ChecklistControl.Data = result.Value.ExecuteChecklist;
                }
                else
                {
                    DisplayMessage(resultStatus);
                }
            }
        }

        private void UpdateChecklist_Click(object sender, EventArgs e)
        {
            var session = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
            if (session != null)
            {
                var service = new UpdateEventChecklistService(session.CurrentUserProfile);
                var serviceData = new UpdateEventChecklist();
                serviceData.QualityESigDetail = ESigCaptureUtil.CollectQualityESigDetail();
                serviceData.QualityObject = new NamedObjectRef() { CDOTypeName = "Event", Name = InstanceID.Data.ToString() };
                serviceData.ExecuteChecklist = (ExecuteChecklist) ChecklistControl.Data;
                var request = new UpdateEventChecklist_Request();
                var result = new UpdateEventChecklist_Result();

                ResultStatus resultStatus = service.ExecuteTransaction(serviceData, request, out result);

                if (resultStatus != null && resultStatus.IsSuccess)
                {
                    DisplayMessage(resultStatus);
                }
                else
                {
                    DisplayMessage(resultStatus);
                }
                ESigCaptureUtil.CleanQualityESigCaptureDM();
            }
        }

        public override void GetInputData(Service serviceData)
        {
            base.GetInputData(serviceData);

            ((QualityTxn)serviceData).QualityObject = new NamedObjectRef() { CDOTypeName = "Event", Name = InstanceID.Data.ToString() };
        }
    }

}
