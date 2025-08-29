"use client";

import { useRef, useEffect, useState } from "react";
import axios from "axios";

export default function PlantScanner({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [prediction, setPrediction] = useState<{
    predicted_class: string;
    confidence: number;
  } | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    async function enableCamera() {
      try {
        const constraints = {
          video: { facingMode: "environment" }, // back camera
          audio: false
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // iOS requirement
          await videoRef.current.play(); // ensures video starts
        }

        setIsReady(true);

        // Start live recognition every 2 seconds
        intervalRef.current = window.setInterval(liveRecognition, 2000);
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Camera access denied or unavailable. Please allow camera permissions.");
      }
    }

    enableCamera();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL("image/png");

    try {
      const res = await axios.post("http://localhost:5000/scan", { file: imageData });
      console.log("Captured & Saved Result:", res.data);
      setPrediction({
        predicted_class: res.data.predicted_class,
        confidence: res.data.confidence,
      });
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const liveRecognition = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );
    if (!blob) return;

    const formData = new FormData();
    formData.append("file", blob, "live_scan.jpg");

    try {
      const res = await axios.post("http://localhost:5000/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrediction({
        predicted_class: res.data.predicted_class,
        confidence: res.data.confidence,
      });
    } catch (err) {
      console.error("Live recognition failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-md">
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />

        {prediction && (
          <div className="mt-4 p-2 bg-gray-100 rounded-lg">
            <p>
              <strong>Class:</strong> {prediction.predicted_class}
            </p>
            <p>
              <strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(2)}%
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={captureImage}
            disabled={!isReady}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  );
}
