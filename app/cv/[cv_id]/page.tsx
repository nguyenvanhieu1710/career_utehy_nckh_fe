"use client"

import { useEffect, useRef, useState } from "react";
import CVCanvas, { ImageState, ShapeElement, generatePDFFromState, getFullCVState } from "../components/Canvas_v2";
import CVToolBox from "../components/ToolBox";
import CVInfoPanel from "../components/CVInfoPanel";
import Button from "@/components/ui/Button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useParams } from "next/navigation";
import { cvAPI } from "@/services/cv";
import { CVProfile } from "@/types/cv";
import { toast } from "sonner";
import { DEFAULT_SECTIONS_VI } from "../page";

// ─── Detect the template's primary color ──────────────────────────────────────
// The CV record stores `primary_color`, but that field doesn't always equal
// the color the template painted its rects with — templates have their own
// palette and `cv.primary_color` can drift (a user picked something else, the
// seed didn't match, etc). To reliably know which shapes to retint, we look
// AT THE PAINTED RECTS THEMSELVES and pick the most common non-neutral fill.
const _isNeutralFill = (raw: string): boolean => {
  let c = raw.trim().toLowerCase();
  if (!c || c === "transparent" || c === "none") return true;
  if (c.startsWith("#") && (c.length === 9 || c.length === 5) && c.endsWith("ff")) {
    c = c.slice(0, c.length - 2);
  }
  // Expand 3-digit hex (#abc → #aabbcc) so the gray check works.
  if (c.startsWith("#") && c.length === 4) {
    c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  }
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(c);
  if (!m) return false;
  const r = m[1], g = m[2], b = m[3];
  // Any shade of gray (r=g=b) — covers black, white, all greys.
  return r === g && g === b;
};

const _normColor = (raw: string): string => {
  let c = raw.trim().toLowerCase();
  if (c.startsWith("#") && (c.length === 9 || c.length === 5) && c.endsWith("ff")) {
    c = c.slice(0, c.length - 2);
  }
  return c;
};

/** Walk every painted shape and return the most-used non-grey fill. That's
 *  the color the template designer treated as "the primary"; we'll remap it
 *  to whatever the user picks. Returns undefined when the template is empty
 *  or fully greyscale. */
const deriveTemplatePrimary = (elements: ShapeElement[]): string | undefined => {
  const counts = new Map<string, number>();
  for (const el of elements) {
    for (const raw of [el.fill, el.stroke, el.iconColor]) {
      if (!raw) continue;
      if (_isNeutralFill(raw)) continue;
      const key = _normColor(raw);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [color, count] of counts) {
    if (count > bestCount) {
      best = color;
      bestCount = count;
    }
  }
  return best;
};

export interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
}

export interface SectionItem {
  text: string;
  editing: boolean;
  tempText: string;
  style: TextStyle;
  children: SectionItem[];
  expanded: boolean;
}

export interface Section {
  id: string;
  title: string;
  // Optional per-section title color. When unset the canvas falls back to its
  // default (white on sidebar sections, dark gray on right-column sections).
  titleColor?: string;
  open: boolean;
  items: SectionItem[];
  adding: boolean;
  editingIndex: number | null;
  x: number,
  y: number,
  size: SectionSize
}
export interface SectionSize {
  width: number,
  height: number,
}

export const defaultSections: { id: string, title: string, x: number, y: number, size: SectionSize }[] = [
  {
    id: "about",
    title: "About Me",
    x: 270,
    y: 140,
    size: {
      width: 500,
      height: 170
    }
  },
  {
    id: "contact",
    title: "Contact",
    x: 20,
    y: 310,
    size: {
      width: 200,
      height: 200
    }
  }, {
    id: "experience",
    title: "Experience",
    x: 270,
    y: 310,
    size: {
      width: 500,
      height: 400
    }
  }, {
    id: "education",
    title: "Education",
    x: 270,
    y: 310 + 200 + 200,
    size: {
      width: 500,
      height: 550
    }
  }, {
    id: "language",
    title: "Language",
    x: 20,
    y: 310 + 200,
    size: {
      width: 200,
      height: 200
    }
  }, {
    id: "skills",
    title: "Skills",
    x: 20,
    y: 310 + 200 + 200,
    size: {
      width: 200,
      height: 200
    }
  },
];
const INITIAL_IMAGE_STATE: ImageState = {
  x: 51,
  y: 20,
  width: 160,
  height: 160,
  borderRadius: 999,
  rotation: 0,
  scale: 1,
  offsetX: 0,
  offsetY: 0
};
export default function CVDesktop() {
  const [cvTitle, setCvTitle] = useState<string>("");
  const [cvColorPrimary, setCVColorPrimary] = useState<string>("#1d7057ff");
  // The template's painted primary. Captured ONCE at load (from the CV record)
  // so subsequent color swaps know which shapes to retint. Never updated as
  // the user picks new colors — that's what `cvColorPrimary` is for.
  const [originalTemplatePrimary, setOriginalTemplatePrimary] = useState<string | undefined>(undefined);
  const [cvSubTitle, setSubCvTitle] = useState<string>("");
  const [titleStyle, setTitleStyle] = useState<string>("{\"x\":292,\"y\":68,\"font_size\":34,\"font_family\":\"Arial\",\"font_weight\":\"bold\",\"color\":\"#111827\"}");
  const [subtitleStyle, setSubtitleStyle] = useState<string>("{\"x\":292,\"y\":94,\"font_size\":15,\"font_family\":\"Arial\",\"font_weight\":\"normal\",\"color\":\"#1d7057ff\"}");
  const [hasAvatar, setHasAvatar] = useState<boolean>(true);
  const [avatarStyle, setAvatarStyle] = useState<string>("{\"x\":50,\"y\":18,\"width\":160,\"height\":160,\"border_radius\":999,\"rotation\":0,\"scale\":1,\"offsetX\":0,\"offsetY\":0}");
  const [projectName, setProjectName] = useState<string>("New project");
  const [editingProjectName, setEditingProjectName] = useState<boolean>(false);
  const [tempProjectName, setTempProjectName] = useState<string>("");
  const [patternSideExtend, setPatternSideExtend] = useState(true);
  const cvCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageState, setImageState] = useState<ImageState>(INITIAL_IMAGE_STATE);
  const { cv_id } = useParams()
  const [cvs, setCvs] = useState<CVProfile[]>([]);

  useEffect(() => {
    cvAPI.getForUser({}).then(res => {
      setCvs(res.data?.data)
    }).catch(() => { })
  }, [])
  const [sections, setSections] = useState<Section[]>(
    defaultSections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      open: true,
      items: [],
      adding: false,
      editingIndex: null,
      x: sec.x,
      y: sec.y,
      size: sec.size
    }))
  );
  const [backgroundElements, setBackgroundElements] = useState<ShapeElement[]>([]);
  const [imageURL, setImageURL] = useState<string | null>(null);

  useEffect(() => {
    cvAPI.getForUser({ id: cv_id as string }).then(res => {
      const cv = res.data?.data?.[0] as CVProfile;
      setCvTitle(cv.title || "");
      setSubCvTitle(cv.subtitle || "");
      setTitleStyle(cv.title_style || "{\"x\":292,\"y\":68,\"font_size\":34,\"font_family\":\"Arial\",\"font_weight\":\"bold\",\"color\":\"#111827\"}");
      setSubtitleStyle(cv.subtitle_style || "{\"x\":292,\"y\":94,\"font_size\":15,\"font_family\":\"Arial\",\"font_weight\":\"normal\",\"color\":\"#1d7057ff\"}");
      setHasAvatar(cv.has_avatar ?? true);
      setAvatarStyle(cv.avatar_style || "{\"x\":50,\"y\":18,\"width\":160,\"height\":160,\"border_radius\":999,\"rotation\":0,\"scale\":1,\"offsetX\":0,\"offsetY\":0}");
      const loadedPrimary = cv.primary_color || "#1d7057ff";
      setCVColorPrimary(loadedPrimary);
      setProjectName(cv.name);
      let secs = [];
      if (cv.sections == "NONE") {
        secs = DEFAULT_SECTIONS_VI;
      } else {
        secs = JSON.parse(cv.sections);
      }
      // Read the painted shapes, then derive the template primary FROM the
      // rect fills themselves (cv.primary_color is unreliable: it can drift
      // from the template palette after edits or seed mismatches). The
      // dominant non-grey color is treated as "the template primary" and
      // every shape carrying it follows the user's color picker.
      const elements: ShapeElement[] = JSON.parse(cv.design_data || "[]");
      setBackgroundElements(elements);
      const templatePrimary = deriveTemplatePrimary(elements) || loadedPrimary;
      setOriginalTemplatePrimary(templatePrimary);
      try {
        const parsedAvatarStyle = JSON.parse(cv.avatar_style || "{}");
        const toNum = (value: unknown, defaultValue: number) => {
          const n = Number(value);
          return Number.isFinite(n) ? n : defaultValue;
        };
        setImageState(prev => ({
          ...prev,
          x: toNum(parsedAvatarStyle.x, prev.x),
          y: toNum(parsedAvatarStyle.y, prev.y),
          width: toNum(parsedAvatarStyle.width, prev.width),
          height: toNum(parsedAvatarStyle.height, prev.height),
          borderRadius: toNum(parsedAvatarStyle.border_radius ?? parsedAvatarStyle.borderRadius, prev.borderRadius),
          rotation: toNum(parsedAvatarStyle.rotation, prev.rotation),
          scale: toNum(parsedAvatarStyle.scale, prev.scale),
          offsetX: toNum(parsedAvatarStyle.offsetX, prev.offsetX),
          offsetY: toNum(parsedAvatarStyle.offsetY, prev.offsetY),
        }));
      } catch { }
      setSections(secs)
    }).catch(() => { })
  }, [cv_id])

  // ── Save + Download handlers are owned here so both the left section toolbox
  //    and the right info panel can fire them with identical semantics.
  const handleSave = (): void => {
    const cvState = getFullCVState(
      cvTitle,
      cvSubTitle,
      cvColorPrimary,
      imageURL ?? undefined,
      imageState,
      sections,
      projectName,
      titleStyle,
      subtitleStyle,
      backgroundElements,
      originalTemplatePrimary,
    );

    cvAPI.update({
      id: cv_id as string,
      primary_color: cvState.primaryColor,
      sections: JSON.stringify(cvState.sections),
      title: cvState.cvTitle,
      subtitle: cvState.cvSubTitle,
      title_style: titleStyle,
      subtitle_style: subtitleStyle,
      has_avatar: hasAvatar,
      avatar_style: JSON.stringify({
        x: imageState.x,
        y: imageState.y,
        width: imageState.width,
        height: imageState.height,
        border_radius: imageState.borderRadius,
        rotation: imageState.rotation,
        scale: imageState.scale,
        offsetX: imageState.offsetX,
        offsetY: imageState.offsetY,
      }),
      name: cvState.projectName,
    }).then(() => toast.success("Đã lưu CV")).catch(() => { });
  };

  const handleDownload = (): void => {
    const cvState = getFullCVState(
      cvTitle,
      cvSubTitle,
      cvColorPrimary,
      imageURL ?? undefined,
      imageState,
      sections,
      projectName,
      titleStyle,
      subtitleStyle,
      backgroundElements,
      originalTemplatePrimary,
    );
    generatePDFFromState(cvState);
  };

  const handleItemTextChange = ({ sectionIndex, itemPath, newText } : { sectionIndex: number, itemPath: number[], newText: string }) => {
    setSections(prev => {
      const updated = [...prev];
      const section = { ...updated[sectionIndex] };
      // Deep clone items
      const items = JSON.parse(JSON.stringify(section.items));
      // Navigate to item via path
      let target = items;
      for (let i = 0; i < itemPath.length - 1; i++) {
        target = target[itemPath[i]].children;
      }
      target[itemPath[itemPath.length - 1]].text = newText;
      section.items = items;
      updated[sectionIndex] = section;
      return updated;
    });
  };
  return (
    <div className="flex text-gray-600 bg-white h-screen relative">
      {/* Left rail — slim sections editor (project-level inputs moved to the
          right info panel). */}
      <CVToolBox
        cv_id={cv_id as string}
        imageState={imageState}
        cvColor={cvColorPrimary}
        titleStyle={titleStyle}
        subtitleStyle={subtitleStyle}
        hasAvatar={hasAvatar}
        setHasAvatar={setHasAvatar}
        avatarStyle={avatarStyle}
        imageURL={imageURL as string}
        cvTitle={cvTitle}
        cvCanvasRef={cvCanvasRef}
        cvSubTitle={cvSubTitle}
        setCvTitle={setCvTitle}
        setCvSubTitle={setSubCvTitle}
        projectName={projectName}
        setProjectName={setProjectName}
        sections={sections}
        setSections={setSections}
        onImageSelected={setImageURL}
        onCVColorChange={setCVColorPrimary}
        onSectionLocationChange={(data) => {
          if (data.field == 'x') {
            setSections(prev => prev.map(sec => sec.id === data.id ? { ...sec, x: data.value } : sec))
          } else if (data.field == 'y') {
            setSections(prev => prev.map(sec => sec.id === data.id ? { ...sec, y: data.value } : sec))
          }
        }}
      />

      {/* Center — A4 canvas */}
      <div className="flex-10 flex text-gray-600 bg-white h-screen">
        <CVCanvas
          onSectionResize={(data) => {
            const newSize = {
              width: data.width,
              height: data.height
            } as SectionSize
            setSections(prev => prev.map(sec => sec.id === data.id ? { ...sec, size: newSize } : sec))
          }}
          cv_id={cv_id as string}
          projectName={projectName}
          setImageState={setImageState}
          imageState={imageState}
          canvasRef={cvCanvasRef}
          primaryColor={cvColorPrimary}
          originalTemplatePrimary={originalTemplatePrimary}
          imageURL={imageURL || ""}
          cvTitle={cvTitle}
          cvSubTitle={cvSubTitle}
          titleStyle={titleStyle}
          subtitleStyle={subtitleStyle}
          hasAvatar={hasAvatar}
          avatarStyle={avatarStyle}
          sections={sections}
          onSectionDrag={(data) => {
            setSections(prev => prev.map(sec => sec.id === data.id ? { ...sec, x: data.x, y: data.y } : sec))
          }}
          isSavable
          backgroundElements={backgroundElements}
        />
      </div>

      {/* Collapse toggle for the info panel */}
      <div className="absolute top-2 right-4 z-20">
        <Button
          backgroundColor="transparent"
          iconLeft={patternSideExtend ? <PanelRightClose color="#0C6A4E" /> : <PanelRightOpen color="#0C6A4E" />}
          onClick={() => setPatternSideExtend(!patternSideExtend)}
          border="none"
        />
      </div>

      {/* Right — Thông tin CV (Toolbox) panel: every CV-level knob + the
          user's other CVs. Collapses to zero-width when the chevron toggle
          flips. */}
      {patternSideExtend && (
        <CVInfoPanel
          cv_id={cv_id as string}
          cvs={cvs}
          projectName={projectName}
          setProjectName={setProjectName}
          editingName={editingProjectName}
          setEditingName={setEditingProjectName}
          tempProjectName={tempProjectName}
          setTempProjectName={setTempProjectName}
          cvColor={cvColorPrimary}
          onCVColorChange={setCVColorPrimary}
          hasAvatar={hasAvatar}
          setHasAvatar={setHasAvatar}
          onImageSelected={setImageURL}
          cvTitle={cvTitle}
          setCvTitle={setCvTitle}
          cvSubTitle={cvSubTitle}
          setCvSubTitle={setSubCvTitle}
          titleStyle={titleStyle}
          setTitleStyle={setTitleStyle}
          subtitleStyle={subtitleStyle}
          setSubtitleStyle={setSubtitleStyle}
          onSave={handleSave}
          onDownload={handleDownload}
          handleItemTextChange={handleItemTextChange}
          defaultSectionsForFallback={DEFAULT_SECTIONS_VI}
          initialImageState={INITIAL_IMAGE_STATE}
        />
      )}
    </div>
  );
}
