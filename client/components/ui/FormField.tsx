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
                style={[styles.input, multiline && styles.multiline, !editable && styles.disabled]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={tokens.color.neutral[400]}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                editable={editable}
                autoCorrect={false}
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
        color: tokens.color.neutral[700],
        marginBottom: 6,
    },
    req: { color: tokens.color.status.danger },
    input: {
        backgroundColor: tokens.color.neutral[0],
        borderWidth: 1,
        borderColor: tokens.color.neutral[300],
        borderRadius: tokens.radius.md,
        paddingHorizontal: tokens.spacing[4],
        paddingVertical: 12,
        fontSize: tokens.typography.body,
        color: tokens.color.neutral[900],
        minHeight: 48,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    disabled: {
        backgroundColor: tokens.color.neutral[100],
        color: tokens.color.neutral[500],
    },
    helper: {
        marginTop: 6,
        fontSize: tokens.typography.caption,
        color: tokens.color.neutral[500],
        lineHeight: 16,
    },
});