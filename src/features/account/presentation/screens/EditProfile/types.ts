import * as yup from 'yup';

export interface EditProfileFormData {
  name: string;
  about: string;
  chatPrice: number;
  callPrice: number;
  skills: string[];
  languages: string[];
}

export const editProfileSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  about: yup.string().max(500, 'About must be less than 500 characters'),
  chatPrice: yup
    .number()
    .required('Chat price is required')
    .min(5, 'Minimum price is ₹5')
    .max(100, 'Maximum price is ₹100'),
  callPrice: yup
    .number()
    .required('Call price is required')
    .min(10, 'Minimum price is ₹10')
    .max(200, 'Maximum price is ₹200'),
  skills: yup
    .array()
    .of(yup.string())
    .min(1, 'Select at least one skill')
    .max(10, 'Maximum 10 skills allowed'),
  languages: yup
    .array()
    .of(yup.string())
    .min(1, 'Select at least one language')
    .max(5, 'Maximum 5 languages allowed'),
});

export const defaultFormValues: EditProfileFormData = {
  name: '',
  about: '',
  chatPrice: 10,
  callPrice: 20,
  skills: [],
  languages: [],
};

export const AVAILABLE_SKILLS = [
  'Vedic Astrology',
  'Numerology',
  'Palmistry',
  'Tarot Reading',
  'Kundli Matching',
  'Career Guidance',
  'Love & Relationship',
  'Financial Astrology',
  'Health Astrology',
  'Gemstone Consultation',
  ' Muhurta',
  'Vastu Shastra',
  'Pras谚na (Horary)',
  'Transit Analysis',
  'Muhurta',
];

export const AVAILABLE_LANGUAGES = [
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Punjabi',
  'Sanskrit',
];
