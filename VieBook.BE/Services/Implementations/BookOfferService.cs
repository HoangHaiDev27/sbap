using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class BookOfferService : IBookOfferService
    {
        private readonly IBookOfferRepository _bookOfferRepository;
        private readonly IMapper _mapper;

        public BookOfferService(IBookOfferRepository bookOfferRepository, IMapper mapper)
        {
            _bookOfferRepository = bookOfferRepository;
            _mapper = mapper;
        }

        public async Task<BookOfferDTO?> GetByIdAsync(long bookOfferId)
        {
            var bookOffer = await _bookOfferRepository.GetByIdAsync(bookOfferId);
            if (bookOffer == null) return null;

            var dto = _mapper.Map<BookOfferDTO>(bookOffer);
            dto.ClaimCount = await _bookOfferRepository.GetClaimCountAsync(bookOfferId);
            dto.ApprovedClaimCount = await _bookOfferRepository.GetApprovedClaimCountAsync(bookOfferId);
            return dto;
        }

        public async Task<BookOfferDTO?> GetByPostIdAsync(long postId)
        {
            var bookOffer = await _bookOfferRepository.GetByPostIdAsync(postId);
            if (bookOffer == null) return null;

            var dto = _mapper.Map<BookOfferDTO>(bookOffer);
            dto.ClaimCount = await _bookOfferRepository.GetClaimCountAsync(bookOffer.BookOfferId);
            dto.ApprovedClaimCount = await _bookOfferRepository.GetApprovedClaimCountAsync(bookOffer.BookOfferId);
            return dto;
        }

        public async Task<List<BookOfferDTO>> GetByOwnerIdAsync(int ownerId)
        {
            var bookOffers = await _bookOfferRepository.GetByOwnerIdAsync(ownerId);
            var dtos = _mapper.Map<List<BookOfferDTO>>(bookOffers);
            
            foreach (var dto in dtos)
            {
                dto.ClaimCount = await _bookOfferRepository.GetClaimCountAsync(dto.BookOfferId);
                dto.ApprovedClaimCount = await _bookOfferRepository.GetApprovedClaimCountAsync(dto.BookOfferId);
            }
            
            return dtos;
        }

        public async Task<List<BookOfferDTO>> GetActiveOffersAsync()
        {
            var bookOffers = await _bookOfferRepository.GetActiveOffersAsync();
            var dtos = _mapper.Map<List<BookOfferDTO>>(bookOffers);
            
            foreach (var dto in dtos)
            {
                dto.ClaimCount = await _bookOfferRepository.GetClaimCountAsync(dto.BookOfferId);
                dto.ApprovedClaimCount = await _bookOfferRepository.GetApprovedClaimCountAsync(dto.BookOfferId);
            }
            
            return dtos;
        }

        public async Task<BookOfferDTO> CreateAsync(CreateBookOfferDTO createDto, int ownerId)
        {
            var bookOffer = _mapper.Map<BookOffer>(createDto);
            bookOffer.OwnerId = ownerId;
            bookOffer.Status = "Active";
            bookOffer.StartAt = DateTime.UtcNow;

            var created = await _bookOfferRepository.CreateAsync(bookOffer);
            var dto = _mapper.Map<BookOfferDTO>(created);
            dto.ClaimCount = 0;
            dto.ApprovedClaimCount = 0;
            return dto;
        }

        public async Task<BookOfferDTO> UpdateAsync(long bookOfferId, UpdateBookOfferDTO updateDto, int ownerId)
        {
            var bookOffer = await _bookOfferRepository.GetByIdAsync(bookOfferId);
            if (bookOffer == null)
                throw new Exception("BookOffer not found");

            if (bookOffer.OwnerId != ownerId)
                throw new UnauthorizedAccessException("Not authorized to update this offer");

            if (!string.IsNullOrEmpty(updateDto.AccessType))
                bookOffer.AccessType = updateDto.AccessType;
            if (updateDto.Quantity.HasValue)
                bookOffer.Quantity = updateDto.Quantity.Value;
            if (!string.IsNullOrEmpty(updateDto.Criteria))
                bookOffer.Criteria = updateDto.Criteria;
            if (updateDto.EndAt.HasValue)
                bookOffer.EndAt = updateDto.EndAt;
            if (!string.IsNullOrEmpty(updateDto.Status))
                bookOffer.Status = updateDto.Status;

            var updated = await _bookOfferRepository.UpdateAsync(bookOffer);
            var dto = _mapper.Map<BookOfferDTO>(updated);
            dto.ClaimCount = await _bookOfferRepository.GetClaimCountAsync(bookOfferId);
            dto.ApprovedClaimCount = await _bookOfferRepository.GetApprovedClaimCountAsync(bookOfferId);
            return dto;
        }

        public async Task<bool> DeleteAsync(long bookOfferId, int ownerId)
        {
            var bookOffer = await _bookOfferRepository.GetByIdAsync(bookOfferId);
            if (bookOffer == null)
                return false;

            if (bookOffer.OwnerId != ownerId)
                throw new UnauthorizedAccessException("Not authorized to delete this offer");

            return await _bookOfferRepository.DeleteAsync(bookOfferId);
        }

        public async Task<int> GetClaimCountForOfferAsync(long bookOfferId)
        {
            return await _bookOfferRepository.GetClaimCountAsync(bookOfferId);
        }

        public async Task<int> GetApprovedClaimCountForOfferAsync(long bookOfferId)
        {
            return await _bookOfferRepository.GetApprovedClaimCountAsync(bookOfferId);
        }
    }
}

