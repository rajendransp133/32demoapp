"use client";

import React, {
  Suspense,
  useState,
  useRef,
  useEffect,
  memo,
  useMemo,
} from "react";
import { useGLTF, useFBX, useAnimations } from "@react-three/drei";
import { Group, SkinnedMesh, Object3D } from "three";
import { useAvatarContext } from "../context/AvatarContext";
import { ttsService } from "../services/TextToSpeechService";

import { LipsyncEn, LipsyncTa } from "../services/LipSyncProvider";

interface AvatarProps {
  position?: [number, number, number];
  scale?: number;
}

// Preload and memoize the model and animations
const useAvatarAssets = () => {
  const { nodes, materials } = useGLTF("/models/32Mins_model_male_01.glb");
  const { animations: idleAnimation } = useFBX("/animations/Idle.fbx");
  const { animations: talkAnimation } = useFBX("/animations/Talking.fbx");

  // Name the animations
  idleAnimation[0].name = "Idle";
  talkAnimation[0].name = "Talk";

  // Fix animation tracks to match the skeleton
  idleAnimation[0].tracks.forEach((track) => {
    if (track.name.includes("mixamorigHips")) {
      track.name = track.name.replace("mixamorigHips", "Hips");
    }
  });

  talkAnimation[0].tracks.forEach((track) => {
    if (track.name.includes("mixamorigHips")) {
      track.name = track.name.replace("mixamorigHips", "Hips");
    }
  });

  return { nodes, materials, idleAnimation, talkAnimation };
};

const Avatar = memo(({ position = [0, 0, 0], scale = 1 }: AvatarProps) => {
  // Use memoized assets
  const { nodes, materials, idleAnimation, talkAnimation } = useAvatarAssets();

  const { replyText, isSpeaking, setIsSpeaking, language, setReplyText } =
    useAvatarContext();

  const [animation, setAnimation] = useState("Idle");
  const [currentVisemeIndex, setCurrentVisemeIndex] = useState(0);
  const [visemes, setVisemes] = useState<{
    visemes: string[];
    times: number[];
    durations: number[];
  }>({
    visemes: [],
    times: [],
    durations: [],
  });
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [ttsError, setTtsError] = useState(false);

  const lipSyncEn = useRef(new LipsyncEn()).current;
  const lipSyncTa = useRef(new LipsyncTa()).current;

  const group = useRef<Group>(null);
  const startTimeRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { actions } = useAnimations(
    [idleAnimation[0], talkAnimation[0]],
    group
  );

  useEffect(() => {
    if (!actions[animation]) {
      return;
    }

    actions[animation].reset().fadeIn(0.5).play();

    return () => {
      if (actions[animation]) {
        actions[animation].fadeOut(0.5);
      }
    };
  }, [animation, actions]);

  useEffect(() => {
    const handleAudioEnd = () => {
      setAudioPlaying(false);
      setIsSpeaking(false);
      setReplyText("");
    };

    ttsService.onAudioEnd = handleAudioEnd;

    return () => {
      ttsService.onAudioEnd = null;
    };
  }, [setIsSpeaking, setReplyText]);

  useEffect(() => {
    if (replyText) {
      setTtsError(false);

      const lipSync = language === "english" ? lipSyncEn : lipSyncTa;

      try {
        const visemes = lipSync.wordsToVisemes(replyText);
        setVisemes(visemes);
        setCurrentVisemeIndex(0);
      } catch (error) {
        console.error("Error generating visemes:", error);
        setTtsError(true);
      }

      startTimeRef.current = Date.now();
      setIsSpeaking(true);
      setAnimation("Talk");

      const playTTS = async () => {
        try {
          const gender = "male";
          const audioContent = await ttsService.getTTSAudio(
            replyText,
            language,
            gender
          );

          if (audioContent) {
            try {
              ttsService.playAudio(audioContent);
              setAudioPlaying(true);
            } catch (error) {
              console.error("Audio playback failed:", error);
              setTtsError(true);
            }
          } else {
            throw new Error("No audio content returned from TTS API");
          }
        } catch (error) {
          console.error("Failed to play TTS audio:", error);
          setTtsError(true);
        }
      };

      playTTS();
    } else {
      setIsSpeaking(false);
      setAudioPlaying(false);
      setTtsError(false);
      ttsService.stopAudio();
      setAnimation("Idle");
    }
  }, [replyText, setIsSpeaking, language, lipSyncEn, lipSyncTa]);

  useEffect(() => {
    const avatar = nodes.Wolf3D_Avatar as SkinnedMesh;
    if (
      !avatar ||
      !avatar.morphTargetDictionary ||
      !avatar.morphTargetInfluences
    ) {
      return;
    }

    let animationFrameId: number;

    const updateViseme = () => {
      try {
        if (isSpeaking && visemes.visemes.length > 0) {
          const currentTime = (Date.now() - startTimeRef.current) / 100;

          if (avatar.morphTargetInfluences) {
            for (let i = 0; i < avatar.morphTargetInfluences.length; i++) {
              avatar.morphTargetInfluences[i] = 0;
            }
          }

          let activeVisemeIndex = -1;
          for (let i = 0; i < visemes.times.length; i++) {
            if (
              currentTime >= visemes.times[i] &&
              (i === visemes.times.length - 1 ||
                currentTime < visemes.times[i + 1])
            ) {
              activeVisemeIndex = i;
              break;
            }
          }

          if (
            activeVisemeIndex >= 0 &&
            activeVisemeIndex < visemes.visemes.length
          ) {
            const visemeName = visemes.visemes[activeVisemeIndex];
            const visemeIndex =
              avatar.morphTargetDictionary["viseme_" + visemeName];

            if (visemeIndex !== undefined) {
              avatar.morphTargetInfluences[visemeIndex] = 1;
            }

            if (
              activeVisemeIndex === visemes.visemes.length - 1 &&
              currentTime >
                visemes.times[activeVisemeIndex] +
                  visemes.durations[activeVisemeIndex] &&
              (ttsError || !audioPlaying)
            ) {
              setIsSpeaking(false);
              setReplyText("");
              setAnimation("Idle");
            }
          }
        } else {
          const smileIndex = avatar.morphTargetDictionary["mouthSmile"];
          if (smileIndex !== undefined) {
            avatar.morphTargetInfluences[smileIndex] = 1;
          }
        }
      } catch (error) {
        console.error("Error in viseme animation:", error);
        if (avatar.morphTargetInfluences) {
          for (let i = 0; i < avatar.morphTargetInfluences.length; i++) {
            avatar.morphTargetInfluences[i] = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(updateViseme);
    };

    updateViseme();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      ttsService.stopAudio();
    };
  }, [
    isSpeaking,
    visemes,
    audioPlaying,
    ttsError,
    nodes.Wolf3D_Avatar,
    setIsSpeaking,
    setReplyText,
  ]);

  return (
    <group ref={group} position={position} scale={scale} dispose={null}>
      <group name="Scene">
        <group name="Armature">
          <group name="Wolf3D_Avatar" />
          <skinnedMesh
            name="Wolf3D_Avatar"
            geometry={(nodes.Wolf3D_Avatar as SkinnedMesh).geometry}
            material={materials["Wolf3D_Avatar.007"]}
            skeleton={(nodes.Wolf3D_Avatar as SkinnedMesh).skeleton}
            morphTargetDictionary={
              (nodes.Wolf3D_Avatar as SkinnedMesh).morphTargetDictionary
            }
            morphTargetInfluences={
              (nodes.Wolf3D_Avatar as SkinnedMesh).morphTargetInfluences
            }
          />
          <primitive object={nodes.Hips} />
        </group>
      </group>
    </group>
  );
});

if (typeof window !== "undefined") {
  useGLTF.preload("/models/32Mins_model_male_01.glb");
}

export { Avatar };
