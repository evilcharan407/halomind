
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FlameIcon, TrophyIcon } from '../components/icons';

// Mock data for demonstration purposes
const activityLog = [
    { timestamp: new Date(Date.now() - 86400000).toISOString() },
    { timestamp: new Date(Date.now() - 172800000).toISOString() },
    { timestamp: new Date(Date.now() - 259200000).toISOString() },
];
const studyStreak = 3;
const unlockedAchievements = [{ achievementId: '1' }];
const achievementsData = [
    { id: '1', title: 'First Steps', description: 'Complete your first study session', icon: TrophyIcon },
    { id: '2', title: 'Weekend Warrior', description: 'Study on a Saturday or Sunday', icon: TrophyIcon },
    { id: '3', title: 'Night Owl', description: 'Study after 10 PM', icon: TrophyIcon },
];

const ActivityScreen = () => {
    const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));

    const generateHeatmapData = () => {
        const counts: { [key: string]: number } = {};
        activityLog.forEach(event => {
            const date = new Date(event.timestamp).toISOString().split('T')[0];
            counts[date] = (counts[date] || 0) + 1;
        });
        return counts;
    };

    const heatmapData = generateHeatmapData();

    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const days = [];
    let currentDate = threeMonthsAgo;
    while (currentDate <= today) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const getIntensityClass = (count: number) => {
        if (count === 0) return styles.heatmapCell;
        if (count <= 2) return [styles.heatmapCell, styles.intensity1];
        if (count <= 5) return [styles.heatmapCell, styles.intensity2];
        return [styles.heatmapCell, styles.intensity3];
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Your Activity</Text>
            <View style={styles.content}>
                <View style={styles.streakContainer}>
                    <Text style={styles.streakLabel}>CURRENT STREAK</Text>
                    <View style={styles.streakValueContainer}>
                        <Text style={styles.streakValue}>{studyStreak}</Text>
                        <FlameIcon size={48} color={studyStreak > 0 ? '#ff9500' : '#ccc'} />
                    </View>
                    <Text style={styles.streakDays}>day{studyStreak !== 1 && 's'}</Text>
                </View>

                <View style={styles.heatmapContainer}>
                    <Text style={styles.sectionHeader}>Study Heatmap</Text>
                    <View style={styles.heatmapGrid}>
                        {days.map(day => {
                            const dateString = day.toISOString().split('T')[0];
                            const count = heatmapData[dateString] || 0;
                            return <View key={dateString} style={getIntensityClass(count)} />;
                        })}
                    </View>
                </View>

                <View style={styles.achievementsContainer}>
                    <Text style={styles.sectionHeader}>Achievements</Text>
                    <View>
                        {achievementsData.map(ach => {
                            const isUnlocked = unlockedIds.has(ach.id);
                            const Icon = ach.icon;
                            return (
                                <View key={ach.id} style={[styles.achievementItem, !isUnlocked && styles.lockedAchievement]}>
                                    <View style={[styles.achievementIconContainer, isUnlocked ? styles.unlockedIcon : styles.lockedIcon]}>
                                        <Icon size={24} color={isUnlocked ? '#fff' : '#999'} />
                                    </View>
                                    <View>
                                        <Text style={styles.achievementTitle}>{ach.title}</Text>
                                        <Text style={styles.achievementDescription}>{ach.description}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    content: {
        padding: 20,
    },
    streakContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    streakLabel: {
        color: '#999',
        fontSize: 12,
        fontWeight: 'bold',
    },
    streakValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    streakValue: {
        fontSize: 48,
        fontWeight: 'bold',
        marginRight: 10,
    },
    streakDays: {
        color: '#999',
        fontSize: 12,
    },
    heatmapContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    heatmapGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    heatmapCell: {
        width: '13%',
        aspectRatio: 1,
        backgroundColor: '#eee',
        borderRadius: 3,
        margin: '0.5%',
    },
    intensity1: { backgroundColor: '#ffc966' },
    intensity2: { backgroundColor: '#ffac33' },
    intensity3: { backgroundColor: '#ff9500' },
    achievementsContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    lockedAchievement: {
        opacity: 0.5,
    },
    achievementIconContainer: {
        padding: 8,
        borderRadius: 8,
        marginRight: 15,
    },
    unlockedIcon: {
        backgroundColor: '#ff9500',
    },
    lockedIcon: {
        backgroundColor: '#ddd',
    },
    achievementTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    achievementDescription: {
        color: '#999',
    },
});

export default ActivityScreen;
