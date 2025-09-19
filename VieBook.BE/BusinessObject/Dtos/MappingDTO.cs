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


        }

    }
}