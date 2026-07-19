import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkHealth } from '@/lib/api';
import { API_BASE_URL } from '@/constants/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { tokens } from '@/constants/theme';

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
      setError('Unable to reach authoring services. Verify API and tunnel status.');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.content}>
        <SectionHeader
          title="Environment"
          subtitle="Service connectivity and model configuration"
        />

        <Card style={{ marginBottom: tokens.spacing[3] }}>
          <Text style={styles.label}>API endpoint</Text>
          <Text style={styles.value} selectable>
            {API_BASE_URL}
          </Text>
        </Card>

        {loading ? (
          <ActivityIndicator color={tokens.color.brand[700]} style={{ marginVertical: 16 }} />
        ) : null}

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : null}

        {health && !loading ? (
          <Card style={{ marginBottom: tokens.spacing[3] }}>
            <Row
              label="API status"
              value={health.status}
              ok={health.status === 'ok'}
            />
            <Row
              label="Model runtime"
              value={health.ollama}
              ok={health.ollama === 'reachable'}
            />
            <Row label="Active model" value={health.model} />
          </Card>
        ) : null}

        <Button title="Refresh status" onPress={fetchHealth} variant="secondary" />

        <View style={{ marginTop: tokens.spacing[6] }}>
          <SectionHeader title="Compliance notice" />
          <DisclaimerBanner />
        </View>

        <Text style={styles.version}>Content Authoring Platform · v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          ok === true && { color: tokens.color.status.success },
          ok === false && { color: tokens.color.status.danger },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.color.neutral[50] },
  content: { padding: tokens.spacing[4] },
  label: {
    fontSize: tokens.typography.caption,
    fontWeight: '700',
    color: tokens.color.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  value: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.neutral[900],
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.neutral[100],
  },
  rowLabel: {
    fontSize: tokens.typography.bodySmall,
    color: tokens.color.neutral[500],
  },
  rowValue: {
    fontSize: tokens.typography.bodySmall,
    fontWeight: '700',
    color: tokens.color.neutral[900],
  },
  errorCard: {
    backgroundColor: tokens.color.status.dangerBg,
    borderColor: '#FECACA',
    marginBottom: tokens.spacing[3],
  },
  errorText: {
    color: tokens.color.status.danger,
    fontSize: tokens.typography.bodySmall,
  },
  version: {
    marginTop: tokens.spacing[8],
    textAlign: 'center',
    color: tokens.color.neutral[400],
    fontSize: tokens.typography.caption,
  },
});