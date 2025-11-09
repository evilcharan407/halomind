import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, StudyPlanItem } from '../types';
import { ActivityEvent, UnlockedAchievement } from '../gamificationTypes';

const COURSES_KEY = 'halomind-courses';
const ACTIVITY_LOG_KEY = 'halomind-activity-log';
const ACHIEVEMENTS_KEY = 'halomind-unlocked-achievements';
const STUDY_PLAN_KEY = 'halomind-study-plan';
const LAST_VIEWED_KEY = 'halomind-last-viewed';
const API_KEY_KEY = 'halomind-api-key';
const MODEL_KEY = 'halomind-model';

// --- Generic Helpers ---

const setItem = async <T>(key: string, value: T): Promise<void> => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to AsyncStorage for key "${key}":`, error);
    }
};

const getItem = async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
        const item = await AsyncStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from AsyncStorage for key "${key}":`, error);
        return defaultValue;
    }
};

const removeItem = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from AsyncStorage for key "${key}":`, error);
    }
};

// --- Courses ---
export const saveCourses = async (courses: Course[]): Promise<void> => setItem(COURSES_KEY, courses);
export const loadCourses = async (): Promise<Course[]> => getItem(COURSES_KEY, []);

// --- Activity ---
export const saveActivityLog = async (log: ActivityEvent[]): Promise<void> => setItem(ACTIVITY_LOG_KEY, log);
export const loadActivityLog = async (): Promise<ActivityEvent[]> => getItem(ACTIVITY_LOG_KEY, []);

export const saveUnlockedAchievements = async (achievements: UnlockedAchievement[]): Promise<void> => setItem(ACHIEVEMENTS_KEY, achievements);
export const loadUnlockedAchievements = async (): Promise<UnlockedAchievement[]> => getItem(ACHIEVEMENTS_KEY, []);

// --- Study Plan ---
export const saveStudyPlan = async (plan: StudyPlanItem[]): Promise<void> => setItem(STUDY_PLAN_KEY, plan);
export const loadStudyPlan = async (): Promise<StudyPlanItem[]> => getItem(STUDY_PLAN_KEY, []);

// --- Last Viewed ---
export const saveLastViewed = async (data: { courseId: string; sectionId: string }): Promise<void> => setItem(LAST_VIEWED_KEY, data);
export const loadLastViewed = async (): Promise<{ courseId: string; sectionId: string } | null> => getItem(LAST_VIEWED_KEY, null);

// --- AI Settings ---
export const saveApiKey = async (apiKey: string): Promise<void> => setItem(API_KEY_KEY, apiKey);
export const loadApiKey = async (): Promise<string | null> => getItem(API_KEY_KEY, null);
export const saveModel = async (model: string): Promise<void> => setItem(MODEL_KEY, model);
export const loadModel = async (): Promise<string | null> => getItem(MODEL_KEY, null);

// --- Global ---
export const clearAllData = async (): Promise<void> => {
    await removeItem(COURSES_KEY);
    await removeItem(ACTIVITY_LOG_KEY);
    await removeItem(ACHIEVEMENTS_KEY);
    await removeItem(STUDY_PLAN_KEY);
    await removeItem(LAST_VIEWED_KEY);
    await removeItem(API_KEY_KEY);
    await removeItem(MODEL_KEY);
};