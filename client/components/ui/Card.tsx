import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@/constants/theme';

interface Props {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'elevated' | 'inset';
}

export function Card({ children, style, variant = 'default' }: Props) {
    return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
    base: {
        borderRadius: tokens.radius.lg,
        padding: tokens.spacing[4],
        borderWidth: 1,
    },
    default: {
        backgroundColor: 'rgba(17, 17, 17, 0.85)',
        borderColor: 'rgba(31, 31, 31, 0.6)',
    },
    elevated: {
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        borderColor: 'rgba(42, 42, 42, 0.7)',
    },
    inset: {
        backgroundColor: 'rgba(26, 26, 26, 0.7)',
        borderColor: 'rgba(31, 31, 31, 0.5)',
    },
});