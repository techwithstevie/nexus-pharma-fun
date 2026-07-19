import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/constants/theme';
import type { AdTone } from '@/types';

const TONES: { value: AdTone; label: string; description: string }[] = [
  {
    value: 'informative',
    label: 'Informative',
    description: 'Clear, factual, educational',
  },
  {
    value: 'clinical',
    label: 'Clinical',
    description: 'Precise, evidence-oriented',
  },
  {
    value: 'hopeful',
    label: 'Hopeful',
    description: 'Supportive, patient-centered',
  },
  {
    value: 'empowering',
    label: 'Empowering',
    description: 'Action-oriented, confident',
  },
];

interface Props {
  selected: AdTone;
  onSelect: (tone: AdTone) => void;
}

export function ToneSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Message tone</Text>
      <View style={styles.grid}>
        {TONES.map((tone) => {
          const active = selected === tone.value;
          return (
            <TouchableOpacity
              key={tone.value}
              style={[styles.toneBtn, active && styles.toneBtnActive]}
              onPress={() => onSelect(tone.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.toneLabel, active && styles.toneLabelActive]}>
                {tone.label}
              </Text>
              <Text
                style={[styles.toneDesc, active && styles.toneDescActive]}
                numberOfLines={2}
              >
                {tone.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: tokens.spacing[4] },
  label: {
    fontSize: tokens.typography.label,
    fontWeight: '600',
    color: tokens.color.neutral[700],
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toneBtn: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: tokens.color.neutral[0],
    borderRadius: tokens.radius.md,
    padding: tokens.spacing[3],
    borderWidth: 1,
    borderColor: tokens.color.neutral[300],
    minHeight: 72,
  },
  toneBtnActive: {
    backgroundColor: tokens.color.brand[50],
    borderColor: tokens.color.brand[700],
  },
  toneLabel: {
    fontSize: tokens.typography.bodySmall,
    fontWeight: '700',
    color: tokens.color.neutral[800],
    marginBottom: 4,
  },
  toneLabelActive: {
    color: tokens.color.brand[900],
  },
  toneDesc: {
    fontSize: tokens.typography.caption,
    color: tokens.color.neutral[500],
    lineHeight: 15,
  },
  toneDescActive: {
    color: tokens.color.brand[700],
  },
});