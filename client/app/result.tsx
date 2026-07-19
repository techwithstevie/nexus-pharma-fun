import { View, Text, ScrollView, StyleSheet, Share } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdStore } from '@/store/useAdStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { tokens } from '@/constants/theme';
import type { AdCopyResponse, CommercialScriptResponse } from '@/types';

export default function ResultScreen() {
  const router = useRouter();
  const { result, mode, form, saveProject, clearResult } = useAdStore();

  if (!result) {
    router.replace('/' as Href);
    return null;
  }

  const docId = `DRAFT-${Date.now().toString().slice(-6)}`;

  const handleShare = async () => {
    let message = `${form.drug_name} — ${docId}\n\n`;
    if (mode === 'copy' && 'headline' in result) {
      message += `${result.headline}\n\n${result.body_copy}\n\nCTA: ${result.cta}`;
      if (result.isi) message += `\n\nISI:\n${result.isi}`;
    } else if ('scenes' in result) {
      message += result.scenes
        .map(
          (s) =>
            `Scene ${s.scene_number} (${s.duration_seconds}s)\nVisual: ${s.visual_description}\nVO: ${s.voiceover}`
        )
        .join('\n\n');
      message += `\n\nISI VO:\n${result.isi_voiceover}`;
    }
    message +=
      '\n\n— Draft only. Requires MLR review before external use.';
    await Share.share({ message });
  };

  const handleSave = () => {
    saveProject();
    router.push('/(tabs)/projects' as Href);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="elevated" style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.docId}>{docId} · VERSION 1</Text>
              <Text style={styles.product}>{form.drug_name}</Text>
              <Text style={styles.format}>
                {mode === 'copy'
                  ? 'Patient-facing copy'
                  : `Broadcast script · ${(result as CommercialScriptResponse).duration_seconds ??
                  form.duration_seconds
                  }s`}
              </Text>
            </View>
            <StatusBadge status="needs_mlr" />
          </View>
        </Card>

        {mode === 'copy' && 'headline' in result ? (
          <CopyDocument data={result as AdCopyResponse} />
        ) : (
          <ScriptDocument data={result as CommercialScriptResponse} />
        )}

        <Card style={styles.riskCard}>
          <Text style={styles.riskTitle}>MLR review findings</Text>
          <Text style={styles.riskBody}>
            {'compliance_notes' in result
              ? result.compliance_notes
              : 'Requires MLR review before use.'}
          </Text>
        </Card>

        <DisclaimerBanner />

        <View style={styles.actions}>
          <Button title="Save to library" onPress={handleSave} style={{ flex: 1 }} />
          <Button
            title="Export"
            variant="secondary"
            onPress={handleShare}
            style={{ flex: 1 }}
          />
        </View>
        <Button
          title="Create new draft"
          variant="ghost"
          onPress={() => {
            clearResult();
            router.replace('/(tabs)/create' as Href);
          }}
          style={{ marginTop: 4 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function CopyDocument({ data }: { data: AdCopyResponse }) {
  return (
    <>
      <DocSection title="Headline">
        <Text style={styles.docHeadline}>{data.headline}</Text>
      </DocSection>
      <DocSection title="Body copy">
        <Text style={styles.docBody}>{data.body_copy}</Text>
      </DocSection>
      <DocSection title="Call to action">
        <Text style={styles.docCta}>{data.cta}</Text>
      </DocSection>
      {data.isi ? (
        <DocSection title="Important safety information" risk>
          <Text style={styles.docIsi}>{data.isi}</Text>
        </DocSection>
      ) : null}
    </>
  );
}

function ScriptDocument({ data }: { data: CommercialScriptResponse }) {
  return (
    <>
      <DocSection title="Script overview">
        <Text style={styles.docBody}>
          {data.scenes.length} scenes · {data.duration_seconds} seconds total
        </Text>
      </DocSection>
      {data.scenes.map((scene) => (
        <Card key={scene.scene_number} style={styles.sceneCard}>
          <Text style={styles.sceneTitle}>
            Scene {scene.scene_number}
            <Text style={styles.sceneDur}> · {scene.duration_seconds}s</Text>
          </Text>
          <Meta label="Visual" value={scene.visual_description} />
          <Meta label="Voiceover" value={scene.voiceover} />
          {scene.on_screen_text ? (
            <Meta label="On-screen text" value={scene.on_screen_text} />
          ) : null}
        </Card>
      ))}
      <DocSection title="ISI voiceover" risk>
        <Text style={styles.docIsi}>{data.isi_voiceover}</Text>
      </DocSection>
    </>
  );
}

function DocSection({
  title,
  children,
  risk,
}: {
  title: string;
  children: React.ReactNode;
  risk?: boolean;
}) {
  return (
    <Card style={[styles.section, risk && styles.sectionRisk]}>
      <Text style={[styles.sectionTitle, risk && styles.sectionTitleRisk]}>
        {title}
      </Text>
      {children}
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.color.bg.base },
  content: {
    padding: tokens.spacing[4],
    paddingBottom: tokens.spacing[16],
    gap: tokens.spacing[3],
  },
  headerCard: {
    borderColor: tokens.color.border.default,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  docId: {
    color: tokens.color.text.tertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  product: {
    color: tokens.color.text.primary,
    fontSize: tokens.typography.h1,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  format: {
    marginTop: 6,
    color: tokens.color.text.secondary,
    fontSize: tokens.typography.bodySmall,
  },
  section: { marginBottom: 0 },
  sectionRisk: {
    backgroundColor: tokens.color.status.warningSoft,
    borderColor: 'rgba(251,191,36,0.22)',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: tokens.color.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 12,
  },
  sectionTitleRisk: {
    color: tokens.color.status.warning,
  },
  docHeadline: {
    fontSize: tokens.typography.h2,
    fontWeight: '600',
    color: tokens.color.text.primary,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  docBody: {
    fontSize: tokens.typography.body,
    color: tokens.color.text.secondary,
    lineHeight: 23,
  },
  docCta: {
    fontSize: tokens.typography.body,
    fontWeight: '600',
    color: tokens.color.text.brand,
    lineHeight: 22,
  },
  docIsi: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.text.secondary,
    lineHeight: 20,
  },
  sceneCard: {
    borderLeftWidth: 2,
    borderLeftColor: tokens.color.brand.primary,
  },
  sceneTitle: {
    fontSize: tokens.typography.h3,
    fontWeight: '600',
    color: tokens.color.text.primary,
  },
  sceneDur: {
    fontWeight: '500',
    color: tokens.color.text.tertiary,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: tokens.color.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.text.secondary,
    lineHeight: 20,
  },
  riskCard: {},
  riskTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: tokens.color.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  riskBody: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.text.secondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: tokens.spacing[2],
  },
});