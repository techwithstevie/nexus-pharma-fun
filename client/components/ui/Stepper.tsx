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
                                {done ? '✓' : String(i + 1)}
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
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(42, 42, 42, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    dotActive: {
        backgroundColor: tokens.color.text.primary,
        borderColor: tokens.color.text.primary,
    },
    dotDone: {
        backgroundColor: tokens.color.brand.soft,
        borderColor: tokens.color.brand.border,
    },
    dotText: {
        fontSize: 11,
        fontWeight: '700',
        color: tokens.color.text.tertiary,
    },
    dotTextOn: {
        color: tokens.color.text.inverse,
    },
    label: {
        marginTop: 8,
        fontSize: 10,
        color: tokens.color.text.tertiary,
        textAlign: 'center',
        fontWeight: '500',
    },
    labelActive: {
        color: tokens.color.text.primary,
        fontWeight: '600',
    },
    line: {
        position: 'absolute',
        top: 14,
        left: '55%',
        right: '-55%',
        height: StyleSheet.hairlineWidth,
        backgroundColor: tokens.color.border.default,
        zIndex: 0,
    },
    lineDone: {
        backgroundColor: tokens.color.brand.primary,
    },
});