import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    StyleProp
} from 'react-native';
import { tokens } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger';

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
            style={[
                styles.base,
                styles[variant],
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
        >
            {loading ? (
                <ActivityIndicator
                    color={
                        variant === 'secondary' || variant === 'tertiary'
                            ? tokens.color.brand[900]
                            : tokens.color.neutral[0]
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
        backgroundColor: tokens.color.brand[900],
    },
    secondary: {
        backgroundColor: tokens.color.neutral[0],
        borderWidth: 1,
        borderColor: tokens.color.neutral[300],
    },
    tertiary: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: tokens.color.status.danger,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: tokens.typography.body,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    primaryText: {
        color: tokens.color.neutral[0],
    },
    secondaryText: {
        color: tokens.color.neutral[800],
    },
    tertiaryText: {
        color: tokens.color.brand[700],
    },
    dangerText: {
        color: tokens.color.neutral[0],
    },
});