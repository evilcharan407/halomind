
import { Achievement } from '../gamificationTypes';

export const achievementsData: Achievement[] = [
  {
    id: 'COURSE_CREATOR',
    title: 'Course Creator',
    description: 'Create your first course.',
    condition: (log) => log.some(e => e.type === 'COURSE_CREATED'),
  },
  {
    id: 'COURSE_MAESTRO',
    title: 'Course Maestro',
    description: 'Create 5 different courses.',
    condition: (log) => log.filter(e => e.type === 'COURSE_CREATED').length >= 5,
  },
  {
    id: 'QUIZ_TAKER',
    title: 'Quiz Taker',
    description: 'Complete your first quiz.',
    condition: (log) => log.some(e => e.type === 'QUIZ_COMPLETED'),
  },
  {
    id: 'QUIZ_MASTER',
    title: 'Quiz Master',
    description: 'Complete 10 quizzes.',
    condition: (log) => log.filter(e => e.type === 'QUIZ_COMPLETED').length >= 10,
  },
  {
    id: 'PERFECTIONIST',
    title: 'Perfectionist',
    description: 'Get a perfect score on a quiz.',
    condition: (log) => log.some(e => e.type === 'QUIZ_PERFECT_SCORE'),
  },
  {
    id: 'STREAK_3',
    title: 'On a Roll',
    description: 'Maintain a 3-day study streak.',
    condition: (log, streak) => streak >= 3,
  },
  {
    id: 'STREAK_7',
    title: 'Study Machine',
    description: 'Maintain a 7-day study streak.',
    condition: (log, streak) => streak >= 7,
  },
];
