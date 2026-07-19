import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdStore } from '@/store/useAdStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { tokens } from '@/constants/theme';

export default function WorkspaceScreen() {
  const router = useRouter();
  const { projects } = useAdStore();

  const needsMlr = projects.filter((p) => p.status === 'needs_mlr').length;
  const inReview = projects.filter((p) => p.status === 'in_review').length;
  const approved = projects.filter((p) => p.status === 'approved').length;
  const recent = projects.slice(0, 4);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>CONTENT AUTHORING</Text>
          <Text style={styles.heroTitle}>Workspace</Text>
          <Text style={styles.heroSub}>
            AI-assisted pharmaceutical content drafting with structured MLR
            readiness checks.
          </Text>
          <Button
            title="Create content draft"
            onPress={() => router.push('/(tabs)/create' as Href)}
            style={{ marginTop: tokens.spacing[4] }}
          />
        </View>

        <View style={styles.metrics}>
          <Metric
            label="Needs MLR"
            value={String(needsMlr)}
            icon="alert-circle-outline"
          />
          <Metric
            label="In review"
            value={String(inReview)}
            icon="time-outline"
          />
          <Metric
            label="Approved"
            value={String(approved)}
            icon="checkmark-circle-outline"
          />
        </View>

        <SectionHeader
          title="Recent activity"
          subtitle="Latest drafts in your content library"
          right={
            <TouchableOpacity onPress={() => router.push('/projects')}>
              <Text style={styles.link}>View all</Text>
            </TouchableOpacity>
          }
        />

        {recent.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>No drafts yet</Text>
            <Text style={styles.emptyBody}>
              Create a patient-facing copy or broadcast script draft to begin
              your review workflow.
            </Text>
          </Card>
        ) : (
          recent.map((p) => (
            <Card key={p.id} style={styles.item}>
              <View style={styles.itemTop}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {p.drug_name}
                </Text>
                <StatusBadge status={p.status} />
              </View>
              <Text style={styles.itemMeta}>
                {p.mode === 'copy' ? 'Patient-facing copy' : 'Broadcast script'}{' '}
                · v{p.version} ·{' '}
                {new Date(p.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </Card>
          ))
        )}

        <View style={{ marginTop: tokens.spacing[6] }}>
          <DisclaimerBanner />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Card style={styles.metricCard} elevated={false}>
      <Ionicons name={icon} size={18} color={tokens.color.brand[700]} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.color.neutral[50] },
  content: {
    padding: tokens.spacing[4],
    paddingBottom: tokens.spacing[12],
  },
  hero: {
    backgroundColor: tokens.color.brand[900],
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing[5],
    marginBottom: tokens.spacing[5],
  },
  kicker: {
    color: tokens.color.accent[100],
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroTitle: {
    color: tokens.color.neutral[0],
    fontSize: tokens.typography.display,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroSub: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.78)',
    fontSize: tokens.typography.bodySmall,
    lineHeight: 20,
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: tokens.spacing[6],
  },
  metricCard: {
    flex: 1,
    alignItems: 'flex-start',
    paddingVertical: tokens.spacing[3],
  },
  metricValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '700',
    color: tokens.color.neutral[900],
  },
  metricLabel: {
    marginTop: 2,
    fontSize: 11,
    color: tokens.color.neutral[500],
    fontWeight: '600',
  },
  link: {
    color: tokens.color.brand[700],
    fontWeight: '600',
    fontSize: tokens.typography.bodySmall,
  },
  item: { marginBottom: tokens.spacing[2] },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  itemTitle: {
    flex: 1,
    fontSize: tokens.typography.h3,
    fontWeight: '700',
    color: tokens.color.neutral[900],
  },
  itemMeta: {
    fontSize: tokens.typography.caption,
    color: tokens.color.neutral[500],
  },
  emptyTitle: {
    fontSize: tokens.typography.h3,
    fontWeight: '700',
    color: tokens.color.neutral[900],
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.neutral[500],
    lineHeight: 20,
  },
});