import React, { useEffect, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function App() {
  const [textInput, setTextInput] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [videoPath, setVideoPath] = useState("");
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [detectedSignText, setDetectedSignText] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [notice, setNotice] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const noticeTimeoutRef = useRef(null);

  const addHistory = (type, content, status = "sent") => {
    setHistory((prev) =>
      [{ type, content, status, timestamp: new Date() }, ...prev].slice(0, 5)
    );
  };

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  const showNotice = (message) => {
    setNotice(message);
    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = setTimeout(() => {
      setNotice("");
      noticeTimeoutRef.current = null;
    }, 3000);
  };

  const speak = (spokenText) => {
    if (!spokenText || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spokenText);
    window.speechSynthesis.speak(utterance);
  };

  const sendTextToServer = async () => {
    const phrase = textInput.trim() || recognizedText.trim();
    if (!phrase) return;

    setIsTextLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: phrase.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to process phrase.");
      }

      setConfidence(
        typeof data.confidence === "number" ? data.confidence : null
      );
      setTextResponse(
        data.bestMatch
          ? `Best match: ${data.bestMatch}`
          : "No text match found."
      );

      addHistory("Text", phrase);

      if (data.videoPath) {
        setVideoPath(`${API_BASE_URL}${data.videoPath}`);
      } else {
        setVideoPath("");
        showNotice("Sorry, we are unable to convert");
      }
    } catch (error) {
      alert(error.message || "Unable to process text input.");
    } finally {
      setIsTextLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript.toLowerCase();
      setRecognizedText(speechText);
      setTextInput(speechText);
      addHistory("Speech", speechText, "captured");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera not supported.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsCameraOn(true);
      setUploadedVideoUrl("");
    } catch {
      alert("Camera access denied.");
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const camera = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(camera, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg");
  };

  const sendVideoToServer = async () => {
    const image = captureFrame();
    if (!image) return;

    setIsVideoLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to analyze sign.");
      }

      const text = data.detectedText || "";
      setDetectedSignText(text);
      setTextResponse(`Detected from video: ${text}`);
      setTextInput(text);
      speak(text);
      addHistory("Video", text);
    } catch (error) {
      alert(error.message || "Video analysis failed.");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-violet-50 to-cyan-100 text-slate-800">
      {notice && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 shadow-lg">
          {notice}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-5">
        <header className="text-center mb-5 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Media Analysis Hub
          </h1>
          <p className="text-violet-700 text-sm md:text-base mt-1">
            Analyze speech, text, and video content
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-3 md:mb-6">
          {/* TEXT CONTAINER */}
          <section className="rounded-xl md:rounded-2xl bg-white/70 backdrop-blur-xl p-3 md:p-6 shadow-xl border border-white/40">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-indigo-700">
              Speech / Text
            </h2>

            <div className="rounded-xl bg-indigo-100/60 border border-indigo-200 h-28 md:h-40 p-3 md:p-4 text-indigo-800 italic text-sm md:text-base mb-3 md:mb-4">
              {textResponse || "Responses will appear here..."}
            </div>

            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendTextToServer()}
              placeholder="Type your message or use voice input..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 md:px-4 py-2 md:py-3 text-sm md:text-base mb-3 md:mb-4 focus:ring-2 focus:ring-indigo-400"
            />

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <button
                onClick={startVoiceInput}
                className="rounded-xl bg-gradient-to-r from-green-600 to-lime-400 hover:from-green-600 hover:to-lime-500 hover:bg-green-500 hover:bg-green-400 text-white py-2 md:py-3 text-sm md:text-base font-semibold border border-green-200"
              >
                {isListening ? "Listening..." : "Record"}
              </button>

              <button
                onClick={sendTextToServer}
                disabled={isTextLoading}
                className="rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white py-2 md:py-3 text-sm md:text-base font-semibold shadow-md"
              >
                {isTextLoading ? "Sending..." : "Send Text"}
              </button>
            </div>

            <div className="mt-3 md:mt-4 text-xs md:text-sm space-y-1">
              <p>Recognized: {recognizedText || "--"}</p>
              <p>
                Confidence: {confidence !== null ? `${confidence}%` : "--"}
              </p>
              <p>Detected from video: {detectedSignText || "--"}</p>
            </div>
          </section>

          {/* VIDEO CONTAINER */}
          <section className="rounded-xl md:rounded-2xl bg-white/70 backdrop-blur-xl p-3 md:p-6 shadow-xl border border-white/40">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-emerald-600">
              Video
            </h2>

            <div className="rounded-xl bg-slate-100 border border-slate-300 h-36 md:h-48 mb-3 md:mb-4 overflow-hidden flex items-center justify-center">
              {videoPath ? (
                <video src={videoPath} controls autoPlay className="w-full h-full object-cover" />
              ) : isCameraOn ? (
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
              ) : (
                <p className="text-slate-400">No video input</p>
              )}
            </div>

            <button
              onClick={startCamera}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 text-white py-2 md:py-3 text-sm md:text-base font-semibold border border-emerald-200 mb-2 md:mb-3"
            >
              Start Camera
            </button>

            <button
              onClick={sendVideoToServer}
              disabled={isVideoLoading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 text-white py-2 md:py-3 text-sm md:text-base font-semibold shadow-md"
            >
              {isVideoLoading ? "Sending..." : "Send Video"}
            </button>

            <canvas ref={canvasRef} className="hidden" />
          </section>
        </div>

        {/* HISTORY */}
        <section className="rounded-xl md:rounded-2xl bg-white/70 backdrop-blur-xl p-3 md:p-6 shadow-xl border border-white/40">
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-amber-600">
            Recent History
          </h3>

          {history.length === 0 ? (
            <p className="text-slate-500">No recent conversations</p>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white border border-slate-200 shadow-sm p-2 md:p-3 flex justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{item.content}</p>
                    <p className="text-xs text-slate-500">
                      {item.type} • {formatTimeAgo(item.timestamp)}
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
