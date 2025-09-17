using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.PayOs
{
    public record Response(
    int error,
    String message,
    object? data
);
}