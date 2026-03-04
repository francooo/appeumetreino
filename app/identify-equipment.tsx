import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  Alert,
  Animated,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import { useApp } from "@/contexts/AppContext";

export default function IdentifyEquipmentScreen() {
  const insets = useSafeAreaInsets();
  const { setVisionResult } = useApp();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAnalyzing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      pulse.start();
      rotate.start();
      return () => {
        pulse.stop();
        rotate.stop();
      };
    }
  }, [isAnalyzing]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const convertToBase64 = async (uri: string): Promise<string> => {
    if (Platform.OS === "web") {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64Image = await convertToBase64(uri);
      const response = await apiRequest("POST", "/api/vision/identify", {
        image: base64Image,
      });
      const data = await response.json();

      if (data.low_confidence) {
        Alert.alert(
          "Baixa confianca",
          "Nao conseguimos identificar o equipamento com certeza. Tente tirar outra foto com melhor iluminacao e angulo.",
          [
            { text: "Tentar novamente", onPress: () => setImageUri(null) },
            {
              text: "Ver resultado",
              onPress: () => {
                setVisionResult(data);
                router.push("/vision-result");
              },
            },
          ]
        );
      } else {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setVisionResult(data);
        router.push("/vision-result");
      }
    } catch (err) {
      console.error("Vision error:", err);
      setError("Erro ao analisar imagem. Tente novamente.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.getCameraPermissionsAsync();
    if (!permission.granted) {
      if (
        permission.status === "denied" &&
        !permission.canAskAgain &&
        Platform.OS !== "web"
      ) {
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
          ]
        );
        return;
      }
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissao necessaria",
          "Precisamos acessar sua camera para identificar equipamentos."
        );
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (permission.status === "denied" && !permission.canAskAgain) {
          Alert.alert(
            "Permissao necessaria",
            "Precisamos acessar sua galeria. Abra as configuracoes para permitir o acesso.",
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
            ]
          );
          return;
        }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissao necessaria",
            "Precisamos acessar sua galeria para selecionar imagens."
          );
          return;
        }
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Identificar equipamento</Text>
        <View style={{ width: 40 }} />
      </View>

      {isAnalyzing ? (
        <View style={styles.analyzingContainer}>
          <Animated.View
            style={[styles.analyzingCircle, { transform: [{ scale: pulseAnim }] }]}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.analyzingGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="scan" size={48} color="#fff" />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.analyzingPreview} />
          )}
          <Text style={styles.analyzingTitle}>Analisando imagem...</Text>
          <Text style={styles.analyzingSubtitle}>
            Identificando equipamentos e sugerindo exercicios
          </Text>
          <ActivityIndicator
            color={Colors.primary}
            size="small"
            style={{ marginTop: 16 }}
          />
        </View>
      ) : imageUri && !error ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        </View>
      ) : (
        <View style={styles.captureContainer}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["rgba(0, 200, 83, 0.2)", "rgba(0, 188, 212, 0.2)"]}
              style={styles.iconGradient}
            >
              <Ionicons name="scan-outline" size={64} color={Colors.primary} />
            </LinearGradient>
          </View>
          <Text style={styles.captureTitle}>
            Fotografe seu equipamento
          </Text>
          <Text style={styles.captureSubtitle}>
            A IA vai identificar o equipamento e sugerir os melhores exercicios com mapa muscular
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              testID="take-photo-button"
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.actionBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="camera" size={28} color="#fff" />
                <Text style={styles.actionBtnText}>Tirar foto</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              testID="pick-image-button"
            >
              <View style={styles.outlineBtnInner}>
                <Ionicons name="images" size={28} color={Colors.primary} />
                <Text style={styles.outlineBtnText}>Escolher da galeria</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Dicas para melhor resultado</Text>
            <View style={styles.tipRow}>
              <Ionicons name="sunny-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.tipText}>Boa iluminacao</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="resize-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.tipText}>Equipamento centralizado na foto</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="eye-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.tipText}>Fundo limpo sem muitos objetos</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  captureContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
    borderRadius: 40,
    overflow: "hidden",
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  captureTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 24,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  captureSubtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    width: "100%",
  },
  errorText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 14,
    color: Colors.error,
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 32,
  },
  actionBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  actionBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  outlineBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
  },
  outlineBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.primary,
  },
  tipsContainer: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipsTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  analyzingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  analyzingCircle: {
    marginBottom: 24,
    borderRadius: 50,
    overflow: "hidden",
  },
  analyzingGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingPreview: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  analyzingTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
    textAlign: "center",
  },
  analyzingSubtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  previewContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});
