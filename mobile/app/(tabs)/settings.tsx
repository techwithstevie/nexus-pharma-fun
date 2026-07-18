import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkHealth } from '@/lib/api';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/api';

export default function SettingsScreen() {
  const [health, setHealth] = useState<{
    status: string;
    ollama: string;
    model: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch {
      setError('Cannot reach backend. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Backend Status</Text>
        <View style={styles.card}>
          <Text style={styles.label}>API URL</Text>
          <Text style={styles.value}>{API_BASE_URL}</Text>
        </View>

        {loading && <ActivityIndicator color={Colors.accent} style={{ marginTop: 16 }} />}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {health && !loading && (
          <>
            <View style={styles.card}>
              <Row label="API Status" value={health.status} ok={health.status === 'ok'} />
              <Row label="Ollama" value={health.ollama} ok={health.ollama === 'reachable'} />
              <Row label="Model" value={health.model} />
            </View>
          </>
        )}

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchHealth}>
          <Text style={styles.refreshBtnText}>🔄 Refresh Status</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ⚠️ Disclaimer: All generated pharmaceutical advertising content is for creative and educational use only. It must be reviewed by qualified medical, legal, and regulatory professionals (MLR) before any real-world use. This app does not provide medical or legal advice.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, ok === true && styles.ok, ok === false && styles.fail]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginTop: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  rowValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  ok: { color: Colors.success },
  fail: { color: Colors.error },
  refreshBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  refreshBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: Spacing.sm,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm },
  infoBox: {
    backgroundColor: '#FEF9C3',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: { fontSize: FontSize.xs, color: '#78350F', lineHeight: 18 },
});
