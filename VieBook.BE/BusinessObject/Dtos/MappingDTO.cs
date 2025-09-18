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

            CreateMap<Book, BookDTO>()
                .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => src.Owner.UserProfile.FullName))
                .ForMember(dest => dest.Categories, opt => opt.MapFrom(src => src.Categories.Select(c => c.Name)));

            CreateMap<Chapter, ChapterDTO>();

            // Map Book -> BookDetailDTO
            CreateMap<Book, BookDetailDTO>()
                .ForMember(dest => dest.Book, opt => opt.MapFrom(src => src))
                .ForMember(dest => dest.Chapters, opt => opt.MapFrom(src => src.Chapters));


        }

    }
}