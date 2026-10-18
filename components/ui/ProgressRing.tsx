import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Colors from "@/constants/colors";

interface ProgressRingProps {
  // 0..1 (valores acima de 1 enchem o anel)
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  // Conteudo do centro; sem ele mostra a porcentagem
  children?: React.ReactNode;
}

export default function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  color = Colors.secondary,
  children,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.min(Math.max(value, 0), 1);
  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityLabel={`${Math.round(value * 100)}%`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={Colors.progressTrack} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * filled} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children ?? <Text style={styles.text}>{Math.round(value * 100)}%</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 13,
    color: Colors.text,
  },
});
