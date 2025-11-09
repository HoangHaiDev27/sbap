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
                // Vérifier si l'utilisateur a déjà fait une demande
                var hasClaimed = await _bookClaimRepository.HasUserClaimedAsync(createDto.BookOfferId, customerId);
                if (hasClaimed)
                    throw new Exception("Vous avez déjà fait une demande pour cette offre");

                // Vérifier l'offre
                var bookOffer = await _bookOfferRepository.GetByIdAsync(createDto.BookOfferId);
                if (bookOffer == null)
                    throw new Exception("Offre non trouvée");

                if (bookOffer.Status != "Active")
                    throw new Exception("Cette offre n'est plus active");

                if (bookOffer.EndAt.HasValue && bookOffer.EndAt < DateTime.UtcNow)
                    throw new Exception("Cette offre a expiré");

                // Vérifier le nombre de claims (tous sont maintenant auto-approuvés)
                var claimCount = await _bookOfferRepository.GetClaimCountAsync(createDto.BookOfferId);
                if (claimCount >= bookOffer.Quantity)
                    throw new Exception("Cette offre est complète");

                var bookClaim = _mapper.Map<BookClaim>(createDto);
                bookClaim.CustomerId = customerId;
                bookClaim.Status = "Approved"; // Auto-approve immediately
                bookClaim.CreatedAt = DateTime.UtcNow;
                bookClaim.ProcessedAt = DateTime.UtcNow;
                bookClaim.ProcessedBy = null; // Auto-approved, no processor

                // Si ChapterId n'est pas fourni, utiliser celui de l'offre
                if (!bookClaim.ChapterId.HasValue && bookOffer.ChapterId.HasValue)
                {
                    bookClaim.ChapterId = bookOffer.ChapterId;
                }

                // Si AudioId n'est pas fourni, utiliser celui de l'offre
                if (!bookClaim.AudioId.HasValue && bookOffer.AudioId.HasValue)
                {
                    bookClaim.AudioId = bookOffer.AudioId;
                }

                // Créer le claim
                var created = await _bookClaimRepository.CreateAsync(bookClaim);

                // Créer les OrderItems avec prix 0 immédiatement
                var chapterId = bookClaim.ChapterId ?? bookOffer.ChapterId;
                var audioId = bookClaim.AudioId ?? bookOffer.AudioId;

                if (chapterId.HasValue)
                {
                    var orderItems = new List<OrderItem>();

                    // Créer OrderItem selon AccessType de l'offre
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
                throw new Exception("Claim non trouvé");

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
                    throw new Exception("Claim non trouvé");

                if (bookClaim.Status != "Pending")
                    throw new Exception("Ce claim a déjà été traité");

                var bookOffer = await _bookOfferRepository.GetByIdAsync(bookClaim.BookOfferId);
                if (bookOffer == null)
                    throw new Exception("Offre non trouvée");

                // Vérifier le nombre de claims approuvés
                var approvedCount = await _bookOfferRepository.GetApprovedClaimCountAsync(bookOffer.BookOfferId);
                if (approvedCount >= bookOffer.Quantity)
                    throw new Exception("Cette offre est complète");

                // Mettre à jour le statut du claim
                bookClaim.Status = "Approved";
                bookClaim.ProcessedAt = DateTime.UtcNow;
                bookClaim.ProcessedBy = processedBy;
                await _bookClaimRepository.UpdateAsync(bookClaim);

                // Créer les OrderItems avec prix 0
                var chapterId = bookClaim.ChapterId ?? bookOffer.ChapterId;
                var audioId = bookClaim.AudioId ?? bookOffer.AudioId;

                if (chapterId.HasValue)
                {
                    var orderItems = new List<OrderItem>();

                    // Créer OrderItem selon AccessType de l'offre
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

