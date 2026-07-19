import { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Image,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { tokens } from '@/constants/theme';
import {
    generateImage,
    generateVideo,
    listMediaJobs,
    mediaUrl,
    pollMediaJob,
} from '@/lib/api';
import type { MediaJob } from '@/types';

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

export default function AssetsScreen() {
    const [prompt, setPrompt] = useState(
        'Adult professional walking through sunlit modern home kitchen at morning, hopeful mood'
    );
    const [product, setProduct] = useState('');
    const [jobs, setJobs] = useState<MediaJob[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [active, setActive] = useState<MediaJob | null>(null);

    const refresh = useCallback(async () => {
        try {
            const data = await listMediaJobs();
            setJobs(data);
        } catch {
            /* ignore on first load */
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    const onImage = async () => {
        setBusy(true);
        setError(null);
        try {
            const job = await generateImage({
                prompt,
                product_name: product || undefined,
                width: 768,
                height: 768,
                steps: 6,
            });
            setActive(job);
            const done = await pollMediaJob(job.id);
            setActive(done);
            if (done.status === 'failed') setError(done.error || 'Image failed');
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Image generation failed');
        } finally {
            setBusy(false);
        }
    };

    const onVideo = async () => {
        setBusy(true);
        setError(null);
        try {
            // prefer animating latest completed image if present
            const lastImage = jobs.find(
                (j) => j.kind === 'image' && j.status === 'completed'
            );
            const job = await generateVideo({
                prompt,
                product_name: product || undefined,
                seconds: 4,
                source_image_job_id: lastImage?.id,
            });
            setActive(job);
            const done = await pollMediaJob(job.id);
            setActive(done);
            if (done.status === 'failed') setError(done.error || 'Video failed');
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Video generation failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <DigitalBackground />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={false} onRefresh={refresh} tintColor="#A1A1AA" />
                }
            >
                <Text style={styles.eyebrow}>CREATIVE</Text>
                <Text style={styles.title}>Asset studio</Text>
                <Text style={styles.sub}>
                    Open-source image and motion drafts for campaign concepts. All outputs
                    require MLR review.
                </Text>

                <Card>
                    <Text style={styles.label}>Product (optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={product}
                        onChangeText={setProduct}
                        placeholder="Brand name"
                        placeholderTextColor={tokens.color.text.tertiary}
                    />
                    <Text style={styles.label}>Visual prompt</Text>
                    <TextInput
                        style={[styles.input, styles.area]}
                        value={prompt}
                        onChangeText={setPrompt}
                        multiline
                        placeholder="Describe the shot"
                        placeholderTextColor={tokens.color.text.tertiary}
                    />
                    <View style={styles.row}>
                        <Button
                            title="Generate image"
                            onPress={onImage}
                            loading={busy}
                            style={{ flex: 1 }}
                        />
                        <Button
                            title="Generate video"
                            variant="secondary"
                            onPress={onVideo}
                            loading={busy}
                            style={{ flex: 1 }}
                        />
                    </View>
                </Card>

                {error ? (
                    <Card style={styles.errorCard}>
                        <Text style={styles.errorText}>{error}</Text>
                    </Card>
                ) : null}

                {active && active.status !== 'completed' ? (
                    <Card style={{ marginTop: 12 }}>
                        <Text style={styles.meta}>
                            Job {active.id} · {active.status} · {Math.round(active.progress * 100)}%
                        </Text>
                        <ActivityIndicator color={tokens.color.text.secondary} style={{ marginTop: 12 }} />
                    </Card>
                ) : null}

                {active?.status === 'completed' && active.result_url ? (
                    <Card style={{ marginTop: 12 }}>
                        <Text style={styles.section}>Latest result</Text>
                        {active.kind === 'image' ? (
                            <Image
                                source={{ uri: mediaUrl(active.result_url)! }}
                                style={styles.preview}
                                resizeMode="cover"
                            />
                        ) : (
                            <Video
                                style={styles.preview}
                                source={{ uri: mediaUrl(active.result_url)! }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping
                            />
                        )}
                    </Card>
                ) : null}

                <Text style={[styles.section, { marginTop: 24 }]}>Library</Text>
                {jobs.length === 0 ? (
                    <Card variant="inset">
                        <Text style={styles.empty}>No assets yet.</Text>
                    </Card>
                ) : (
                    jobs.map((j) => (
                        <Card key={j.id} style={{ marginBottom: 10 }}>
                            <View style={styles.jobTop}>
                                <Text style={styles.jobKind}>{j.kind.toUpperCase()}</Text>
                                <Text style={styles.jobStatus}>{j.status}</Text>
                            </View>
                            <Text style={styles.jobPrompt} numberOfLines={2}>
                                {j.prompt}
                            </Text>
                            {j.status === 'completed' && j.result_url && j.kind === 'image' ? (
                                <Image
                                    source={{ uri: mediaUrl(j.result_url)! }}
                                    style={styles.thumb}
                                />
                            ) : null}
                        </Card>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: tokens.color.bg.base },
    content: { padding: 16, paddingBottom: 64 },
    eyebrow: {
        color: tokens.color.text.tertiary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.4,
        marginBottom: 6,
        textAlign: 'center',
    },
    title: {
        color: tokens.color.text.primary,
        fontSize: 24,
        fontWeight: '600',
        letterSpacing: -0.4,
        textAlign: 'center',
    },
    sub: {
        marginTop: 6,
        marginBottom: 16,
        color: tokens.color.text.tertiary,
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
    },
    label: {
        color: tokens.color.text.secondary,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        backgroundColor: 'rgba(26, 26, 26, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(42, 42, 42, 0.6)',
        borderRadius: 12,
        color: tokens.color.text.primary,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        minHeight: 48,
    },
    area: { minHeight: 110, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 10, marginTop: 16 },
    errorCard: {
        marginTop: 12,
        backgroundColor: 'rgba(248, 113, 113, 0.12)',
        borderColor: 'rgba(248, 113, 113, 0.35)',
    },
    errorText: { color: tokens.color.status.danger, fontSize: 13 },
    meta: { color: tokens.color.text.secondary, fontSize: 12 },
    section: {
        color: tokens.color.text.primary,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },
    preview: {
        width: '100%',
        height: 280,
        borderRadius: 12,
        backgroundColor: 'rgba(26, 26, 26, 0.5)',
    },
    empty: { color: tokens.color.text.tertiary, fontSize: 13 },
    jobTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    jobKind: {
        color: tokens.color.text.tertiary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    jobStatus: { color: tokens.color.text.secondary, fontSize: 11, fontWeight: '600' },
    jobPrompt: { color: tokens.color.text.secondary, fontSize: 13, lineHeight: 18 },
    thumb: {
        marginTop: 10,
        width: '100%',
        height: 160,
        borderRadius: 10,
        backgroundColor: 'rgba(26, 26, 26, 0.5)',
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