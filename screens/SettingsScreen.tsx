
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ExportIcon, TrashIcon, GoogleDriveIcon, CheckCircleIcon } from '../components/icons';
import Spinner from '../components/Spinner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const SettingsScreen = () => {
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
    const [saveStatus, setSaveStatus] = useState('idle');

    useEffect(() => {
        const loadSettings = async () => {
            const storedApiKey = await AsyncStorage.getItem('apiKey');
            const storedModel = await AsyncStorage.getItem('aiModel');
            if (storedApiKey) setApiKey(storedApiKey);
            if (storedModel) setSelectedModel(storedModel);
        };
        loadSettings();
    }, []);

    const handleSaveAiSettings = async () => {
        setSaveStatus('saving');
        try {
            await AsyncStorage.setItem('apiKey', apiKey);
            await AsyncStorage.setItem('aiModel', selectedModel);
            setSaveStatus('saved');
        } catch (e) {
            console.error("Failed to save AI settings:", e);
            setSaveStatus('idle');
            Alert.alert("Failed to save settings.");
        }
    };

    useEffect(() => {
        if (saveStatus === 'saved') {
            const timer = setTimeout(() => setSaveStatus('idle'), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    const handleExportData = async () => {
        const dataToExport = {
            // Mock data for now
            courses: [],
            activity: { log: [], unlockedAchievements: [], studyStreak: 0 },
            studyPlan: [],
            exportDate: new Date().toISOString(),
        };

        const path = `${RNFS.DocumentDirectoryPath}/halomind_backup.json`;
        try {
            await RNFS.writeFile(path, JSON.stringify(dataToExport, null, 2), 'utf8');
            Alert.alert('Data Exported', `Your data has been saved to: ${path}`);
        } catch (error) {
            console.error('Export failed', error);
            Alert.alert('Export Failed', 'Could not save your data.');
        }
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to delete all your data? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: async () => {
                    await AsyncStorage.clear();
                    Alert.alert('Data Cleared', 'All local data has been cleared.');
                } },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>AI Configuration</Text>
                    <Text style={styles.label}>Google Gemini API Key</Text>
                    <TextInput
                        style={styles.input}
                        value={apiKey}
                        onChangeText={setApiKey}
                        placeholder="Enter your API key"
                        secureTextEntry
                    />
                    <Text style={styles.label}>Primary Text Model</Text>
                    <Text style={styles.input}>{selectedModel}</Text> // Placeholder for a picker
                    <TouchableOpacity style={styles.button} onPress={handleSaveAiSettings} disabled={saveStatus !== 'idle'}>
                        {saveStatus === 'idle' && <Text style={styles.buttonText}>Save AI Settings</Text>}
                        {saveStatus === 'saving' && <Spinner size="small" />}
                        {saveStatus === 'saved' && <CheckCircleIcon size={24} color="#fff" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Cloud Sync</Text>
                    <TouchableOpacity style={styles.button} onPress={() => {}}>
                        <GoogleDriveIcon size={24} color="#fff" />
                        <Text style={styles.buttonText}>Connect to Google Drive</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Data Management</Text>
                    <TouchableOpacity style={styles.button} onPress={handleExportData}>
                        <ExportIcon size={24} color="#fff" />
                        <Text style={styles.buttonText}>Export All Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearData}>
                        <TrashIcon size={24} color="#fff" />
                        <Text style={styles.buttonText}>Clear All Local Data</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>About</Text>
                    <Text style={styles.aboutText}>Halomind - AI Study Assistant</Text>
                    <Text style={styles.aboutText}>Version 1.0.0</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { fontSize: 24, fontWeight: 'bold', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    content: { padding: 20 },
    section: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 20 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    label: { color: '#999', marginBottom: 5 },
    input: { backgroundColor: '#eee', padding: 10, borderRadius: 5, marginBottom: 10 },
    button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007bff', padding: 15, borderRadius: 5, marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
    dangerButton: { backgroundColor: '#dc3545' },
    aboutText: { color: '#999' },
});

export default SettingsScreen;
