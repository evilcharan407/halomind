
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeIcon, CalendarIcon, ActivityIcon, SettingsIcon } from './components/icons';

import HomeScreen from './screens/HomeScreen';
import CourseDetailsScreen from './screens/CourseDetailsScreen';
import SectionScreen from './screens/SectionScreen';
import StudyPlanScreen from './screens/StudyPlanScreen';
import ActivityScreen from './screens/ActivityScreen';
import SettingsScreen from './screens/SettingsScreen';
import AnalyzerScreen from './screens/AnalyzerScreen';
import CourseCustomizationScreen from './screens/CourseCustomizationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
        <Stack.Screen name="Section" component={SectionScreen} />
        <Stack.Screen name="Analyzer" component={AnalyzerScreen} />
        <Stack.Screen name="CourseCustomization" component={CourseCustomizationScreen} />
    </Stack.Navigator>
);

const App = () => (
    <NavigationContainer>
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    if (route.name === 'Home') {
                        return <HomeIcon color={color} size={size} />;
                    } else if (route.name === 'Plan') {
                        return <CalendarIcon color={color} size={size} />;
                    } else if (route.name === 'Activity') {
                        return <ActivityIcon color={color} size={size} />;
                    } else if (route.name === 'Settings') {
                        return <SettingsIcon color={color} size={size} />;
                    }
                },
                tabBarActiveTintColor: '#007bff',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Plan" component={StudyPlanScreen} />
            <Tab.Screen name="Activity" component={ActivityScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    </NavigationContainer>
);

export default App;
