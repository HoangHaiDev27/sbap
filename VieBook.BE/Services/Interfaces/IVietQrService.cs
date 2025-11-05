using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IVietQrService
    {
        Task<List<SupportedBankDTO>> GetSupportedBanksAsync();
        Task<VietQrResponseDTO> GenerateQRCodeAsync(VietQrRequestDTO request);
    }
}

