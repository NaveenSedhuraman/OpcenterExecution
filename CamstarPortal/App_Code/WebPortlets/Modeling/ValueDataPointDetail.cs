// Copyright Siemens 2019  
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Web.UI;
using Camstar.WCF.ObjectStack;
using Camstar.WCF.Services;

using Camstar.WebPortal.PortalFramework;
using Camstar.WebPortal.FormsFramework;
using Camstar.WebPortal.FormsFramework.WebGridControls;
using Camstar.WebPortal.FormsFramework.Utilities;
using Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WebPortal.Utilities;
using Camstar.WebPortal.WCFUtilities;
using Camstar.WebPortal.WebPortlets;
using Camstar.WebPortal.Personalization;

using CamstarPortal.WebControls;


namespace Camstar.WebPortal.WebPortlets.Modeling
{
    public class ValueDataPointDetail : MatrixWebPart
    {
        protected string BooleanTrueState
        {
            get { return Page.SessionVariables["BooleanTrueState"] as string; }
            set { Page.SessionVariables["BooleanTrueState"] = value; }
        }

        protected string BooleanFalseState
        {
            get { return Page.SessionVariables["BooleanFalseState"] as string; }
            set { Page.SessionVariables["BooleanFalseState"] = value; }
        }

        protected virtual CheckBox MapToUserAttribute
        { get { return Page.FindCamstarControl("MapToUserAttribute") as CheckBox; } }

        protected virtual TextBox AttributeName
        { get { return Page.FindCamstarControl("AttributeName") as TextBox; } }

        protected virtual TextBox DataPointName
        { get { return Page.FindCamstarControl("DataPointName") as TextBox; } }

        protected virtual DropDownList Value_DataType
        { get { return Page.FindCamstarControl("Value_DataType") as DropDownList; } }

        protected virtual TextBox BooleanTrue
        { get { return Page.FindCamstarControl("Boolean_True") as TextBox; } }

        protected virtual TextBox BooleanFalse
        { get { return Page.FindCamstarControl("Boolean_False") as TextBox; } }


        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            AttributeName.Enabled = (bool)MapToUserAttribute.Data;
            MapToUserAttribute.DataChanged += MapToUserAttribute_DataChanged;

            if (BooleanTrue != null && BooleanFalse != null)
            {
                if (BooleanTrue.Data != null)
                    BooleanTrueState = BooleanTrue.Data.ToString();
                if (BooleanFalse.Data != null)
                    BooleanFalseState = BooleanFalse.Data.ToString();
            }

            Value_DataType.DataChanged += Value_DataType_DataChanged;

        }

        protected virtual void MapToUserAttribute_DataChanged(object sender, EventArgs e)
        {

            AttributeName.Enabled = (bool)MapToUserAttribute.Data;

            if (!AttributeName.Enabled)
                AttributeName.ClearData();

            if (AttributeName.Enabled && AttributeName.Data == null)
                AttributeName.Data = DataPointName.Data;
        }

        protected virtual void Value_DataType_DataChanged(object sender, EventArgs e)
        {
          if(BooleanTrue !=null && BooleanFalse != null)
          { 
            if (Value_DataType.GetEnumText(Value_DataType.SelectionData) == DataTypeEnum.Boolean.ToString())
            {
                BooleanTrue.Visible = true;
                BooleanFalse.Visible = true;
                BooleanTrue.Data = BooleanTrueState;
                BooleanFalse.Data = BooleanFalseState;
            }
            else
            {
                BooleanTrue.Visible = false;
                BooleanFalse.Visible = false;
                BooleanTrue.Data = null;
                BooleanFalse.Data = null;
            }
          }
        }
    }
}
