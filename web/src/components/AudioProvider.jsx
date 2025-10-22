import { createContext, useEffect, useRef, useState } from "react";

export const AudioContext = createContext();

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [isOn, setIsOn] = useState(true);

  const MIN_VOLUME = 0.2;
  const MAX_VOLUME = 0.5;
  const TRACK_COUNT = 4;

  const save = (k, v) => localStorage.setItem(k, v);
  const get = (k) => localStorage.getItem(k);
  const random = (min, max) => Math.random() * (max - min) + min;

  const getRandomTrack = (exclude = "") => {
    let track;
    do {
      const num = Math.floor(Math.random() * TRACK_COUNT) + 1;
      track = `/sounds/${num}.mp3`;
    } while (track === exclude && TRACK_COUNT > 1);
    return track;
  };

  useEffect(() => {
    const savedAudio = get("audioOn");
    if (savedAudio === "false") setIsOn(false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const savedSrc = get("lastTrack") || getRandomTrack();
    const savedTime = parseFloat(get("lastTime")) || 0;

    audio.src = savedSrc;
    audio.currentTime = savedTime;
    audio.volume = isOn ? random(MIN_VOLUME, MAX_VOLUME) : 0;
    audio.loop = false;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch {
        // ⚙️ Obriga tocar ao interagir com qualquer elemento
        const handler = async () => {
          try {
            await audio.play();
          } catch {}
          window.removeEventListener("click", handler);
        };
        window.addEventListener("click", handler);
      }
    };

    playAudio();

    const handleEnded = () => {
      const shouldRepeat = Math.random() < 0.15;
      const nextTrack = shouldRepeat ? audio.src : getRandomTrack(audio.src);
      audio.src = nextTrack;
      save("lastTrack", nextTrack);
      audio.currentTime = 0;
      audio.play();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else if (isOn) {
        audio.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    audio.addEventListener("ended", handleEnded);

    let fadeDir = 1;
    let volume = audio.volume;
    const interval = setInterval(() => {
      if (!audio.paused) {
        save("lastTime", audio.currentTime);
        save("audioOn", isOn);

        if (isOn) {
          volume += fadeDir * 0.01;
          if (volume >= MAX_VOLUME || volume <= MIN_VOLUME) fadeDir *= -1;
          audio.volume = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume));
        } else {
          audio.volume = 0;
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      audio.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [isOn]);

  const toggle = () => setIsOn((prev) => !prev);

  return (
    <AudioContext.Provider value={{ isOn, toggle }}>
      {children}
      <audio ref={audioRef} preload="auto" />
    </AudioContext.Provider>
  );
}