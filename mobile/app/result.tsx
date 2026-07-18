import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdStore } from '@/store/useAdStore';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import type { AdCopyResponse, CommercialScriptResponse } from '@/types';

function AdCopyView({ data }: { data: AdCopyResponse }) {
  return (
    <>
      <Section title="📬 Headline">
        <Text style={styles.headline}>{data.headline}</Text>
      </Section>
      <Section title="📝 Body Copy">
        <Text style={styles.body}>{data.body_copy}</Text>
      </Section>
      <Section title="📣 Call to Action">
        <Text style={styles.cta}>{data.cta}</Text>
      </Section>
      {data.isi && (
        <Section title="⚠️ Important Safety Information">
          <Text style={styles.isi}>{data.isi}</Text>
        </Section>
      )}
      <Section title="📋 Compliance Notes" warning>
        <Text style={styles.compliance}>{data.compliance_notes}</Text>
      </Section>
    </>
  );
}

function CommercialView({ data }: { data: CommercialScriptResponse }) {
  return (
    <>
      <Section title={`🎥 ${data.duration_seconds}s Commercial Script`}>
        <Text style={styles.body}>
          {data.scenes.length} scenes total
        </Text>
      </Section>
      {data.scenes.map((scene) => (
        <View key={scene.scene_number} style={styles.sceneCard}>
          <Text style={styles.sceneTitle}>
            Scene {scene.scene_number} • {scene.duration_seconds}s
          </Text>
          <Text style={styles.sceneLabel}>Visual</Text>
          <Text style={styles.sceneText}>{scene.visual_description}</Text>
          <Text style={styles.sceneLabel}>Voiceover</Text>
          <Text style={styles.sceneText}>{scene.voiceover}</Text>
          {scene.on_screen_text && (
            <>
              <Text style={styles.sceneLabel}>On-Screen Text</Text>
              <Text style={styles.sceneText}>{scene.on_screen_text}</Text>
            </>
          )}
        </View>
      ))}
      <Section title="⚠️ ISI Voiceover">
        <Text style={styles.isi}>{data.isi_voiceover}</Text>
      </Section>
      <Section title="📌 Compliance Notes" warning>
        <Text style={styles.compliance}>{data.compliance_notes}</Text>
      </Section>
    </>
  );
}

function Section({
  title,
  children,
  warning,
}: {
  title: string;
  children: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <View style={[styles.section, warning && styles.sectionWarning]}>
      <Text style={[styles.sectionTitle, warning && styles.sectionTitleWarning]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const { result, mode, form, saveProject, clearResult } = useAdStore();

  if (!result) {
    router.replace('/');
    return null;
  }

  const handleShare = async () => {
    const text =
      mode === 'copy' && 'headline' in result
        ? `${result.headline}\n\n${result.body_copy}\n\nCTA: ${result.cta}`
        : `${form.drug_name} Commercial Script — ${(result as CommercialScriptResponse).duration_seconds}s`;
    await Share.share({ message: text });
  };

  const handleSave = () => {
    saveProject();
    router.push('/projects');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.drugBadge}>
          <Text style={styles.drugName}>{form.drug_name}</Text>
          <Text style={styles.modeLabel}>
            {mode === 'copy' ? '📝 Ad Copy' : '🎥 Commercial'}
          </Text>
        </View>

        {mode === 'copy' && 'headline' in result ? (
          <AdCopyView data={result as AdCopyResponse} />
        ) : (
          <CommercialView data={result as CommercialScriptResponse} />
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>💾 Save Project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>📤 Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => { clearResult(); router.replace('/'); }}
        >
          <Text style={styles.newBtnText}>+ New Ad</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  drugBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  drugName: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800' },
  modeLabel: { color: Colors.accentLight, fontSize: FontSize.sm, marginTop: 4 },
  section: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionWarning: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  sectionTitleWarning: { color: '#92400E' },
  headline: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  body: { fontSize: FontSize.md, color: Colors.text, lineHeight: 22 },
  cta: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.accent,
  },
  isi: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  compliance: { fontSize: FontSize.sm, color: '#92400E', lineHeight: 20 },
  sceneCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  sceneTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  sceneLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  sceneText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareBtnText: { color: Colors.text, fontWeight: '700', fontSize: FontSize.md },
  newBtn: {
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  newBtnText: { color: Colors.accent, fontWeight: '700', fontSize: FontSize.md },
});
