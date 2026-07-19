import { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdStore } from '@/store/useAdStore';
import { FormField } from '@/components/ui/FormField';
import { BenefitsList } from '@/components/BenefitsList';
import { ToneSelector } from '@/components/ToneSelector';
import { Stepper } from '@/components/ui/Stepper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { tokens } from '@/constants/theme';
import type { AdTone } from '@/types';

const STEPS = ['Product', 'Audience', 'Message', 'Safety', 'Generate'];

export default function CreateScreen() {
    const router = useRouter();
    const {
        mode,
        form,
        wizardStep,
        isLoading,
        error,
        setMode,
        setWizardStep,
        updateForm,
        generate,
    } = useAdStore();

    const canNext = useMemo(() => {
        if (wizardStep === 0) {
            return form.drug_name.trim().length > 0 && form.indication.trim().length > 0;
        }
        if (wizardStep === 2) {
            return form.key_benefits.some((b) => b.trim().length > 0);
        }
        return true;
    }, [wizardStep, form]);

    const onGenerate = async () => {
        if (!form.drug_name.trim() || !form.indication.trim()) {
            Alert.alert('Missing information', 'Product name and indication are required.');
            return;
        }
        if (!form.key_benefits.some((b) => b.trim())) {
            Alert.alert('Missing information', 'Add at least one substantiated benefit claim.');
            return;
        }
        await generate();
        if (useAdStore.getState().result) {
            router.push('/result');
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.pageTitle}>Create content draft</Text>
                <Text style={styles.pageSub}>
                    Guided authoring for regulated patient-facing materials.
                </Text>

                <View style={styles.modeRow}>
                    <TouchableOpacity
                        style={[styles.modeBtn, mode === 'copy' && styles.modeBtnOn]}
                        onPress={() => setMode('copy')}
                    >
                        <Text style={[styles.modeText, mode === 'copy' && styles.modeTextOn]}>
                            Patient-facing copy
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeBtn, mode === 'commercial' && styles.modeBtnOn]}
                        onPress={() => setMode('commercial')}
                    >
                        <Text
                            style={[styles.modeText, mode === 'commercial' && styles.modeTextOn]}
                        >
                            Broadcast script
                        </Text>
                    </TouchableOpacity>
                </View>

                <Stepper steps={STEPS} current={wizardStep} />

                <Card>
                    {wizardStep === 0 && (
                        <>
                            <FormField
                                label="Product name"
                                required
                                placeholder="Brand (generic)"
                                value={form.drug_name}
                                onChangeText={(v) => updateForm({ drug_name: v })}
                                helper="Include brand and established name where applicable."
                            />
                            <FormField
                                label="Indication"
                                required
                                multiline
                                placeholder="Approved indication statement"
                                value={form.indication}
                                onChangeText={(v) => updateForm({ indication: v })}
                            />
                        </>
                    )}

                    {wizardStep === 1 && (
                        <>
                            <FormField
                                label="Target audience"
                                placeholder="e.g., Adults with type 2 diabetes"
                                value={form.target_audience}
                                onChangeText={(v) => updateForm({ target_audience: v })}
                            />
                            {mode === 'commercial' && (
                                <>
                                    <Text style={styles.fieldLabel}>Duration</Text>
                                    <View style={styles.durationRow}>
                                        {([30, 60] as const).map((d) => (
                                            <TouchableOpacity
                                                key={d}
                                                style={[
                                                    styles.durationBtn,
                                                    form.duration_seconds === d && styles.durationBtnOn,
                                                ]}
                                                onPress={() => updateForm({ duration_seconds: d })}
                                            >
                                                <Text
                                                    style={[
                                                        styles.durationText,
                                                        form.duration_seconds === d && styles.durationTextOn,
                                                    ]}
                                                >
                                                    {d} seconds
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <FormField
                                        label="Setting"
                                        value={form.setting}
                                        onChangeText={(v) => updateForm({ setting: v })}
                                    />
                                    <FormField
                                        label="Protagonist description"
                                        value={form.protagonist_description}
                                        onChangeText={(v) =>
                                            updateForm({ protagonist_description: v })
                                        }
                                    />
                                </>
                            )}
                        </>
                    )}

                    {wizardStep === 2 && (
                        <>
                            <BenefitsList
                                benefits={form.key_benefits}
                                onChange={(key_benefits) => updateForm({ key_benefits })}
                            />
                            <ToneSelector
                                selected={form.tone}
                                onSelect={(tone: AdTone) => updateForm({ tone })}
                            />
                        </>
                    )}

                    {wizardStep === 3 && (
                        <>
                            <FormField
                                label="Boxed warning"
                                multiline
                                placeholder="Leave blank if not applicable"
                                value={form.black_box_warning}
                                onChangeText={(v) => updateForm({ black_box_warning: v })}
                                helper="Enter only approved boxed warning language when applicable."
                            />
                            <View style={styles.switchRow}>
                                <View style={{ flex: 1, paddingRight: 12 }}>
                                    <Text style={styles.switchTitle}>Include ISI / major statement</Text>
                                    <Text style={styles.switchHelper}>
                                        Recommended for DTC materials requiring fair balance and risk
                                        disclosure.
                                    </Text>
                                </View>
                                <Switch
                                    value={form.include_isi}
                                    onValueChange={(v) => updateForm({ include_isi: v })}
                                    trackColor={{
                                        true: tokens.color.brand[700],
                                        false: tokens.color.neutral[300],
                                    }}
                                    thumbColor={tokens.color.neutral[0]}
                                />
                            </View>
                        </>
                    )}

                    {wizardStep === 4 && (
                        <View>
                            <Text style={styles.summaryTitle}>Draft summary</Text>
                            <SummaryRow label="Product" value={form.drug_name || '—'} />
                            <SummaryRow label="Indication" value={form.indication || '—'} />
                            <SummaryRow label="Audience" value={form.target_audience || '—'} />
                            <SummaryRow
                                label="Format"
                                value={
                                    mode === 'copy'
                                        ? 'Patient-facing copy'
                                        : `Broadcast script (${form.duration_seconds}s)`
                                }
                            />
                            <SummaryRow
                                label="Claims"
                                value={
                                    form.key_benefits.filter((b) => b.trim()).join('; ') || '—'
                                }
                            />
                            <SummaryRow label="Tone" value={form.tone} />
                            <SummaryRow
                                label="ISI"
                                value={form.include_isi ? 'Included' : 'Not included'}
                            />
                            {error ? (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}
                        </View>
                    )}
                </Card>

                <View style={styles.navRow}>
                    {wizardStep > 0 ? (
                        <Button
                            title="Back"
                            variant="secondary"
                            onPress={() => setWizardStep(wizardStep - 1)}
                            style={{ flex: 1 }}
                        />
                    ) : (
                        <View style={{ flex: 1 }} />
                    )}
                    {wizardStep < STEPS.length - 1 ? (
                        <Button
                            title="Continue"
                            onPress={() => setWizardStep(wizardStep + 1)}
                            disabled={!canNext}
                            style={{ flex: 1 }}
                        />
                    ) : (
                        <Button
                            title="Generate draft"
                            onPress={onGenerate}
                            loading={isLoading}
                            style={{ flex: 1 }}
                        />
                    )}
                </View>

                <View style={{ marginTop: tokens.spacing[4] }}>
                    <DisclaimerBanner />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: tokens.color.neutral[50] },
    content: {
        padding: tokens.spacing[4],
        paddingBottom: tokens.spacing[12],
    },
    pageTitle: {
        fontSize: tokens.typography.h1,
        fontWeight: '700',
        color: tokens.color.neutral[900],
        letterSpacing: -0.3,
    },
    pageSub: {
        marginTop: 6,
        marginBottom: tokens.spacing[4],
        fontSize: tokens.typography.bodySmall,
        color: tokens.color.neutral[500],
        lineHeight: 19,
    },
    modeRow: {
        flexDirection: 'row',
        backgroundColor: tokens.color.neutral[0],
        borderRadius: tokens.radius.md,
        borderWidth: 1,
        borderColor: tokens.color.neutral[200],
        padding: 4,
        marginBottom: tokens.spacing[4],
    },
    modeBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: tokens.radius.sm,
        alignItems: 'center',
    },
    modeBtnOn: {
        backgroundColor: tokens.color.brand[900],
    },
    modeText: {
        fontSize: tokens.typography.bodySmall,
        fontWeight: '600',
        color: tokens.color.neutral[600],
    },
    modeTextOn: {
        color: tokens.color.neutral[0],
    },
    fieldLabel: {
        fontSize: tokens.typography.label,
        fontWeight: '600',
        color: tokens.color.neutral[700],
        marginBottom: 8,
    },
    durationRow: { flexDirection: 'row', gap: 8, marginBottom: tokens.spacing[4] },
    durationBtn: {
        flex: 1,
        minHeight: 44,
        borderRadius: tokens.radius.md,
        borderWidth: 1,
        borderColor: tokens.color.neutral[300],
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.color.neutral[0],
    },
    durationBtnOn: {
        borderColor: tokens.color.brand[700],
        backgroundColor: tokens.color.brand[50],
    },
    durationText: {
        fontWeight: '600',
        color: tokens.color.neutral[600],
        fontSize: tokens.typography.bodySmall,
    },
    durationTextOn: { color: tokens.color.brand[900] },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: tokens.spacing[2],
    },
    switchTitle: {
        fontSize: tokens.typography.body,
        fontWeight: '600',
        color: tokens.color.neutral[900],
    },
    switchHelper: {
        marginTop: 4,
        fontSize: tokens.typography.caption,
        color: tokens.color.neutral[500],
        lineHeight: 16,
    },
    summaryTitle: {
        fontSize: tokens.typography.h3,
        fontWeight: '700',
        color: tokens.color.neutral[900],
        marginBottom: tokens.spacing[3],
    },
    summaryRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: tokens.color.neutral[100],
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: tokens.color.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: tokens.typography.body,
        color: tokens.color.neutral[900],
        lineHeight: 21,
    },
    errorBox: {
        marginTop: tokens.spacing[3],
        backgroundColor: tokens.color.status.dangerBg,
        borderRadius: tokens.radius.md,
        padding: tokens.spacing[3],
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        color: tokens.color.status.danger,
        fontSize: tokens.typography.bodySmall,
        lineHeight: 18,
    },
    navRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: tokens.spacing[4],
    },
});