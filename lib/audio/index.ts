import { Audio } from "expo-av";
import { Platform } from "react-native";
import { useLocaleStore } from "@/lib/i18n";

type SoundId = "pop" | "error" | "undo" | "lineClear" | "complete" | "achievement";

const soundFiles: Record<SoundId, any> = {
  pop: require("../../assets/sounds/pop.mp3"),
  error: require("../../assets/sounds/error.mp3"),
  undo: require("../../assets/sounds/undo.mp3"),
  lineClear: require("../../assets/sounds/lineClear.mp3"),
  complete: require("../../assets/sounds/complete.mp3"),
  achievement: require("../../assets/sounds/achievement.mp3"),
};

const loadedSounds: Partial<Record<SoundId, Audio.Sound>> = {};

export async function preloadSounds(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
    });

    for (const [id, file] of Object.entries(soundFiles)) {
      const { sound } = await Audio.Sound.createAsync(file, { volume: 0.4 });
      loadedSounds[id as SoundId] = sound;
    }
  } catch (e) {
    // 静默失败，音效是增强体验不是核心功能
  }
}

export async function playSound(id: SoundId): Promise<void> {
  if (Platform.OS === "web") return;

  // 检查静音状态
  const isMuted = useLocaleStore.getState().isMuted;
  if (isMuted) return;

  const sound = loadedSounds[id];
  if (!sound) return;

  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (e) {
    // 静默失败
  }
}

export async function unloadSounds(): Promise<void> {
  for (const sound of Object.values(loadedSounds)) {
    if (sound) {
      await sound.unloadAsync();
    }
  }
}
