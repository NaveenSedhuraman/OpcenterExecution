// Copyright Siemens 2019  

using System;
using System.Web;
using System.Web.UI;
using Camstar.WCF.ObjectStack;
using Camstar.WCF.Services;
using Camstar.WebPortal.Constants;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.Personalization;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;

namespace Camstar.WebPortal.WebPortlets
{
    public class LineAssignmentControl : MatrixWebPart
    {
        public virtual void SubmitLineAssignment_Click(object sender, EventArgs e)
        {
            SetLineAssigment();
            Page.Response.Redirect("Main.aspx");
        }

        public virtual void ResetLineAssignment_Click(object sender, EventArgs e)
        {
            ResetLineAssigment();
            Page.Response.Redirect("LineAssignmentPage.aspx");
        }

        protected virtual void ShowAgainExecute(bool show)
        {
            FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(Page.Session);
            EmployeeMaintService serv = Page.Service.GetService<EmployeeMaintService>();

            EmployeeMaint dataToChange = new EmployeeMaint();
            dataToChange.ObjectToChange = new NamedObjectRef(session.CurrentUserProfile.Name);

            EmployeeMaint dataChanges = new EmployeeMaint();
            dataChanges.ObjectChanges = new EmployeeChanges();
            dataChanges.ObjectChanges.UserProfile = new UserProfileChanges { ShowLineAssignmentOnLogon = show };

            serv.BeginTransaction();
            serv.Load(dataToChange);
            serv.ExecuteTransaction(dataChanges);
            serv.CommitTransaction();
        }

        public override void WebPartCustomAction(object sender, Personalization.CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);
            var action = e.Action as CustomAction;
            if (action != null)
                if (action.Parameters == "SetAssignment")
                {
                    SetLineAssignmentCustomAction();
                }
                else if (action.Parameters == "Reset")
                {
                    ResetLineAssigment();
                }
        }

        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);
            if (!Page.IsPostBack)
            {
                if (Page.Session["LineAssignmentDefaultValues"] == null)
                    StoreDefaultLineAssignment();
            }
        }

        protected virtual void SetLineAssignmentCustomAction()
        {
            SetLineAssigment();
	        string setLineAssignmentScript = "parent.pop.hide();"; 

	        if (IsResponsive)
	        {
		        setLineAssignmentScript +="if(parent.setApolloLineAssignement)parent.setApolloLineAssignement('{0}','{1}','{2}','{3}');";
                setLineAssignmentScript = string.Format(setLineAssignmentScript,
                 this.sessionValues.WorkCenter != null ? HttpUtility.JavaScriptStringEncode(this.sessionValues.WorkCenter.Name) : "",
                 this.sessionValues.Operation != null ? HttpUtility.JavaScriptStringEncode(this.sessionValues.Operation.Name) : "",
                 this.sessionValues.Resource != null ? HttpUtility.JavaScriptStringEncode(this.sessionValues.Resource.Name) : "",
                 this.sessionValues.Workstation != null ? HttpUtility.JavaScriptStringEncode(this.sessionValues.Workstation.Name) : "");

            }
	        else
	        {
		        setLineAssignmentScript += "window.parent.__page.refreshHeader();";
	        }

	        ScriptManager.RegisterStartupScript(Page.Form, GetType(), "OnRefreshHeader", setLineAssignmentScript, true);
        }

        private SessionValuesChanges sessionValues;
        protected virtual void SetLineAssigment()
        {
            bool dontShowAgain = (bool)DontShowAgainChk.Data;
            ShowAgainExecute(!dontShowAgain);

            EmployeeMaint maint = new EmployeeMaint();
            GetInputData(maint);
            this.sessionValues = maint.ObjectChanges != null
                ? maint.ObjectChanges.SessionValues : new SessionValuesChanges();
            SaveSettings();
        }

        protected virtual void ResetLineAssigment()
        {
            RestoreDefaultLineAssignment();
        }

        protected virtual void SaveSettings()
        {
            UIComponentDataContract contract = Page.SessionDataContract;
            contract.SetValueByName(DataMemberConstants.WorkCenter, this.sessionValues.WorkCenter);
            contract.SetValueByName(DataMemberConstants.Resource, this.sessionValues.Resource);
            contract.SetValueByName(DataMemberConstants.Operation, this.sessionValues.Operation);
            contract.SetValueByName(DataMemberConstants.WorkStation, this.sessionValues.Workstation);
            SetActiveSmartScanRule();
        }

        protected virtual void StoreDefaultLineAssignment()
        {
            var contract = Page.SessionDataContract;
            Page.Session["LineAssignmentDefaultValues"] = new LineAssignmentDefaultValues(
                contract.GetValueByName(DataMemberConstants.WorkCenter),
                contract.GetValueByName(DataMemberConstants.Resource),
                contract.GetValueByName(DataMemberConstants.Operation),
                contract.GetValueByName(DataMemberConstants.WorkStation));
        }

        protected virtual void RestoreDefaultLineAssignment()
        {
            if (Page.Session["LineAssignmentDefaultValues"] != null)
            {
                var defaultValues = (LineAssignmentDefaultValues)Page.Session["LineAssignmentDefaultValues"];
                Workcenter.Data = defaultValues.WorkCenter;
                Operation.Data = defaultValues.Operation;
                ResourceWorkcell.Data = defaultValues.Resource;
                Workstation.Data = defaultValues.WorkStation;
            }
        }

        protected virtual void SetActiveSmartScanRule()
        {
            var contract = Page.SessionDataContract;
            var factoryRef = contract.GetValueByName(DataMemberConstants.Factory) as NamedObjectRef;
            var resourceRef = contract.GetValueByName(DataMemberConstants.Resource) as NamedObjectRef;
            string factory = factoryRef != null ? factoryRef.Name : string.Empty;
            string resource = resourceRef != null ? resourceRef.Name : string.Empty;

            FrameworkSession session = FrameworkManagerUtil.GetFrameworkSession(Page.Session);
            session.SetActiveSmartScanRule(factory, resource);
        }

        private struct LineAssignmentDefaultValues
        {
            public LineAssignmentDefaultValues(object workcenter, object resource, object operation, object workstation)
            {
                WorkCenter = workcenter;
                Resource = resource;
                Operation = operation;
                WorkStation = workstation;
            }
            public readonly object WorkCenter;
            public readonly object Resource;
            public readonly object Operation;
            public readonly object WorkStation;
        }

        protected virtual CWC.CheckBox DontShowAgainChk
        {
            get { return FindControl("chkDontShowAgain") as CWC.CheckBox; }
        }
        protected virtual NamedObject Workcenter { get { return Page.FindCamstarControl("Control_Workcenter") as NamedObject; } }
        protected virtual NamedObject ResourceWorkcell { get { return Page.FindCamstarControl("Control_ResourceWorkcell") as NamedObject; } }
        protected virtual NamedObject Operation { get { return Page.FindCamstarControl("Control_Operation") as NamedObject; } }
        protected virtual NamedObject Workstation { get { return Page.FindCamstarControl("Control_Workstation") as NamedObject; } }
    }
}
