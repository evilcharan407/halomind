
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useCourses } from '../contexts/CourseContext';

const CourseCustomizationScreen = ({ route, navigation }: { route: any, navigation: any }) => {
    const { generatedCourse } = route.params;
    const [title, setTitle] = useState(generatedCourse.title);
    const [sections, setSections] = useState(generatedCourse.sections);
    const { addCourse } = useCourses();

    const handleAddCourse = () => {
        const newCourse = {
            id: new Date().toISOString(),
            title,
            sections: sections.map((section, index) => ({ ...section, id: `${index}`, content: section.summary })),
            progress: 0,
        };
        addCourse(newCourse);
        Alert.alert('Course Added', 'The new course has been added to your list.');
        navigation.navigate('Home');
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<{ title: string, summary: string }>) => (
        <TouchableOpacity
            style={[styles.sectionItem, { backgroundColor: isActive ? '#f0f0f0' : '#fff' }]}
            onLongPress={drag}
        >
            <TextInput
                style={styles.sectionTitle}
                value={item.title}
                onChangeText={(text) => {
                    const newSections = [...sections];
                    const index = newSections.findIndex(s => s.title === item.title);
                    newSections[index].title = text;
                    setSections(newSections);
                }}
            />
            <Text style={styles.sectionSummary}>{item.summary}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Customize Your Course</Text>
            <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
            />
            <DraggableFlatList
                data={sections}
                renderItem={renderItem}
                keyExtractor={(item) => item.title}
                onDragEnd={({ data }) => setSections(data)}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddCourse}>
                <Text style={styles.addButtonText}>Add Course</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { fontSize: 24, fontWeight: 'bold', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    titleInput: { fontSize: 20, fontWeight: 'bold', padding: 15, backgroundColor: '#fff', margin: 10, borderRadius: 5 },
    sectionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    sectionSummary: { fontSize: 14, color: '#666' },
    addButton: { backgroundColor: '#007bff', padding: 15, alignItems: 'center', margin: 10, borderRadius: 5 },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default CourseCustomizationScreen;
