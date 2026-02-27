import React, { useState } from "react";
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
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { EQUIPMENT_OPTIONS } from "@/lib/workout-generator";
import type { Equipment } from "@/lib/storage";

export default function EquipmentCaptureScreen() {
  const insets = useSafeAreaInsets();
  const { addUserEquipment, equipment } = useApp();
  const [photos, setPhotos] = useState<{ uri: string; name: string }[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(
    new Set(),
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [
        ...prev,
        { uri: result.assets[0].uri, name: "Equipamento" },
      ]);
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
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [
        ...prev,
        { uri: result.assets[0].uri, name: "Equipamento" },
      ]);
    }
  };

  const toggleEquipment = (key: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedEquipment((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (selectedEquipment.size === 0 && photos.length === 0) {
      Alert.alert("Selecione equipamentos", "Escolha pelo menos um equipamento ou tire uma foto.");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    for (const key of selectedEquipment) {
      const opt = EQUIPMENT_OPTIONS.find((o) => o.key === key);
      if (opt) {
        const item: Equipment = {
          id:
            Date.now().toString() +
            Math.random().toString(36).substr(2, 9) +
            key,
          name: opt.label,
          imageUri: "",
          addedAt: Date.now(),
        };
        await addUserEquipment(item);
      }
    }

    for (const photo of photos) {
      const item: Equipment = {
        id:
          Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: photo.name,
        imageUri: photo.uri,
        addedAt: Date.now(),
      };
      await addUserEquipment(item);
    }

    router.replace("/processing");
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 20,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Seus equipamentos</Text>
          <Text style={styles.subtitle}>
            Selecione os equipamentos que voce tem ou tire fotos deles
          </Text>
        </View>

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
              <Ionicons name="camera" size={24} color="#fff" />
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
              <Ionicons name="images" size={24} color={Colors.primary} />
              <Text style={styles.galleryBtnText}>Galeria</Text>
            </View>
          </Pressable>
        </View>

        {photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>
              Fotos capturadas ({photos.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosRow}
            >
              {photos.map((photo, idx) => (
                <View key={idx} style={styles.photoCard}>
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  <Pressable
                    onPress={() => removePhoto(idx)}
                    style={styles.photoRemove}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.equipmentSection}>
          <Text style={styles.sectionTitle}>Ou selecione da lista</Text>
          <View style={styles.equipmentGrid}>
            {EQUIPMENT_OPTIONS.map((opt) => {
              const isSelected = selectedEquipment.has(opt.key);
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => toggleEquipment(opt.key)}
                  style={[
                    styles.equipmentCard,
                    isSelected && styles.equipmentCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.equipmentIconContainer,
                      isSelected && styles.equipmentIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={opt.icon as keyof typeof Ionicons.glyphMap}
                      size={28}
                      color={isSelected ? "#fff" : Colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.equipmentLabel,
                      isSelected && styles.equipmentLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 },
        ]}
      >
        <Pressable
          onPress={handleContinue}
          disabled={selectedEquipment.size === 0 && photos.length === 0}
          style={({ pressed }) => [
            styles.continueBtn,
            pressed && styles.continueBtnPressed,
            selectedEquipment.size === 0 &&
              photos.length === 0 &&
              styles.continueBtnDisabled,
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.continueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
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
  header: {
    gap: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Rubik_700Bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Rubik_400Regular",
    color: Colors.textSecondary,
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
  photosSection: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  photosRow: {
    gap: 12,
  },
  photoCard: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoRemove: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  equipmentSection: {
    gap: 16,
  },
  equipmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  equipmentCard: {
    width: "47%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    alignItems: "center",
    gap: 10,
  },
  equipmentCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardLight,
  },
  equipmentIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  equipmentIconSelected: {
    backgroundColor: Colors.primary,
  },
  equipmentLabel: {
    fontFamily: "Rubik_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  equipmentLabelSelected: {
    color: Colors.text,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  continueBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  continueText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 17,
    color: "#fff",
  },
});
