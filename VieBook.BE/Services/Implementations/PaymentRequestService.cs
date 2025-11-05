using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System.Text.RegularExpressions;
using System.Linq;

namespace Services.Implementations
{
    public class PaymentRequestService : IPaymentRequestService
    {
        private readonly IPaymentRequestRepository _paymentRequestRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;
        private readonly IVietQrService _vietQrService;

        public PaymentRequestService(
            IPaymentRequestRepository paymentRequestRepository,
            IUserRepository userRepository,
            INotificationService notificationService,
            IVietQrService vietQrService)
        {
            _paymentRequestRepository = paymentRequestRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
            _vietQrService = vietQrService;
        }

        public async Task<PaymentRequestResponseDTO> CreatePaymentRequestAsync(int userId, CreatePaymentRequestDTO createDto)
        {
            // Kiểm tra số dư trước khi trừ
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            if (user.Wallet < createDto.RequestedCoin)
            {
                throw new Exception("Số dư xu không đủ để thực hiện giao dịch");
            }

            // Trừ xu từ wallet của user
            await _userRepository.UpdateWalletBalanceAsync(userId, -createDto.RequestedCoin);

            var paymentRequest = new PaymentRequest
            {
                UserId = userId,
                RequestedCoin = createDto.RequestedCoin,
                Status = "Pending",
                RequestDate = DateTime.UtcNow
            };

            var created = await _paymentRequestRepository.CreatePaymentRequestAsync(paymentRequest);
            
            // Tính số tiền nhận được sau khi trừ 10%
            var amountReceived = created.RequestedCoin * 1000m * 0.9m;

            // Tạo notification
            await _notificationService.CreateAsync(new CreateNotificationDTO
            {
                UserId = userId,
                Title = "Yêu cầu rút tiền đã được gửi",
                Body = $"Yêu cầu rút {createDto.RequestedCoin} xu (tương đương {amountReceived:N0} VNĐ) đã được gửi thành công. Yêu cầu sẽ được xử lý trong vòng 1-3 ngày làm việc.",
                Type = "WALLET_WITHDRAWAL"
            });

            return new PaymentRequestResponseDTO
            {
                PaymentRequestId = created.PaymentRequestId,
                UserId = created.UserId,
                RequestedCoin = created.RequestedCoin,
                AmountReceived = amountReceived,
                Status = created.Status,
                RequestDate = created.RequestDate,
                AcceptDate = created.AcceptDate
            };
        }

        public async Task<List<PaymentRequestResponseDTO>> GetPaymentRequestsByUserIdAsync(int userId)
        {
            var paymentRequests = await _paymentRequestRepository.GetPaymentRequestsByUserIdAsync(userId);
            
            return paymentRequests.Select(pr => new PaymentRequestResponseDTO
            {
                PaymentRequestId = pr.PaymentRequestId,
                UserId = pr.UserId,
                RequestedCoin = pr.RequestedCoin,
                AmountReceived = pr.RequestedCoin * 1000m * 0.9m, // Tính số tiền nhận được
                Status = pr.Status,
                RequestDate = pr.RequestDate,
                AcceptDate = pr.AcceptDate
            }).ToList();
        }

        public async Task<PaymentRequestResponseDTO?> GetPaymentRequestByIdAsync(long paymentRequestId)
        {
            var paymentRequest = await _paymentRequestRepository.GetPaymentRequestByIdAsync(paymentRequestId);
            
            if (paymentRequest == null)
                return null;

            return new PaymentRequestResponseDTO
            {
                PaymentRequestId = paymentRequest.PaymentRequestId,
                UserId = paymentRequest.UserId,
                RequestedCoin = paymentRequest.RequestedCoin,
                AmountReceived = paymentRequest.RequestedCoin * 1000m * 0.9m,
                Status = paymentRequest.Status,
                RequestDate = paymentRequest.RequestDate,
                AcceptDate = paymentRequest.AcceptDate
            };
        }

        public async Task<List<StaffPaymentRequestResponseDTO>> GetAllPaymentRequestsAsync()
        {
            var paymentRequests = await _paymentRequestRepository.GetAllPaymentRequestsAsync();
            
            return paymentRequests.Select(pr => new StaffPaymentRequestResponseDTO
            {
                PaymentRequestId = pr.PaymentRequestId,
                UserId = pr.UserId,
                UserName = pr.User?.UserProfile?.FullName ?? pr.User?.Email ?? "N/A",
                UserEmail = pr.User?.Email ?? "N/A",
                BankName = pr.User?.UserProfile?.BankName ?? "N/A",
                BankNumber = pr.User?.UserProfile?.BankNumber ?? "N/A",
                RequestedCoin = pr.RequestedCoin,
                AmountReceived = pr.RequestedCoin * 1000m * 0.9m,
                Status = pr.Status,
                RequestDate = pr.RequestDate,
                AcceptDate = pr.AcceptDate
            }).ToList();
        }

        public async Task<bool> ApprovePaymentRequestAsync(long paymentRequestId, int staffId)
        {
            var paymentRequest = await _paymentRequestRepository.GetPaymentRequestByIdAsync(paymentRequestId);
            if (paymentRequest == null)
                return false;

            if (paymentRequest.Status != "Pending" && paymentRequest.Status != "Processing")
                return false; // Chỉ có thể approve các request đang pending

            // Validate thông tin ngân hàng
            var userProfile = paymentRequest.User?.UserProfile;
            if (userProfile == null)
                throw new Exception("Không tìm thấy thông tin người dùng");

            var bankNumber = userProfile.BankNumber;
            var bankName = userProfile.BankName;

            // Validate số tài khoản
            if (string.IsNullOrWhiteSpace(bankNumber))
                throw new Exception("Người dùng chưa cập nhật số tài khoản. Vui lòng yêu cầu người dùng cập nhật thông tin ngân hàng.");

            // Validate format số tài khoản (chỉ chứa số, độ dài từ 8-20 ký tự)
            if (!System.Text.RegularExpressions.Regex.IsMatch(bankNumber, @"^\d{8,20}$"))
                throw new Exception("Số tài khoản không hợp lệ. Số tài khoản phải chứa từ 8-20 chữ số.");

            // Validate tên ngân hàng
            if (string.IsNullOrWhiteSpace(bankName))
                throw new Exception("Người dùng chưa cập nhật tên ngân hàng. Vui lòng yêu cầu người dùng cập nhật thông tin ngân hàng.");

            // Validate tên ngân hàng có trong danh sách supported banks
            try
            {
                var supportedBanks = await _vietQrService.GetSupportedBanksAsync();
                var isValidBank = supportedBanks.Any(bank => 
                    (bank.Name != null && bank.Name.Equals(bankName, StringComparison.OrdinalIgnoreCase)) ||
                    (bank.ShortName != null && bank.ShortName.Equals(bankName, StringComparison.OrdinalIgnoreCase)) ||
                    (bank.Name != null && bankName.Contains(bank.Name, StringComparison.OrdinalIgnoreCase)) ||
                    (bank.ShortName != null && bankName.Contains(bank.ShortName, StringComparison.OrdinalIgnoreCase))
                );

                if (!isValidBank)
                    throw new Exception($"Ngân hàng '{bankName}' không được hỗ trợ. Vui lòng yêu cầu người dùng cập nhật thông tin ngân hàng.");
            }
            catch (Exception ex)
            {
                // Nếu không thể lấy danh sách banks, chỉ log warning nhưng vẫn cho phép approve
                // (fallback để tránh block flow khi service external có vấn đề)
                Console.WriteLine($"Warning: Could not validate bank name: {ex.Message}");
            }

            var result = await _paymentRequestRepository.ApprovePaymentRequestAsync(paymentRequestId, staffId);
            
            if (result)
            {
                var amountReceived = paymentRequest.RequestedCoin * 1000m * 0.9m;
                
                // Tạo notification cho user
                await _notificationService.CreateAsync(new CreateNotificationDTO
                {
                    UserId = paymentRequest.UserId,
                    Title = "Yêu cầu rút tiền đã được duyệt",
                    Body = $"Yêu cầu rút {paymentRequest.RequestedCoin} xu (tương đương {amountReceived:N0} VNĐ) đã được duyệt và tiền đã được chuyển vào tài khoản của bạn.",
                    Type = "WALLET_WITHDRAWAL"
                });
            }

            return result;
        }

        public async Task<bool> RejectPaymentRequestAsync(long paymentRequestId, int staffId, string? reason = null)
        {
            var paymentRequest = await _paymentRequestRepository.GetPaymentRequestByIdAsync(paymentRequestId);
            if (paymentRequest == null)
                return false;

            if (paymentRequest.Status != "Pending" && paymentRequest.Status != "Processing")
                return false; // Chỉ có thể reject các request đang pending

            // Hoàn lại xu cho user
            await _userRepository.UpdateWalletBalanceAsync(paymentRequest.UserId, paymentRequest.RequestedCoin);

            var result = await _paymentRequestRepository.RejectPaymentRequestAsync(paymentRequestId, staffId, reason);
            
            if (result)
            {
                // Tạo notification cho user
                var reasonText = string.IsNullOrEmpty(reason) ? "" : $" Lý do: {reason}";
                await _notificationService.CreateAsync(new CreateNotificationDTO
                {
                    UserId = paymentRequest.UserId,
                    Title = "Yêu cầu rút tiền đã bị từ chối",
                    Body = $"Yêu cầu rút {paymentRequest.RequestedCoin} xu của bạn đã bị từ chối.{reasonText} Số xu đã được hoàn lại vào ví của bạn.",
                    Type = "WALLET_WITHDRAWAL"
                });
            }

            return result;
        }
    }
}

