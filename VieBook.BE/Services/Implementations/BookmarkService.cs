using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class BookmarkService : IBookmarkService
    {
        private readonly IBookmarkRepository _bookmarkRepository;
        private readonly IMapper _mapper;

        public BookmarkService(IBookmarkRepository bookmarkRepository, IMapper mapper)
        {
            _bookmarkRepository = bookmarkRepository;
            _mapper = mapper;
        }

        public async Task<List<BookmarkDTO>> GetUserBookmarksAsync(int userId)
        {
            var bookmarks = await _bookmarkRepository.GetUserBookmarksAsync(userId);
            return _mapper.Map<List<BookmarkDTO>>(bookmarks);
        }

        public async Task<BookmarkDTO?> GetBookmarkByUserAndChapterAsync(int userId, int chapterId)
        {
            var bookmark = await _bookmarkRepository.GetBookmarkByUserAndChapterAsync(userId, chapterId);
            return bookmark != null ? _mapper.Map<BookmarkDTO>(bookmark) : null;
        }

        public async Task<BookmarkDTO> CreateOrUpdateBookmarkAsync(int userId, CreateBookmarkDTO bookmarkDto)
        {
            // Check if bookmark already exists for this user and chapter
            var existingBookmark = await _bookmarkRepository.GetBookmarkByUserAndChapterAsync(userId,
                bookmarkDto.ChapterReadId ?? bookmarkDto.ChapterListenId ?? 0);

            if (existingBookmark != null)
            {
                // Update existing bookmark
                existingBookmark.PagePosition = bookmarkDto.PagePosition;
                existingBookmark.AudioPosition = bookmarkDto.AudioPosition;
                existingBookmark.ChapterReadId = bookmarkDto.ChapterReadId;
                existingBookmark.ChapterListenId = bookmarkDto.ChapterListenId;

                var updatedBookmark = await _bookmarkRepository.UpdateBookmarkAsync(existingBookmark);
                return _mapper.Map<BookmarkDTO>(updatedBookmark);
            }
            else
            {
                // Create new bookmark
                var newBookmark = new Bookmark
                {
                    UserId = userId,
                    BookId = bookmarkDto.BookId,
                    ChapterReadId = bookmarkDto.ChapterReadId,
                    ChapterListenId = bookmarkDto.ChapterListenId,
                    PagePosition = bookmarkDto.PagePosition,
                    AudioPosition = bookmarkDto.AudioPosition,
                    CreatedAt = DateTime.UtcNow
                };

                var createdBookmark = await _bookmarkRepository.CreateBookmarkAsync(newBookmark);
                return _mapper.Map<BookmarkDTO>(createdBookmark);
            }
        }

        public async Task<bool> DeleteBookmarkAsync(int userId, int bookmarkId)
        {
            return await _bookmarkRepository.DeleteBookmarkAsync(bookmarkId);
        }

        public async Task<bool> DeleteBookmarkByChapterAsync(int userId, int chapterId)
        {
            return await _bookmarkRepository.DeleteBookmarkByUserAndChapterAsync(userId, chapterId);
        }
    }
}
