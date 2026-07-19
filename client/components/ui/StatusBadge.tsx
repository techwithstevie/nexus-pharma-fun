import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/constants/theme';
import type { ContentStatus } from '@/types';

const CONFIG: Record<
    ContentStatus,
    { label: string; bg: string; fg: string; border: string }
> = {
    draft: {
        label: 'Draft',
        bg: tokens.color.status.neutralSoft,
        fg: tokens.color.status.neutral,
        border: 'rgba(161,161,170,0.25)',
    },
    needs_mlr: {
        label: 'Needs MLR',
        bg: tokens.color.status.warningSoft,
        fg: tokens.color.status.warning,
        border: 'rgba(251,191,36,0.28)',
    },
    in_review: {
        label: 'In review',
        bg: tokens.color.status.infoSoft,
        fg: tokens.color.status.info,
        border: 'rgba(96,165,250,0.28)',
    },
    needs_changes: {
        label: 'Needs changes',
        bg: tokens.color.status.dangerSoft,
        fg: tokens.color.status.danger,
        border: 'rgba(248,113,113,0.28)',
    },
    approved: {
        label: 'Approved',
        bg: tokens.color.status.successSoft,
        fg: tokens.color.status.success,
        border: 'rgba(52,211,153,0.28)',
    },
    archived: {
        label: 'Archived',
        bg: tokens.color.bg.muted,
        fg: tokens.color.text.tertiary,
        border: tokens.color.border.subtle,
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