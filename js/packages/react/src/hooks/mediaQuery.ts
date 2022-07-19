import {useEffect, useState} from "react";

export function useMediaQuery(
  query: string,
  onStateChanged?: (match: boolean) => void
): boolean {
  // For correct initial state use first passed query without effect
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const resizeListener = () => {
      if (media.matches !== matches) {
        setMatches(media.matches);
        if (onStateChanged) {
          onStateChanged(media.matches);
        }
      }
    };

    // Call first matcher on query changes
    resizeListener();

    window.addEventListener("resize", resizeListener);
    return () => window.removeEventListener("resize", resizeListener);
  }, [matches, query]);

  return matches;
}
