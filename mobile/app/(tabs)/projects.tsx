import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdStore } from '@/store/useAdStore';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import type { SavedProject } from '@/types';

function ProjectCard({
  project,
  onDelete,
}: {
  project: SavedProject;
  onDelete: () => void;
}) {
  const date = new Date(project.created_at).toLocaleDateString();
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDrug}>{project.drug_name}</Text>
        <View
          style={[
            styles.badge,
            project.mode === 'commercial' ? styles.badgeCommercial : styles.badgeCopy,
          ]}
        >
          <Text style={styles.badgeText}>
            {project.mode === 'copy' ? '📝 Copy' : '🎥 Commercial'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardDate}>{date}</Text>
      {project.mode === 'copy' && 'headline' in project.result && (
        <Text style={styles.cardPreview} numberOfLines={2}>
          {project.result.headline}
        </Text>
      )}
      {project.mode === 'commercial' && 'scenes' in project.result && (
        <Text style={styles.cardPreview}>
          {project.result.scenes.length} scenes • {project.result.duration_seconds}s
        </Text>
      )}
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ProjectsScreen() {
  const { projects, deleteProject } = useAdStore();

  const handleDelete = (id: string) => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProject(id) },
    ]);
  };

  if (projects.length === 0) {
    return (
      <SafeAreaView style={styles.empty} edges={['bottom']}>
        <Text style={styles.emptyIcon}>📂</Text>
        <Text style={styles.emptyText}>No saved projects yet.</Text>
        <Text style={styles.emptySubText}>
          Generate and save ads from the Create tab.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProjectCard project={item} onDelete={() => handleDelete(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardDrug: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  badge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  badgeCopy: { backgroundColor: '#DBEAFE' },
  badgeCommercial: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  cardDate: { color: Colors.textSecondary, fontSize: FontSize.xs, marginBottom: 6 },
  cardPreview: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: 8 },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteBtnText: { color: Colors.error, fontSize: FontSize.sm, fontWeight: '600' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptySubText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
