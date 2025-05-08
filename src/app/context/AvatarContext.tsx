"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AvatarContextType {
  replyText: string;
  setReplyText: (text: string) => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  language: "english" | "tamil";
  toggleLanguage: () => void;
  audioIsPlaying: boolean;
  setAudioIsPlaying: (playing: boolean) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const useAvatarContext = () => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error("useAvatarContext must be used within an AvatarProvider");
  }
  return context;
};

interface AvatarProviderProps {
  children: ReactNode;
}

export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  const [replyText, setReplyText] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [language, setLanguage] = useState<"english" | "tamil">("tamil");
  const [audioIsPlaying, setAudioIsPlaying] = useState<boolean>(false);

  const updateReplyText = (text: string) => {
    setReplyText(text);
    setIsSpeaking(text.length > 0);
  };

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "english" ? "tamil" : "english"));
  };

  return (
    <AvatarContext.Provider
      value={{
        replyText,
        setReplyText: updateReplyText,
        isSpeaking,
        setIsSpeaking,
        language,
        toggleLanguage,
        audioIsPlaying,
        setAudioIsPlaying,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};
