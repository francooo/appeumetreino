import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import Icon from "@/components/Icon";
import TextField from "@/components/ui/TextField";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { BackButton } from "@/components/ui/Layout";
import { apiRequest } from "@/lib/query-client";
import { useMealActions, type MealDraft } from "@/hooks/useCalories";
import { getSelectedMeal } from "@/lib/mealSelection";
import { MEAL_TYPES, MEAL_TYPE_LABEL, mealTypeForHour } from "@/lib/meals";
import { formatDayLong, formatTime, keyToDate, todayKey } from "@/lib/dates";
import type { MealType } from "@/lib/storage";

type Mode = "photo" | "manual" | "edit";

interface Estimate {
  name: string;
  meal_type: MealType | null;
  kcal: number;
  items: { name: string; kcal: number }[];
  confidence: number;
}

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export default function MealEntryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: Mode; day?: string }>();
  const mode: Mode = params.mode === "edit" || params.mode === "photo" ? params.mode : "manual";
  const editing = mode === "edit" ? getSelectedMeal() : null;
  const day = editing?.day || params.day || todayKey();
  const { addMeal, updateMeal, deleteMeal } = useMealActions();

  const now = new Date();
  const [name, setName] = useState(editing?.name || "");
  const [mealType, setMealType] = useState<MealType>(editing?.mealType || mealTypeForHour(now.getHours()));
  const [kcalText, setKcalText] = useState(editing ? String(editing.kcal) : "");
  const [timeText, setTimeText] = useState(editing ? formatTime(editing.eatenAt) : formatTime(now.toISOString()));
  const [photo, setPhoto] = useState<string | null>(editing?.photo || null);
  const [items, setItems] = useState<{ name: string; kcal: number }[] | null>(editing?.items || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [saving, setSaving] = useState(false);
  const autoOpened = useRef(false);

  const analyzePhoto = async (uri: string) => {
    setIsAnalyzing(true);
    setLowConfidence(false);
    try {
      // Miniatura pequena para guardar no banco e versao maior para a IA
      const [thumb, forAi] = await Promise.all([
        manipulateAsync(uri, [{ resize: { width: 300 } }], { compress: 0.6, format: SaveFormat.JPEG, base64: true }),
        manipulateAsync(uri, [{ resize: { width: 1024 } }], { compress: 0.7, format: SaveFormat.JPEG, base64: true }),
      ]);
      if (!thumb.base64 || !forAi.base64) throw new Error("Falha ao processar a imagem");
      setPhoto(`data:image/jpeg;base64,${thumb.base64}`);

      const res = await apiRequest("POST", "/api/vision/meal", {
        image: `data:image/jpeg;base64,${forAi.base64}`,
      });
      const estimate: Estimate = await res.json();
      setName(estimate.name);
      setKcalText(String(estimate.kcal));
      setItems(estimate.items.length ? estimate.items : null);
      if (estimate.meal_type) setMealType(estimate.meal_type);
      setLowConfidence(estimate.confidence < 50);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.error("Meal photo error:", e);
      Alert.alert("Erro", "Não foi possível estimar as calorias. Preencha os dados manualmente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pickPhoto = async (source: "camera" | "library") => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        source === "camera"
          ? "Permita o acesso à câmera para fotografar a refeição."
          : "Permita o acesso às fotos para escolher uma imagem.",
      );
      return;
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 1 };
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets[0]?.uri) {
      await analyzePhoto(result.assets[0].uri);
    }
  };

  // No modo foto, abre a camera direto ao entrar
  useEffect(() => {
    if (mode === "photo" && !autoOpened.current) {
      autoOpened.current = true;
      pickPhoto("camera");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    const kcal = Number(kcalText.replace(/\D/g, ""));
    if (!name.trim()) {
      Alert.alert("Erro", "Informe o nome da refeição.");
      return;
    }
    if (!kcalText.trim() || !Number.isInteger(kcal) || kcal > 5000) {
      Alert.alert("Erro", "Informe as calorias (0 a 5000 kcal).");
      return;
    }
    const time = timeText.trim().match(TIME_RE);
    if (!time) {
      Alert.alert("Erro", "Informe o horário no formato HH:MM.");
      return;
    }
    const eatenAt = keyToDate(day);
    eatenAt.setHours(Number(time[1]), Number(time[2]), 0, 0);

    const draft: MealDraft = {
      day,
      eatenAt: eatenAt.toISOString(),
      mealType,
      name: name.trim(),
      kcal,
      photo,
      items,
    };
    setSaving(true);
    try {
      if (editing) {
        await updateMeal(editing.id, draft);
      } else {
        await addMeal(draft);
      }
      router.back();
    } catch (e) {
      console.error("Save meal error:", e);
      Alert.alert("Erro", "Não foi possível salvar a refeição. Verifique sua conexão.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    Alert.alert("Excluir refeição", "Deseja excluir esta refeição?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMeal(editing.id);
            router.back();
          } catch {
            Alert.alert("Erro", "Não foi possível excluir a refeição.");
          }
        },
      },
    ]);
  };

  const title = editing ? "Editar refeição" : mode === "photo" ? "Fotografar refeição" : "Registrar refeição";
  const showPhotoArea = mode === "photo" || !!photo;

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollViewCompat
        bottomOffset={24}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} shape="square" />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerDay}>{formatDayLong(day)}</Text>
          </View>
        </View>

        {showPhotoArea && (
          <View style={styles.photoArea}>
            {photo ? (
              <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <View style={styles.photoEmpty}>
                <Icon name="plate" size={44} color={Colors.textSecondary} />
                <Text style={styles.photoEmptyText}>Fotografe o prato para estimar as calorias</Text>
              </View>
            )}
            {isAnalyzing && (
              <View style={styles.analyzing}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.analyzingText}>Estimando calorias...</Text>
              </View>
            )}
          </View>
        )}

        {mode !== "edit" && showPhotoArea && (
          <View style={styles.photoActions}>
            <PrimaryButton
              label={photo ? "Tirar outra foto" : "Tirar foto"}
              leadingIcon="camera"
              trailingIcon={null}
              onPress={() => pickPhoto("camera")}
              disabled={isAnalyzing}
            />
            <SecondaryButton
              label="Escolher da galeria"
              icon="gallery"
              iconColor={Colors.secondary}
              onPress={() => pickPhoto("library")}
              disabled={isAnalyzing}
            />
          </View>
        )}

        {lowConfidence && (
          <View style={styles.warning}>
            <Icon name="info" size={20} color={Colors.warning} />
            <Text style={styles.warningText}>
              Não temos certeza desta estimativa. Confira o nome e as calorias antes de salvar.
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Refeição</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {MEAL_TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setMealType(t)}
              style={[styles.chip, mealType === t && styles.chipSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected: mealType === t }}
            >
              <Text style={[styles.chipText, mealType === t && styles.chipTextSelected]}>
                {MEAL_TYPE_LABEL[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.form}>
          <TextField
            icon="utensils"
            label="O que você comeu"
            placeholder="Ex.: Frango grelhado com arroz"
            value={name}
            onChangeText={setName}
            maxLength={80}
          />
          <TextField
            icon="fire"
            label="Calorias (kcal)"
            placeholder="Ex.: 620"
            value={kcalText}
            onChangeText={setKcalText}
            keyboardType="number-pad"
            maxLength={4}
          />
          <TextField
            icon="clock"
            label="Horário"
            placeholder="HH:MM"
            value={timeText}
            onChangeText={setTimeText}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>

        {items && items.length > 0 && (
          <View style={styles.items}>
            <Text style={styles.sectionLabel}>Itens estimados</Text>
            {items.map((item, i) => (
              <View key={`${item.name}-${i}`} style={[styles.itemRow, i > 0 && styles.itemBorder]}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemKcal}>{item.kcal} kcal</Text>
              </View>
            ))}
          </View>
        )}

        {editing && (
          <Pressable onPress={handleDelete} style={styles.delete} accessibilityRole="button">
            <Text style={styles.deleteText}>Excluir refeição</Text>
          </Pressable>
        )}
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <PrimaryButton
          label="Salvar refeição"
          trailingIcon="check"
          onPress={handleSave}
          loading={saving}
          disabled={isAnalyzing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  headerDay: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  photoArea: {
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.backgroundLight,
  },
  photoEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 24,
  },
  photoEmptyText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
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
  photoActions: {
    gap: 10,
    marginTop: 14,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFF4E0",
  },
  warningText: {
    flex: 1,
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.text,
  },
  sectionLabel: {
    fontFamily: "Rubik_700Bold",
    fontSize: 16,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 15,
    color: Colors.text,
  },
  chipTextSelected: {
    fontFamily: "Rubik_700Bold",
    color: Colors.onPrimary,
  },
  form: {
    gap: 12,
    marginTop: 16,
  },
  items: {
    marginTop: 4,
    padding: 16,
    paddingTop: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    marginVertical: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: 12,
  },
  itemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  itemName: {
    flex: 1,
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  itemKcal: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  delete: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 16,
  },
  deleteText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 16,
    color: Colors.error,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
