import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import Icon, { type IconName } from "@/components/Icon";
import { apiRequest } from "@/lib/query-client";
import { useApp } from "@/contexts/AppContext";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { BackButton, Sparks } from "@/components/ui/Layout";

const TIPS: { icon: IconName; color: string; label: string }[] = [
  { icon: "sun", color: Colors.primaryDark, label: "Boa luz" },
  { icon: "aim", color: Colors.secondary, label: "Centralizado" },
  { icon: "gallery", color: Colors.text, label: "Fundo limpo" },
];

// Cantos verde-lima de enquadramento sobre a camera
function FrameCorners() {
  return (
    <View style={styles.frame} pointerEvents="none">
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
    </View>
  );
}

export default function IdentifyEquipmentScreen() {
  const insets = useSafeAreaInsets();
  const { setVisionResult, level } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (uri: string) => {
    setImageUri(uri);
    setIsAnalyzing(true);
    setError(null);
    try {
      // Reduz a foto antes de enviar: mantem a requisicao bem abaixo do limite da Vercel (4,5 MB)
      const small = await manipulateAsync(uri, [{ resize: { width: 1024 } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
        base64: true,
      });
      if (!small.base64) throw new Error("Base64 data not available");

      const response = await apiRequest("POST", "/api/vision/identify", {
        image: `data:image/jpeg;base64,${small.base64}`,
        level,
      });
      const data = await response.json();

      if (data.low_confidence) {
        Alert.alert(
          "Baixa confiança",
          "Não conseguimos identificar o equipamento com certeza. Tente outra foto com melhor iluminação e ângulo.",
          [
            { text: "Tentar novamente", onPress: () => setImageUri(null) },
            {
              text: "Ver resultado",
              onPress: () => {
                setVisionResult(data);
                router.push("/vision-result");
              },
            },
          ],
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
      setError("Erro ao analisar a imagem. Tente novamente.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askCameraPermission = async () => {
    if (permission && !permission.canAskAgain) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos acessar sua câmera. Abra as configurações para permitir o acesso.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir configurações", onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    await requestPermission();
  };

  const takePhoto = async () => {
    if (!permission?.granted) {
      await askCameraPermission();
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        await analyzeImage(photo.uri);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Não foi possível tirar a foto. Tente novamente.");
    }
  };

  const pickImage = async () => {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!lib.granted) {
      Alert.alert("Permissão necessária", "Precisamos acessar sua galeria para selecionar imagens.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await analyzeImage(result.assets[0].uri);
    }
  };

  const showCamera = permission?.granted && !imageUri;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} shape="square" />
          <Text style={styles.headerTitle}>Novo equipamento</Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>O que você tem por aí?</Text>
          <Sparks size={44} style={styles.titleSparks} />
        </View>
        <Text style={styles.subtitle}>Aponte a câmera para descobrir exercícios compatíveis.</Text>

        {/* Previa: camera ao vivo, foto capturada ou pedido de permissao */}
        <View style={styles.preview}>
          {showCamera ? (
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
          ) : imageUri ? (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={styles.permissionBox}>
              <Icon name="camera" size={40} color="#FFFFFF" />
              <Text style={styles.permissionText}>
                Permita o acesso à câmera para fotografar seus equipamentos.
              </Text>
              <Pressable onPress={askCameraPermission} style={styles.permissionBtn} accessibilityRole="button">
                <Text style={styles.permissionBtnText}>Permitir câmera</Text>
              </Pressable>
            </View>
          )}

          {(showCamera || imageUri) && <FrameCorners />}

          {isAnalyzing ? (
            <View style={styles.analyzing}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.analyzingText}>Analisando com IA...</Text>
            </View>
          ) : showCamera ? (
            <View style={styles.hintPill} pointerEvents="none">
              <Text style={styles.hintText}>Centralize o equipamento</Text>
            </View>
          ) : null}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Icon name="info" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => { setError(null); setImageUri(null); }} hitSlop={8}>
              <Text style={styles.retryText}>Tentar de novo</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={imageUri && !isAnalyzing ? "Tirar outra foto" : "Tirar foto"}
            leadingIcon="camera"
            trailingIcon={null}
            onPress={imageUri && !isAnalyzing ? () => setImageUri(null) : takePhoto}
            disabled={isAnalyzing}
            testID="take-photo-button"
          />
          <SecondaryButton
            label="Escolher da galeria"
            icon="gallery"
            iconColor={Colors.secondary}
            onPress={pickImage}
            disabled={isAnalyzing}
          />
        </View>

        <View style={styles.tips}>
          {TIPS.map((tip, i) => (
            <React.Fragment key={tip.label}>
              {i > 0 && <View style={styles.tipDivider} />}
              <View style={styles.tip}>
                <View style={styles.tipIcon}>
                  <Icon name={tip.icon} size={26} color={tip.color} strokeWidth={2} />
                </View>
                <Text style={styles.tipText}>{tip.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <Pressable
          onPress={() => router.push("/add-equipment")}
          style={styles.manual}
          accessibilityRole="link"
        >
          <Icon name="list" size={22} color={Colors.text} />
          <Text style={styles.manualText}>
            Você também pode{" "}
            <Text style={styles.manualLink}>adicionar equipamentos manualmente.</Text>
          </Text>
          <Icon name="chevron-right" size={20} color={Colors.secondary} strokeWidth={2.2} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const CORNER = 34;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  titleRow: {
    marginTop: 24,
    paddingRight: 40,
  },
  title: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 32,
    lineHeight: 38,
    color: Colors.text,
  },
  titleSparks: {
    position: "absolute",
    right: 0,
    top: -10,
  },
  subtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 18,
  },
  preview: {
    height: 300,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.heroDark,
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: 40,
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: Colors.primary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 12 },
  hintPill: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Colors.overlay,
  },
  hintText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 15,
    color: "#FFFFFF",
  },
  analyzing: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  analyzingText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  permissionBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
  },
  permissionText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
  },
  permissionBtn: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
  },
  permissionBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.onPrimary,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FBE9EA",
  },
  errorText: {
    flex: 1,
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.error,
  },
  retryText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 14,
    color: Colors.error,
  },
  actions: {
    gap: 12,
    marginTop: 18,
  },
  tips: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: Colors.backgroundLight,
  },
  tip: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  tipIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 14,
    color: Colors.text,
  },
  tipDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.border,
  },
  manual: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    minHeight: 44,
  },
  manualText: {
    flex: 1,
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  manualLink: {
    fontFamily: "Rubik_600SemiBold",
    color: Colors.secondary,
  },
});
