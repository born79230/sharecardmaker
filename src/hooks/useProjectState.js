import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { createDefaultProject, normalizeProject, projectReducer } from '../model/project.js';
import { DEFAULT_PADDING, DEFAULT_RADIUS } from '../presets.js';

export function useProjectState(platform) {
  const [project, dispatch] = useReducer(
    projectReducer,
    undefined,
    () => normalizeProject(platform.loadProject?.() ?? createDefaultProject())
  );

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      platform.saveProject?.(project);
    }, 250);
    return () => globalThis.clearTimeout(timeoutId);
  }, [platform, project]);

  const setField = useCallback((field, value) => {
    dispatch({ type: 'set-field', field, value });
  }, []);

  const actions = useMemo(() => {
    const bind = (field) => (value) => setField(field, value);
    return {
      setMode: bind('mode'),
      setMarkdown: bind('markdown'),
      setPost: bind('post'),
      setCode: bind('code'),
      setCodeTitle: bind('codeTitle'),
      setImageSrc: bind('imageSrc'),
      setImageCaption: bind('imageCaption'),
      setBackground: bind('background'),
      setScene: bind('scene'),
      setShadow: bind('shadow'),
      setTheme: bind('theme'),
      setAspect: bind('aspect'),
      setPadding: bind('padding'),
      setPaddingX: bind('paddingX'),
      setRadius: bind('radius'),
      setBorder: bind('border'),
      setBorderWidth: bind('borderWidth'),
      setQuoteMarks: bind('quoteMarks'),
      setWatermarkTextEnabled: bind('watermarkTextEnabled'),
      setWatermarkText: bind('watermarkText'),
      setWatermarkLocationEnabled: bind('watermarkLocationEnabled'),
      setWatermarkLocationText: bind('watermarkLocationText'),
      setWatermarkDateEnabled: bind('watermarkDateEnabled'),
      setWatermarkDateText: bind('watermarkDateText')
    };
  }, [setField]);

  const patchProject = useCallback((value) => {
    dispatch({ type: 'patch', value });
  }, []);

  const applyNoPad = useCallback((checked) => {
    patchProject(checked
      ? { padding: 0, paddingX: 0, radius: 0, aspect: 'auto' }
      : { padding: DEFAULT_PADDING, paddingX: DEFAULT_PADDING, radius: DEFAULT_RADIUS });
  }, [patchProject]);

  return { project, actions, patchProject, applyNoPad };
}
