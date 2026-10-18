import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import Colors from "@/constants/colors";
import Icon, { type IconName } from "@/components/Icon";

// Botao de voltar (circulo ou quadrado arredondado claro, como nos mockups)
export function BackButton({
  onPress,
  shape = "plain",
}: {
  onPress: () => void;
  shape?: "plain" | "square" | "circle";
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [
        styles.back,
        shape === "square" && styles.backSquare,
        shape === "circle" && styles.backCircle,
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
    >
      <Icon name="arrow-left" size={28} color={Colors.text} strokeWidth={2} />
    </Pressable>
  );
}

// Voltar + "01 / 03" + barrinhas de progresso
export function StepHeader({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack?: () => void;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <View style={styles.stepHeader}>
      {onBack ? <BackButton onPress={onBack} /> : <View />}
      <View style={styles.stepRight}>
        <Text style={styles.stepText}>
          <Text style={styles.stepCurrent}>{pad(step)}</Text> / {pad(total)}
        </Text>
        <View style={styles.stepBars} accessibilityLabel={`Etapa ${step} de ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[styles.stepBar, i < step && { backgroundColor: Colors.primary }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// Opcao selecionavel (nivel): icone em circulo, titulo, descricao e marcador
export function SelectionRow({
  icon,
  iconColor,
  iconBg,
  title,
  description,
  selected,
  onPress,
}: {
  icon: IconName;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && { opacity: 0.9 }]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${description}`}
    >
      <View style={[styles.optionIcon, { backgroundColor: selected ? "rgba(255,255,255,0.45)" : iconBg }]}>
        <Icon name={icon} size={30} color={iconColor} strokeWidth={2} />
      </View>
      <View style={styles.optionDivider} />
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDesc}>{description}</Text>
      </View>
      {selected ? (
        <View style={styles.checkOn}>
          <Icon name="check" size={20} color="#FFFFFF" strokeWidth={2.6} />
        </View>
      ) : (
        <View style={styles.checkOff} />
      )}
    </Pressable>
  );
}

// Marca: quadrado verde-lima com halter + nome
export function BrandMark({ name = "Eu me treino", size = 56 }: { name?: string; size?: number }) {
  return (
    <View style={styles.brand} accessibilityRole="header">
      <View style={[styles.brandIcon, { width: size, height: size, borderRadius: size * 0.28 }]}>
        <Icon name="dumbbell" size={size * 0.62} color={Colors.onPrimary} strokeWidth={2.8} />
      </View>
      <Text style={[styles.brandName, { fontSize: size * 0.46 }]}>{name}</Text>
    </View>
  );
}

// Tracos de "brilho" (3 riscos) usados como enfeite nos mockups
export function Sparks({
  color = Colors.primary,
  size = 64,
  style,
  flip,
}: {
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  flip?: boolean;
}) {
  return (
    <View style={[{ width: size, height: size }, flip && { transform: [{ scaleX: -1 }] }, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Path d="M20 6 L14 22" stroke={color} strokeWidth={6} strokeLinecap="round" />
        <Path d="M34 22 L52 10" stroke={color} strokeWidth={6} strokeLinecap="round" />
        <Path d="M38 38 L58 40" stroke={color} strokeWidth={6} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

// Faixas diagonais verde-lima (canto da tela)
export function Stripes({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: 150, height: 180 }, style]} pointerEvents="none">
      <Svg width={150} height={180} viewBox="0 0 150 180">
        <Rect x={60} y={-30} width={34} height={230} rx={17} fill={Colors.primary} opacity={0.85} transform="rotate(45 77 85)" />
        <Rect x={20} y={0} width={10} height={160} rx={5} fill={Colors.primary} opacity={0.5} transform="rotate(45 25 80)" />
      </Svg>
    </View>
  );
}

// Blob organico com linha de contorno (cantos do onboarding/nivel)
export function Blob({
  color,
  lineColor,
  style,
  width = 260,
  height = 220,
}: {
  color: string;
  lineColor: string;
  style?: StyleProp<ViewStyle>;
  width?: number;
  height?: number;
}) {
  return (
    <View style={[{ width, height }, style]} pointerEvents="none">
      <Svg width={width} height={height} viewBox="0 0 260 220">
        <Path d="M260 0 V220 H40 C70 170 120 150 170 140 C220 128 240 70 260 0 Z" fill={color} />
        <Path
          d="M60 220 C90 175 140 160 185 150 C225 140 245 100 260 60"
          stroke={lineColor}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backSquare: {
    borderRadius: 16,
    backgroundColor: Colors.backgroundLight,
  },
  backCircle: {
    borderRadius: 24,
    backgroundColor: Colors.backgroundLight,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  stepText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  stepCurrent: {
    fontFamily: "Rubik_800ExtraBold",
    color: Colors.text,
  },
  stepBars: {
    flexDirection: "row",
    gap: 6,
  },
  stepBar: {
    width: 26,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 104,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  optionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  optionDivider: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: 4,
    backgroundColor: "rgba(17,19,24,0.12)",
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 19,
    color: Colors.text,
  },
  optionDesc: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  checkOn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.heroDark,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOff: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.textMuted,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  brandIcon: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: "Rubik_800ExtraBold",
    color: Colors.text,
  },
});
