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
                    opt => opt.MapFrom(src => src.BookReviews));

            // Book → BookResponseDTO
            CreateMap<Book, BookResponseDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.BookId))
            .ForMember(dest => dest.Author,
                opt => opt.MapFrom(src => src.Owner.UserProfile != null
                    ? src.Owner.UserProfile.FullName
                    : src.Owner.Email))
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
                opt => opt.MapFrom(src => src.Description));
        }

    }
}