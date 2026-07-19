import { tokens } from '@/constants/theme';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';

interface Props {
    title: string;
    onPress: () => void;
    variant?: Variant;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}: Props) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
        >
            {loading ? (
                <ActivityIndicator
                    color={
                        variant === 'secondary' || variant === 'ghost'
                            ? tokens.color.text.primary
                            : tokens.color.text.inverse
                    }
                />
            ) : (
                <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: 48,
        borderRadius: tokens.radius.md,
        paddingHorizontal: tokens.spacing[5],
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: tokens.color.text.primary,
    },
    soft: {
        backgroundColor: 'rgba(255, 255, 255, 0.60)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.28)',
    },
    secondary: {
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(42, 42, 42, 0.7)',
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.4)',
    },
    disabled: { opacity: 0.4 },
    text: {
        fontSize: tokens.typography.bodySmall,
        fontWeight: '600',
    },
    primaryText: { color: tokens.color.text.inverse },
    softText: { color: tokens.color.text.inverse },
    secondaryText: { color: tokens.color.text.primary },
    ghostText: { color: tokens.color.text.secondary },
    dangerText: { color: tokens.color.status.danger },
});