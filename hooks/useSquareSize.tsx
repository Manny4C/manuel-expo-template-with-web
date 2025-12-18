import { useEffect, useMemo, useState } from "react";
import { Dimensions } from "react-native";

export function useSquareSize(subtract = 0) {
  const [width, setWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      setWidth(Dimensions.get("window").width);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const squareSize = useMemo(() => {
    const screenWidth = width;
    const screenHeight = Dimensions.get("window").height;
    if (screenWidth > screenHeight) {
      return screenHeight * 0.6 - subtract;
    }
    return screenWidth - subtract;
  }, [width]);

  return squareSize;
}
