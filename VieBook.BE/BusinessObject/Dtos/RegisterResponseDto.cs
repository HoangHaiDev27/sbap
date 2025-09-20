using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class RegisterResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public bool RequiresEmailConfirmation { get; set; }
    }
}
