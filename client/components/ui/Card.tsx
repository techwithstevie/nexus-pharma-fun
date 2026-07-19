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
        backgroundColor: tokens.color.bg.surface,
        borderColor: tokens.color.border.subtle,
    },
    elevated: {
        backgroundColor: tokens.color.bg.elevated,
        borderColor: tokens.color.border.default,
    },
    inset: {
        backgroundColor: tokens.color.bg.muted,
        borderColor: tokens.color.border.subtle,
    },
});