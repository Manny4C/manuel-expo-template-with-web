import React, { useEffect, useRef, useState } from "react";
import { StyleProp, TextStyle } from "react-native";

import { Text } from "@/components/Text";

// Typewriter text component with pause support
export function TypewriterText({
  style,
  text,
  speed = 50,
  delay = 0,
  pauseAfterFirstLine = false,
  pauseLength = 800,
  onFirstLineComplete,
  onComplete,
}: {
  style?: StyleProp<TextStyle>;
  text: string;
  speed?: number;
  delay?: number;
  pauseAfterFirstLine?: boolean;
  pauseLength?: number;
  onFirstLineComplete?: () => void;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  // Use refs to store callbacks so they don't trigger re-renders
  const onFirstLineCompleteRef = useRef(onFirstLineComplete);
  const onCompleteRef = useRef(onComplete);

  // Update refs when callbacks change
  useEffect(() => {
    onFirstLineCompleteRef.current = onFirstLineComplete;
    onCompleteRef.current = onComplete;
  }, [onFirstLineComplete, onComplete]);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    let currentIndex = 0;
    let isPaused = false;
    let firstLineDone = false;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          const char = text[currentIndex];

          // Check if we hit a newline and should pause
          if (pauseAfterFirstLine && char === "\n" && !isPaused) {
            isPaused = true;
            // First line is complete
            if (!firstLineDone && onFirstLineCompleteRef.current) {
              firstLineDone = true;
              onFirstLineCompleteRef.current();
            }
            setTimeout(() => {
              isPaused = false;
              setDisplayedText(text.slice(0, currentIndex + 1));
              currentIndex++;
            }, pauseLength);
          } else if (!isPaused) {
            setDisplayedText(text.slice(0, currentIndex + 1));
            currentIndex++;
          }
        } else {
          setIsComplete(true);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [
    text,
    speed,
    delay,
    pauseAfterFirstLine,
    pauseLength,
    // Removed callbacks from dependency array - using refs instead
  ]);

  return (
    <Text weight="Bold" style={style}>
      {displayedText.split("\n").map((line, index, array) => (
        <React.Fragment key={index}>
          {line}
          {index < array.length - 1 && "\n"}
        </React.Fragment>
      ))}
      {!isComplete && <Text style={{ opacity: 0.7 }}>|</Text>}
    </Text>
  );
}
