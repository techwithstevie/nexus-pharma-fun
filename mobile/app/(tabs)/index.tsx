import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdStore } from '@/store/useAdStore';
import { FormInput } from '@/components/FormInput';
import { BenefitsList } from '@/components/BenefitsList';
import { ToneSelector } from '@/components/ToneSelector';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import type { AdTone } from '@/types';

export default function CreateAdScreen() {
  const router = useRouter();
  const { mode, form, isLoading, error, setMode, updateForm, generate, result } =
    useAdStore();

  const handleGenerate = async () => {
    if (!form.drug_name.trim() || !form.indication.trim()) {
      Alert.alert('Missing Fields', 'Drug name and indication are required.');
      return;
    }
    if (form.key_benefits.filter((b) => b.trim()).length === 0) {
      Alert.alert('Missing Fields', 'Add at least one key benefit.');
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
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>💊 Pharma Ad Studio</Text>
          <Text style={styles.headerSub}>AI-powered DTC ad generator</Text>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'copy' && styles.modeBtnActive]}
            onPress={() => setMode('copy')}
          >
            <Text
              style={[
                styles.modeBtnText,
                mode === 'copy' && styles.modeBtnTextActive,
              ]}
            >
              📝 Ad Copy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'commercial' && styles.modeBtnActive]}
            onPress={() => setMode('commercial')}
          >
            <Text
              style={[
                styles.modeBtnText,
                mode === 'commercial' && styles.modeBtnTextActive,
              ]}
            >
              🎥 Commercial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Core Fields */}
        <FormInput
          label="Drug Name *"
          placeholder="e.g. Lipitor (atorvastatin)"
          value={form.drug_name}
          onChangeText={(v) => updateForm({ drug_name: v })}
        />
        <FormInput
          label="Indication *"
          placeholder="e.g. high cholesterol in adults"
          value={form.indication}
          onChangeText={(v) => updateForm({ indication: v })}
          multiline
        />
        <FormInput
          label="Target Audience"
          placeholder="e.g. adults 45+"
          value={form.target_audience}
          onChangeText={(v) => updateForm({ target_audience: v })}
        />
        <FormInput
          label="Black Box Warning (optional)"
          placeholder="Leave blank if none"
          value={form.black_box_warning}
          onChangeText={(v) => updateForm({ black_box_warning: v })}
          multiline
        />

        {/* Key Benefits */}
        <BenefitsList
          benefits={form.key_benefits}
          onChange={(benefits) => updateForm({ key_benefits: benefits })}
        />

        {/* Tone */}
        <ToneSelector
          selected={form.tone}
          onSelect={(tone: AdTone) => updateForm({ tone })}
        />

        {/* ISI Toggle */}
        <View style={styles.row}>
          <Text style={styles.label}>Include ISI</Text>
          <Switch
            value={form.include_isi}
            onValueChange={(v) => updateForm({ include_isi: v })}
            trackColor={{ true: Colors.accent }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Commercial-only fields */}
        {mode === 'commercial' && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.durationRow}>
                {([30, 60] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.durationBtn,
                      form.duration_seconds === d && styles.durationBtnActive,
                    ]}
                    onPress={() => updateForm({ duration_seconds: d })}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        form.duration_seconds === d && styles.durationTextActive,
                      ]}
                    >
                      {d}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <FormInput
              label="Commercial Setting"
              placeholder="e.g. sunny park, kitchen"
              value={form.setting}
              onChangeText={(v) => updateForm({ setting: v })}
            />
            <FormInput
              label="Protagonist"
              placeholder="e.g. a woman in her 50s"
              value={form.protagonist_description}
              onChangeText={(v) => updateForm({ protagonist_description: v })}
            />
          </>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, isLoading && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.generateBtnText}>
              ✨ Generate {mode === 'copy' ? 'Ad Copy' : 'Commercial Script'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          ⚠️ All output requires MLR review before real-world use.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  headerCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  headerSub: {
    color: Colors.accentLight,
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: FontSize.md },
  modeBtnTextActive: { color: Colors.white },
  label: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationRow: { flexDirection: 'row', gap: Spacing.sm },
  durationBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  durationText: { color: Colors.textSecondary, fontWeight: '600' },
  durationTextActive: { color: Colors.white },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm },
  generateBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800' },
  disclaimer: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: Spacing.md,
    lineHeight: 16,
  },
});
