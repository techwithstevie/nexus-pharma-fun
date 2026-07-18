import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import type { AdTone } from '@/types';

const TONES: { value: AdTone; label: string; emoji: string }[] = [
  { value: 'hopeful', label: 'Hopeful', emoji: '🌟' },
  { value: 'clinical', label: 'Clinical', emoji: '🔬' },
  { value: 'empowering', label: 'Empowering', emoji: '💪' },
  { value: 'informative', label: 'Informative', emoji: '📋' },
];

interface Props {
  selected: AdTone;
  onSelect: (tone: AdTone) => void;
}

export function ToneSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ad Tone</Text>
      <View style={styles.grid}>
        {TONES.map((tone) => (
          <TouchableOpacity
            key={tone.value}
            style={[
              styles.toneBtn,
              selected === tone.value && styles.toneBtnActive,
            ]}
            onPress={() => onSelect(tone.value)}
          >
            <Text style={styles.toneEmoji}>{tone.emoji}</Text>
            <Text
              style={[
                styles.toneLabel,
                selected === tone.value && styles.toneLabelActive,
              ]}
            >
              {tone.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.sm },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toneBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toneBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  toneEmoji: { fontSize: 20, marginBottom: 2 },
  toneLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  toneLabelActive: { color: Colors.white },
});
