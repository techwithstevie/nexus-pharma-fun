import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

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
      <Text style={styles.label}>Key Benefits * (max 5)</Text>
      {benefits.map((benefit, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder={`Benefit ${i + 1}`}
            placeholderTextColor={Colors.textSecondary}
            value={benefit}
            onChangeText={(v) => update(i, v)}
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => remove(i)}
            style={styles.removeBtn}
            disabled={benefits.length === 1}
          >
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      {benefits.length < 5 && (
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Text style={styles.addBtnText}>+ Add Benefit</Text>
        </TouchableOpacity>
      )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: Colors.error, fontWeight: '700', fontSize: FontSize.sm },
  addBtn: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { color: Colors.accent, fontWeight: '600', fontSize: FontSize.sm },
});
