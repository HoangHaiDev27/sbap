using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendEmailAsync(string to, string? cc, string subject, string body, string? attachmentPath = null);
    }
}
