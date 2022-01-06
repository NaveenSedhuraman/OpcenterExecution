// Copyright Siemens 2019  

using Camstar.WebPortal.PortalFramework;
using Helpers;

namespace Camstar.WebPortal.WebPortlets
{
    public class MatrixWebPartM : MatrixWebPartBase
    {
        protected override IMatrixBuilder MatrixBuilder
        {
            get { return _matrixBuilder; }
        }

        IMatrixBuilder _matrixBuilder = new DivLayoutBuilder();
    }
}
