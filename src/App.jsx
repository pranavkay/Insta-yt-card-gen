import { useState, useRef, useEffect, useCallback } from 'react';
import './index.css';

const FONTS = [
  { id: 'jersey', name: 'Jersey 15', family: "'Jersey 15', sans-serif" },
  { id: 'vt323', name: 'VT323', family: "'VT323', monospace" },
  { id: 'oswald', name: 'Oswald', family: "'Oswald', sans-serif" },
  { id: 'bebas', name: 'Bebas Neue', family: "'Bebas Neue', sans-serif" },
];

const COLORS = [
  { id: 'lavender', value: '#b482c1' },
  { id: 'azure', value: '#70d0fb' },
  { id: 'green', value: '#83bf5f' },
  { id: 'magenta', value: '#f0a2d1' },
  { id: 'orange', value: '#e18f3d' },
  { id: 'cyan', value: '#29a9b2' },
  { id: 'white', value: '#ffffff' },
  { id: 'black', value: '#000000' },
];

const SPEED_OPTIONS = [
  { id: 0.25, label: '0.25x' },
  { id: 0.5, label: '0.5x' },
  { id: 1, label: '1x' },
  { id: 1.5, label: '1.5x' },
  { id: 2, label: '2x' },
];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9', value: '16 / 9' },
  { id: '9:16', label: '9:16', value: '9 / 16' },
  { id: '4:5', label: '4:5', value: '4 / 5' },
];

const POSITION_OPTIONS = [
  { id: 'top', icon: '↑', label: 'Top' },
  { id: 'center', icon: '↕', label: 'Center' },
  { id: 'bottom', icon: '↓', label: 'Bottom' },
];

const ALIGN_OPTIONS = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
  { id: 'justify', label: 'Justify' },
];

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url) {
  if (!url) return null;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  return null;
}

function App() {
  // Video state
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoScale, setVideoScale] = useState(100);
  const [blurAmount, setBlurAmount] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[2]); // Default 4:5
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Text state
  const [text, setText] = useState('Your text here');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[1]);
  const [fontSize, setFontSize] = useState(32);
  const [textPosition, setTextPosition] = useState('center');
  const [textAlign, setTextAlign] = useState('center');

  // Text background state
  const [showTextBg, setShowTextBg] = useState(false);
  const [textBgColor, setTextBgColor] = useState(COLORS[0]);
  const [textBgOpacity, setTextBgOpacity] = useState(50);

  // YouTube Player ref and state
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);

  const videoId = getYouTubeVideoId(videoUrl);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube player when videoId changes
  useEffect(() => {
    if (!videoId) {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        setPlayerReady(false);
      }
      return;
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: videoId,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            setPlayerReady(true);
            event.target.setPlaybackRate(playbackSpeed);
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            // Loop the video when it ends
            if (event.data === window.YT.PlayerState.ENDED) {
              event.target.playVideo();
            }
          },
        },
      });
    };

    // Wait for YT API to be ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoId]);

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    if (playerRef.current && playerReady) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, playerReady]);

  // Handle mute/unmute
  const toggleMute = useCallback(() => {
    if (playerRef.current && playerReady) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
    }
    setIsMuted(!isMuted);
  }, [isMuted, playerReady]);

  // Handle speed change
  const handleSpeedChange = useCallback((speed) => {
    setPlaybackSpeed(speed);
    if (playerRef.current && playerReady) {
      playerRef.current.setPlaybackRate(speed);
    }
  }, [playerReady]);

  // Convert hex to rgba
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  return (
    <div className={`app-layout ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Settings Panel */}
      <aside className="settings-panel">
        <h1>✨ Speedrun Content Tool</h1>

        {/* Aspect Ratio */}
        <div className="settings-section">
          <label>Aspect Ratio</label>
          <div className="inline-controls">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                className={`inline-btn ${aspectRatio.id === ratio.id ? 'selected' : ''}`}
                onClick={() => setAspectRatio(ratio)}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video URL Section */}
        <div className="settings-section">
          <label>YouTube Background</label>
          <input
            type="text"
            className="settings-input"
            placeholder="Paste YouTube URL..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <div className="player-controls">
            <button
              className={`control-btn ${isPlaying ? 'active' : ''}`}
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              className={`control-btn ${isMuted ? '' : 'active'}`}
              onClick={toggleMute}
            >
              {isMuted ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
              )}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>

        {/* Video Controls */}
        <div className="settings-section">
          <label>Video Settings</label>
          <div className="slider-row">
            <label>Scale</label>
            <input
              type="range"
              min="100"
              max="200"
              value={videoScale}
              onChange={(e) => setVideoScale(Number(e.target.value))}
            />
            <span className="value">{videoScale}%</span>
          </div>
          <div className="slider-row">
            <label>Blur</label>
            <input
              type="range"
              min="0"
              max="20"
              value={blurAmount}
              onChange={(e) => setBlurAmount(Number(e.target.value))}
            />
            <span className="value">{blurAmount}px</span>
          </div>
          <div>
            <label style={{ marginBottom: '8px', display: 'block' }}>Speed</label>
            <div className="inline-controls">
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed.id}
                  className={`inline-btn ${playbackSpeed === speed.id ? 'selected' : ''}`}
                  onClick={() => handleSpeedChange(speed.id)}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Text Section */}
        <div className="settings-section">
          <label>Content</label>
          <textarea
            className="settings-input"
            placeholder="Enter your post text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Font Section */}
        <div className="settings-section">
          <label>Font</label>
          <div className="font-grid">
            {FONTS.map((font) => (
              <button
                key={font.id}
                className={`font-btn ${selectedFont.id === font.id ? 'selected' : ''}`}
                data-font={font.id}
                onClick={() => setSelectedFont(font)}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>

        {/* Text Styling */}
        <div className="settings-section">
          <label>Text Style</label>
          <div className="slider-row">
            <label>Size</label>
            <input
              type="range"
              min="16"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
            <span className="value">{fontSize}px</span>
          </div>
          <div className="color-grid">
            {COLORS.map((color) => (
              <button
                key={color.id}
                className={`color-swatch ${selectedColor.id === color.id ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => setSelectedColor(color)}
                title={color.id}
              />
            ))}
          </div>
        </div>

        {/* Text Position & Alignment */}
        <div className="settings-section">
          <label>Position</label>
          <div className="inline-controls">
            {POSITION_OPTIONS.map((pos) => (
              <button
                key={pos.id}
                className={`inline-btn ${textPosition === pos.id ? 'selected' : ''}`}
                onClick={() => setTextPosition(pos.id)}
              >
                {pos.icon} {pos.label}
              </button>
            ))}
          </div>
          <label style={{ marginTop: '8px' }}>Alignment</label>
          <div className="inline-controls">
            {ALIGN_OPTIONS.map((align) => (
              <button
                key={align.id}
                className={`inline-btn ${textAlign === align.id ? 'selected' : ''}`}
                onClick={() => setTextAlign(align.id)}
              >
                {align.label}
              </button>
            ))}
          </div>
        </div>

        <div className="section-divider" />

        {/* Text Background */}
        <div className="settings-section">
          <button
            className={`toggle-btn ${showTextBg ? 'active' : ''}`}
            onClick={() => setShowTextBg(!showTextBg)}
          >
            <span>Text Background</span>
            <div className="toggle-indicator" />
          </button>
          {showTextBg && (
            <>
              <div className="slider-row">
                <label>Opacity</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={textBgOpacity}
                  onChange={(e) => setTextBgOpacity(Number(e.target.value))}
                />
                <span className="value">{textBgOpacity}%</span>
              </div>
              <div className="color-grid">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    className={`color-swatch ${textBgColor.id === color.id ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setTextBgColor(color)}
                    title={color.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Preview Area */}
      <main className="preview-area">
        <button
          className="fullscreen-btn"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
          )}
        </button>
        <div
          className="preview-canvas"
          style={{ aspectRatio: aspectRatio.value }}
          data-ratio={aspectRatio.id}
        >
          {/* Video Background */}
          {videoId ? (
            <div className="video-bg">
              <div
                className="video-scale-wrapper"
                style={{
                  transform: `translate(-50%, -50%) scale(${videoScale / 100})`,
                }}
              >
                <div id="youtube-player" />
              </div>
              {blurAmount > 0 && (
                <div
                  className="video-blur-layer"
                  style={{ '--blur-amount': `${blurAmount}px` }}
                />
              )}
            </div>
          ) : (
            <div className="no-video">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5-6l-7 4V7l7 4z" />
              </svg>
              <span>Paste a YouTube URL to begin</span>
            </div>
          )}

          {/* Overlay with Text */}
          <div className={`overlay position-${textPosition}`}>
            <div
              className="text-card"
              style={{
                backgroundColor: showTextBg ? hexToRgba(textBgColor.value, textBgOpacity) : 'transparent',
              }}
            >
              <p
                className={`overlay-text align-${textAlign}`}
                style={{
                  fontFamily: selectedFont.family,
                  color: selectedColor.value,
                  fontSize: `${fontSize}px`,
                }}
              >
                {text}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
