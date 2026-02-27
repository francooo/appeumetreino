import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, level, equipment, workouts, history, logout } = useApp();

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  const levelLabel =
    level === "beginner"
      ? "Iniciante"
      : level === "intermediate"
        ? "Intermediario"
        : level === "advanced"
          ? "Avancado"
          : "Nao definido";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.profileCard}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.profileAvatar}
        >
          <Text style={styles.profileAvatarText}>
            {(user?.name || "A").charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
        <Text style={styles.profileName}>{user?.name || "Atleta"}</Text>
        <Text style={styles.profileEmail}>{user?.email || ""}</Text>
        <View style={styles.levelChip}>
          <Text style={styles.levelChipText}>{levelLabel}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workouts.length}</Text>
          <Text style={styles.statLabel}>Treinos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Completos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{equipment.length}</Text>
          <Text style={styles.statLabel}>Equipamentos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipamentos cadastrados</Text>
        {equipment.length > 0 ? (
          <View style={styles.equipmentList}>
            {equipment.map((item) => (
              <View key={item.id} style={styles.equipmentChip}>
                <Ionicons name="fitness" size={14} color={Colors.primary} />
                <Text style={styles.equipmentChipText}>{item.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhum equipamento cadastrado</Text>
        )}
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="person-outline"
          label="Editar perfil"
          onPress={() => {}}
        />
        <MenuItem
          icon="fitness-outline"
          label="Alterar nivel"
          onPress={() => router.push("/level-select")}
        />
        <MenuItem
          icon="barbell-outline"
          label="Gerenciar equipamentos"
          onPress={() => router.push("/(tabs)/add-equipment")}
        />
        <MenuItem
          icon="information-circle-outline"
          label="Sobre o app"
          onPress={() =>
            Alert.alert(
              "Eu me treino",
              "Versao 1.0.0\nSeu treino personalizado com o que voce tem em casa.",
            )
          }
        />
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutBtn,
          pressed && styles.logoutBtnPressed,
        ]}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
      <Text style={styles.menuItemLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "Rubik_700Bold",
    fontSize: 28,
    color: Colors.text,
    marginBottom: 24,
  },
  profileCard: {
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  profileAvatarText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 32,
    color: "#fff",
  },
  profileName: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  profileEmail: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0, 200, 83, 0.15)",
    marginTop: 4,
  },
  levelChipText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 13,
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  equipmentList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  equipmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipmentChipText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.text,
  },
  emptyText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
  },
  menuSection: {
    marginBottom: 24,
    gap: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemLabel: {
    flex: 1,
    fontFamily: "Rubik_400Regular",
    fontSize: 16,
    color: Colors.text,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  logoutBtnPressed: {
    opacity: 0.8,
  },
  logoutText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.error,
  },
});
