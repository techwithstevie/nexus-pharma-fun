import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/constants/theme';

interface Props {
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, right }: Props) {
    return (
        <View style={styles.row}>
            <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {right}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: tokens.spacing[3],
    },
    textBlock: { flex: 1, paddingRight: tokens.spacing[3] },
    title: {
        fontSize: tokens.typography.h2,
        fontWeight: '600',
        color: tokens.color.text.primary,
        letterSpacing: -0.3,
    },
    subtitle: {
        marginTop: 4,
        fontSize: tokens.typography.bodySmall,
        color: tokens.color.text.tertiary,
        lineHeight: 18,
    },
});