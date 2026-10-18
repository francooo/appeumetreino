import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import Colors from "@/constants/colors";
import Icon from "@/components/Icon";
import { useApp } from "@/contexts/AppContext";
import { PrimaryButton } from "@/components/ui/Buttons";
import { Blob, Sparks, Stripes } from "@/components/ui/Layout";

type SlideId = "equipment" | "level" | "custom";

interface Slide {
  id: SlideId;
  title: string;
  description: string;
  showBrand: boolean;
}

const slides: Slide[] = [
  {
    id: "equipment",
    title: "Tire fotos dos seus equipamentos",
    description:
      "Fotografe os aparelhos de exercício que você tem em casa. Nós identificamos e criamos treinos sob medida.",
    showBrand: true,
  },
  {
    id: "level",
    title: "Informe seu nível de experiência",
    description:
      "Selecione se você é iniciante, intermediário ou avançado. O treino será adaptado ao seu nível.",
    showBrand: false,
  },
  {
    id: "custom",
    title: "Receba treinos personalizados",
    description:
      "Geramos automaticamente um plano de treino completo, com séries, repetições e equipamentos.",
    showBrand: true,
  },
];

function SlideArt({ id }: { id: SlideId }) {
  if (id === "equipment") {
    return (
      <View style={styles.artWrap}>
        <Svg width={230} height={220} viewBox="0 0 230 220">
          <Path
            d="M120 8 C185 10 225 60 222 120 C219 180 170 214 110 212 C50 210 8 176 8 112 C8 50 55 6 120 8 Z"
            fill={Colors.primary}
          />
        </Svg>
        <View style={styles.artIcon}>
          <Icon name="dumbbell" size={120} color={Colors.text} strokeWidth={2.4} />
        </View>
        <Sparks style={styles.sparkTopRight} size={80} />
        <Sparks style={styles.sparkBottomLeft} size={56} color={Colors.secondary} flip />
      </View>
    );
  }
  if (id === "level") {
    return (
      <View style={styles.artWrap}>
        <View style={[styles.artSquare, { backgroundColor: Colors.limeSoft }]}>
          <Icon name="trend-up" size={96} color={Colors.secondary} strokeWidth={2.6} />
        </View>
        <Sparks style={styles.sparkTopRight} size={80} />
      </View>
    );
  }
  return (
    <View style={styles.artWrap}>
      <View style={[styles.artSquare, { backgroundColor: Colors.cobaltSoft }]}>
        <Icon name="bolt" size={96} color={Colors.secondary} strokeWidth={2.6} />
      </View>
      <Sparks style={styles.sparkLeft} size={64} flip />
      <Sparks style={styles.sparkRight} size={64} />
    </View>
  );
}

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { setOnboarded } = useApp();

  const isLast = currentIndex === slides.length - 1;
  const current = slides[currentIndex];

  const handleNext = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!isLast) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await setOnboarded();
      router.replace("/(auth)/login");
    }
  };

  const handleSkip = async () => {
    await setOnboarded();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      {/* Decoracao de fundo de cada slide */}
      {current.id === "level" && (
        <>
          <Blob
            color={Colors.primary}
            lineColor={Colors.secondary}
            style={[styles.blobTopLeft, { transform: [{ rotate: "180deg" }] }]}
          />
          <Blob color={Colors.secondary} lineColor={Colors.primary} style={styles.blobBottomRight} />
        </>
      )}
      {current.id === "custom" && (
        <>
          <Stripes style={styles.stripesTopLeft} />
          <Stripes style={styles.stripesBottomRight} />
        </>
      )}

      <View
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 16 }]}
      >
        {current.showBrand ? (
          <View style={styles.brand}>
            <Icon name="dumbbell" size={44} color={Colors.primary} strokeWidth={3.4} />
            <Text style={styles.brandName}>{"Eu me\ntreino"}</Text>
            <View style={styles.brandDivider} />
            <Text style={styles.brandTagline}>{"DISCIPLINA HOJE,\nRESULTADOS SEMPRE."}</Text>
          </View>
        ) : (
          <View />
        )}
        <Pressable onPress={handleSkip} hitSlop={10} accessibilityRole="button" style={styles.skipBtn}>
          <Text style={styles.skipText}>Pular</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <SlideArt id={item.id} />
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }]}>
        <View style={styles.pagination} accessibilityLabel={`Página ${currentIndex + 1} de ${slides.length}`}>
          {slides.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        <PrimaryButton
          label={isLast ? "Começar" : "Próximo"}
          trailingIcon={isLast ? "check" : "arrow-right"}
          onPress={handleNext}
        />
        {isLast && (
          <Text style={styles.note}>Você poderá ajustar suas preferências depois.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
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
  skipBtn: {
    minHeight: 44,
    justifyContent: "center",
    paddingLeft: 12,
  },
  skipText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 16,
  },
  artWrap: {
    width: 260,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  artIcon: {
    position: "absolute",
  },
  artSquare: {
    width: 180,
    height: 180,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkTopRight: {
    position: "absolute",
    top: -6,
    right: 0,
  },
  sparkBottomLeft: {
    position: "absolute",
    bottom: 30,
    left: 0,
  },
  sparkLeft: {
    position: "absolute",
    left: 6,
    top: 70,
  },
  sparkRight: {
    position: "absolute",
    right: 6,
    top: 70,
  },
  slideTitle: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 34,
    lineHeight: 40,
    color: Colors.text,
    textAlign: "center",
  },
  slideDescription: {
    fontFamily: "Rubik_400Regular",
    fontSize: 17,
    lineHeight: 25,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 32,
    backgroundColor: Colors.primary,
  },
  note: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: -6,
  },
  blobTopLeft: {
    position: "absolute",
    top: -40,
    left: -60,
  },
  blobBottomRight: {
    position: "absolute",
    bottom: -20,
    right: -40,
  },
  stripesTopLeft: {
    position: "absolute",
    top: 120,
    left: -50,
  },
  stripesBottomRight: {
    position: "absolute",
    bottom: 160,
    right: -50,
  },
});
