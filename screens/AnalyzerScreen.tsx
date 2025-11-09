
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { UploadIcon, LinkIcon, ImageIcon, VideoIcon } from '../components/icons';
import Spinner from '../components/Spinner';
import { extractTextFromUrl } from '../services/textExtractor';
import { generateCourseFromText } from '../services/aiService';

const AnalyzerScreen = ({ navigation }: { navigation: any }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFilePick = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf, DocumentPicker.types.docx, DocumentPicker.types.plainText],
            });
            // Text extraction from files is not yet implemented
            Alert.alert('File Picked', `You picked: ${res[0].name}. File processing is not yet available.`);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                throw err;
            }
        }
    };

    const handleUrlSubmit = async () => {
        if (!url) {
            Alert.alert('URL Required', 'Please enter a URL to generate a course.');
            return;
        }

        setLoading(true);
        try {
            const text = await extractTextFromUrl(url);
            if (text) {
                const generatedCourse = await generateCourseFromText(text);
                if (generatedCourse) {
                    navigation.navigate('CourseCustomization', { generatedCourse });
                }
            }
        } catch (error) {
            console.error("An error occurred during URL processing:", error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Modal
                transparent={true}
                animationType="none"
                visible={loading}
            >
                <View style={styles.modalBackground}>
                    <Spinner size="large" />
                    <Text style={styles.loadingText}>Analyzing and generating course...</Text>
                </View>
            </Modal>

            <Text style={styles.header}>Create or Analyze</Text>
            <View style={styles.content}>
                <TouchableOpacity style={styles.button} onPress={handleFilePick}>
                    <UploadIcon size={24} color="#fff" />
                    <Text style={styles.buttonText}>Course from File (.pdf, .docx)</Text>
                </TouchableOpacity>
                <View style={styles.urlContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Course from Web Link"
                        value={url}
                        onChangeText={setUrl}
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleUrlSubmit} disabled={loading}>
                        <LinkIcon size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => {}}>
                    <ImageIcon size={24} color="#fff" />
                    <Text style={styles.buttonText}>Analyze Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {}}>
                    <VideoIcon size={24} color="#fff" />
                    <Text style={styles.buttonText}>Analyze Video</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { fontSize: 24, fontWeight: 'bold', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    content: { padding: 20 },
    button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007bff', padding: 15, borderRadius: 5, marginBottom: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
    urlContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    input: { flex: 1, backgroundColor: '#eee', padding: 10, borderRadius: 5, marginRight: 10 },
    submitButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5 },
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    loadingText: { color: '#fff', marginTop: 10 },
});

export default AnalyzerScreen;
