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
        Only claims supported by approved labeling or substantiation.
      </Text>
      {benefits.map((benefit, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder={`Claim ${i + 1}`}
            placeholderTextColor={tokens.color.text.tertiary}
            value={benefit}
            onChangeText={(v) => update(i, v)}
            autoCorrect={false}
            selectionColor={tokens.color.brand.primary}
          />
          <TouchableOpacity
            onPress={() => remove(i)}
            style={styles.removeBtn}
            disabled={benefits.length === 1}
            accessibilityLabel="Remove claim"
          >
            <Ionicons
              name="close"
              size={16}
              color={
                benefits.length === 1
                  ? tokens.color.text.tertiary
                  : tokens.color.status.danger
              }
            />
          </TouchableOpacity>
        </View>
      ))}
      {benefits.length < 5 ? (
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Ionicons name="add" size={16} color={tokens.color.text.secondary} />
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
    color: tokens.color.text.secondary,
    marginBottom: 6,
  },
  req: { color: tokens.color.status.danger },
  helper: {
    fontSize: tokens.typography.caption,
    color: tokens.color.text.tertiary,
    marginBottom: tokens.spacing[3],
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
    backgroundColor: tokens.color.bg.muted,
    borderWidth: 1,
    borderColor: tokens.color.border.default,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: 14,
    fontSize: tokens.typography.body,
    color: tokens.color.text.primary,
    minHeight: 50,
  },
  removeBtn: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.bg.muted,
    borderWidth: 1,
    borderColor: tokens.color.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: tokens.color.border.default,
    borderStyle: 'dashed',
    borderRadius: tokens.radius.md,
    paddingVertical: 14,
    marginTop: 4,
  },
  addBtnText: {
    color: tokens.color.text.secondary,
    fontWeight: '600',
    fontSize: tokens.typography.bodySmall,
  },
});