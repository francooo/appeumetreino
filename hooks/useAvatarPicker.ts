import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useApp } from "@/contexts/AppContext";

// Escolher/tirar/remover a foto de perfil (usado no Perfil e em Dados pessoais)
export function useAvatarPicker() {
  const { user, updateAvatar } = useApp();
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const saveAvatar = async (uri: string) => {
    setIsSavingAvatar(true);
    try {
      // Reduz para 400x400 JPEG (~30-60 KB) antes de enviar e salvar no banco
      const result = await manipulateAsync(uri, [{ resize: { width: 400, height: 400 } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
        base64: true,
      });
      if (!result.base64) throw new Error("Falha ao processar a imagem");
      await updateAvatar(`data:image/jpeg;base64,${result.base64}`);
    } catch (e) {
      console.error("Avatar error:", e);
      Alert.alert("Erro", "Nao foi possivel salvar a foto. Tente novamente.");
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const pickAvatar = async (source: "camera" | "library") => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissao necessaria",
        source === "camera"
          ? "Permita o acesso a camera para tirar a foto."
          : "Permita o acesso as fotos para escolher uma imagem.",
      );
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    };
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets[0]?.uri) {
      await saveAvatar(result.assets[0].uri);
    }
  };

  const handleAvatarPress = () => {
    const buttons: { text: string; style?: "cancel" | "destructive"; onPress?: () => void }[] = [
      { text: "Tirar foto", onPress: () => pickAvatar("camera") },
      { text: "Escolher da galeria", onPress: () => pickAvatar("library") },
    ];
    if (user?.avatar) {
      buttons.push({
        text: "Remover foto",
        style: "destructive",
        onPress: async () => {
          setIsSavingAvatar(true);
          try {
            await updateAvatar(null);
          } catch {
            Alert.alert("Erro", "Nao foi possivel remover a foto.");
          } finally {
            setIsSavingAvatar(false);
          }
        },
      });
    }
    buttons.push({ text: "Cancelar", style: "cancel" });
    Alert.alert("Foto de perfil", undefined, buttons);
  };

  return { handleAvatarPress, isSavingAvatar };
}
