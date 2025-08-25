using AutoMapper;
using BusinessObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class MappingDTO : Profile
    {
        public MappingDTO()
        {
            // Map từ User entity sang UserDTO
            CreateMap<User, UserDTO>().ReverseMap();
          
        }

    }
}
