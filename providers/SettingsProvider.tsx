"use client";
import { createContext, useContext } from "react";
import { useLocalStorage } from "usehooks-ts";
type SettingsContextProps = {
  isAudioMuted: boolean;
  setIsAudioMuted: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultSettingsContext: SettingsContextProps = {
  isAudioMuted: false,
  setIsAudioMuted: () => {},
};

const SettingsContext = createContext<SettingsContextProps>(defaultSettingsContext);

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [isAudioMuted, setIsAudioMuted] = useLocalStorage("isAudioMuted", false);

  const contextValue: SettingsContextProps = {
    isAudioMuted,
    setIsAudioMuted,
  };

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
}

export const useAudioToggle = () => useContext(SettingsContext);
