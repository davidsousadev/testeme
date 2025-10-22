// src/audio.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const AudioContext = createContext(null);

export function AudioProvider({ children, tracks = 4 }) {
  const audioRef = useRef(null);
  const [isOn, setIsOn] = useState(true);
  const MIN_VOLUME = 0.2;
  const MAX_VOLUME = 0.5;
  const TRACK_COUNT = tracks;

  const save = (k, v) => localStorage.setItem(k, v);
  const get = (k) => localStorage.getItem(k);

  // pega track aleatória (não repetir se possível)
  const getRandomTrack = (exclude = "") => {
    let track;
    do {
      const n = Math.floor(Math.random() * TRACK_COUNT) + 1;
      track = `/sounds/${n}.mp3`;
    } while (track === exclude && TRACK_COUNT > 1);
    return track;
  };

  // alterna on/off
  const toggle = () => {
    setIsOn((s) => {
      const next = !s;
      save("audioOn", next);
      return next;
    });
  };

  useEffect(() => {
    const stored = get("audioOn");
    if (stored === "false") setIsOn(false);
  }, []);

  // core do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      audioRef.current = new Audio();
    }
    const a = audioRef.current;

    let fadeDir = 1;
    let volume = Math.random() * (MAX_VOLUME - MIN_VOLUME) + MIN_VOLUME;

    const savedSrc = get("lastTrack") || getRandomTrack();
    const savedTime = parseFloat(get("lastTime")) || 0;

    a.src = savedSrc;
    a.currentTime = savedTime;
    a.loop = false; // controlamos mudança manualmente
    a.volume = isOn ? volume : 0;

    const tryPlay = async () => {
      try {
        await a.play();
      } catch {
        const handler = async () => {
          try { await a.play(); } catch {}
          window.removeEventListener("click", handler);
          window.removeEventListener("keydown", handler);
          window.removeEventListener("touchstart", handler);
        };
        window.addEventListener("click", handler);
        window.addEventListener("keydown", handler);
        window.addEventListener("touchstart", handler);
      }
    };
    tryPlay();

    const handleEnded = () => {
      const shouldRepeat = Math.random() < 0.15; // 15% repeat
      const next = shouldRepeat ? a.src : getRandomTrack(a.src);
      a.src = next;
      save("lastTrack", next);
      a.currentTime = 0;
      a.play().catch(() => {});
    };
    a.addEventListener("ended", handleEnded);

    const visibilityHandler = () => {
      if (document.hidden) {
        a.pause();
      } else if (isOn) {
        a.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);
    window.addEventListener("blur", visibilityHandler);
    window.addEventListener("focus", visibilityHandler);

    const interval = setInterval(() => {
      if (!a.paused) {
        save("lastTime", a.currentTime);
        save("audioOn", isOn);

        if (isOn) {
          volume += fadeDir * 0.01;
          if (volume >= MAX_VOLUME || volume <= MIN_VOLUME) fadeDir *= -1;
          a.volume = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume));
        } else {
          a.volume = 0;
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      a.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", visibilityHandler);
      window.removeEventListener("blur", visibilityHandler);
      window.removeEventListener("focus", visibilityHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn]);

  return (
    <AudioContext.Provider value={{ audioRef, isOn, toggle }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}