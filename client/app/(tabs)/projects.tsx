import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
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

import { useState } from 'react';

export default function LibraryScreen() {
  const { projects, deleteProject, updateProjectStatus } = useAdStore();
  const [filter, setFilter] = useState<ContentStatus | 'all'>('all');

  const data =
    filter === 'all'
      ? projects
      : projects.filter((p) => p.status === filter);

  const onDelete = (id: string) => {
    Alert.alert('Delete draft', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteProject(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
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
        <Text style={styles.title} numberOfLines={1}>
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
          variant="tertiary"
          onPress={onDelete}
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.color.neutral[50] },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[3],
    paddingBottom: tokens.spacing[2],
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.color.neutral[0],
    borderWidth: 1,
    borderColor: tokens.color.neutral[200],
  },
  chipOn: {
    backgroundColor: tokens.color.brand[900],
    borderColor: tokens.color.brand[900],
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.color.neutral[600],
  },
  chipTextOn: { color: tokens.color.neutral[0] },
  list: {
    padding: tokens.spacing[4],
    paddingBottom: tokens.spacing[12],
  },
  card: { marginBottom: tokens.spacing[3] },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: tokens.typography.h3,
    fontWeight: '700',
    color: tokens.color.neutral[900],
  },
  meta: {
    fontSize: tokens.typography.caption,
    color: tokens.color.neutral[500],
    marginBottom: 2,
  },
  date: {
    fontSize: tokens.typography.caption,
    color: tokens.color.neutral[400],
    marginBottom: 8,
  },
  preview: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.neutral[700],
    lineHeight: 19,
    marginBottom: 12,
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
    fontWeight: '700',
    color: tokens.color.neutral[900],
    marginBottom: 8,
  },
  emptyBody: {
    textAlign: 'center',
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.neutral[500],
    lineHeight: 20,
  },
});