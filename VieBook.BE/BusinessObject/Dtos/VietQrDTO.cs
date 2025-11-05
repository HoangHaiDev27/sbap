namespace BusinessObject.Dtos
{
    public class VietQrRequestDTO
    {
        public string AccountNo { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public string AcqId { get; set; } = null!;
        public decimal Amount { get; set; }
        public string AddInfo { get; set; } = null!;
    }

    public class VietQrResponseDTO
    {
        public string? QrDataURL { get; set; }
        public string? Message { get; set; }
        public bool Success { get; set; }
    }

    public class SupportedBankDTO
    {
        public string AcqId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? ShortName { get; set; }
    }

    public class VietQrGenerateRequest
    {
        public string accountNo { get; set; } = null!;
        public string accountName { get; set; } = null!;
        public string acqId { get; set; } = null!;
        public decimal amount { get; set; }
        public string addInfo { get; set; } = null!;
        public string format { get; set; } = "text";
        public string template { get; set; } = "print";
    }

    public class VietQrGenerateResponse
    {
        public string? code { get; set; }
        public string? desc { get; set; }
        public VietQrData? data { get; set; }
    }

    public class VietQrData
    {
        public string? qrDataURL { get; set; }
        public string? qrCode { get; set; }
    }

    public class VietQrBankResponse
    {
        public string? code { get; set; }
        public string? desc { get; set; }
        public List<VietQrBankData>? data { get; set; }
    }

    public class VietQrBankData
    {
        public string? id { get; set; }
        public string? name { get; set; }
        public string? code { get; set; }
        public string? bin { get; set; }
        public string? shortName { get; set; }
        public string? logo { get; set; }
        public int? transferSupported { get; set; }
        public int? lookupSupported { get; set; }
        public string? short_name { get; set; }
        public int? support { get; set; }
        public int? isTransfer { get; set; }
        public string? swift_code { get; set; }
    }
}

