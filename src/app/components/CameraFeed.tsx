"use client";

import { useEffect, useRef, useState } from "react";

// Define emotion data interface
interface EmotionData {
  primary: string;
  scores: {
    neutral: number;
    confusion: number;
    engagement: number;
    frustration: number;
  };
}

export default function CameraFeed({
  onEmotionUpdate,
}: {
  onEmotionUpdate?: (data: EmotionData) => void;
}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [emotionData, setEmotionData] = useState<EmotionData>({
    primary: "neutral",
    scores: {
      neutral: 0.75,
      confusion: 0.45,
      engagement: 0.6,
      frustration: 0.3,
    },
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket("ws://localhost:8000/ws");

      wsRef.current.onopen = () => {
        console.log("WebSocket connection established");
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          // Process incoming emotion analysis data
          const data = JSON.parse(event.data);
          if (data.emotion) {
            const newEmotionData: EmotionData = {
              primary: data.emotion.primary || "neutral",
              scores: {
                neutral: data.emotion.scores?.neutral || 0,
                confusion: data.emotion.scores?.confusion || 0,
                engagement: data.emotion.scores?.engagement || 0,
                frustration: data.emotion.scores?.frustration || 0,
              },
            };

            setEmotionData(newEmotionData);

            // Send emotion data to parent component if callback exists
            if (onEmotionUpdate) {
              onEmotionUpdate(newEmotionData);
            }
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket connection closed");
        setIsConnected(false);
      };
    } catch (error) {
      console.error("WebSocket setup error:", error);
      setError("Failed to connect to WebSocket server");
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    wsRef.current = null;
    setIsConnected(false);
  };

  const startSendingFrames = () => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    frameIntervalRef.current = setInterval(() => {
      if (
        videoRef.current &&
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN
      ) {
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");

        // Set canvas dimensions to match video
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw current video frame to canvas
        context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob and send via WebSocket
        canvas.toBlob(
          (blob) => {
            if (
              blob &&
              wsRef.current &&
              wsRef.current.readyState === WebSocket.OPEN
            ) {
              wsRef.current.send(blob);
            }
          },
          "image/jpeg",
          0.7
        ); // Adjust quality for performance
      }
    }, 300); // Send 10 frames per second
  };

  const stopSendingFrames = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  const startCamera = async () => {
    console.log("Attempting to start camera...");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices API not supported");
      }

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true, // Simplified video constraints
        audio: false,
      });

      console.log("Camera access granted, setting up video element...");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, playing...");
          videoRef.current
            ?.play()
            .catch((e) => console.error("Error playing video:", e));
        };
        streamRef.current = stream;
        setIsStreaming(true);
        setError(null);
        console.log("Camera setup complete");

        // Connect to WebSocket when camera starts
        connectWebSocket();
        startSendingFrames();
      } else {
        console.error("Video element reference not found");
        throw new Error("Video element not initialized");
      }
    } catch (error) {
      console.error("Detailed camera error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to access camera"
      );
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    disconnectWebSocket();
    stopSendingFrames();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Track stopped:", track.label);
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
      setIsStreaming(false);
      console.log("Camera stopped successfully");
    }
  };

  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      console.log("Key pressed:", event.key);
      if (event.key.toLowerCase() === "c") {
        console.log("C key detected, current streaming state:", isStreaming);
        if (!isStreaming) {
          await startCamera();
        } else {
          stopCamera();
        }
      } else if (event.key === "Escape") {
        console.log("Escape key detected, streaming state:", isStreaming);
        if (isStreaming) {
          console.log("Stopping camera due to Escape key");
          stopCamera();
        }
      }
    };

    console.log("Adding keydown event listener");
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      console.log("Component unmounting, cleaning up...");
      window.removeEventListener("keydown", handleKeyPress);
      stopSendingFrames();
      disconnectWebSocket();
      if (isStreaming) {
        stopCamera();
      }
    };
  }, [isStreaming]); // Add isStreaming to dependencies to ensure we have the current state

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: isStreaming ? "block" : "none" }}
        className="w-full h-full object-cover"
      />

      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="flex flex-col items-center space-y-2">
              <p className="text-gray-600">Press C to start camera</p>
              <p className="text-sm text-gray-400">Camera is inactive</p>
            </div>
          </div>
        </div>
      )}

      {isStreaming && (
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-xs">Live</span>
          </div>

          {isConnected && (
            <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs">Connected to WS</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-500/90 text-white p-2 rounded text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
