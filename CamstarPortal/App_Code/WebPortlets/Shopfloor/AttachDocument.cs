// Copyright Siemens 2019  
using System;
using System.Collections.Generic;
using System.Web;
using MDL = Camstar.WebPortal.WebPortlets.Modeling; 
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.FormsFramework.Utilities;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.Personalization;
using CamstarPortal.WebControls;
using Camstar.WCF.Services;
using System.Collections;
using Camstar.WebPortal.WCFUtilities;
using Camstar.WCF.ObjectStack;
using System.IO;
using System.Linq;
using OS = Camstar.WCF.ObjectStack;
using System.Web.UI;


namespace Camstar.WebPortal.WebPortlets.Shopfloor
{
	public class AttachDocument : MatrixWebPart
	{

		#region Properties

        protected virtual CWC.FileInput UploadField 
		{ 
			get { return Page.FindCamstarControl("DocumentPath") as CWC.FileInput; } 
		} // UploadField 

        protected virtual CWC.TextBox DocRevision
		{
			get { return Page.FindCamstarControl("AttachDocument_DocumentRevision") as CWC.TextBox; }
		} // DocRevision

        protected virtual CWC.TextBox DocName
		{
			get { return Page.FindCamstarControl("AttachDocument_DocumentName") as CWC.TextBox; }
		} // DocName

        protected virtual CWC.TextBox DocDescription
		{
			get { return Page.FindCamstarControl("AttachDocument_DocumentDescription") as CWC.TextBox; }
		} // DocDescription

        protected virtual CWC.RadioButton RadioBtn_NewDocNOReuse
		{
			get { return Page.FindCamstarControl("RadioBtn_AttachDocument_NewDocumentNOReuse") as CWC.RadioButton; }
		} // RadioBtn_NewDocNOReuse

        protected virtual CWC.RadioButton RadioBtn_NewDocReuse
		{
			get { return Page.FindCamstarControl("RadioBtn_AttachDocument_NewDocumentReuse") as CWC.RadioButton; }
		} // RadioBtn_NewDocReuse

        protected virtual CWC.RadioButton RadioBtn_ExistingDoc
		{
			get { return Page.FindCamstarControl("RadioBtn_AttachDocument_Existing") as CWC.RadioButton; }
		} // RadioBtn_ExistingDoc

        protected virtual CWC.DropDownList AttachmentType
		{
			get { return Page.FindCamstarControl("AttachDocument_AttachmentType") as CWC.DropDownList; }
		} // AttachmentType

        protected virtual CWC.TextBox StoredFileNameField
        {
			get { return Page.FindCamstarControl("AttachDocument_AttachedFileName") as CWC.TextBox; }
        } // StoredFileNameField

        protected virtual CWC.NamedObject NDOInstanceField
		{
			get { return Page.FindCamstarControl("AttachDocument_NDO") as CWC.NamedObject; }
		} // NDOInstanceField

        protected virtual CWC.RevisionedObject RDOInstanceField
		{
			get { return Page.FindCamstarControl("AttachDocument_RDO") as CWC.RevisionedObject; }
		} // RDOInstanceField

        protected virtual CWC.ContainerList ContainerField
		{
			get { return Page.FindCamstarControl("AttachDocument_Container") as CWC.ContainerList; }
		} // ContainerField

        protected virtual CWC.CheckBox IsRDOField
		{
			get { return Page.FindCamstarControl("AttachDocument_IsRDO") as CWC.CheckBox; }
		} // IsRDOField

        protected virtual CWC.CheckBox IsContainerField
		{
			get { return Page.FindCamstarControl("AttachDocument_IsContainer") as CWC.CheckBox; }
		} // IsContainerField

        protected virtual CWC.CheckBox IsNDOField
		{
			get { return Page.FindCamstarControl("AttachDocument_IsNDO") as CWC.CheckBox; }
		} // IsNDOField

        protected virtual CWC.DropDownList ObjectTypeField
		{
			get { return Page.FindCamstarControl("AttachDocument_ObjectType") as CWC.DropDownList; }
		} // ObjectTypeField

        protected virtual CWC.RevisionedObject DocumentInstanceField
		{
			get { return Page.FindCamstarControl("AttachDocument_DocumentInstance") as CWC.RevisionedObject; }
		} // DocumentInstanceField

        protected virtual CWC.Button ViewDocumentButton
		{
			get { return Page.FindCamstarControl("ViewDocumentButton") as CWC.Button; }
		} //DocumentActionsButton

        protected virtual CWC.CheckBox CalledExternallyField
		{
			get { return Page.FindCamstarControl("AttachDocument_CalledExternally") as CWC.CheckBox; }
		} // CalledExternallyField

        protected virtual CWC.TextBox ServiceTypeNameField
        {
			get { return Page.FindCamstarControl("AttachDocument_ServiceTypeName") as CWC.TextBox; }
        } // ServiceTypeNameField

        protected virtual ContainerListGrid HiddenContainer
		{
			get { return Page.FindCamstarControl("HiddenSelectedContainer") as ContainerListGrid; }
		} // ServiceTypeNameField

        protected virtual CWC.CheckBox AttachAsRORField
		{
			get { return Page.FindCamstarControl("AttachDocument_AttachAsROR") as CWC.CheckBox; }
		} // AttachAsRORField

        protected virtual CWC.TextBox CommentsField
		{
            get { return Page.FindCamstarControl("AttachDocument_Comments") as CWC.TextBox; }
		} // CommentsField

	    protected virtual CWC.CheckBox IsPackageField
	    {
	        get { return Page.FindCamstarControl("AttachDocument_IsPackage") as CWC.CheckBox; }
	    } // IsPackageField

	    protected virtual CWC.NamedObject PackageField
	    {
            get { return Page.FindCamstarControl("CSICDOName_ChangePackage") as CWC.NamedObject; }
	    } // PackageField

	    protected virtual Personalization.UIAction SubmitAction
	    {
            get { return Page.ActionDispatcher.PageActions().FirstOrDefault(x => x.Name.Equals("Submit")); }
	    }

		#endregion


		#region Private Member Variables

		private DirectoryInfo _folder = null;
		private FileInfo _file = null;		

		#endregion


		#region methods

		protected override void OnLoad(EventArgs e)
		{
			base.OnLoad(e);			

			RadioBtn_NewDocNOReuse.DataChanged += new EventHandler(RadioBtn_NewDocNOReuse_DataChanged);
			RadioBtn_ExistingDoc.DataChanged += new EventHandler(RadioBtn_ExistingDoc_DataChanged);
			RadioBtn_NewDocReuse.DataChanged += new EventHandler(RadioBtn_NewDocReuse_DataChanged);
			ViewDocumentButton.Click += new EventHandler(ViewDocumentButton_Click);
			DocumentInstanceField.DataChanged += new EventHandler(DocumentInstanceField_DataChanged);

		    if (IsPackageField.IsChecked)
		    {
		        InitAttachToPackageData();
		    }

			if (Page.Request.Form["__EVENTARGUMENT"] == null)
			{

				NDOInstanceField.Hidden = true;
				RDOInstanceField.Hidden = true;
				ContainerField.Hidden = true;

				if (CalledExternallyField.IsChecked == true)
				{
					ObjectTypeField.Hidden = true;
					NDOInstanceField.Hidden = true;
					RDOInstanceField.Hidden = true;
					ContainerField.Hidden = true;
					NDOInstanceField.Enabled = false;
					RDOInstanceField.Enabled = false;
					ContainerField.Enabled = false;
				}

				if (IsNDOField.IsChecked == true)
				{
					NDOInstanceField.Hidden = false;				
				}

				if (IsRDOField.IsChecked == true)
				{
					RDOInstanceField.Hidden = false;
				}

				if (IsContainerField.IsChecked == true)
				{
					ContainerField.Hidden = false;
				}

			}			
            
		}


		protected override void OnPreRender(EventArgs e)
		{
			base.OnPreRender(e);

			if (HiddenContainer.TextEditControl.Text.Length > 0)
			{
				IsContainerField.IsChecked = true;
				CalledExternallyField.IsChecked = true;

				IsContainerField.CheckControl.Checked = true;
				CalledExternallyField.CheckControl.Checked = true;
			}

		    SubmitAction.IsControlDisabled = ObjectTypeField.IsEmpty && !CalledExternallyField.IsChecked;
		}

	    protected virtual void DocumentInstanceField_DataChanged(object sender, EventArgs e)
		{

			if (DocumentInstanceField.TextEditControl.Text.Length > 0)
			{
				ViewDocumentButton.Enabled = true;
			}
			
		}
        
        protected virtual void ViewDocumentButton_Click(object sender, EventArgs e)
		{
			var docInfo = DownloadDocument();
            if (docInfo != null && !string.IsNullOrEmpty(docInfo.FileName))
			{
                var src = docInfo.IsRemote
                    ? string.Format("OpenDocumentUrl('{0}','{1}','');", JavascriptUtil.ConvertForJavascript(docInfo.URI), docInfo.AuthenticationType)
                    : string.Format("window.open('DownloadFile.aspx?viewdocfile={0}');", docInfo.FileName);
                StoredFileNameField.Data = docInfo.FileName;
                ScriptManager.RegisterStartupScript(this, Page.GetType(), "opendocument", src, true);
                StoredFileNameField.ClearData();   
			}
		}


        protected virtual void RadioBtn_NewDocReuse_DataChanged(object sender, EventArgs e)
		{
			if (RadioBtn_NewDocReuse.RadioControl.Checked)
			{
				RadioBtn_NewDocNOReuse.RadioControl.Checked = false;
				RadioBtn_ExistingDoc.RadioControl.Checked = false;
				AttachmentType.Data = (int)AttachmentTypeEnum.NewDocumentReuse;
				AttachAsRORField.Visible = true;
				DocRevision.Visible = true;				
				UploadField.Visible = true;
				DocName.Visible = true;
				DocDescription.Visible = true;
				DocumentInstanceField.ClearData();
				DocumentInstanceField.Visible = false;
				StoredFileNameField.ClearData();
				ViewDocumentButton.Enabled = false;
				ViewDocumentButton.Visible = false;
			}
		}


        protected virtual void RadioBtn_ExistingDoc_DataChanged(object sender, EventArgs e)
		{
			if (RadioBtn_ExistingDoc.RadioControl.Checked)
			{
				RadioBtn_NewDocNOReuse.RadioControl.Checked = false;
				RadioBtn_NewDocReuse.RadioControl.Checked = false;
				AttachmentType.Data = (int)AttachmentTypeEnum.ExistingDocument;
				AttachAsRORField.ClearData();
				AttachAsRORField.Visible = false;
				DocRevision.ClearData();
				DocRevision.Visible = false;				
				UploadField.Visible = false;
				DocName.ClearData();
				DocName.Visible = false;				
				DocDescription.ClearData();				
				DocDescription.Visible = false;
				DocumentInstanceField.Visible = true;
				StoredFileNameField.ClearData();
				ViewDocumentButton.Visible = true;
              //  ViewDocumentButton.Enabled = true;
			}
		}


        protected virtual void RadioBtn_NewDocNOReuse_DataChanged(object sender, EventArgs e)
		{
			if (RadioBtn_NewDocNOReuse.RadioControl.Checked)
			{

				RadioBtn_NewDocReuse.RadioControl.Checked = false;
				RadioBtn_ExistingDoc.RadioControl.Checked = false;
				AttachmentType.Data = (int)AttachmentTypeEnum.NewDocumentNOReuse;
				AttachAsRORField.ClearData();
				AttachAsRORField.Visible = false;
				DocRevision.ClearData();
				DocRevision.Visible = false;
				UploadField.Visible = true;
				DocName.Visible = true;
				DocDescription.Visible = true;
				DocumentInstanceField.ClearData();
				DocumentInstanceField.Visible = false;
				StoredFileNameField.ClearData();
				ViewDocumentButton.Enabled = false;
				ViewDocumentButton.Visible = false;
			}
		}


		public override void GetInputData(Service serviceData)
		{
			base.GetInputData(serviceData);
			

			if (!UploadField.IsEmpty) 
			{
				StoredFileNameField.Data = new FileInfo((string)UploadField.Data).Name;

			    string configFolder = CamstarPortalSection.Settings.DefaultSettings.UploadDirectory;
			    if (Directory.Exists(configFolder))
			        _folder = new DirectoryInfo(configFolder);

			    string fileName = (string)StoredFileNameField.Data;
			    if (_folder != null)
				{
					((OS.AttachDocument)serviceData).FilePath = _folder.FullName; //File Location
				
					_file = new FileInfo(_folder.FullName + "\\" + fileName);
					if (_file != null)
					{
						((OS.AttachDocument)serviceData).AttachedFileName = _file.Name;
						((OS.AttachDocument)serviceData).AttachedFileExtension = _file.Extension;
					}						
				}
				((OS.AttachDocument)serviceData).Identifier = (string)UploadField.Data;
				
			}

			if (ContainerField.Data != null || NDOInstanceField.Data != null || RDOInstanceField.Data != null)
			{
				// Extract the corresponding information to save

				// for Container
				if (IsContainerField.CheckControl.Checked == true)
				{
					((OS.AttachDocument)serviceData).InstanceName = ((ContainerRef)ContainerField.Data).Name;
					((OS.AttachDocument)serviceData).ContainerInstance = (ContainerRef)ContainerField.Data;
                   
				}

				// for NDO
				if (IsNDOField.CheckControl.Checked == true)
				{
					((OS.AttachDocument)serviceData).InstanceName = ((NamedObjectRef)NDOInstanceField.Data).Name;
				}

				// for RDO
				if (IsRDOField.CheckControl.Checked == true)
				{
					((OS.AttachDocument)serviceData).InstanceName = ((RevisionedObjectRef)RDOInstanceField.Data).Name;
					((OS.AttachDocument)serviceData).InstanceRevision = ((RevisionedObjectRef)RDOInstanceField.Data).Revision;
					((OS.AttachDocument)serviceData).InstanceIsROR = ((RevisionedObjectRef)RDOInstanceField.Data).RevisionOfRecord;
				}						
			}

		}

		public override void PostExecute(ResultStatus status, Service serviceData)
		{
			base.PostExecute(status, serviceData);

			if (status.IsSuccess)
			{
				ClearObjects();
			}
		}


		#endregion


		#region functions

        protected virtual void ClearObjects()
		{
			RadioBtn_NewDocReuse.RadioControl.Checked = false;
			RadioBtn_ExistingDoc.RadioControl.Checked = false;
			RadioBtn_NewDocNOReuse.RadioControl.Checked = false;
			AttachAsRORField.Visible = false;
			DocRevision.Visible = false;
			UploadField.Visible = false;
			DocName.Visible = false;
			DocDescription.Visible = false;
			DocumentInstanceField.Visible = false;
			ViewDocumentButton.Visible = false;
            ContainerField.Hidden = true;
            RDOInstanceField.Hidden = true;
            NDOInstanceField.Hidden = true;
            
            
			AttachmentType.ClearData();
			AttachAsRORField.ClearData();
			DocRevision.ClearData();
			DocName.ClearData();			
			DocDescription.ClearData();			
			DocumentInstanceField.ClearData();			
			StoredFileNameField.ClearData();
			ObjectTypeField.ClearData();
			ObjectTypeField.ClearSelectionValues();
            ContainerField.ClearData();
            RDOInstanceField.ClearData();
            NDOInstanceField.ClearData();
            CommentsField.ClearData();
            UploadField.ClearData();

		}

        protected virtual void ClearDataValues()
        {
            RadioBtn_NewDocReuse.RadioControl.Checked = false;
            RadioBtn_ExistingDoc.RadioControl.Checked = false;
            RadioBtn_NewDocNOReuse.RadioControl.Checked = false;
            AttachAsRORField.Visible = false;
            DocRevision.Visible = false;
            UploadField.Visible = false;
            DocName.Visible = false;
            DocDescription.Visible = false;
            DocumentInstanceField.Visible = false;
            ViewDocumentButton.Visible = false;

            AttachAsRORField.ClearData();
            DocRevision.ClearData();
            DocName.ClearData();
            DocDescription.ClearData();
            DocumentInstanceField.ClearData();
            StoredFileNameField.ClearData();
            CommentsField.ClearData();
            UploadField.ClearData();

            if (IsPackageField.IsChecked)
            {
                InitAttachToPackageData();
            }
        }


        public override void WebPartCustomAction(object sender, CustomActionEventArgs e)
        {
            base.WebPartCustomAction(sender, e);

            if (e.Action.Name == "ClearAction")
            {
                ClearDataValues();
            }
        }

	    protected virtual DocumentRefInfo DownloadDocument()
	    {
	        ResultStatus resultStatus;
	        var documentRev = GetRevObjectRef();
	        
            var session = FrameworkManagerUtil.GetFrameworkSession(HttpContext.Current.Session);
	        var configFolder = CamstarPortalSection.Settings.DefaultSettings.UploadDirectory;
	        var labelCache = LabelCache.GetRuntimeCacheInstance();
            var label = labelCache.GetLabelByName("Lbl_SharedFolderDoesntExists");
            var message = string.Format(label != null ? label.Value : "Shared folder '{0}' does not exist.", configFolder);
	        var docInfo = AttachmentExecutor.DownloadDocumentRef(documentRev, session.CurrentUserProfile, message, out resultStatus);
	        if (!resultStatus.IsSuccess)
	        {
	            Page.DisplayMessage(resultStatus);
	            docInfo = null;
	        }
	        return docInfo;
	    }

	    protected virtual RevisionedObjectRef GetRevObjectRef()
		{
			{
				var nameTxt = ((RevisionedObjectRef)(DocumentInstanceField.Data)).Name; 
				var revTxt = ((RevisionedObjectRef)(DocumentInstanceField.Data)).Revision;  
				var isROR = ((RevisionedObjectRef)(DocumentInstanceField.Data)).RevisionOfRecord;
				if (!string.IsNullOrEmpty(nameTxt))
				{
					var name = nameTxt== null ? "" : nameTxt.ToString();
					var rev = revTxt == null ? "" : revTxt.ToString();
					bool useROR = isROR == null ? false : (bool)isROR;
					return WSObjectRef.AssignRevisionedObject(name, rev, useROR, "Document");
				}
			}
			return null;
		}

        protected virtual void InitAttachToPackageData()
	    {
            CalledExternallyField.Data = true;
            ServiceTypeNameField.Data = "ChangePackageHeader";
            IsNDOField.Data = true;
            // Set InstanceName value
            NDOInstanceField.Data = PackageField.Data;
            // Hide AttachDocument_NDO control element
            NDOInstanceField.Visible = false;
            // Set default radio button value
            if (!RadioBtn_ExistingDoc.RadioControl.Checked)
            {
                RadioBtn_ExistingDoc.RadioControl.Checked = true;
                RadioBtn_ExistingDoc_DataChanged(RadioBtn_ExistingDoc, null);
            }
	    }

	#endregion


	}
}
