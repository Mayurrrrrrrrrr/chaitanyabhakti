// frontend/src/utils/vaishnavaData.js

/**
 * STATIC DATA SOURCE: Major Vaishnava Festivals (2024 - March 2027)
 * * In a production environment, you would replace this static return with:
 * return await fetch('https://your-backend-api.com/calendar').then(res => res.json());
 * * Note: Dates below are based on India Standard Time (IST). 
 * Tithi timings may vary by location (Timezone).
 */

export const fetchVaishnavaEvents = async () => {
  // Simulating an API call with a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(calendarData);
    }, 300);
  });
};

const calendarData = [
  // ==================== 2024 ====================
  {
    id: "v-2024-01",
    title: "Gaura Purnima",
    start_date: "2024-03-25T00:00:00",
    description: "Appearance of Sri Chaitanya Mahaprabhu. Fasting till moonrise.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2024-02",
    title: "Rama Navami",
    start_date: "2024-04-17T00:00:00",
    description: "Appearance of Lord Sri Ramachandra. Fasting till sunset.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2024-03",
    title: "Nrisimha Caturdashi",
    start_date: "2024-05-22T00:00:00",
    description: "Appearance of Lord Nrisimhadeva. Fasting till dusk.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2024-04",
    title: "Pandava Nirjala Ekadashi",
    start_date: "2024-06-18T00:00:00",
    description: "Total fast, even from water, if possible.",
    event_type: "ekadashi",
    is_default: true
  },
  {
    id: "v-2024-05",
    title: "Ratha Yatra (Puri)",
    start_date: "2024-07-07T00:00:00",
    description: "Lord Jagannath's Chariot Festival.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2024-06",
    title: "Sri Krishna Janmashtami",
    start_date: "2024-08-26T00:00:00",
    description: "Appearance of Lord Sri Krishna. Fasting till midnight.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2024-07",
    title: "Radhashtami",
    start_date: "2024-09-11T00:00:00",
    description: "Appearance of Srimati Radharani. Fasting till noon.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2024-08",
    title: "Govardhan Puja",
    start_date: "2024-11-02T00:00:00",
    description: "Worship of Govardhan Hill.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2024-09",
    title: "Gita Jayanti",
    start_date: "2024-12-11T00:00:00",
    description: "Advent of Srimad Bhagavad Gita.",
    event_type: "festival",
    is_default: true
  },

  // ==================== 2025 ====================
  {
    id: "v-2025-01",
    title: "Nityananda Trayodashi",
    start_date: "2025-02-11T00:00:00",
    description: "Appearance of Lord Nityananda. Fasting till noon.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2025-02",
    title: "Gaura Purnima",
    start_date: "2025-03-14T00:00:00",
    description: "539th Anniversary of Chaitanya Mahaprabhu.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2025-03",
    title: "Rama Navami",
    start_date: "2025-04-06T00:00:00",
    description: "Appearance of Lord Ramachandra. Fasting till sunset.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2025-04",
    title: "Nrisimha Caturdashi",
    start_date: "2025-05-11T00:00:00",
    description: "Appearance of Lord Nrisimhadeva. Fasting till dusk.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2025-05",
    title: "Pandava Nirjala Ekadashi",
    start_date: "2025-06-07T00:00:00",
    description: "Complete fast, even from water.",
    event_type: "ekadashi",
    is_default: true
  },
  {
    id: "v-2025-06",
    title: "Ratha Yatra (Puri)",
    start_date: "2025-06-27T00:00:00",
    description: "Festival of Chariots.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2025-07",
    title: "Sri Krishna Janmashtami",
    start_date: "2025-08-16T00:00:00",
    description: "Sri Krishna Janmashtami. Fasting till midnight.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2025-08",
    title: "Radhashtami",
    start_date: "2025-08-31T00:00:00",
    description: "Appearance of Srimati Radharani. Fasting till noon.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2025-09",
    title: "Govardhan Puja",
    start_date: "2025-10-22T00:00:00",
    description: "Worship of Govardhan Hill.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2025-10",
    title: "Gita Jayanti",
    start_date: "2025-11-30T00:00:00",
    description: "Advent of Bhagavad Gita.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2025-11",
    title: "Moksada Ekadashi",
    start_date: "2025-11-30T00:00:00",
    description: "Fast from grains and beans.",
    event_type: "ekadashi",
    is_default: true
  },

  // ==================== 2026 ====================
  {
    id: "v-2026-01",
    title: "Nityananda Trayodashi",
    start_date: "2026-01-31T00:00:00",
    description: "Appearance of Lord Nityananda.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2026-02",
    title: "Gaura Purnima",
    start_date: "2026-03-03T00:00:00",
    description: "Appearance of Sri Chaitanya Mahaprabhu.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2026-03",
    title: "Rama Navami",
    start_date: "2026-03-27T00:00:00",
    description: "Appearance of Lord Ramachandra.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2026-04",
    title: "Nrisimha Caturdashi",
    start_date: "2026-05-01T00:00:00",
    description: "Appearance of Lord Nrisimhadeva.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2026-05",
    title: "Pandava Nirjala Ekadashi",
    start_date: "2026-05-27T00:00:00",
    description: "Total fast.",
    event_type: "ekadashi",
    is_default: true
  },
  {
    id: "v-2026-06",
    title: "Ratha Yatra (Puri)",
    start_date: "2026-07-17T00:00:00",
    description: "Festival of Chariots.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2026-07",
    title: "Janmashtami",
    start_date: "2026-09-04T00:00:00",
    description: "Sri Krishna Janmashtami. Fasting till midnight.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2026-08",
    title: "Radhashtami",
    start_date: "2026-09-19T00:00:00",
    description: "Appearance of Srimati Radharani.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2026-09",
    title: "Govardhan Puja",
    start_date: "2026-11-10T00:00:00",
    description: "Worship of Govardhan Hill.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2026-10",
    title: "Gita Jayanti",
    start_date: "2026-12-20T00:00:00",
    description: "Advent of Bhagavad Gita.",
    event_type: "festival",
    is_default: true
  },

  // ==================== 2027 (Up to March 31st) ====================
  {
    id: "v-2027-01",
    title: "Nityananda Trayodashi",
    start_date: "2027-02-19T00:00:00",
    description: "Appearance of Lord Nityananda.",
    event_type: "festival",
    is_default: true
  },
  {
    id: "v-2027-02",
    title: "Gaura Purnima",
    start_date: "2027-03-22T00:00:00",
    description: "Appearance of Sri Chaitanya Mahaprabhu.",
    event_type: "festival",
    is_default: true
  }
];