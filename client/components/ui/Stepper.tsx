import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/constants/theme';

interface Props {
    steps: string[];
    current: number;
}

export function Stepper({ steps, current }: Props) {
    return (
        <View style={styles.wrap}>
            {steps.map((label, i) => {
                const active = i === current;
                const done = i < current;
                return (
                    <View key={label} style={styles.step}>
                        <View
                            style={[
                                styles.dot,
                                active && styles.dotActive,
                                done && styles.dotDone,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dotText,
                                    (active || done) && styles.dotTextOn,
                                ]}
                            >
                                {done ? '✓' : i + 1}
                            </Text>
                        </View>
                        <Text
                            style={[styles.label, active && styles.labelActive]}
                            numberOfLines={1}
                        >
                            {label}
                        </Text>
                        {i < steps.length - 1 ? (
                            <View style={[styles.line, done && styles.lineDone]} />
                        ) : null}
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: tokens.spacing[5],
    },
    step: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    dot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: tokens.color.neutral[100],
        borderWidth: 1,
        borderColor: tokens.color.neutral[300],
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    dotActive: {
        backgroundColor: tokens.color.brand[900],
        borderColor: tokens.color.brand[900],
    },
    dotDone: {
        backgroundColor: tokens.color.accent[600],
        borderColor: tokens.color.accent[600],
    },
    dotText: {
        fontSize: 11,
        fontWeight: '700',
        color: tokens.color.neutral[500],
    },
    dotTextOn: { color: tokens.color.neutral[0] },
    label: {
        marginTop: 6,
        fontSize: 10,
        color: tokens.color.neutral[500],
        textAlign: 'center',
        fontWeight: '500',
    },
    labelActive: {
        color: tokens.color.brand[900],
        fontWeight: '700',
    },
    line: {
        position: 'absolute',
        top: 14,
        left: '55%',
        right: '-55%',
        height: 1,
        backgroundColor: tokens.color.neutral[200],
        zIndex: 0,
    },
    lineDone: {
        backgroundColor: tokens.color.accent[600],
    },
});