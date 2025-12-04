using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class VerifyEmailRequestDto
    {
        public string Token { get; set; } = null!;
    }
}
