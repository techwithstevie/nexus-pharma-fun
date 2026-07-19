import { View, Text, TextInput, StyleSheet } from 'react-native';
import { tokens } from '@/constants/theme';

interface Props {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
    helper?: string;
    required?: boolean;
    multiline?: boolean;
    editable?: boolean;
}

export function FormField({
    label,
    value,
    onChangeText,
    placeholder,
    helper,
    required,
    multiline,
    editable = true,
}: Props) {
    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>
                {label}
                {required ? <Text style={styles.req}> *</Text> : null}
            </Text>
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multiline,
                    !editable && styles.disabled,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={tokens.color.text.tertiary}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                editable={editable}
                autoCorrect={false}
                selectionColor={tokens.color.brand.primary}
                accessibilityLabel={label}
            />
            {helper ? <Text style={styles.helper}>{helper}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginBottom: tokens.spacing[4] },
    label: {
        fontSize: tokens.typography.label,
        fontWeight: '600',
        color: tokens.color.text.secondary,
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    req: { color: tokens.color.status.danger },
    input: {
        backgroundColor: tokens.color.bg.muted,
        borderWidth: 1,
        borderColor: tokens.color.border.default,
        borderRadius: tokens.radius.md,
        paddingHorizontal: tokens.spacing[4],
        paddingVertical: 14,
        fontSize: tokens.typography.body,
        color: tokens.color.text.primary,
        minHeight: 50,
    },
    multiline: {
        minHeight: 110,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    disabled: {
        opacity: 0.5,
    },
    helper: {
        marginTop: 8,
        fontSize: tokens.typography.caption,
        color: tokens.color.text.tertiary,
        lineHeight: 16,
    },
});