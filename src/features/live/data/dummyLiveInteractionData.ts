import { GiftType, MessageType } from '../domain/liveEnums';
import {
  ChatMessage,
  GiftEvent,
  LikeEvent,
  LiveParticipant,
} from '../domain/types';

const usernames = [
  'AstroSeeker_23',
  'CosmicDreamer',
  'StarGazer99',
  'MoonWatcher',
  'NebulaKnight',
  'ZodiacFan',
  'PlanetaryLover',
  'GalaxyExplorer',
  'CelestialSeeker',
  'UniverseFan',
  'VedicLearner',
  'KarmaChaser',
  'SpiritualSoul',
  'DivineGuided',
  'AstroGuru',
];

const messages = [
  'Namaste Guruji! 🙏',
  'Today is amazing!',
  'What about my career?',
  'When will I get married?',
  'Please bless us!',
  'Kya mera future hai?',
  'Love the session!',
  'So informative!',
  'Can you see my chart?',
  'Amazing prediction!',
  'Thank you Guruji!',
  'Very helpful! 🙏',
  'Keep streaming!',
  'Jai Shree Ganesh!',
  'Namaste everyone!',
];

const remedyTitles = [
  'Chant Om Gam Ganapataye',
  'Donate to charity on Thursday',
  'Light a mustard oil lamp',
  'Recite Hare Krishna mantra',
  'Donate black til seeds',
  'Worship Lord Shiva',
  'Offer water to Sun',
  'Chant Om Namo Narayanaya',
  'Donate iron utensils',
  'Recite Lalita Sahasranam',
];

const remedyDescriptions = [
  'Chant this mantra 108 times daily for 21 days',
  'Donate 11 bananas to a needy person on Thursday',
  'Light a ghee lamp in front of Ganesha idol for 7 days',
  'Chant Hare Krishna mantra 108 times every morning',
  'Feed birds in the morning for 40 days',
  'Visit a Shiva temple on Monday and offer milk',
  'Offer water to the rising Sun for 11 days',
  'Chant Om Namo Narayanaya 108 times daily',
  'Donate iron utensils to a temple or charity',
  'Read or listen to Lalita Sahasranam on Fridays',
];

export const generateRandomMessage = (): ChatMessage => {
  const username = usernames[Math.floor(Math.random() * usernames.length)];
  const message = messages[Math.floor(Math.random() * messages.length)];
  const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    userId: `user_${Math.random().toString(36).substr(2, 6)}`,
    username,
    message,
    type: MessageType.CHAT,
    timestamp: Date.now(),
  };
};

export const generateRandomLike = (): LikeEvent => {
  const username = usernames[Math.floor(Math.random() * usernames.length)];
  return {
    id: `like_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: `user_${Math.random().toString(36).substr(2, 6)}`,
    username,
    timestamp: Date.now(),
  };
};

export const generateRandomGift = (): GiftEvent => {
  const username = usernames[Math.floor(Math.random() * usernames.length)];
  const giftTypes = [
    GiftType.COINS,
    GiftType.HEART,
    GiftType.STAR,
    GiftType.DIAMOND,
    GiftType.CROWN,
  ];
  const giftType = giftTypes[Math.floor(Math.random() * giftTypes.length)];
  const amounts =
    giftType === GiftType.COINS ? [10, 25, 50, 100] : [1, 2, 5, 10];
  return {
    id: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: `user_${Math.random().toString(36).substr(2, 6)}`,
    username,
    giftType,
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    timestamp: Date.now(),
  };
};

export const generateRandomRemedy = (isPaid: boolean = false) => {
  const index = Math.floor(Math.random() * remedyTitles.length);
  return {
    id: `remedy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: remedyTitles[index],
    description: remedyDescriptions[index],
    type: isPaid ? 'PAID' : 'FREE',
    price: isPaid
      ? [51, 101, 201, 501][Math.floor(Math.random() * 4)]
      : undefined,
    timestamp: Date.now(),
  };
};

export const generateTopSupporters = (): LiveParticipant[] => {
  const shuffled = [...usernames].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).map((username, index) => ({
    id: `user_${index}`,
    username,
    coinsContributed: Math.floor(Math.random() * 1000) + 100,
    isSupporter: index < 3,
  }));
};

export const generateJoiningMessage = (): string => {
  const username = usernames[Math.floor(Math.random() * usernames.length)];
  return username;
};
