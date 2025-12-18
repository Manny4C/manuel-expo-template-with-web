import { useCallback, useEffect, useState } from "react";

export function useTypewriterAnimation({
  resetTypewriterKey,
}: {
  resetTypewriterKey: number;
}) {
  const [typewriterFirstLineComplete, setTypewriterFirstLineComplete] =
    useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  // Memoize callbacks to prevent TypewriterText from resetting
  const handleFirstLineComplete = useCallback(() => {
    setTypewriterFirstLineComplete(true);
  }, []);

  const handleTypewriterComplete = useCallback(() => {
    setTypewriterComplete(true);
  }, []);

  useEffect(() => {
    setTypewriterFirstLineComplete(false);
    setTypewriterComplete(false);
  }, [resetTypewriterKey]);

  return {
    typewriterFirstLineComplete,
    setTypewriterFirstLineComplete,
    typewriterComplete,
    setTypewriterComplete,
    handleFirstLineComplete,
    handleTypewriterComplete,
  };
}
