import React from "react";
import { Image, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Colors from "@/constants/colors";
import type { UserData } from "@/lib/storage";

interface AvatarProps {
  user: UserData | null;
  size: number;
  // Formato do contorno: circulo (Inicio) ou quadrado arredondado (Perfil)
  radius?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

// Mostra a foto de perfil ou, sem foto, a inicial do nome
export default function Avatar({
  user,
  size,
  radius = size / 2,
  backgroundColor = Colors.secondary,
  textColor = "#FFFFFF",
  style,
}: AvatarProps) {
  const initial = (user?.name || "A").trim().charAt(0).toUpperCase();
  const box = { width: size, height: size, borderRadius: radius };

  return (
    <View style={[styles.base, box, { backgroundColor }, style]}>
      {user?.avatar ? (
        <Image
          source={{ uri: user.avatar }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          accessibilityLabel={`Foto de ${user.name}`}
        />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.42, color: textColor }]}>
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initial: {
    fontFamily: "Rubik_700Bold",
  },
});
