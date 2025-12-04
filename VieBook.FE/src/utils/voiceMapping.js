export const VOICE_MAPPING = {
  "banmai": "Nữ miền Bắc - Ban Mai",
  "thuminh": "Nữ miền Bắc - Thu Minh",
  "giahuy": "Nam miền Trung - Gia Huy",
  "myan": "Nữ miền Trung - Mỹ An",
  "leminh": "Nam miền Bắc - Lê Minh",
  "ngoclam": "Nữ miền Trung - Ngọc Lam",
  "linhsan": "Nữ miền Nam - Linh San",
  "minhquang": "Nam miền Nam - Minh Quang",
};

export const getVoiceDisplayName = (voiceId) => {
  if (!voiceId) return "Mặc định";
  return VOICE_MAPPING[voiceId.toLowerCase()] || voiceId;
};

