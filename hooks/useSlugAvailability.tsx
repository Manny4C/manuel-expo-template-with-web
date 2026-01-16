import { useState, useCallback } from "react";

import {
  checkSlugAvailability,
  validateSlug,
  normalizeSlug,
} from "@/utils/slug";

export function useSlugAvailability() {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [normalizedSlug, setNormalizedSlug] = useState<string>("");

  const checkAvailability = useCallback(async (slug: string) => {
    const normalized = normalizeSlug(slug);
    setNormalizedSlug(normalized);

    if (!normalized) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    // Validate first
    const validation = validateSlug(normalized);
    if (!validation.valid) {
      setIsAvailable(false);
      setError(validation.error || "Invalid URL");
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const available = await checkSlugAvailability(normalized);
      setIsAvailable(available);
      if (!available) {
        setError("This URL is already taken");
      }
    } catch (err) {
      console.error("Error checking slug availability:", err);
      setError("Error checking availability");
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsAvailable(null);
    setError(null);
    setNormalizedSlug("");
  }, []);

  return {
    isChecking,
    isAvailable,
    error,
    normalizedSlug,
    checkAvailability,
    reset,
  };
}
