/**
 * Text to Speech Service for Avatar
 */

export class TextToSpeechService {
  private audioContext: AudioContext | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  public onAudioEnd: (() => void) | null = null;
  private isPlaying: boolean = false;
  window: any;

  constructor() {
    // Initialize AudioContext lazily when needed
    this.initAudioContext();
  }

  private initAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } catch (error) {
        console.error("Failed to create AudioContext:", error);
      }
    }
  }

  /**
   * Call TTS API and returns audio content as base64
   * @param text Text to be spoken
   * @param language Source language ('english' or 'tamil')
   * @param gender Gender for voice ('male' or 'female')
   * @returns Promise with base64 audio content
   */
  async getTTSAudio(
    text: string,
    language: "english" | "tamil" = "english",
    gender: "male" | "female" = "male"
  ): Promise<string> {
    try {
      const apiUrl = "http://1.6.13.157:5120";

      const payload = {
        input: [
          {
            source: text,
          },
        ],
        config: {
          language: {
            sourceLanguage: language === "english" ? "en" : "ta",
          },
          gender: gender,
        },
      };

      // Set a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      console.log("Response:", response);

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`TTS API responded with ${response.status}`);
      }

      const data = await response.json();

      // Ensure we have the expected data format
      if (
        !data ||
        !data.audio ||
        !data.audio[0] ||
        !data.audio[0].audioContent
      ) {
        console.error("Invalid response format from TTS API", data);
        throw new Error("Invalid response format from TTS API");
      }

      return data.audio[0].audioContent;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error("TTS API request timed out");
      } else {
        console.error("TTS API error:", error);
      }
      throw error;
    }
  }

  /**
   * Play audio using Web Audio API for better control
   * @param base64Audio Base64 encoded audio content
   * @returns Promise that resolves when audio starts playing
   */
  playAudio(base64Audio: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Stop any currently playing audio
        this.stopAudio();

        // Ensure AudioContext is initialized and resumed
        this.initAudioContext();
        if (!this.audioContext) {
          reject(new Error("AudioContext could not be created"));
          return;
        }

        // Resume context if suspended (autoplay policy)
        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
        }

        // Log the base64 length to verify we have audio content
        console.log(`Received audio content of length: ${base64Audio.length}`);

        if (!base64Audio || base64Audio.length < 100) {
          console.error("Invalid or empty audio content received");
          reject(new Error("Invalid audio content"));
          return;
        }

        // Convert base64 to array buffer
        const byteCharacters = atob(base64Audio);
        const byteArray = new Uint8Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        console.log(
          `Created audio byte array of size: ${byteArray.length} bytes`
        );

        // Decode audio data
        try {
          const audioBuffer = await this.audioContext.decodeAudioData(
            byteArray.buffer
          );
          console.log(
            `Audio decoded successfully, duration: ${audioBuffer.duration}s`
          );

          // Create source node
          this.audioSource = this.audioContext.createBufferSource();
          this.audioSource.buffer = audioBuffer;

          // Create gain node for volume control
          this.gainNode = this.audioContext.createGain();
          this.gainNode.gain.value = 1.0; // Full volume

          // Connect nodes
          this.audioSource.connect(this.gainNode);
          this.gainNode.connect(this.audioContext.destination);

          // Set up event handlers
          this.audioSource.onended = () => {
            console.log("Audio playback ended");
            this.isPlaying = false;
            this.audioSource = null;

            if (this.onAudioEnd) {
              this.onAudioEnd();
            }
          };

          // Start playback
          this.audioSource.start(0);
          this.isPlaying = true;
          console.log("Audio playback started successfully");
          resolve();
        } catch (decodeError) {
          console.error("Failed to decode audio data:", decodeError);
          reject(new Error(`Failed to decode audio: ${decodeError.message}`));
        }
      } catch (error) {
        console.error("Audio setup error:", error);
        this.isPlaying = false;
        this.audioSource = null;
        reject(error);
      }
    });
  }

  /**
   * Stop currently playing audio
   */
  stopAudio(): void {
    if (this.audioSource) {
      try {
        this.audioSource.stop();
        this.audioSource.disconnect();
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
      this.audioSource = null;
    }

    this.isPlaying = false;
  }

  /**
   * Check if audio is currently playing
   */
  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Set playback rate (1.0 = normal speed)
   * @param rate Playback rate where 1.0 is normal speed
   */
  setPlaybackRate(rate: number): void {
    if (this.audioSource && rate > 0) {
      this.audioSource.playbackRate.value = rate;
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   * @param volume Volume level from 0.0 (silent) to 1.0 (full volume)
   */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

export const ttsService = new TextToSpeechService();
