import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Share,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { useAdStore } from '@/store/useAdStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { tokens } from '@/constants/theme';
import {
  generateSceneAssets,
  mediaUrl,
  pollMediaJob,
} from '@/lib/api';
import type {
  AdCopyResponse,
  CommercialScriptResponse,
  Scene,
} from '@/types';

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

type SceneAssetState = {
  loading: boolean;
  error: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  imageJobId: string | null;
  videoJobId: string | null;
};

export default function ResultScreen() {
  const router = useRouter();
  const { result, mode, form, saveProject, clearResult } = useAdStore();
  const [sceneAssets, setSceneAssets] = useState<Record<number, SceneAssetState>>(
    {}
  );
  const [copyVisual, setCopyVisual] = useState<SceneAssetState>({
    loading: false,
    error: null,
    imageUrl: null,
    videoUrl: null,
    imageJobId: null,
    videoJobId: null,
  });

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

  const generateCopyHeroVisual = async (withVideo: boolean) => {
    if (!('headline' in result)) return;

    setCopyVisual((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const visual = [
        `Campaign key visual for ${form.drug_name}.`,
        form.indication ? `Indication context: ${form.indication}.` : '',
        `Mood inspired by headline: ${result.headline}.`,
        'Premium pharmaceutical commercial photography, hopeful adult lifestyle, clean modern lighting.',
      ]
        .filter(Boolean)
        .join(' ');

      const res = await generateSceneAssets({
        drug_name: form.drug_name,
        scene_number: 1,
        visual_description: visual,
        voiceover: result.body_copy?.slice(0, 240) ?? '',
        on_screen_text: result.cta ?? null,
        generate_video: withVideo,
        style:
          'cinematic pharmaceutical commercial, clean modern lighting, high-end lifestyle',
      });

      const imageDone = await pollMediaJob(res.image_job.id);
      if (imageDone.status === 'failed') {
        throw new Error(imageDone.error || 'Image generation failed');
      }

      let videoUrl: string | null = null;
      let videoJobId: string | null = null;
      if (res.video_job) {
        const videoDone = await pollMediaJob(res.video_job.id);
        videoJobId = videoDone.id;
        if (videoDone.status === 'completed') {
          videoUrl = mediaUrl(videoDone.result_url);
        } else if (videoDone.status === 'failed') {
          throw new Error(videoDone.error || 'Video generation failed');
        }
      }

      setCopyVisual({
        loading: false,
        error: null,
        imageUrl: mediaUrl(imageDone.result_url),
        videoUrl,
        imageJobId: imageDone.id,
        videoJobId,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Asset generation failed';
      setCopyVisual((prev) => ({ ...prev, loading: false, error: msg }));
      Alert.alert('Asset generation', msg);
    }
  };

  const generateForScene = async (scene: Scene, withVideo: boolean) => {
    setSceneAssets((prev) => ({
      ...prev,
      [scene.scene_number]: {
        loading: true,
        error: null,
        imageUrl: prev[scene.scene_number]?.imageUrl ?? null,
        videoUrl: prev[scene.scene_number]?.videoUrl ?? null,
        imageJobId: prev[scene.scene_number]?.imageJobId ?? null,
        videoJobId: prev[scene.scene_number]?.videoJobId ?? null,
      },
    }));

    try {
      const res = await generateSceneAssets({
        drug_name: form.drug_name,
        scene_number: scene.scene_number,
        visual_description: scene.visual_description,
        voiceover: scene.voiceover,
        on_screen_text: scene.on_screen_text,
        generate_video: withVideo,
        style:
          'cinematic pharmaceutical commercial, clean modern lighting, high-end lifestyle',
      });

      const imageDone = await pollMediaJob(res.image_job.id);
      if (imageDone.status === 'failed') {
        throw new Error(imageDone.error || 'Image generation failed');
      }

      let videoUrl: string | null = null;
      let videoJobId: string | null = null;
      if (res.video_job) {
        const videoDone = await pollMediaJob(res.video_job.id);
        videoJobId = videoDone.id;
        if (videoDone.status === 'completed') {
          videoUrl = mediaUrl(videoDone.result_url);
        } else if (videoDone.status === 'failed') {
          throw new Error(videoDone.error || 'Video generation failed');
        }
      }

      setSceneAssets((prev) => ({
        ...prev,
        [scene.scene_number]: {
          loading: false,
          error: null,
          imageUrl: mediaUrl(imageDone.result_url),
          videoUrl,
          imageJobId: imageDone.id,
          videoJobId,
        },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Asset generation failed';
      setSceneAssets((prev) => ({
        ...prev,
        [scene.scene_number]: {
          loading: false,
          error: msg,
          imageUrl: prev[scene.scene_number]?.imageUrl ?? null,
          videoUrl: prev[scene.scene_number]?.videoUrl ?? null,
          imageJobId: prev[scene.scene_number]?.imageJobId ?? null,
          videoJobId: prev[scene.scene_number]?.videoJobId ?? null,
        },
      }));
      Alert.alert('Asset generation', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <DigitalBackground />
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
          <>
            <CopyDocument data={result as AdCopyResponse} />
            <Card>
              <Text style={styles.sectionTitle}>Campaign visual</Text>
              <Text style={styles.sectionHint}>
                Generate open-source draft stills and motion from this copy. Outputs
                are creative concepts only and require MLR review.
              </Text>
              <View style={styles.assetActions}>
                <Button
                  title="Generate image"
                  onPress={() => generateCopyHeroVisual(false)}
                  loading={copyVisual.loading}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Image + video"
                  variant="secondary"
                  onPress={() => generateCopyHeroVisual(true)}
                  loading={copyVisual.loading}
                  style={{ flex: 1 }}
                />
              </View>
              {copyVisual.loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color={tokens.color.text.secondary} />
                  <Text style={styles.loadingText}>Rendering draft assets…</Text>
                </View>
              ) : null}
              {copyVisual.error ? (
                <Text style={styles.errorText}>{copyVisual.error}</Text>
              ) : null}
              {copyVisual.imageUrl ? (
                <Image
                  source={{ uri: copyVisual.imageUrl }}
                  style={styles.preview}
                  resizeMode="cover"
                />
              ) : null}
              {copyVisual.videoUrl ? (
                <Video
                  style={[styles.preview, { marginTop: 12 }]}
                  source={{ uri: copyVisual.videoUrl }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
              ) : null}
            </Card>
          </>
        ) : (
          <ScriptDocument
            data={result as CommercialScriptResponse}
            sceneAssets={sceneAssets}
            onGenerateScene={generateForScene}
          />
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

function ScriptDocument({
  data,
  sceneAssets,
  onGenerateScene,
}: {
  data: CommercialScriptResponse;
  sceneAssets: Record<number, SceneAssetState>;
  onGenerateScene: (scene: Scene, withVideo: boolean) => void;
}) {
  return (
    <>
      <DocSection title="Script overview">
        <Text style={styles.docBody}>
          {data.scenes.length} scenes · {data.duration_seconds} seconds total
        </Text>
      </DocSection>

      {data.scenes.map((scene) => {
        const assets = sceneAssets[scene.scene_number];
        return (
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

            <View style={styles.assetActions}>
              <Button
                title="Still"
                variant="secondary"
                onPress={() => onGenerateScene(scene, false)}
                loading={assets?.loading}
                style={{ flex: 1 }}
              />
              <Button
                title="Still + clip"
                onPress={() => onGenerateScene(scene, true)}
                loading={assets?.loading}
                style={{ flex: 1 }}
              />
            </View>

            {assets?.loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={tokens.color.text.secondary} />
                <Text style={styles.loadingText}>
                  Rendering scene {scene.scene_number}…
                </Text>
              </View>
            ) : null}

            {assets?.error ? (
              <Text style={styles.errorText}>{assets.error}</Text>
            ) : null}

            {assets?.imageUrl ? (
              <Image
                source={{ uri: assets.imageUrl }}
                style={styles.preview}
                resizeMode="cover"
              />
            ) : null}

            {assets?.videoUrl ? (
              <Video
                style={[styles.preview, { marginTop: 12 }]}
                source={{ uri: assets.videoUrl }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
              />
            ) : null}
          </Card>
        );
      })}

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
  sectionHint: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.text.tertiary,
    lineHeight: 18,
    marginBottom: 14,
    marginTop: -4,
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
  assetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  loadingBox: {
    marginTop: 14,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    color: tokens.color.text.tertiary,
    fontSize: tokens.typography.caption,
  },
  errorText: {
    marginTop: 12,
    color: tokens.color.status.danger,
    fontSize: tokens.typography.bodySmall,
    lineHeight: 18,
  },
  preview: {
    marginTop: 14,
    width: '100%',
    height: 220,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.bg.muted,
    borderWidth: 1,
    borderColor: tokens.color.border.subtle,
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