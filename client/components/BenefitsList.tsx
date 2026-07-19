import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/constants/theme';

interface Props {
  benefits: string[];
  onChange: (benefits: string[]) => void;
}

export function BenefitsList({ benefits, onChange }: Props) {
  const update = (index: number, value: string) => {
    const next = [...benefits];
    next[index] = value;
    onChange(next);
  };

  const add = () => {
    if (benefits.length < 5) onChange([...benefits, '']);
  };

  const remove = (index: number) => {
    if (benefits.length > 1) onChange(benefits.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Key benefit claims <Text style={styles.req}>*</Text>
      </Text>
      <Text style={styles.helper}>
        Enter only claims supported by approved labeling or substantiation.
      </Text>
      {benefits.map((benefit, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder={`Claim ${i + 1}`}
            placeholderTextColor={tokens.color.neutral[400]}
            value={benefit}
            onChangeText={(v) => update(i, v)}
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => remove(i)}
            style={styles.removeBtn}
            disabled={benefits.length === 1}
            accessibilityLabel="Remove claim"
          >
            <Ionicons
              name="close"
              size={18}
              color={
                benefits.length === 1
                  ? tokens.color.neutral[300]
                  : tokens.color.status.danger
              }
            />
          </TouchableOpacity>
        </View>
      ))}
      {benefits.length < 5 ? (
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Ionicons name="add" size={18} color={tokens.color.brand[700]} />
          <Text style={styles.addBtnText}>Add claim</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: tokens.spacing[4] },
  label: {
    fontSize: tokens.typography.label,
    fontWeight: '600',
    color: tokens.color.neutral[700],
    marginBottom: 4,
  },
  req: { color: tokens.color.status.danger },
  helper: {
    fontSize: tokens.typography.caption,
    color: tokens.color.neutral[500],
    marginBottom: tokens.spacing[2],
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: tokens.color.neutral[0],
    borderWidth: 1,
    borderColor: tokens.color.neutral[300],
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: 12,
    fontSize: tokens.typography.body,
    color: tokens.color.neutral[900],
    minHeight: 48,
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: tokens.color.brand[600],
    borderStyle: 'dashed',
    borderRadius: tokens.radius.md,
    paddingVertical: 12,
    marginTop: 4,
  },
  addBtnText: {
    color: tokens.color.brand[700],
    fontWeight: '600',
    fontSize: tokens.typography.bodySmall,
  },
});