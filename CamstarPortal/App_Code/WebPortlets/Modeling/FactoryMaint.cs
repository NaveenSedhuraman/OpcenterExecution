//Copyright Siemens 2019  
using System;
using System.Text;
using CWC = Camstar.WebPortal.FormsFramework.WebControls;
using Camstar.WCF.ObjectStack;

namespace Camstar.WebPortal.WebPortlets.Modeling
{

    /// <summary>
    /// TODO: Add a Summary description for this Camstar Web Part
    /// </summary>
    public class FactoryMaint : MatrixWebPart
    {
	    #region Controls

        protected virtual CWC.CheckBox ShouldDisplayGeneralMessage
        {
            get { return Page.FindCamstarControl( "ObjectChanges_DisplayGeneralMessage" ) as CWC.CheckBox; }
        }

        protected virtual CWC.TextEditor GeneralMessage
        {
            get { return Page.FindCamstarControl( "GeneralMessageTextEditor" ) as CWC.TextEditor; }
        }

        #endregion

        #region Protected Functions

        #endregion

        #region Public Functions

        public override void GetInputData ( Service serviceData )
        {
            if ( ShouldDisplayGeneralMessage.CheckControl.Checked )
            {
                try
                {
                    char[] buffer = GeneralMessage.TextControl.Text.ToCharArray();
                    StringBuilder sb = new StringBuilder();

                    bool inTag = false;
                    for ( int i = 0; i < buffer.Length; i++ )
                    {
                        if ( buffer[i].Equals( '<' ) )
                            inTag = true;

                        if ( !inTag )
                            sb.Append( buffer[i] );

                        if ( buffer[i].Equals( '>' ) )
                            inTag = false;

                    }

                    string s = sb.ToString();

                    if ( sb.ToString().Equals( "" ) )
                        GeneralMessage.Data = null;
                }
                catch ( Exception ) { }
            }            
            
            base.GetInputData( serviceData );
        }

        #endregion
    }

}

