import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import {
  BadgeCheck,
  Check,
  Clipboard,
  Code2,
  Copy,
  CalendarDays,
  Download,
  FileImage,
  Image as ImageIcon,
  LocateFixed,
  MapPin,
  MessageSquareText,
  Moon,
  Palette,
  Quote,
  Shapes,
  Sparkles,
  Sun,
  Type,
  Upload
} from 'lucide-react';
import { usePreviewScale } from './hooks/usePreviewScale.js';
import {
  formatGpsCoordinates,
  getTodayDateValue,
  initials,
  nextInList,
  nextNumberPreset
} from './lib/formatters.js';
import { buildWatermarkItems } from './lib/watermark.js';
import { exportCaptureImage, getCurrentCoordinates, readImageFile } from './platform/browser.js';
import {
  ASPECTS,
  AUTO_SHELL_HEIGHT,
  BACKGROUNDS,
  BORDER_WIDTH_PRESETS,
  DEFAULT_PADDING,
  DEFAULT_RADIUS,
  INITIAL_CODE,
  INITIAL_CODE_TITLE,
  INITIAL_IMAGE_CAPTION,
  INITIAL_POST,
  INITIAL_TEXT,
  SCENES,
  SHADOWS,
  THEME_OPTIONS
} from './presets.js';
import './styles.css';

const MODES = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'post', label: 'Post', icon: MessageSquareText },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'image', label: 'Image', icon: ImageIcon }
];

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  glass: Sparkles
};

const WATERMARK_ICONS = {
  text: Sparkles,
  location: MapPin,
  date: CalendarDays
};

marked.use({
  breaks: true,
  gfm: true
});

function App() {
  const captureRef = useRef(null);
  const stageRef = useRef(null);
  const [mode, setMode] = useState('text');
  const [markdown, setMarkdown] = useState(INITIAL_TEXT);
  const [post, setPost] = useState(INITIAL_POST);
  const [code, setCode] = useState(INITIAL_CODE);
  const [codeTitle, setCodeTitle] = useState(INITIAL_CODE_TITLE);
  const [imageSrc, setImageSrc] = useState('');
  const [imageCaption, setImageCaption] = useState(INITIAL_IMAGE_CAPTION);
  const [background, setBackground] = useState(BACKGROUNDS[0].value);
  const [scene, setScene] = useState('none');
  const [shadow, setShadow] = useState(SHADOWS[0].value);
  const [theme, setTheme] = useState('light');
  const [aspect, setAspect] = useState('auto');
  const [padding, setPadding] = useState(DEFAULT_PADDING);
  const [paddingX, setPaddingX] = useState(DEFAULT_PADDING);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [border, setBorder] = useState(true);
  const [borderWidth, setBorderWidth] = useState(1);
  const [quoteMarks, setQuoteMarks] = useState(false);
  const [watermarkTextEnabled, setWatermarkTextEnabled] = useState(true);
  const [watermarkText, setWatermarkText] = useState('Share Card');
  const [watermarkLocationEnabled, setWatermarkLocationEnabled] = useState(false);
  const [watermarkLocationText, setWatermarkLocationText] = useState('');
  const [watermarkDateEnabled, setWatermarkDateEnabled] = useState(false);
  const [watermarkDateText, setWatermarkDateText] = useState(getTodayDateValue);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);

  const dims = ASPECTS[aspect];
  const shellHeight = dims.height || AUTO_SHELL_HEIGHT;
  const previewScale = usePreviewScale(stageRef, { width: dims.width, shellHeight });
  const cleanHtml = useMemo(() => DOMPurify.sanitize(marked.parse(markdown)), [markdown]);
  const watermarkItems = useMemo(
    () => buildWatermarkItems({
      watermarkTextEnabled,
      watermarkText,
      watermarkLocationEnabled,
      watermarkLocationText,
      watermarkDateEnabled,
      watermarkDateText
    }),
    [
      watermarkTextEnabled,
      watermarkText,
      watermarkLocationEnabled,
      watermarkLocationText,
      watermarkDateEnabled,
      watermarkDateText
    ]
  );
  const noPad = padding === 0 && paddingX === 0;

  useEffect(() => {
    if (noPad && radius !== 0) {
      setRadius(0);
    }
  }, [noPad, radius]);

  const applyNoPad = (checked) => {
    setPadding(checked ? 0 : DEFAULT_PADDING);
    setPaddingX(checked ? 0 : DEFAULT_PADDING);
    setRadius(checked ? 0 : DEFAULT_RADIUS);
    if (checked) {
      setAspect('auto');
    }
  };

  const applyGpsLocation = () => {
    setGpsBusy(true);
    setToast('正在获取 GPS 定位...');
    getCurrentCoordinates()
      .then((coords) => {
        setWatermarkLocationText(formatGpsCoordinates(coords.latitude, coords.longitude));
        setWatermarkLocationEnabled(true);
        setToast('已引用 GPS 定位');
        window.setTimeout(() => setToast(''), 2200);
      })
      .catch((error) => {
        const message = error.message === 'geolocation-unavailable'
          ? '当前浏览器不支持 GPS 定位'
          : '定位失败：请允许浏览器访问位置';
        setToast(message);
        window.setTimeout(() => setToast(''), 2600);
      })
      .finally(() => setGpsBusy(false));
  };

  async function exportPng(action) {
    if (!captureRef.current || busy) return;
    setBusy(true);
    setToast(action === 'copy' ? '正在复制 PNG...' : '正在生成 PNG...');

    try {
      const result = await exportCaptureImage(captureRef.current, action);
      setToast(getExportToast(result));
    } catch (error) {
      console.error(error);
      setToast('导出失败：请检查图片来源或浏览器权限');
    } finally {
      setBusy(false);
      window.setTimeout(() => setToast(''), 2200);
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setImageSrc(await readImageFile(file));
    } catch (error) {
      console.error(error);
      setToast('图片读取失败');
      window.setTimeout(() => setToast(''), 2200);
    }
  }

  return (
    <main className="app-shell">
      <aside className="editor-panel">
        <div className="brand-row">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>
          <div>
            <h1>截图生成器</h1>
            <p>文字、帖子和代码转分享图</p>
          </div>
        </div>

        <Segmented
          items={MODES}
          value={mode}
          onChange={setMode}
        />

        <EditorBody
          mode={mode}
          markdown={markdown}
          setMarkdown={setMarkdown}
          post={post}
          setPost={setPost}
          code={code}
          setCode={setCode}
          codeTitle={codeTitle}
          setCodeTitle={setCodeTitle}
          imageSrc={imageSrc}
          imageCaption={imageCaption}
          setImageCaption={setImageCaption}
          onImageUpload={handleImageUpload}
        />
      </aside>

      <section className="preview-panel">
        <div className="preview-toolbar">
          <div>
            <span className="toolbar-kicker">Preview</span>
            <strong>{ASPECTS[aspect].label}</strong>
          </div>
        </div>

        <div className="preview-stage" ref={stageRef}>
          <div
            className="preview-scale-shell"
            style={{
              width: `${dims.width * previewScale}px`,
              height: `${shellHeight * previewScale}px`
            }}
          >
            <div
              className="preview-scale"
              style={{
                width: `${dims.width}px`,
                transform: `scale(${previewScale})`
              }}
            >
              <div
                ref={captureRef}
                className="export-surface"
                style={{
                  width: `${dims.width}px`,
                  minHeight: dims.height ? `${dims.height}px` : 'auto',
                  height: dims.height ? `${dims.height}px` : 'auto',
                  backgroundImage: background
                }}
              >
                <div
                  className={`surface-inner ${paddingX === 0 ? 'no-horizontal-pad' : ''}`}
                  style={{ padding: `${padding}px ${paddingX}px` }}
                >
                  <SceneLayer scene={scene} />
                  <ShotCard
                    mode={mode}
                    cleanHtml={cleanHtml}
                    post={post}
                    code={code}
                    codeTitle={codeTitle}
                    imageSrc={imageSrc}
                    imageCaption={imageCaption}
                    theme={theme}
                    shadow={shadow}
                    radius={radius}
                    border={border}
                    borderWidth={borderWidth}
                    quoteMarks={quoteMarks}
                  />
                  <Watermark items={watermarkItems} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BottomDock
        mode={mode}
        background={background}
        setBackground={setBackground}
        scene={scene}
        setScene={setScene}
        shadow={shadow}
        setShadow={setShadow}
        aspect={aspect}
        setAspect={setAspect}
        theme={theme}
        setTheme={setTheme}
        border={border}
        setBorder={(checked) => {
          setBorder(checked);
          if (checked && borderWidth === 0) setBorderWidth(1);
          if (!checked) setBorderWidth(0);
        }}
        borderWidth={borderWidth}
        setBorderWidth={(value) => {
          setBorderWidth(value);
          setBorder(value > 0);
        }}
        padding={padding}
        setPadding={setPadding}
        paddingX={paddingX}
        setPaddingX={setPaddingX}
        setRadius={setRadius}
        applyNoPad={applyNoPad}
        quoteMarks={quoteMarks}
        setQuoteMarks={setQuoteMarks}
        onCopy={() => exportPng('copy')}
        onDownload={() => exportPng('download')}
        busy={busy}
      />

      <aside className="controls-panel">
        <PanelTitle icon={Palette} title="Style" />
        <ControlGroup label="Background">
          <div className="swatch-grid">
            {BACKGROUNDS.map((item) => (
              <button
                key={item.name}
                className={`swatch ${item.value === background ? 'selected' : ''}`}
                style={{ backgroundImage: item.value }}
                onClick={() => setBackground(item.value)}
                aria-label={item.name}
              >
                {item.value === background && <Check size={16} />}
              </button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup label="Scene">
          <div className="chip-row">
            {SCENES.map((item) => (
              <button
                key={item.id}
                className={`chip ${scene === item.id ? 'selected' : ''}`}
                onClick={() => setScene(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup label="Shadow">
          <div className="chip-row">
            {SHADOWS.map((item) => (
              <button
                key={item.name}
                className={`chip ${shadow === item.value ? 'selected' : ''}`}
                onClick={() => setShadow(item.value)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup label="Theme">
          <div className="chip-row">
            <button className={`chip icon-chip ${theme === 'light' ? 'selected' : ''}`} onClick={() => setTheme('light')}>
              <Sun size={15} />
              Light
            </button>
            <button className={`chip icon-chip ${theme === 'dark' ? 'selected' : ''}`} onClick={() => setTheme('dark')}>
              <Moon size={15} />
              Dark
            </button>
            <button className={`chip icon-chip ${theme === 'glass' ? 'selected' : ''}`} onClick={() => setTheme('glass')}>
              <Sparkles size={15} />
              Glass
            </button>
          </div>
        </ControlGroup>

        <ControlGroup label="Border">
          <Slider
            label="Width"
            min="0"
            max="16"
            value={border ? borderWidth : 0}
            onChange={(value) => {
              setBorderWidth(value);
              setBorder(value > 0);
            }}
          />
          <Toggle
            label="Border"
            checked={border}
            onChange={(checked) => {
              setBorder(checked);
              setBorderWidth(checked ? Math.max(borderWidth, 1) : 0);
            }}
          />
        </ControlGroup>

        <ControlGroup label="Aspect">
          <div className="chip-row">
            {Object.entries(ASPECTS).map(([key, item]) => (
              <button
                key={key}
                className={`chip ${aspect === key ? 'selected' : ''}`}
                onClick={() => setAspect(key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup label="Controls">
          <Slider label="Padding X" min="0" max="180" value={paddingX} onChange={setPaddingX} />
          <Slider label="Padding Y" min="0" max="140" value={padding} onChange={setPadding} />
          <Slider label="Radius" min="0" max="52" value={radius} onChange={setRadius} disabled={noPad} />
          <div className="toggle-list compact">
            <Toggle
              label="No pad"
              checked={noPad}
              onChange={applyNoPad}
            />
            <Toggle label="Quote marks" checked={quoteMarks} onChange={setQuoteMarks} />
          </div>
        </ControlGroup>

        <ControlGroup label="Watermark">
          <WatermarkControls
            watermarkTextEnabled={watermarkTextEnabled}
            setWatermarkTextEnabled={setWatermarkTextEnabled}
            watermarkText={watermarkText}
            setWatermarkText={setWatermarkText}
            watermarkLocationEnabled={watermarkLocationEnabled}
            setWatermarkLocationEnabled={setWatermarkLocationEnabled}
            watermarkLocationText={watermarkLocationText}
            setWatermarkLocationText={setWatermarkLocationText}
            watermarkDateEnabled={watermarkDateEnabled}
            setWatermarkDateEnabled={setWatermarkDateEnabled}
            watermarkDateText={watermarkDateText}
            setWatermarkDateText={setWatermarkDateText}
            onUseGpsLocation={applyGpsLocation}
            gpsBusy={gpsBusy}
          />
        </ControlGroup>
      </aside>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function Segmented({ items, value, onChange }) {
  return (
    <div className="segmented" role="tablist" aria-label="Capture mode">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={value === item.id ? 'active' : ''}
            onClick={() => onChange(item.id)}
            role="tab"
            aria-selected={value === item.id}
          >
            <Icon size={16} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function EditorBody(props) {
  const {
    mode,
    markdown,
    setMarkdown,
    post,
    setPost,
    code,
    setCode,
    codeTitle,
    setCodeTitle,
    imageCaption,
    setImageCaption,
    onImageUpload
  } = props;

  if (mode === 'post') {
    return (
      <div className="form-stack">
        <Label text="Author">
          <input value={post.author} onChange={(event) => setPost({ ...post, author: event.target.value })} />
        </Label>
        <Label text="Handle">
          <input value={post.handle} onChange={(event) => setPost({ ...post, handle: event.target.value })} />
        </Label>
        <Label text="Post text">
          <textarea value={post.content} onChange={(event) => setPost({ ...post, content: event.target.value })} />
        </Label>
        <Label text="Meta">
          <input value={post.meta} onChange={(event) => setPost({ ...post, meta: event.target.value })} />
        </Label>
        <Toggle label="Verified mark" checked={post.verified} onChange={(checked) => setPost({ ...post, verified: checked })} />
      </div>
    );
  }

  if (mode === 'code') {
    return (
      <div className="form-stack">
        <Label text="File name">
          <input value={codeTitle} onChange={(event) => setCodeTitle(event.target.value)} />
        </Label>
        <Label text="Code">
          <textarea className="code-input" value={code} onChange={(event) => setCode(event.target.value)} />
        </Label>
      </div>
    );
  }

  if (mode === 'image') {
    return (
      <div className="form-stack">
        <label className="upload-box">
          <Upload size={20} />
          <span>Upload image</span>
          <input type="file" accept="image/*" onChange={onImageUpload} />
        </label>
        <Label text="Caption">
          <textarea value={imageCaption} onChange={(event) => setImageCaption(event.target.value)} />
        </Label>
      </div>
    );
  }

  return (
    <div className="form-stack">
      <Label text="Markdown text">
        <textarea className="markdown-input" value={markdown} onChange={(event) => setMarkdown(event.target.value)} />
      </Label>
    </div>
  );
}

function ShotCard({
  mode,
  cleanHtml,
  post,
  code,
  codeTitle,
  imageSrc,
  imageCaption,
  theme,
  shadow,
  radius,
  border,
  borderWidth,
  quoteMarks
}) {
  const visibleBorder = border ? borderWidth : 0;
  const borderColor = getCardBorderColor(theme, visibleBorder);
  const className = `shot-card ${theme}`;
  const style = {
    boxShadow: composeCardShadow(theme, shadow, visibleBorder),
    borderRadius: `${radius}px`,
    '--card-border-width': `${visibleBorder}px`,
    '--card-border-color': borderColor
  };

  if (mode === 'post') {
    return (
      <article className={className} style={style}>
        <div className="post-head">
          <div className="avatar">{initials(post.author)}</div>
          <div>
            <div className="author-line">
              <strong>{post.author || 'Author'}</strong>
              {post.verified && <BadgeCheck size={18} className="verified" />}
            </div>
            <span>{post.handle || '@handle'}</span>
          </div>
        </div>
        <p className="post-content">{post.content}</p>
        <div className="post-meta">{post.meta}</div>
      </article>
    );
  }

  if (mode === 'code') {
    return (
      <article className={`${className} code-card`} style={style}>
        <div className="code-head">
          <div className="traffic-lights">
            <span />
            <span />
            <span />
          </div>
          <strong>{codeTitle || 'snippet.js'}</strong>
          <Clipboard size={15} />
        </div>
        <pre><code>{code}</code></pre>
      </article>
    );
  }

  if (mode === 'image') {
    return (
      <article className={`${className} image-card`} style={style}>
        {imageSrc ? (
          <img src={imageSrc} alt="" />
        ) : (
          <div className="image-placeholder">
            <FileImage size={42} />
            <span>Upload an image</span>
          </div>
        )}
        <p>{imageCaption}</p>
      </article>
    );
  }

  return (
    <article className={className} style={style}>
      {quoteMarks && <Quote className="quote-mark" size={54} />}
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </article>
  );
}

function getCardBorderColor(theme, width) {
  if (!width) return 'transparent';
  if (theme === 'glass') return 'rgba(255, 255, 255, 0.68)';
  if (theme === 'dark') return 'rgba(255, 255, 255, 0.16)';
  return 'rgba(255, 255, 255, 0.58)';
}

function composeCardShadow(theme, shadow, borderWidth) {
  const highlights = [];

  if (theme === 'glass') {
    highlights.push('inset 0 1px 0 rgba(255, 255, 255, 0.56)');
    if (borderWidth > 1) {
      highlights.push(`inset 0 0 ${Math.max(10, borderWidth * 2)}px rgba(255, 255, 255, 0.12)`);
    }
  }

  return [shadow !== 'none' ? shadow : '', ...highlights].filter(Boolean).join(', ') || 'none';
}

function SceneLayer({ scene }) {
  if (scene === 'none') return null;
  return <div className={`scene-layer scene-${scene}`} aria-hidden="true" />;
}

function Watermark({ items }) {
  if (!items.length) return null;

  return (
    <div className="watermark">
      {items.map(({ id, iconId, label }) => {
        const Icon = WATERMARK_ICONS[iconId] || Sparkles;
        return (
          <span className="watermark-item" key={id}>
            <Icon size={14} />
            <span>{label}</span>
          </span>
        );
      })}
    </div>
  );
}

function WatermarkControls({
  watermarkTextEnabled,
  setWatermarkTextEnabled,
  watermarkText,
  setWatermarkText,
  watermarkLocationEnabled,
  setWatermarkLocationEnabled,
  watermarkLocationText,
  setWatermarkLocationText,
  watermarkDateEnabled,
  setWatermarkDateEnabled,
  watermarkDateText,
  setWatermarkDateText,
  onUseGpsLocation,
  gpsBusy
}) {
  return (
    <div className="watermark-control-stack">
      <WatermarkOption label="Custom text" checked={watermarkTextEnabled} onChange={setWatermarkTextEnabled}>
        <input
          value={watermarkText}
          placeholder="Share Card"
          aria-label="Custom text watermark"
          onChange={(event) => {
            setWatermarkText(event.target.value);
            if (event.target.value.trim()) setWatermarkTextEnabled(true);
          }}
        />
      </WatermarkOption>

      <WatermarkOption label="Location" checked={watermarkLocationEnabled} onChange={setWatermarkLocationEnabled}>
        <div className="watermark-location-row">
          <input
            value={watermarkLocationText}
            placeholder="Shanghai or GPS"
            aria-label="Location watermark"
            onChange={(event) => {
              setWatermarkLocationText(event.target.value);
              if (event.target.value.trim()) setWatermarkLocationEnabled(true);
            }}
          />
          <button
            className="icon-button"
            type="button"
            title="Use GPS location"
            aria-label="Use GPS location"
            onClick={onUseGpsLocation}
            disabled={gpsBusy}
          >
            <LocateFixed size={17} />
          </button>
        </div>
      </WatermarkOption>

      <WatermarkOption label="Date" checked={watermarkDateEnabled} onChange={setWatermarkDateEnabled}>
        <input
          type="date"
          value={watermarkDateText}
          aria-label="Date watermark"
          onChange={(event) => {
            setWatermarkDateText(event.target.value);
            if (event.target.value) setWatermarkDateEnabled(true);
          }}
        />
      </WatermarkOption>
    </div>
  );
}

function WatermarkOption({ label, checked, onChange, children }) {
  return (
    <div className="watermark-option">
      <Toggle label={label} checked={checked} onChange={onChange} />
      <div className="watermark-option-control">
        {children}
      </div>
    </div>
  );
}

function BottomDock({
  mode,
  background,
  setBackground,
  scene,
  setScene,
  shadow,
  setShadow,
  aspect,
  setAspect,
  theme,
  setTheme,
  border,
  setBorder,
  borderWidth,
  setBorderWidth,
  padding,
  setPadding,
  paddingX,
  setPaddingX,
  setRadius,
  applyNoPad,
  quoteMarks,
  setQuoteMarks,
  onCopy,
  onDownload,
  busy
}) {
  const [activeDock, setActiveDock] = useState(null);
  const backgroundName = BACKGROUNDS.find((item) => item.value === background)?.name || 'Screen';
  const sceneName = SCENES.find((item) => item.id === scene)?.label || 'Scene';
  const shadowName = SHADOWS.find((item) => item.value === shadow)?.name || 'Shadow';
  const themeOption = THEME_OPTIONS.find((item) => item.id === theme) || THEME_OPTIONS[0];
  const ThemeIcon = THEME_ICONS[themeOption.id] || Sun;
  const currentBorderWidth = border ? borderWidth : 0;
  const borderLabel = currentBorderWidth > 0 ? `${currentBorderWidth}px` : 'Off';
  const noPad = padding === 0 && paddingX === 0;

  const applyEdgeToEdge = () => {
    setPadding(0);
    setPaddingX(0);
    setBorder(false);
    setBorderWidth(0);
    setRadius(0);
    setShadow('none');
  };

  const cycleBackground = () => {
    const nextBackground = nextInList(BACKGROUNDS, background, (item) => item.value);
    setActiveDock(null);
    setBackground(nextBackground.value);
  };

  const cycleScene = () => {
    const nextScene = nextInList(SCENES, scene, (item) => item.id);
    setActiveDock(null);
    setScene(nextScene.id);
  };

  const cycleShadow = () => {
    const nextShadow = nextInList(SHADOWS, shadow, (item) => item.value);
    setActiveDock(null);
    setShadow(nextShadow.value);
  };

  const cycleTheme = () => {
    const nextTheme = nextInList(THEME_OPTIONS, theme, (item) => item.id);
    setActiveDock(null);
    setTheme(nextTheme.id);
  };

  const cycleBorder = () => {
    const nextWidth = nextNumberPreset(BORDER_WIDTH_PRESETS, currentBorderWidth);
    setActiveDock(null);
    setBorderWidth(nextWidth);
    setBorder(nextWidth > 0);
  };

  const cycleAspect = () => {
    const aspectEntries = Object.entries(ASPECTS);
    const currentIndex = aspectEntries.findIndex(([key]) => key === aspect);
    const nextAspect = aspectEntries[(currentIndex + 1) % aspectEntries.length]?.[0] || 'auto';
    setActiveDock(null);
    setAspect(nextAspect);
  };

  return (
    <div className="bottom-dock" aria-label="Capture controls">
      <CycleDockButton
        label={backgroundName}
        icon={<div className="dock-swatch" style={{ backgroundImage: background }} />}
        onClick={cycleBackground}
        title={`Background: ${backgroundName}`}
      />

      <CycleDockButton
        label={sceneName}
        icon={<Shapes size={24} />}
        onClick={cycleScene}
        title={`Scene: ${sceneName}`}
      />

      <CycleDockButton
        label={shadowName}
        icon={<Sparkles size={24} />}
        onClick={cycleShadow}
        title={`Shadow: ${shadowName}`}
      />

      <CycleDockButton
        label={themeOption.label}
        icon={<ThemeIcon size={24} />}
        onClick={cycleTheme}
        title={`Mode: ${themeOption.label}`}
      />

      <CycleDockButton
        label={borderLabel}
        icon={<span className={`border-icon ${currentBorderWidth === 0 ? 'off' : ''}`} style={{ borderWidth: Math.max(1, currentBorderWidth) }} />}
        onClick={cycleBorder}
        title={`Border: ${borderLabel}`}
      />

      <CycleDockButton
        label={ASPECTS[aspect].label}
        icon={<FileImage size={24} />}
        onClick={cycleAspect}
        title={`Aspect: ${ASPECTS[aspect].label}`}
      />

      <DockPopover id="controls" label="Controls" icon={<Palette size={24} />} activeDock={activeDock} setActiveDock={setActiveDock}>
        <div className="dock-control-stack">
          <Slider label="Padding X" min="0" max="180" value={paddingX} onChange={setPaddingX} />
          <Slider label="Padding Y" min="0" max="140" value={padding} onChange={setPadding} />
          <Toggle
            label="No pad"
            checked={noPad}
            onChange={applyNoPad}
          />
          {mode === 'text' && <Toggle label="Quote" checked={quoteMarks} onChange={setQuoteMarks} />}
          <button className="wide-dock-button" onClick={applyEdgeToEdge}>Edge to edge</button>
        </div>
      </DockPopover>

      <button className="dock-action" onClick={() => {
        setActiveDock(null);
        onCopy();
      }} disabled={busy}>
        <Copy size={23} />
        <span>Copy</span>
      </button>
      <button className="dock-action primary" onClick={() => {
        setActiveDock(null);
        onDownload();
      }} disabled={busy}>
        <Download size={23} />
        <span>Download</span>
      </button>
    </div>
  );
}

function CycleDockButton({ icon, label, onClick, title }) {
  return (
    <button className="dock-button" type="button" onClick={onClick} title={title} aria-label={title}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DockPopover({ id, icon, label, children, activeDock, setActiveDock }) {
  const open = activeDock === id;

  return (
    <div className={`dock-item ${open ? 'open' : ''}`}>
      <div className="dock-popover">{children}</div>
      <button className="dock-button" type="button" onClick={() => setActiveDock(open ? null : id)}>
        {icon}
        <span>{label}</span>
      </button>
    </div>
  );
}

function ControlGroup({ label, children }) {
  return (
    <section className="control-group">
      <h2>{label}</h2>
      {children}
    </section>
  );
}

function PanelTitle({ icon: Icon, title }) {
  return (
    <div className="panel-title">
      <Icon size={18} />
      <strong>{title}</strong>
    </div>
  );
}

function Slider({ label, value, onChange, min = '0', max = '100', ...props }) {
  const sliderId = useId();
  const numberId = useId();
  const minValue = Number(min);
  const maxValue = Number(max);

  const updateValue = (nextValue) => {
    const normalizedValue = Number.isFinite(nextValue) ? nextValue : minValue;
    onChange(Math.min(maxValue, Math.max(minValue, normalizedValue)));
  };

  return (
    <div className="slider-row">
      <label htmlFor={sliderId}>{label}</label>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => updateValue(Number(event.target.value))}
        {...props}
      />
      <span className="slider-value">
        <input
          id={numberId}
          type="number"
          min={min}
          max={max}
          value={value}
          aria-label={`${label} value`}
          onChange={(event) => updateValue(Number(event.target.value))}
        />
        <span>px</span>
      </span>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-ui" />
    </label>
  );
}

function Label({ text, children }) {
  return (
    <label className="field-label">
      <span>{text}</span>
      {children}
    </label>
  );
}

function getExportToast(result) {
  if (result === 'copied') return 'PNG 已复制到剪贴板';
  if (result === 'copy-fallback-downloaded') return '浏览器不支持图片复制，已改为下载';
  return 'PNG 已下载';
}

const rootElement = document.getElementById('root');
const root = globalThis.__shareCardMakerRoot ?? createRoot(rootElement);
globalThis.__shareCardMakerRoot = root;
root.render(<App />);
