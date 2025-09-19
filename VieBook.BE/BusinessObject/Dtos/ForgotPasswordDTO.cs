namespace BusinessObject.Dtos
{
    public class ForgotPasswordRequestDto
    {
        public string Email { get; set; }
    }

    public class VerifyOtpRequestDto
    {
        public string Email { get; set; }
        public string Otp { get; set; }
    }

    public class ResetPasswordRequestDto
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
    }

}