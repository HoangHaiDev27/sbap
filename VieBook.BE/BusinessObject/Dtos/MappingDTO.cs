using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BusinessObject.Models;

namespace BusinessObject.Dtos
{
    public class MappingDTO : Profile
    {
        public MappingDTO()
        {
            // Map từ User entity sang UserDTO
            CreateMap<User, UserDTO>().ReverseMap();

            // BookReview → BookReviewDTO
            CreateMap<BookReview, BookReviewDTO>()
                .ForMember(dest => dest.UserName,
                    opt => opt.MapFrom(src => src.User.UserProfile != null
                        ? src.User.UserProfile.FullName
                        : src.User.Email))
                .ForMember(dest => dest.AvatarUrl,
                    opt => opt.MapFrom(src => src.User.UserProfile != null
                        ? src.User.UserProfile.AvatarUrl
                        : null));

            // Chapter → ChapterDTO
            CreateMap<Chapter, ChapterDTO>();

            // Book → BookDetailDTO
            CreateMap<Book, BookDetailDTO>()
                .ForMember(dest => dest.OwnerName,
                    opt => opt.MapFrom(src => src.Owner.UserProfile != null
                        ? src.Owner.UserProfile.FullName
                        : src.Owner.Email))
                .ForMember(dest => dest.Categories,
                    opt => opt.MapFrom(src => src.Categories.Select(c => c.Name)))
                .ForMember(dest => dest.Chapters,
                    opt => opt.MapFrom(src => src.Chapters))
                .ForMember(dest => dest.Reviews,
                    opt => opt.MapFrom(src => src.BookReviews))
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.TotalPrice,
                    opt => opt.MapFrom(src => src.Chapters.Sum(ch => ch.PriceAudio ?? 0)));
            // Book → BookDTO
            CreateMap<Book, BookDTO>()
                .ForMember(dest => dest.OwnerName,
                    opt => opt.MapFrom(src => src.Owner.UserProfile.FullName))
                .ForMember(dest => dest.CategoryIds,
                    opt => opt.MapFrom(src => src.Categories.Select(c => c.CategoryId).ToList()))
                .ForMember(dest => dest.TotalPrice,
                    opt => opt.MapFrom(src => src.Chapters.Sum(c => c.PriceAudio ?? 0)))
                .ForMember(dest => dest.Rating,
                    opt => opt.MapFrom(src => src.BookReviews.Any()
                        ? Math.Round(src.BookReviews.Average(r => r.Rating), 1)
                        : 0))
                .ForMember(dest => dest.Sold,
                    opt => opt.MapFrom(src => src.Chapters
                        .SelectMany(c => c.OrderItems)   
                        .Count()));                        


            // Map từ RegisterRequestDto sang User
            CreateMap<RegisterRequestDto, User>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.UserProfile, opt => opt.MapFrom(src => new UserProfile
                {
                    FullName = src.FullName
                }))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => "Pending"))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Roles, opt => opt.Ignore()) // sẽ gán ở Service
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); // hash trong Service

            CreateMap<BookDTO, Book>()
                .ForMember(dest => dest.Categories, opt => opt.Ignore());

            // Category → CategoryDTO
            CreateMap<Category, CategoryDTO>().ReverseMap();
            // Book → BookResponseDTO
            CreateMap<Book, BookResponseDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.BookId))
            .ForMember(dest => dest.Author,
                opt => opt.MapFrom(src => src.Author))
            .ForMember(dest => dest.Category,
                opt => opt.MapFrom(src => src.Categories.FirstOrDefault() != null
                    ? src.Categories.First().Name
                    : string.Empty))
            .ForMember(dest => dest.Price,
                opt => opt.MapFrom(src => src.Chapters.Sum(c => c.PriceAudio ?? 0)))
            .ForMember(dest => dest.Rating,
                opt => opt.MapFrom(src => src.BookReviews.Any()
                    ? Math.Round(src.BookReviews.Average(r => r.Rating), 1)
                    : 0))
            .ForMember(dest => dest.Reviews,
                opt => opt.MapFrom(src => src.BookReviews.Count))
            .ForMember(dest => dest.Duration,
                opt => opt.MapFrom(src =>
                    (src.Chapters.Sum(c => c.DurationSec ?? 0) / 3600) + "h " +
                    ((src.Chapters.Sum(c => c.DurationSec ?? 0) % 3600) / 60) + "m"
                ))
            .ForMember(dest => dest.Chapters,
                opt => opt.MapFrom(src => src.Chapters.Count))
            .ForMember(dest => dest.Image,
                opt => opt.MapFrom(src => src.CoverUrl))
            .ForMember(dest => dest.Description,
                opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Narrator,
                opt => opt.MapFrom(src =>
                    src.Chapters
                        .Where(c => c.ChapterAudioUrl != null)
                        .Select(c => c.StorageMeta)
                        .FirstOrDefault()));

            CreateMap<User, StaffDTO>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.UserProfile != null ? src.UserProfile.FullName : ""))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.UserProfile != null ? src.UserProfile.AvatarUrl : ""))
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.UserProfile != null ? src.UserProfile.DateOfBirth : null))
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.Roles.Select(r => r.RoleName).FirstOrDefault() ?? ""));

            // User → UserManagementDTO
            CreateMap<User, UserManagementDTO>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.UserProfile != null ? src.UserProfile.FullName : ""))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.UserProfile != null ? src.UserProfile.AvatarUrl : ""))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.UserProfile != null ? src.UserProfile.PhoneNumber : ""))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => ""))
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Roles.Select(r => r.RoleName).FirstOrDefault() ?? "Unknown"))
                .ForMember(dest => dest.BookCount, opt => opt.MapFrom(src => src.Books != null ? src.Books.Count : 0))
                .ForMember(dest => dest.OrderCount, opt => opt.MapFrom(src => src.OrderItems != null ? src.OrderItems.Count : 0));

            CreateMap<CreateStaffRequestDTO, User>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.UserProfile, opt => opt.MapFrom(src => new UserProfile
                {
                    FullName = src.FullName,
                    AvatarUrl = src.AvatarUrl,
                    DateOfBirth = src.DateOfBirth

                }))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => "Active"))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Roles, opt => opt.Ignore())       // gán trong Service
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); // hash trong Service
                                                                            // Trong MappingProfile.cs
            CreateMap<UpdateStaffRequestDTO, User>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.UserProfile, opt => opt.MapFrom(src => new UserProfile
                {
                    FullName = src.FullName,
                    AvatarUrl = src.AvatarUrl,
                    DateOfBirth = src.DateOfBirth
                }))
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()) // nếu cập nhật mật khẩu, xử lý riêng
                .ForMember(dest => dest.Roles, opt => opt.Ignore()); // giữ nguyên roles

            CreateMap<User, AdminProfileDTO>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.UserProfile.FullName))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.UserProfile.AvatarUrl))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.UserProfile.PhoneNumber))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ReverseMap()
                .ForPath(dest => dest.UserProfile.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForPath(dest => dest.UserProfile.AvatarUrl, opt => opt.MapFrom(src => src.AvatarUrl))
                .ForPath(dest => dest.UserProfile.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForPath(dest => dest.Email, opt => opt.MapFrom(src => src.Email));


            // Map từ BookApproval -> BookApprovalDTO
            CreateMap<BookApproval, BookApprovalDTO>()
                .ForMember(dest => dest.StaffName,
                           opt => opt.MapFrom(src => src.Staff.UserProfile.FullName));
            CreateMap<User, UserNameDTO>()
                .ForMember(dest => dest.UserId,
                    opt => opt.MapFrom(src => src.UserId)) 
                .ForMember(dest => dest.Email,
                    opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Name,
                    opt => opt.MapFrom(src => src.UserProfile.FullName));
            // Map giữa Chapter ↔ ChapterViewDTO
            CreateMap<Chapter, ChapterViewDTO>()
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book.Title));

            CreateMap<ChapterViewDTO, Chapter>()
                .ForMember(dest => dest.Book, opt => opt.Ignore());
        }
    }

}