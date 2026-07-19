import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/constants/theme';
import type { ContentStatus } from '@/types';

const CONFIG: Record<
    ContentStatus,
    { label: string; bg: string; fg: string; border: string }
> = {
    draft: {
        label: 'Draft',
        bg: 'rgba(161, 161, 170, 0.12)',
        fg: tokens.color.status.neutral,
        border: 'rgba(161, 161, 170, 0.3)',
    },
    needs_mlr: {
        label: 'Needs MLR',
        bg: 'rgba(251, 191, 36, 0.12)',
        fg: tokens.color.status.warning,
        border: 'rgba(251, 191, 36, 0.35)',
    },
    in_review: {
        label: 'In review',
        bg: 'rgba(96, 165, 250, 0.12)',
        fg: tokens.color.status.info,
        border: 'rgba(96, 165, 250, 0.35)',
    },
    needs_changes: {
        label: 'Needs changes',
        bg: 'rgba(248, 113, 113, 0.12)',
        fg: tokens.color.status.danger,
        border: 'rgba(248, 113, 113, 0.35)',
    },
    approved: {
        label: 'Approved',
        bg: 'rgba(52, 211, 153, 0.12)',
        fg: tokens.color.status.success,
        border: 'rgba(52, 211, 153, 0.35)',
    },
    archived: {
        label: 'Archived',
        bg: 'rgba(26, 26, 26, 0.7)',
        fg: tokens.color.text.tertiary,
        border: 'rgba(31, 31, 31, 0.5)',
    },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
    const cfg = CONFIG[status];
    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: cfg.bg, borderColor: cfg.border },
            ]}
        >
            <View style={[styles.dot, { backgroundColor: cfg.fg }]} />
            <Text style={[styles.text, { color: cfg.fg }]}>{cfg.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: tokens.radius.full,
        borderWidth: 1,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    text: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
});