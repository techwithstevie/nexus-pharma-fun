import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/constants/theme';

export function DisclaimerBanner() {
    return (
        <View style={styles.wrap} accessibilityRole="text">
            <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={tokens.color.status.warning}
                style={styles.icon}
            />
            <Text style={styles.text}>
                Draft content only. All materials require Medical, Legal, and Regulatory
                (MLR) review prior to external use. This system does not provide medical
                or legal advice.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        backgroundColor: tokens.color.status.warningBg,
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: tokens.radius.md,
        padding: tokens.spacing[3],
        gap: tokens.spacing[2],
    },
    icon: { marginTop: 1 },
    text: {
        flex: 1,
        fontSize: tokens.typography.caption,
        color: tokens.color.status.warning,
        lineHeight: 17,
    },
});