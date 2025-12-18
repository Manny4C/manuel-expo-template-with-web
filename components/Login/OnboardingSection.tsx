import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { Easing, FadeInDown, FadeOut } from "react-native-reanimated";

import { Text } from "@/components/Text";
import { TypewriterText } from "@/components/TypewriterText";
import { useTypewriterAnimation } from "@/hooks/useTypewriterAnimation";
import { SECONDARY_TEXT_COLOR, WHITE } from "@/lib/styles";

export interface SlideConfig {
  id: number;
  title: string;
  description?: string;
  pauseAfterFirstLine?: boolean;
  pauseLength?: number; // Pause duration in ms when hitting newline (default: 800)
  totalLength?: number; // Total duration for this slide in ms (default: PAUSE_DURATION)
}

export const SLIDES: SlideConfig[] = [
  {
    id: 1,
    title: "Welcome",
    totalLength: 4000,
  },
];

export const ANIMATION_DURATION = 600; // Fast animation in
export const PAUSE_DURATION = 2500; // Pause before next slide
export const FADE_OUT_DURATION = 400; // Fast fade out

interface OnboardingSectionProps {
  onComplete: () => void;
}

export function OnboardingSection({ onComplete }: OnboardingSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const currentSlide = SLIDES[currentIndex];

  const { handleFirstLineComplete, handleTypewriterComplete } =
    useTypewriterAnimation({ resetTypewriterKey: currentIndex });

  useEffect(
    function handleSlideChange() {
      if (currentIndex >= SLIDES.length) return;

      // Show current slide
      setIsVisible(true);

      const currentSlide = SLIDES[currentIndex];
      const slideDuration = currentSlide.totalLength ?? PAUSE_DURATION;

      // Move to next slide after animation + pause
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
        }, FADE_OUT_DURATION);
      }, ANIMATION_DURATION + slideDuration);

      return () => clearTimeout(timer);
    },

    [currentIndex],
  );

  // Hidden control, preses and hold to skip the onboarding flow
  function handleLongPress() {
    if (currentIndex === SLIDES.length - 1) {
      handleResetSlides();
    } else {
      onComplete();
    }
  }

  function handleResetSlides() {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex(0);
    }, FADE_OUT_DURATION);
  }

  return (
    <Pressable
      style={styles.container}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      {isVisible && currentSlide && (
        <Animated.View
          key={currentSlide.id}
          entering={FadeInDown.duration(ANIMATION_DURATION)
            .easing(Easing.out(Easing.ease))
            .springify()}
          exiting={FadeOut.duration(FADE_OUT_DURATION)}
          style={styles.slide}
        >
          <Animated.View
            style={styles.titleContainer}
            entering={FadeInDown.duration(ANIMATION_DURATION)
              .delay(100)
              .easing(Easing.out(Easing.ease))
              .springify()}
          >
            <TypewriterText
              style={styles.title}
              text={currentSlide.title}
              speed={50}
              delay={100}
              pauseAfterFirstLine={currentSlide.pauseAfterFirstLine || false}
              pauseLength={currentSlide.pauseLength || 800}
              onFirstLineComplete={handleFirstLineComplete}
              onComplete={handleTypewriterComplete}
            />
          </Animated.View>

          {currentSlide.description && (
            <Animated.View
              entering={FadeInDown.duration(ANIMATION_DURATION)
                .delay(1500)
                .easing(Easing.out(Easing.ease))
                .springify()}
            >
              <Text style={styles.description}>{currentSlide.description}</Text>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 40,
    paddingRight: 30,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Above decorative elements (stamps and polaroids)
  },
  titleContainer: {
    width: "100%",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    textShadowColor: WHITE,

    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    color: SECONDARY_TEXT_COLOR,
    textShadowColor: WHITE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  passportContainer: {
    width: 300,
  },
});
