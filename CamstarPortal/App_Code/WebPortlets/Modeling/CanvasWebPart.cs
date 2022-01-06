// Copyright Siemens 2019  
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.UI;
using Camstar.WCF.ObjectStack;
using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.WCFUtilities;
using CamstarPortal.WebControls;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;

namespace Camstar.WebPortal.WebPortlets
{
    public class CanvasWebPart : MatrixWebPart
    {
        protected override void OnPreLoad(object sender, EventArgs e)
        {
            base.OnPreLoad(sender, e);
            WorkflowsControl.PickListPanelControl.NoCacheOutput = true;
        }

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            SpecsControl.DisplayPanelOnly = true;
            WorkflowsControl.DisplayPanelOnly = true;
            SpecsControl.PickListPanelControl.Attributes.CssStyle.Add(HtmlTextWriterStyle.ZIndex, "0");
            WorkflowsControl.PickListPanelControl.Attributes.CssStyle.Add(HtmlTextWriterStyle.ZIndex, "0");

            if (!string.IsNullOrEmpty(Page.PrimaryServiceType))
            {
                var service = new WSDataCreator().CreateObject(Page.PrimaryServiceType);
                if (service.GetType().IsAssignableFrom(typeof(ChangeMgtWorkflowMaint)))
                    CanvasControl.DisableReworkPath = true;
            }
            Page.BeforeSubmitTransactionCommit += Page_BeforeSubmitTransactionCommit;
            _portalContext = Page.PortalContext as MaintenanceBehaviorContext;
        }

        public override void ClearValues()
        {
            base.ClearValues();
            SpecsControl.ClearData();
            WorkflowsControl.ClearData();
            CanvasControl.Redraw = true;
        }

        protected virtual void Page_BeforeSubmitTransactionCommit(object sender, TransactionEventHandler e)
        {
            var pc = Page.PortalContext as MaintenanceBehaviorContext;
            if (pc.State != MaintenanceBehaviorContext.MaintenanceState.None)
            {
                var service = e.Service;
                var inputData = WCFObject.CreateObject(e.Data.GetType()) as BusinessProcessWorkflowMaint;
                if (inputData == null)
                    return;
                inputData.ObjectChanges = WCFObject.CreateObject(e.Data.ObjectChanges.GetType()) as BusinessProcessWorkflowChanges;
                if (inputData.ObjectChanges == null)
                    return;
                inputData.ObjectChanges.FirstStep = CanvasControl.GetFirstStepData(GetCurrentWorkflow());
                inputData.ObjectChanges.Steps = PrepareSecondInputData(_stepsToSubmit);
                service.ExecuteTransaction(inputData);
            }
        }

        public override void GetInputData(Service serviceData)
        {
            base.GetInputData(serviceData);

            var serviceData1 = serviceData as BusinessProcessWorkflowMaint;
            if (serviceData1 != null)
            {
                if (_portalContext != null && _portalContext.State != MaintenanceBehaviorContext.MaintenanceState.None)
                {
                    _stepsToSubmit = CanvasControl.GetData(GetCurrentWorkflow());
                    var serviceObject = new WCFObject(serviceData) { ReplaceValue = true };
                    serviceObject.SetValue("ObjectChanges.Steps", PrepareFirstInputData(_stepsToSubmit));
                }
            }
        }

        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);
            var pc = Page.PortalContext as MaintenanceBehaviorContext;
            if (pc.State == MaintenanceBehaviorContext.MaintenanceState.Edit)
                CanvasControl.WorkflowValue = pc.Current as RevisionedObjectRef;
            else
                CanvasControl.WorkflowValue = null;
        }

        protected virtual BaseObjectRef GetCurrentWorkflow()
        {
            var instanceHeaderWp = Page.Manager.WebParts["MDL_InstanceHeader"];
            if (instanceHeaderWp != null)
            {
                var nameTxt = instanceHeaderWp.FindControl("NameTxt") as CWC.TextBox;
                var revTxt = instanceHeaderWp.FindControl("RevisionTxt") as CWC.TextBox;
                if (nameTxt != null && revTxt != null)
                {
                    var name = nameTxt.Data == null ? "" : nameTxt.Data.ToString();
                    var rev = revTxt.Data == null ? "" : revTxt.Data.ToString();
                    var changesType = WCFObject.GetFieldMetadata(PrimaryServiceType + ".ObjectChanges").CDOTypeName;
                    return new RevisionedObjectRef(name, rev) { CDOTypeName = changesType };
                }
            }
            return null;
        }

        //Returns added steps only without paths.
        protected virtual StepChanges[] PrepareFirstInputData(IEnumerable<StepChanges> allSteps)
        {
            var retVal = new List<StepChanges>();
            if (allSteps != null)
            {
                foreach (var step in allSteps.Where(step => step.ListItemAction.HasValue && step.ListItemAction.Value == ListItemAction.Add))
                {
                    StepChanges newStep;
                    if (WorkflowHelper.IsSpec(step, CanvasControl.SpecStepChangesType))
                    {
                        newStep = WorkflowHelper.CreateSpecStepChanges(CanvasControl.SpecStepChangesType);
                        WorkflowHelper.SetSpec(newStep, WorkflowHelper.GetSpec(step, CanvasControl.SpecStepFieldName), CanvasControl.SpecStepFieldName);
                    }
                    else
                    {
                        newStep = WorkflowHelper.CreateSubWorkflowStepChanges(CanvasControl.SubWorkflowStepChangesType);
                        WorkflowHelper.SetSubWorkflow(newStep, WorkflowHelper.GetSubWorkflow(step, CanvasControl.SubWorkflowStepFieldName), CanvasControl.SubWorkflowStepFieldName);
                    }
                    newStep.ListItemAction = ListItemAction.Add;
                    newStep.Name = step.Name;
                    newStep.XLocation = step.XLocation;
                    newStep.YLocation = step.YLocation;
                    retVal.Add(newStep);
                }
            }
            return retVal.Count > 0 ? retVal.ToArray() : null;
        }

        // Returns modified/deleted steps.
        private static StepChanges[] PrepareSecondInputData(IEnumerable<StepChanges> allSteps)
        {
            var retVal = new List<StepChanges>();
            if (allSteps != null)
            {
                foreach (var step in allSteps.Where(step => step.ListItemAction.HasValue))
                {
                    if (step.ListItemAction.HasValue && step.ListItemAction.Value == ListItemAction.Add)
                    {
                        step.ListItemAction = ListItemAction.Change;
                        step.Key = new NamedObjectRef(step.Name.Value);
                    }
                    retVal.Add(step);
                }
            }
            return retVal.Count > 0 ? retVal.ToArray() : null;
        }

        protected virtual WorkflowViewerControl CanvasControl
        {
            get { return Page.FindCamstarControl("CanvasControl") as WorkflowViewerControl; }
        }

        protected virtual FormsFramework.WebControls.RevisionedObject SpecsControl
        {
            get
            {
                return Page.FindCamstarControl("SpecsControl") as FormsFramework.WebControls.RevisionedObject;
            }
        }

        protected virtual FormsFramework.WebControls.RevisionedObject WorkflowsControl
        {
            get
            {
                return Page.FindCamstarControl("WorkflowsControl") as FormsFramework.WebControls.RevisionedObject;
            }
        }

        private StepChanges[] _stepsToSubmit;
        private MaintenanceBehaviorContext _portalContext;
    }
}
