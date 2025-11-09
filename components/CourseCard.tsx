
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Course } from '../types';

const CourseCard = ({ course, onClick }: { course: Course; onClick: () => void }) => (
    <TouchableOpacity onPress={onClick} style={styles.cardContainer}>
        <View style={styles.innerContainer}>
            <View style={styles.iconContainer}>
                {/* Add BookIcon here */}
            </View>
            <View>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseSections}>{course.sections.length} sections</Text>
            </View>
            {/* Add ArrowRightIcon here */}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#eee',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        marginRight: 16,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    courseSections: {
        color: '#666',
    },
});

export default CourseCard;
