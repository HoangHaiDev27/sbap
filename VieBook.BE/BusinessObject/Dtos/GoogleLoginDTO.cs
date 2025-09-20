namespace BusinessObject.Dtos
{
    public class GoogleLoginRequestDto
    {
        public string IdToken { get; set; } = null!;
    }

    public class GoogleUserInfoDto
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Picture { get; set; }
        public bool EmailVerified { get; set; }
    }
}
