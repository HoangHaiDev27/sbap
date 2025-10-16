using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IAudioService
    {
        Task<string> ConvertTextToSpeechAndUploadAsync(string text, string voiceName, string fileName, double speed);
    }
}
