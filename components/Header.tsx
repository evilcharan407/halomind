
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Header = ({ title, onBack, actions }: { title: string, onBack?: () => void, actions?: React.ReactNode }) => (
    <View style={styles.headerContainer}>
        {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                {/* Add BackIcon here */}
            </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        {actions && <View style={styles.actionsContainer}>{actions}</View>}
    </View>
);

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
    },
    actionsContainer: {
        marginLeft: 16,
    },
});

export default Header;
