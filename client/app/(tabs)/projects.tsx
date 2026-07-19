import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdStore } from '@/store/useAdStore';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/constants/theme';
import type { ContentStatus, SavedProject } from '@/types';

const FILTERS: { key: ContentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'needs_mlr', label: 'Needs MLR' },
  { key: 'in_review', label: 'In review' },
  { key: 'approved', label: 'Approved' },
];
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function DigitalBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
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

export default function LibraryScreen() {
  const { projects, deleteProject, updateProjectStatus } = useAdStore();
  const [filter, setFilter] = useState<ContentStatus | 'all'>('all');

  const data =
    filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  const onDelete = (id: string) => {
    Alert.alert('Delete draft', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProject(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <DigitalBackground />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LIBRARY</Text>
        <Text style={styles.title}>Content library</Text>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipOn]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextOn]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No content in library</Text>
          <Text style={styles.emptyBody}>
            Generated drafts appear here for tracking, versioning, and MLR
            workflow status.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <LibraryCard
              project={item}
              onDelete={() => onDelete(item.id)}
              onStatus={(s) => updateProjectStatus(item.id, s)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function LibraryCard({
  project,
  onDelete,
  onStatus,
}: {
  project: SavedProject;
  onDelete: () => void;
  onStatus: (s: ContentStatus) => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {project.drug_name}
        </Text>
        <StatusBadge status={project.status} />
      </View>
      <Text style={styles.meta}>
        {project.mode === 'copy' ? 'Patient-facing copy' : 'Broadcast script'} ·
        Version {project.version}
      </Text>
      <Text style={styles.date}>
        {new Date(project.created_at).toLocaleString()}
      </Text>

      {project.mode === 'copy' && 'headline' in project.result ? (
        <Text style={styles.preview} numberOfLines={2}>
          {project.result.headline}
        </Text>
      ) : null}

      <View style={styles.actions}>
        {project.status === 'needs_mlr' ? (
          <Button
            title="Mark in review"
            variant="secondary"
            onPress={() => onStatus('in_review')}
            style={styles.actionBtn}
          />
        ) : null}
        {project.status === 'in_review' ? (
          <Button
            title="Mark approved"
            onPress={() => onStatus('approved')}
            style={styles.actionBtn}
          />
        ) : null}
        <Button
          title="Delete"
          variant="ghost"
          onPress={onDelete}
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.color.bg.base },
  header: {
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[3],
  },
  eyebrow: {
    color: tokens.color.text.tertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 6,
    textAlign: 'center',
  },
  title: {
    fontSize: tokens.typography.h1,
    fontWeight: '600',
    color: tokens.color.text.primary,
    letterSpacing: -0.4,
    marginBottom: tokens.spacing[3],
    textAlign: 'center',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[2],
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.color.bg.muted,
    borderWidth: 1,
    borderColor: tokens.color.border.subtle,
  },
  chipOn: {
    backgroundColor: tokens.color.text.primary,
    borderColor: tokens.color.text.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.color.text.secondary,
  },
  chipTextOn: { color: tokens.color.text.inverse },
  list: {
    padding: tokens.spacing[4],
    paddingBottom: tokens.spacing[16],
  },
  card: { marginBottom: tokens.spacing[3] },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: tokens.typography.h3,
    fontWeight: '600',
    color: tokens.color.text.primary,
  },
  meta: {
    fontSize: tokens.typography.caption,
    color: tokens.color.text.tertiary,
    marginBottom: 2,
  },
  date: {
    fontSize: tokens.typography.caption,
    color: tokens.color.text.tertiary,
    marginBottom: 10,
    opacity: 0.8,
  },
  preview: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.text.secondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { minHeight: 40, paddingHorizontal: 14 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[8],
  },
  emptyTitle: {
    fontSize: tokens.typography.h2,
    fontWeight: '600',
    color: tokens.color.text.primary,
    marginBottom: 8,
  },
  emptyBody: {
    textAlign: 'center',
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.text.tertiary,
    lineHeight: 20,
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