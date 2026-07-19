import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@/constants/theme';

interface Props {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    elevated?: boolean;
}

export function Card({ children, style, elevated = true }: Props) {
    return (
        <View style={[styles.card, elevated && tokens.shadow.card, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: tokens.color.neutral[0],
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: tokens.color.neutral[200],
        padding: tokens.spacing[4],
    },
});