// src/components/CameraCaptureModal.jsx

import { useEffect, useRef, useState } from "react";

function formatarErroGeo(error) {
  if (!error) return "Não foi possível obter sua localização.";

  switch (error.code) {
    case 1:
      return "Permissão de localização negada.";
    case 2:
      return "Sua localização não pôde ser determinada.";
    case 3:
      return "Tempo esgotado ao tentar obter sua localização.";
    default:
      return "Não foi possível obter sua localização.";
  }
}

export default function CameraCaptureModal({
  open,
  onClose,
  onCapture,
  showToast,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!open) {
      stopStream();
      setDevices([]);
      setDeviceId("");
      return;
    }

    init();
    return () => stopStream();
  }, [open]);

  async function init() {
    try {
      setLoadingCamera(true);

      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      tempStream.getTracks().forEach((t) => t.stop());

      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all.filter((d) => d.kind === "videoinput");
      setDevices(cams);

      const iriun = cams.find((d) =>
        (d.label || "").toLowerCase().includes("iriun")
      );

      const defaultId = iriun?.deviceId || cams[0]?.deviceId || "";
      setDeviceId(defaultId);

      if (defaultId) {
        await abrirCamera(defaultId);
      }
    } catch (err) {
      console.error(err);
      showToast?.("error", "Não foi possível acessar a câmera.");
    } finally {
      setLoadingCamera(false);
    }
  }

  async function abrirCamera(selectedDeviceId) {
    try {
      stopStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedDeviceId
          ? {
              deviceId: { exact: selectedDeviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      showToast?.("error", "Não foi possível abrir a câmera selecionada.");
    }
  }

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function obterGeolocalizacao() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não suportada neste navegador."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => reject(err),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  async function handleTrocarCamera(e) {
    const nextId = e.target.value;
    setDeviceId(nextId);
    await abrirCamera(nextId);
  }

  async function handleCapturar() {
    try {
      if (!videoRef.current?.videoWidth || !videoRef.current?.videoHeight) {
        showToast?.("error", "A câmera ainda não está pronta para captura.");
        return;
      }

      setCapturing(true);

      const geo = await obterGeolocalizacao();

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) {
        showToast?.("error", "Não foi possível gerar a foto capturada.");
        return;
      }

      const now = new Date();
      const file = new File([blob], `captura-${Date.now()}.jpg`, {
        type: "image/jpeg",
        lastModified: now.getTime(),
      });

      onCapture?.({
        file,
        meta: {
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          lat: geo.lat,
          lng: geo.lng,
          takenAt: now,
          source: "browser_capture",
          accuracy: geo.accuracy,
        },
      });

      stopStream();
    } catch (err) {
      console.error(err);

      if (err?.code) {
        showToast?.("error", formatarErroGeo(err));
      } else {
        showToast?.("error", "Não foi possível capturar a foto.");
      }
    } finally {
      setCapturing(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Captura pela câmera"
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">
              Capturar pela câmera
            </h2>
            <p className="text-sm text-white/70">
              Modo demo desktop: a foto é capturada ao vivo e a localização é
              obtida no momento do registro.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/90 hover:bg-white/10 transition"
          >
            Fechar
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={deviceId}
            onChange={handleTrocarCamera}
            className="px-3 py-2 rounded-lg border border-white/10 bg-slate-900 text-white text-sm"
          >
            {devices.map((d, idx) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Câmera ${idx + 1}`}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => abrirCamera(deviceId)}
            className="px-3 py-2 rounded-lg border border-white/10 text-sm text-white/90 hover:bg-white/10 transition"
          >
            Reabrir câmera
          </button>

          <button
            type="button"
            onClick={handleCapturar}
            disabled={capturing || loadingCamera}
            className="px-4 py-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 text-sm hover:bg-emerald-500/20 transition disabled:opacity-50"
          >
            {capturing ? "Capturando..." : "Tirar foto"}
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10 bg-black min-h-[240px] flex items-center justify-center">
          {loadingCamera ? (
            <p className="text-sm text-white/70">Abrindo câmera...</p>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}