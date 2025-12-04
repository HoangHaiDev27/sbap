using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using DataAccess;

namespace Services.Implementations
{
    public class BookClaimService : IBookClaimService
    {
        private readonly IBookClaimRepository _bookClaimRepository;
        private readonly IBookOfferRepository _bookOfferRepository;
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly IMapper _mapper;
        private readonly VieBookContext _context;

        public BookClaimService(
            IBookClaimRepository bookClaimRepository,
            IBookOfferRepository bookOfferRepository,
            IOrderItemRepository orderItemRepository,
            IMapper mapper,
            VieBookContext context)
        {
            _bookClaimRepository = bookClaimRepository;
            _bookOfferRepository = bookOfferRepository;
            _orderItemRepository = orderItemRepository;
            _mapper = mapper;
            _context = context;
        }

        public async Task<BookClaimDTO?> GetByIdAsync(long claimId)
        {
            var bookClaim = await _bookClaimRepository.GetByIdAsync(claimId);
            if (bookClaim == null) return null;
            return _mapper.Map<BookClaimDTO>(bookClaim);
        }

        public async Task<List<BookClaimDTO>> GetByBookOfferIdAsync(long bookOfferId)
        {
            var bookClaims = await _bookClaimRepository.GetByBookOfferIdAsync(bookOfferId);
            return _mapper.Map<List<BookClaimDTO>>(bookClaims);
        }

        public async Task<List<BookClaimDTO>> GetByCustomerIdAsync(int customerId)
        {
            var bookClaims = await _bookClaimRepository.GetByCustomerIdAsync(customerId);
            return _mapper.Map<List<BookClaimDTO>>(bookClaims);
        }

        public async Task<List<BookClaimDTO>> GetByStatusAsync(string status)
        {
            var bookClaims = await _bookClaimRepository.GetByStatusAsync(status);
            return _mapper.Map<List<BookClaimDTO>>(bookClaims);
        }

        public async Task<BookClaimDTO> CreateAsync(CreateBookClaimDTO createDto, int customerId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Check if user has already made a claim
                var hasClaimed = await _bookClaimRepository.HasUserClaimedAsync(createDto.BookOfferId, customerId);
                if (hasClaimed)
                    throw new Exception("You have already made a request for this offer");

                // Check the offer
                var bookOffer = await _bookOfferRepository.GetByIdAsync(createDto.BookOfferId);
                if (bookOffer == null)
                    throw new Exception("Offer not found");

                if (bookOffer.Status != "Active")
                    throw new Exception("Đã đạt giới hạn đăng kí");

                if (bookOffer.EndAt.HasValue && bookOffer.EndAt < DateTime.UtcNow)
                    throw new Exception("Đã hết thời hạn đăng ký");

                // Check the number of claims (all are now auto-approved)
                var claimCount = await _bookOfferRepository.GetClaimCountAsync(createDto.BookOfferId);
                if (claimCount >= bookOffer.Quantity)
                    throw new Exception("Đã hết số lượng đăng ký");

                var bookClaim = _mapper.Map<BookClaim>(createDto);
                bookClaim.CustomerId = customerId;
                bookClaim.Status = "Approved"; // Auto-approve immediately
                bookClaim.CreatedAt = DateTime.UtcNow;
                bookClaim.ProcessedAt = DateTime.UtcNow;
                bookClaim.ProcessedBy = null; // Auto-approved, no processor

                // If ChapterId is not provided, use the one from the offer
                if (!bookClaim.ChapterId.HasValue && bookOffer.ChapterId.HasValue)
                {
                    bookClaim.ChapterId = bookOffer.ChapterId;
                }

                // If AudioId is not provided, use the one from the offer
                if (!bookClaim.AudioId.HasValue && bookOffer.AudioId.HasValue)
                {
                    bookClaim.AudioId = bookOffer.AudioId;
                }

                // Create the claim
                var created = await _bookClaimRepository.CreateAsync(bookClaim);

                // Create OrderItems with price 0 immediately
                var chapterId = bookClaim.ChapterId ?? bookOffer.ChapterId;
                var audioId = bookClaim.AudioId ?? bookOffer.AudioId;

                if (chapterId.HasValue)
                {
                    var orderItems = new List<OrderItem>();

                    // Create OrderItem according to offer's AccessType
                    if (bookOffer.AccessType == "Soft" || bookOffer.AccessType == "Both")
                    {
                        orderItems.Add(new OrderItem
                        {
                            CustomerId = bookClaim.CustomerId,
                            ChapterId = chapterId.Value,
                            UnitPrice = 0,
                            CashSpent = 0,
                            PaidAt = DateTime.UtcNow,
                            OrderType = "BuyChapterSoft"
                        });
                    }

                    if ((bookOffer.AccessType == "Audio" || bookOffer.AccessType == "Both") && audioId.HasValue)
                    {
                        orderItems.Add(new OrderItem
                        {
                            CustomerId = bookClaim.CustomerId,
                            ChapterId = chapterId.Value,
                            UnitPrice = 0,
                            CashSpent = 0,
                            PaidAt = DateTime.UtcNow,
                            OrderType = "BuyChapterAudio"
                        });
                    }

                    if (orderItems.Any())
                    {
                        await _orderItemRepository.CreateOrderItemsAsync(orderItems);
                    }
                }

                await transaction.CommitAsync();
                return _mapper.Map<BookClaimDTO>(created);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<BookClaimDTO> UpdateAsync(long claimId, UpdateBookClaimDTO updateDto, int? processedBy)
        {
            var bookClaim = await _bookClaimRepository.GetByIdAsync(claimId);
            if (bookClaim == null)
                throw new Exception("Claim not found");

            if (!string.IsNullOrEmpty(updateDto.Status))
            {
                bookClaim.Status = updateDto.Status;
                bookClaim.ProcessedAt = DateTime.UtcNow;
                bookClaim.ProcessedBy = processedBy;
            }

            if (!string.IsNullOrEmpty(updateDto.Note))
                bookClaim.Note = updateDto.Note;

            var updated = await _bookClaimRepository.UpdateAsync(bookClaim);
            return _mapper.Map<BookClaimDTO>(updated);
        }

        public async Task<bool> DeleteAsync(long claimId, int customerId)
        {
            var bookClaim = await _bookClaimRepository.GetByIdAsync(claimId);
            if (bookClaim == null)
                return false;

            if (bookClaim.CustomerId != customerId)
                throw new UnauthorizedAccessException("Not authorized to delete this claim");

            return await _bookClaimRepository.DeleteAsync(claimId);
        }

        public async Task<bool> ApproveClaimAsync(long claimId, int? processedBy)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var bookClaim = await _bookClaimRepository.GetByIdAsync(claimId);
                if (bookClaim == null)
                    throw new Exception("Claim not found");

                if (bookClaim.Status != "Pending")
                    throw new Exception("This claim has already been processed");

                var bookOffer = await _bookOfferRepository.GetByIdAsync(bookClaim.BookOfferId);
                if (bookOffer == null)
                    throw new Exception("Offer not found");

                // Check the number of approved claims
                var approvedCount = await _bookOfferRepository.GetApprovedClaimCountAsync(bookOffer.BookOfferId);
                if (approvedCount >= bookOffer.Quantity)
                    throw new Exception("This offer is full");

                // Update the claim status
                bookClaim.Status = "Approved";
                bookClaim.ProcessedAt = DateTime.UtcNow;
                bookClaim.ProcessedBy = processedBy;
                await _bookClaimRepository.UpdateAsync(bookClaim);

                // Create OrderItems with price 0
                var chapterId = bookClaim.ChapterId ?? bookOffer.ChapterId;
                var audioId = bookClaim.AudioId ?? bookOffer.AudioId;

                if (chapterId.HasValue)
                {
                    var orderItems = new List<OrderItem>();

                    // Create OrderItem according to offer's AccessType
                    if (bookOffer.AccessType == "Soft" || bookOffer.AccessType == "Both")
                    {
                        orderItems.Add(new OrderItem
                        {
                            CustomerId = bookClaim.CustomerId,
                            ChapterId = chapterId.Value,
                            UnitPrice = 0,
                            CashSpent = 0,
                            PaidAt = DateTime.UtcNow,
                            OrderType = "BuyChapterSoft"
                        });
                    }

                    if ((bookOffer.AccessType == "Audio" || bookOffer.AccessType == "Both") && audioId.HasValue)
                    {
                        orderItems.Add(new OrderItem
                        {
                            CustomerId = bookClaim.CustomerId,
                            ChapterId = chapterId.Value,
                            UnitPrice = 0,
                            CashSpent = 0,
                            PaidAt = DateTime.UtcNow,
                            OrderType = "BuyChapterAudio"
                        });
                    }

                    if (orderItems.Any())
                    {
                        await _orderItemRepository.CreateOrderItemsAsync(orderItems);
                    }
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> HasUserClaimedAsync(long bookOfferId, int customerId)
        {
            return await _bookClaimRepository.HasUserClaimedAsync(bookOfferId, customerId);
        }
    }
}

