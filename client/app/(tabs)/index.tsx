import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { tokens } from '@/constants/theme';
import { useAdStore } from '@/store/useAdStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function DigitalBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Grid pattern */}
      <View style={styles.gridContainer}>
        {[...Array(20)].map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLine, styles.gridHorizontal, { top: i * 40 }]} />
        ))}
        {[...Array(Math.ceil(SCREEN_WIDTH / 40))].map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLine, styles.gridVertical, { left: i * 40 }]} />
        ))}
      </View>
    </View>
  );
}

export default function WorkspaceScreen() {
  const router = useRouter();
  const { projects } = useAdStore();

  const needsMlr = projects.filter((p) => p.status === 'needs_mlr').length;
  const inReview = projects.filter((p) => p.status === 'in_review').length;
  const approved = projects.filter((p) => p.status === 'approved').length;
  const recent = projects.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <DigitalBackground />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top bar brand */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brandMark}>NEXUS</Text>
            <Text style={styles.brandSub}>Content Operations</Text>
          </View>
          <View style={styles.envPill}>
            <View style={styles.envDot} />
            <Text style={styles.envText}>Authoring</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>REGULATED CONTENT WORKSPACE</Text>
          <Text style={styles.heroTitle}>
            Draft with precision.{'\n'}Review with control.
          </Text>
          <Text style={styles.heroBody}>
            AI-assisted authoring for patient-facing copy and broadcast scripts,
            structured for Medical, Legal, and Regulatory review.
          </Text>
          <Button
            title="New content draft"
            onPress={() => router.push('/(tabs)/create' as Href)}
            variant="soft"
            style={styles.heroCta}
          />
        </View>

        {/* Metrics */}
        <View style={styles.metrics}>
          <Metric label="Needs MLR" value={needsMlr} accent={tokens.color.status.warning} />
          <Metric label="In review" value={inReview} accent={tokens.color.status.info} />
          <Metric label="Approved" value={approved} accent={tokens.color.status.success} />
        </View>

        <SectionHeader
          title="Recent drafts"
          subtitle="Latest items in your content library"
          right={
            <TouchableOpacity onPress={() => router.push('/(tabs)/projects' as Href)}>
              <Text style={styles.link}>View all</Text>
            </TouchableOpacity>
          }
        />

        {recent.length === 0 ? (
          <Card variant="inset">
            <View style={styles.emptyRow}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={tokens.color.text.tertiary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyTitle}>No drafts yet</Text>
                <Text style={styles.emptyBody}>
                  Create patient-facing copy or a broadcast script to open your
                  first review cycle.
                </Text>
              </View>
            </View>
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
                {p.mode === 'copy' ? 'Patient-facing copy' : 'Broadcast script'}
                {'  ·  '}v{p.version}
                {'  ·  '}
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
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card style={styles.metricCard} variant="default">
      <View style={[styles.metricBar, { backgroundColor: accent }]} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.color.bg.base },
  content: {
    padding: tokens.spacing[4],
    paddingBottom: tokens.spacing[16],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[5],
  },
  brandMark: {
    color: tokens.color.text.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 3,
  },
  brandSub: {
    marginTop: 2,
    color: tokens.color.text.tertiary,
    fontSize: 11,
    fontWeight: '500',
  },
  envPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.color.bg.muted,
    borderWidth: 1,
    borderColor: tokens.color.border.subtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.radius.full,
  },
  envDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.color.status.success,
  },
  envText: {
    color: tokens.color.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  hero: {
    marginBottom: tokens.spacing[6],
    paddingBottom: tokens.spacing[6],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.color.border.subtle,
    alignItems: 'center',
  },
  heroEyebrow: {
    color: tokens.color.text.tertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroTitle: {
    color: tokens.color.text.primary,
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroBody: {
    color: tokens.color.text.secondary,
    fontSize: tokens.typography.bodySmall,
    lineHeight: 20,
    maxWidth: 340,
    textAlign: 'center',
  },
  heroCta: {
    marginTop: tokens.spacing[5],
    alignSelf: 'center',
    minWidth: 180,
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: tokens.spacing[6],
  },
  metricCard: {
    flex: 1,
    overflow: 'hidden',
    paddingTop: tokens.spacing[4],
  },
  metricBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '600',
    color: tokens.color.text.primary,
    letterSpacing: -0.5,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 11,
    color: tokens.color.text.tertiary,
    fontWeight: '500',
  },
  link: {
    color: tokens.color.text.secondary,
    fontWeight: '600',
    fontSize: tokens.typography.bodySmall,
  },
  item: { marginBottom: tokens.spacing[2] },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: tokens.typography.h3,
    fontWeight: '600',
    color: tokens.color.text.primary,
  },
  itemMeta: {
    fontSize: tokens.typography.caption,
    color: tokens.color.text.tertiary,
  },
  emptyRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: tokens.color.bg.surface,
    borderWidth: 1,
    borderColor: tokens.color.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: tokens.typography.h3,
    fontWeight: '600',
    color: tokens.color.text.primary,
    marginBottom: 4,
  },
  emptyBody: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.text.tertiary,
    lineHeight: 19,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(91, 141, 239, 0.08)',
  },
  gridHorizontal: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridVertical: {
    top: 0,
    bottom: 0,
    width: 1,
  },
});