import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/constants/theme';
import type { ContentStatus } from '@/types';

const CONFIG: Record<
    ContentStatus,
    { label: string; bg: string; fg: string }
> = {
    draft: {
        label: 'Draft',
        bg: tokens.color.status.pendingBg,
        fg: tokens.color.status.pending,
    },
    needs_mlr: {
        label: 'Needs MLR Review',
        bg: tokens.color.status.warningBg,
        fg: tokens.color.status.warning,
    },
    in_review: {
        label: 'In Review',
        bg: tokens.color.status.infoBg,
        fg: tokens.color.status.info,
    },
    needs_changes: {
        label: 'Needs Changes',
        bg: tokens.color.status.dangerBg,
        fg: tokens.color.status.danger,
    },
    approved: {
        label: 'Approved',
        bg: tokens.color.status.successBg,
        fg: tokens.color.status.success,
    },
    archived: {
        label: 'Archived',
        bg: tokens.color.neutral[100],
        fg: tokens.color.neutral[600],
    },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
    const cfg = CONFIG[status];
    return (
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.text, { color: cfg.fg }]}>{cfg.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: tokens.radius.full,
    },
    text: {
        fontSize: tokens.typography.caption,
        fontWeight: '700',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
});