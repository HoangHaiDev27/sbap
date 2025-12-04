using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class ReadingScheduleService : IReadingScheduleService
    {
        private readonly IReadingScheduleRepository _readingScheduleRepository;
        private readonly IMapper _mapper;

        public ReadingScheduleService(IReadingScheduleRepository readingScheduleRepository, IMapper mapper)
        {
            _readingScheduleRepository = readingScheduleRepository;
            _mapper = mapper;
        }

        public async Task<ReadingScheduleDTO> CreateReadingScheduleAsync(CreateReadingScheduleDTO createDto, int userId)
        {
            var readingSchedule = new ReadingSchedule
            {
                UserId = userId,
                BookId = createDto.BookId,
                BeginReadAt = createDto.BeginReadAt,
                ReadingTime = createDto.ReadingTime,
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.Now
            };

            var createdSchedule = await _readingScheduleRepository.CreateReadingScheduleAsync(readingSchedule);
            return _mapper.Map<ReadingScheduleDTO>(createdSchedule);
        }

        public async Task<bool> DeleteReadingScheduleAsync(int scheduleId)
        {
            return await _readingScheduleRepository.DeleteReadingScheduleAsync(scheduleId);
        }

        public async Task<ReadingScheduleDTO> GetReadingScheduleByIdAsync(int scheduleId)
        {
            var schedule = await _readingScheduleRepository.GetReadingScheduleByIdAsync(scheduleId);
            if (schedule == null) return null;

            return _mapper.Map<ReadingScheduleDTO>(schedule);
        }

        public async Task<IEnumerable<ReadingScheduleDTO>> GetReadingSchedulesByDateAsync(int userId, DateTime date)
        {
            var schedules = await _readingScheduleRepository.GetReadingSchedulesByDateAsync(userId, date);
            return _mapper.Map<IEnumerable<ReadingScheduleDTO>>(schedules);
        }

        public async Task<IEnumerable<ReadingScheduleDTO>> GetReadingSchedulesByUserIdAsync(int userId)
        {
            var schedules = await _readingScheduleRepository.GetReadingSchedulesByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<ReadingScheduleDTO>>(schedules);
        }

        public async Task<ReadingScheduleStatsDTO> GetReadingScheduleStatsAsync(int userId)
        {
            var startOfWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7);

            var totalTime = await _readingScheduleRepository.GetTotalReadingTimeAsync(userId, startOfWeek, endOfWeek);
            var completedSessions = await _readingScheduleRepository.GetCompletedSchedulesCountAsync(userId, startOfWeek, endOfWeek);
            var streak = await _readingScheduleRepository.GetCurrentStreakAsync(userId);
            var totalSchedules = (await _readingScheduleRepository.GetReadingSchedulesByUserIdAsync(userId)).Count();

            return new ReadingScheduleStatsDTO
            {
                TotalTime = totalTime,
                CompletedSessions = completedSessions,
                Streak = streak,
                TotalSchedules = totalSchedules
            };
        }

        public async Task<bool> MarkScheduleCompletedAsync(int scheduleId)
        {
            var schedule = await _readingScheduleRepository.GetReadingScheduleByIdAsync(scheduleId);
            if (schedule == null) return false;

            schedule.IsActive = false;
            await _readingScheduleRepository.UpdateReadingScheduleAsync(schedule);
            return true;
        }

        public async Task<ReadingScheduleDTO> UpdateReadingScheduleAsync(int scheduleId, UpdateReadingScheduleDTO updateDto)
        {
            var schedule = await _readingScheduleRepository.GetReadingScheduleByIdAsync(scheduleId);
            if (schedule == null) return null;

            schedule.BeginReadAt = updateDto.BeginReadAt;
            schedule.ReadingTime = updateDto.ReadingTime;
            schedule.IsActive = updateDto.IsActive;

            var updatedSchedule = await _readingScheduleRepository.UpdateReadingScheduleAsync(schedule);
            return _mapper.Map<ReadingScheduleDTO>(updatedSchedule);
        }
    }
}
