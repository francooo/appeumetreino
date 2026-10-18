import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";
import { useApp } from "@/contexts/AppContext";

// Cabecalho das abas principais: marca + slogan + avatar que abre o Perfil
export default function AppHeader() {
  const { user } = useApp();
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Icon name="dumbbell" size={40} color={Colors.primary} strokeWidth={3.2} />
        <Text style={styles.brandName}>{"Meu\nTreinador"}</Text>
        <View style={styles.brandDivider} />
        <Text style={styles.brandTagline} numberOfLines={2}>
          {"DISCIPLINA HOJE,\nRESULTADOS SEMPRE."}
        </Text>
      </View>
      <Pressable
        onPress={() => router.push("/(tabs)/profile")}
        style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.8 }]}
        accessibilityRole="button"
        accessibilityLabel="Abrir perfil"
      >
        <Avatar user={user} size={52} />
        <View style={styles.avatarStatus} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  brandName: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 19,
    lineHeight: 20,
    color: Colors.text,
  },
  brandDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  brandTagline: {
    flexShrink: 1,
    fontFamily: "Rubik_500Medium",
    fontSize: 9,
    letterSpacing: 1.6,
    lineHeight: 14,
    color: Colors.textSecondary,
  },
  avatar: {
    width: 52,
    height: 52,
    marginLeft: 8,
  },
  avatarStatus: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
});
