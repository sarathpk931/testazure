using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Xerox.Wnc.Resources
{
    public static class Copyright
    {
        public const string CopyrightYears = "2023";

        public static string GetCopyrightText(string years = CopyrightYears)
        {
            return string.Format(ResourceWrapper.GetString("SDE_COPYRIGHT_FMTSTR_XEROX"), years);
        }
    }
}
