
import React from 'react';
import { ActivityIndicator } from 'react-native';

const Spinner = ({ size = 'large' }: { size?: 'small' | 'large' }) => (
    <ActivityIndicator size={size} color="#007bff" />
);

export default Spinner;
