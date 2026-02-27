import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { EQUIPMENT_OPTIONS } from "@/lib/workout-generator";
import type { Equipment } from "@/lib/storage";

export default function AddEquipmentScreen() {
  const insets = useSafeAreaInsets();
  const { equipment, addUserEquipment, removeUserEquipment } = useApp();
  const params = useLocalSearchParams<{ workoutEquipment?: string }>();
  const [showFiltered, setShowFiltered] = useState(!!params.workoutEquipment);

  const workoutEquipmentNames: string[] = useMemo(() => {
    if (params.workoutEquipment) {
      try {
        return JSON.parse(params.workoutEquipment);
      } catch {
        return [];
      }
    }
    return [];
  }, [params.workoutEquipment]);

  const filteredEquipment = useMemo(() => {
    if (!showFiltered || workoutEquipmentNames.length === 0) return equipment;
    return equipment.filter((e) =>
      workoutEquipmentNames.some(
        (name) => e.name.toLowerCase() === name.toLowerCase()
      )
    );
  }, [equipment, showFiltered, workoutEquipmentNames]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const item: Equipment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: "Equipamento",
        imageUri: result.assets[0].uri,
        addedAt: Date.now(),
      };
      await addUserEquipment(item);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.getCameraPermissionsAsync();
    if (!permission.granted) {
      if (permission.status === "denied" && !permission.canAskAgain && Platform.OS !== "web") {
        Alert.alert(
          "Permissao necessaria",
          "Precisamos acessar sua camera. Abra as configuracoes para permitir o acesso.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Abrir configuracoes",
              onPress: () => {
                try {
                  const { Linking } = require("react-native");
                  Linking.openSettings();
                } catch {}
              },
            },
          ],
        );
        return;
      }
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissao necessaria",
          "Precisamos acessar sua camera para identificar seus equipamentos.",
        );
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const item: Equipment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: "Equipamento",
        imageUri: result.assets[0].uri,
        addedAt: Date.now(),
      };
      await addUserEquipment(item);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const addFromList = async (key: string, label: string) => {
    const already = equipment.find(
      (e) => e.name.toLowerCase() === label.toLowerCase(),
    );
    if (already) {
      Alert.alert("Ja adicionado", `${label} ja esta na sua lista.`);
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const item: Equipment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + key,
      name: label,
      imageUri: "",
      addedAt: Date.now(),
    };
    await addUserEquipment(item);
  };

  const handleRemove = (id: string) => {
    Alert.alert("Remover?", "Deseja remover este equipamento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => removeUserEquipment(id),
      },
    ]);
  };

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
      <Text style={styles.title}>
        {showFiltered ? "Equipamentos do treino" : "Equipamentos"}
      </Text>
      <Text style={styles.subtitle}>
        {showFiltered
          ? "Equipamentos necessarios para o treino atual"
          : "Gerencie seus equipamentos de treino"}
      </Text>
      {showFiltered && (
        <Pressable
          onPress={() => setShowFiltered(false)}
          style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.7 }]}
          testID="show-all-button"
        >
          <Ionicons name="list" size={16} color={Colors.primary} />
          <Text style={styles.filterBtnText}>Ver todos</Text>
        </Pressable>
      )}

      <View style={styles.cameraButtons}>
        <Pressable
          onPress={takePhoto}
          style={({ pressed }) => [
            styles.cameraBtn,
            pressed && styles.cameraBtnPressed,
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.cameraBtnGradient}
          >
            <Ionicons name="camera" size={22} color="#fff" />
            <Text style={styles.cameraBtnText}>Tirar foto</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          onPress={pickImage}
          style={({ pressed }) => [
            styles.cameraBtn,
            pressed && styles.cameraBtnPressed,
          ]}
        >
          <View style={styles.galleryBtnInner}>
            <Ionicons name="images" size={22} color={Colors.primary} />
            <Text style={styles.galleryBtnText}>Galeria</Text>
          </View>
        </Pressable>
      </View>

      {filteredEquipment.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {showFiltered
              ? `Necessarios (${filteredEquipment.length})`
              : `Meus equipamentos (${equipment.length})`}
          </Text>
          {filteredEquipment.map((item) => (
            <View key={item.id} style={styles.equipmentItem}>
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.equipmentImage}
                />
              ) : (
                <View style={styles.equipmentImagePlaceholder}>
                  <Ionicons name="fitness" size={20} color={Colors.primary} />
                </View>
              )}
              <View style={styles.equipmentInfo}>
                <Text style={styles.equipmentName}>{item.name}</Text>
                <Text style={styles.equipmentDate}>
                  {new Date(item.addedAt).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <Pressable
                onPress={() => handleRemove(item.id)}
                style={styles.removeBtn}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adicionar da lista</Text>
        <View style={styles.optionsGrid}>
          {EQUIPMENT_OPTIONS.map((opt) => {
            const exists = equipment.some(
              (e) => e.name.toLowerCase() === opt.label.toLowerCase(),
            );
            return (
              <Pressable
                key={opt.key}
                onPress={() => addFromList(opt.key, opt.label)}
                disabled={exists}
                style={[
                  styles.optionCard,
                  exists && styles.optionCardDisabled,
                ]}
              >
                <Ionicons
                  name={opt.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={exists ? Colors.textMuted : Colors.primary}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    exists && styles.optionLabelDisabled,
                  ]}
                >
                  {opt.label}
                </Text>
                {exists && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={Colors.success}
                    style={styles.optionCheck}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
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
  },
  subtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 200, 83, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  filterBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 14,
    color: Colors.primary,
  },
  cameraButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  cameraBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  cameraBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cameraBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  cameraBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  galleryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 14,
  },
  galleryBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.primary,
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
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipmentImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  equipmentImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  equipmentInfo: {
    flex: 1,
    gap: 2,
  },
  equipmentName: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  equipmentDate: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionCard: {
    width: "47%",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  optionLabel: {
    fontFamily: "Rubik_500Medium",
    fontSize: 14,
    color: Colors.text,
  },
  optionLabelDisabled: {
    color: Colors.textMuted,
  },
  optionCheck: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
