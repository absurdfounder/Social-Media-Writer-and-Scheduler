import { useState, useRef, useEffect } from "react";

export default function AudioTranscriber() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [captions, setCaptions] = useState([]);
  const [currentCaption, setCurrentCaption] = useState("");
  const [youtubeUrls, setYoutubeUrls] = useState(() => {
    return JSON.parse(localStorage.getItem("youtubeUrls")) || [];
  });
  const audioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("youtubeUrls", JSON.stringify(youtubeUrls));
  }, [youtubeUrls]);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setAudioUrl(URL.createObjectURL(uploadedFile));
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload an audio file.");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading file:", file.name);
      const response = await fetch("https://speech-to-text-ai.p.rapidapi.com/transcribe", {
        method: "POST",
        headers: {
          "x-rapidapi-key": "5494d46bb3msh9f3edd0ad229c73p1722d8jsn85dcaa55ae02",
          "x-rapidapi-host": "speech-to-text-ai.p.rapidapi.com"
        },
        body: formData
      });

      const result = await response.json();
      console.log("API Response:", result);
      setTranscript(result.text || "Error transcribing audio");
      setCaptions(result.chunks || []);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setTranscript("Failed to transcribe audio.");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    const currentTime = audioRef.current.currentTime;
    const currentChunk = captions.find(chunk => 
      currentTime >= chunk.offset && currentTime <= chunk.offset + chunk.duration
    );
    if (currentChunk) {
      setCurrentCaption(currentChunk.text);
    }
  };

  const handleYoutubeUrlAdd = async () => {
    const url = prompt("Enter YouTube URL:");
    if (!url) return;
    setYoutubeUrls([...youtubeUrls, { url, summary: "Fetching summary..." }]);

    try {
      const response = await fetch(`https://speech-to-text-ai.p.rapidapi.com/transcribe?url=${encodeURIComponent(url)}`);
      const result = await response.json();
      setYoutubeUrls(prevUrls => prevUrls.map(item => 
        item.url === url ? { ...item, summary: result.text || "Error fetching summary" } : item
      ));
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      "YouTube URL,Summary",
      ...youtubeUrls.map(item => `${item.url.replace(/,/g, '')},${item.summary.replace(/,/g, '')}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "youtube_summaries.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Speech-to-Text AI</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} className="w-full border p-2 rounded" />
      <button className="mt-2 w-full bg-green-500 text-white p-2 rounded" onClick={handleUpload} disabled={loading}>
        {loading ? "Transcribing..." : "Upload & Transcribe"}
      </button>
      <button className="mt-2 w-full bg-green-500 text-white p-2 rounded" onClick={handleYoutubeUrlAdd}>Add YouTube URL</button>
      <button className="mt-2 w-full bg-gray-500 text-white p-2 rounded" onClick={downloadCSV}>Download CSV</button>
      {audioUrl && (
        <div className="mt-4">
          <audio ref={audioRef} controls className="w-full" onTimeUpdate={handleTimeUpdate}>
            <source src={audioUrl} type={file?.type} />
            Your browser does not support the audio element.
          </audio>
          <div className="mt-2 p-2 bg-gray-200 rounded text-center font-semibold">
            {currentCaption || "Playing..."}
          </div>
        </div>
      )}
      <div className="mt-4 border p-4 rounded">
        <h2 className="text-lg font-semibold">Full Transcript:</h2>
        <p className="mt-2 whitespace-pre-wrap">{transcript || "No transcript available."}</p>
      </div>
      <div className="mt-4 border p-4 rounded">
        <h2 className="text-lg font-semibold">YouTube Summaries</h2>
        <table className="w-full mt-2 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">YouTube URL</th>
              <th className="border p-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {youtubeUrls.map((item, index) => (
              <tr key={index} className="border">
                <td className="border p-2"><a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a></td>
                <td className="border p-2">{item.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
