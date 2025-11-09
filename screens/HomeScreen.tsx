
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Course, Section, StudyPlanItem } from '../types';
import { useCourses } from '../contexts/CourseContext';
import { useStudyPlan } from '../contexts/StudyPlanContext';
import { useActivity } from '../contexts/ActivityContext';
import { achievementsData } from '../data/achievements';
import { loadLastViewed } from '../services/storageService';
import { FlameIcon, TrophyIcon, ArrowRightIcon, BookOpenIcon, PlusIcon } from '../components/icons';

const DashboardCard = ({ children, style }: { children: React.ReactNode, style?: any }) => (
    <View style={[styles.dashboardCard, style]}>
        {children}
    </View>
);

const HomeScreen = ({ navigation }: { navigation: any }) => {
    const { courses } = useCourses();
    const { studyPlan } = useStudyPlan();
    const { studyStreak, unlockedAchievements } = useActivity();
    const [lastViewed, setLastViewed] = useState<{ course: Course; section: Section } | null>(null);

    useEffect(() => {
        const fetchLastViewed = async () => {
            const lastViewedIds = await loadLastViewed();
            if (lastViewedIds && courses.length > 0) {
                const course = courses.find(c => c.id === lastViewedIds.courseId);
                if (course) {
                    const section = course.sections.find(s => s.id === lastViewedIds.sectionId);
                    if (section) {
                        setLastViewed({ course, section });
                    }
                }
            } else if (!lastViewedIds) {
                setLastViewed(null);
            }
        };

        fetchLastViewed();
    }, [courses]);

    const todayISO = new Date().toISOString().split('T')[0];
    const todaysTasks = studyPlan.filter(item => item.scheduledDate === todayISO && !item.completed);

    const latestAchievement = unlockedAchievements.length > 0
        ? achievementsData.find(a => a.id === unlockedAchievements[unlockedAchievements.length - 1].achievementId)
        : null;

    const handleTaskClick = (item: StudyPlanItem) => {
        const course = courses.find(c => c.id === item.courseId);
        if (course) {
            const section = course.sections.find(s => s.id === item.sectionId);
            if (section) {
                navigation.navigate('Section', { course, section });
            }
        }
    };

    const CourseCard = ({ course, onPress }: { course: Course, onPress: () => void }) => (
        <TouchableOpacity onPress={onPress} style={styles.courseCard}>
            <Text style={styles.courseCardTitle}>{course.title}</Text>
            <Text style={styles.courseCardSubtitle}>{course.sections.length} sections</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.header}>Today</Text>
                <View style={styles.dashboardRow}>
                    <DashboardCard style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.cardLabel}>Streak</Text>
                        <View style={styles.cardValueRow}>
                            <Text style={styles.streakValue}>{studyStreak}</Text>
                            <FlameIcon size={32} color={studyStreak > 0 ? '#ff9500' : '#ccc'} />
                        </View>
                        <Text style={styles.cardSubLabel}>day{studyStreak !== 1 && 's'}</Text>
                    </DashboardCard>
                    <DashboardCard style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.cardLabel}>Latest Award</Text>
                        {latestAchievement ? (
                            <View style={styles.cardValueRow}>
                                <TrophyIcon size={32} color="#ffc107" />
                                <Text style={styles.achievementTitle}>{latestAchievement.title}</Text>
                            </View>
                        ) : (
                            <Text style={styles.noDataText}>No achievements yet.</Text>
                        )}
                    </DashboardCard>
                </View>

                {lastViewed && (
                    <TouchableOpacity onPress={() => navigation.navigate('Section', { course: lastViewed.course, section: lastViewed.section })} style={styles.lastViewedCard}>
                        <Text style={styles.cardLabel}>Continue Learning</Text>
                        <View style={styles.lastViewedContent}>
                            <View>
                                <Text style={styles.lastViewedTitle}>{lastViewed.section.title}</Text>
                                <Text style={styles.lastViewedSubtitle}>{lastViewed.course.title}</Text>
                            </View>
                            <ArrowRightIcon size={24} color="#ccc" />
                        </View>
                    </TouchableOpacity>
                )}

                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.sectionHeader}>Today's Plan</Text>
                    <DashboardCard style={todaysTasks.length === 0 ? { alignItems: 'center' } : {}}>
                        {todaysTasks.length > 0 ? (
                            <View style={{ width: '100%' }}>
                                {todaysTasks.map(item => (
                                    <TouchableOpacity key={item.id} onPress={() => handleTaskClick(item)} style={styles.taskItem}>
                                        <View style={styles.taskIndicator}></View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.taskTitle}>{item.sectionTitle}</Text>
                                            <Text style={styles.taskSubtitle}>{item.courseTitle}</Text>
                                        </View>
                                        <ArrowRightIcon size={24} color="#ccc" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.noDataText}>No study sessions planned for today. Great job staying on top of things!</Text>
                        )}
                    </DashboardCard>
                </View>

                <View>
                    <Text style={styles.sectionHeader}>All Courses</Text>
                    {courses.length === 0 ? (
                        <View style={styles.welcomeContainer}>
                            <BookOpenIcon size={64} color="#ccc" />
                            <Text style={styles.welcomeHeader}>Welcome to Halomind</Text>
                            <Text style={styles.welcomeSubtext}>
                                Tap the <PlusIcon size={16} color="#007bff" /> button to create your first course.
                            </Text>
                        </View>
                    ) : (
                        courses.map(course => (
                            <CourseCard key={course.id} course={course} onPress={() => navigation.navigate('Course', { course })} />
                        ))
                    )}
                </View>
            </ScrollView>
            <TouchableOpacity
                onPress={() => navigation.navigate('Analyzer')}
                style={styles.fab}
            >
                <PlusIcon size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContainer: { padding: 16 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    dashboardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    dashboardCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12 },
    cardLabel: { fontSize: 14, color: '#666' },
    cardValueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    streakValue: { fontSize: 32, fontWeight: 'bold', marginRight: 8 },
    cardSubLabel: { fontSize: 12, color: '#666', marginTop: 4 },
    achievementTitle: { fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
    noDataText: { fontSize: 14, color: '#666', marginTop: 8 },
    lastViewedCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 },
    lastViewedContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    lastViewedTitle: { fontSize: 18, fontWeight: 'bold' },
    lastViewedSubtitle: { fontSize: 14, color: '#666' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 8, color: '#666' },
    taskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    taskIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007bff', marginRight: 12 },
    taskTitle: { fontWeight: 'bold' },
    taskSubtitle: { fontSize: 12, color: '#666' },
    welcomeContainer: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderRadius: 12 },
    welcomeHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
    welcomeSubtext: { color: '#666', marginTop: 8, textAlign: 'center', maxWidth: 300 },
    courseCard: { padding: 16, backgroundColor: '#fff', borderRadius: 8, marginBottom: 16 },
    courseCardTitle: { fontSize: 18, fontWeight: 'bold' },
    courseCardSubtitle: { fontSize: 14, color: '#666' },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default HomeScreen;
