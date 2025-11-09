
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ArrowRightIcon } from '../components/icons';

// Mock data for demonstration purposes
const studyPlan = [
    {
        id: '1',
        scheduledDate: new Date().toISOString().split('T')[0],
        completed: false,
        sectionTitle: 'Introduction to React Native',
        courseTitle: 'React Native for Beginners',
    },
    {
        id: '2',
        scheduledDate: new Date().toISOString().split('T')[0],
        completed: true,
        sectionTitle: 'Components and Props',
        courseTitle: 'React Native for Beginners',
    },
];

const StudyPlanScreen = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const planByDate = useMemo(() => {
        return studyPlan.reduce((acc, item) => {
            const date = item.scheduledDate;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {} as { [key: string]: typeof studyPlan });
    }, [studyPlan]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array(firstDay).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => changeMonth(-1)}>
                        <Text style={styles.calendarNav}>&lt;</Text>
                    </TouchableOpacity>
                    <Text style={styles.calendarHeaderText}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                    <TouchableOpacity onPress={() => changeMonth(1)}>
                        <Text style={styles.calendarNav}>&gt;</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.calendarGrid}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <Text key={d} style={styles.calendarWeekDay}>{d}</Text>)}
                    {blanks.map((_, i) => <View key={`b-${i}`} style={styles.calendarDay} />)}
                    {days.map(day => {
                        const date = new Date(year, month, day);
                        const dateString = date.toISOString().split('T')[0];
                        const hasItems = planByDate[dateString];
                        const isSelected = date.toDateString() === selectedDate.toDateString();

                        return (
                            <TouchableOpacity key={day} onPress={() => setSelectedDate(date)} style={[styles.calendarDay, isSelected && styles.selectedDay]}>
                                <Text style={isSelected ? styles.selectedDayText : styles.dayText}>{day}</Text>
                                {hasItems && <View style={styles.dayIndicator} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const itemsForSelectedDate = planByDate[selectedDateString] || [];

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Study Plan</Text>
            <View style={styles.content}>
                {renderCalendar()}
                <View style={styles.tasksContainer}>
                    <Text style={styles.tasksHeader}>Tasks for {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}</Text>
                    {itemsForSelectedDate.length > 0 ? (
                        <View>
                            {itemsForSelectedDate.map(item => (
                                <View key={item.id} style={styles.taskItem}>
                                    <Switch
                                        value={item.completed}
                                        onValueChange={() => { /* Toggle completion */ }}
                                        trackColor={{ false: '#767577', true: '#007bff' }}
                                        thumbColor={item.completed ? '#f4f3f4' : '#f4f3f4'}
                                    />
                                    <View style={styles.taskTextContainer}>
                                        <Text style={[styles.taskTitle, item.completed && styles.completedTask]}>{item.sectionTitle}</Text>
                                        <Text style={styles.taskCourse}>{item.courseTitle}</Text>
                                    </View>
                                    <ArrowRightIcon size={24} color="#ccc" />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.noTasksContainer}>
                            <Text style={styles.noTasksText}>No study sessions planned for this day.</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
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
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    calendarNav: {
        fontSize: 18,
        color: '#007bff',
    },
    calendarHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarWeekDay: {
        width: '14.28%',
        textAlign: 'center',
        color: '#999',
        marginBottom: 10,
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedDay: {
        backgroundColor: '#007bff',
        borderRadius: 20,
    },
    dayText: {
        fontSize: 16,
    },
    selectedDayText: {
        fontSize: 16,
        color: '#fff',
    },
    dayIndicator: {
        position: 'absolute',
        bottom: 5,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#007bff',
    },
    tasksContainer: {
        marginTop: 20,
    },
    tasksHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    taskItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    taskTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    completedTask: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    taskCourse: {
        color: '#999',
    },
    noTasksContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    noTasksText: {
        color: '#999',
    },
});

export default StudyPlanScreen;
