import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import Colors from "@/constants/colors";
import Icon, { type IconName } from "@/components/Icon";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  // Icone verde-lima a direita do texto (padrao: seta)
  trailingIcon?: IconName | null;
  // Icone antes do texto (ex.: camera em "Tirar foto")
  leadingIcon?: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// Botao principal preto com acento verde-lima (mockups v2)
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  trailingIcon = "arrow-right",
  leadingIcon,
  style,
  testID,
}: PrimaryButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.primary,
        pressed && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        <View style={styles.row}>
          {leadingIcon ? (
            <Icon name={leadingIcon} size={24} color={Colors.primary} strokeWidth={2.2} />
          ) : null}
          <Text style={styles.primaryText}>{label}</Text>
          {trailingIcon ? (
            <Icon name={trailingIcon} size={24} color={Colors.primary} strokeWidth={2.4} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  iconColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SecondaryButton({
  label,
  onPress,
  icon,
  iconColor = Colors.text,
  disabled,
  style,
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={24} color={iconColor} strokeWidth={2} /> : null}
        <Text style={styles.secondaryText}>{label}</Text>
      </View>
    </Pressable>
  );
}

// "G" oficial do Google em 4 cores (o google-g.svg do pacote e monocromatico)
function GoogleG({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

export function GoogleButton({
  label,
  onPress,
  loading,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed, loading && styles.disabled]}
      accessibilityRole="button"
      accessibilityState={{ busy: !!loading }}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={Colors.text} /> : <GoogleG />}
        <Text style={styles.secondaryText}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  primary: {
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: Colors.heroDark,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  secondary: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.text,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  secondaryText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 17,
    color: Colors.text,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
});
