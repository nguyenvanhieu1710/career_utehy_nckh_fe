"use client"

import { useEffect, useRef, useState } from "react";
import CVCanvas, { ImageState } from "../components/Canvas_v2";
import CVToolBox from "../components/ToolBox";
import Button from "@/components/ui/Button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useParams } from "next/navigation";
import { cvAPI } from "@/services/cv";
import { CVProfile } from "@/types/cv";
import { DEFAULT_SECTIONS, DEFAULT_SECTIONS_VI } from "../page";
import { set } from "date-fns";

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
  rotation: 0,
  scale: 1,
  offsetX: 0,
  offsetY: 0
};
export default function CVDesktop() {
  const [cvTitle, setCvTitle] = useState<string>("");
  const [cvColorPrimary, setCVColorPrimary] = useState<string>("#1d7057ff");
  const [cvSubTitle, setSubCvTitle] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("New project");
  const [patternSideExtend, setPatternSideExtend] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const cvCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageState, setImageState] = useState<ImageState>(INITIAL_IMAGE_STATE);
  const { cv_id } = useParams()
  const [cvs, setCvs] = useState<CVProfile[]>([]);

  useEffect(() => {
    cvAPI.getForUser({}).then(res => {
      setCvs(res.data?.data)
    }).catch(err => { })
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
  const [backgroundElements, setBackgroundElements] = useState([]);
  const [imageURL, setImageURL] = useState<string | null>(null);

  useEffect(() => {
    cvAPI.getForUser({ id: cv_id as string }).then(res => {
      const cv = res.data?.data?.[0] as CVProfile;
      setCvTitle(cv.title || "");
      setSubCvTitle(cv.subtitle || "");
      setCVColorPrimary(cv.primary_color || "#1d7057ff")
      setProjectName(cv.name);
      let secs = [];
      if (cv.sections == "NONE") {
        secs = DEFAULT_SECTIONS_VI;
      } else {
        secs = JSON.parse(cv.sections);
      }
      setBackgroundElements(JSON.parse(cv.design_data || "[]"))
      setSections(secs)
    }).catch(err => {

    })
  }, [cv_id])
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
      <CVToolBox
        cv_id={cv_id as string}
        imageState={imageState}
        cvColor={cvColorPrimary}
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
          imageURL={imageURL || ""}
          cvTitle={cvTitle}
          cvSubTitle={cvSubTitle}
          sections={sections}
          onSectionDrag={(data) => {
            setSections(prev => prev.map(sec => sec.id === data.id ? { ...sec, x: data.x, y: data.y } : sec))
          }}
          isSavable
          backgroundElements={backgroundElements}
        />
      </div>
      <div className="absolute top-2 right-4 zindex-10">
        <Button
          backgroundColor="transparent"
          iconLeft={patternSideExtend ? <PanelRightClose color="#ffffffff" fill="#0C6A4E" /> : <PanelRightOpen color="#ffffff" fill="#0C6A4E" />}
          onClick={() => setPatternSideExtend(!patternSideExtend)}
          border="none"
        />
      </div>
      <div className={` ${patternSideExtend ? "flex-3" : "flex-0"} p-2 h-screen flex flex-col gap-5 items-center overflow-y-auto overflow-hidden transition-all border-l border-gray-200`}>
        <div className="w-full flex gap-2 items-center p-1 bg-[#0C6A4E] text-white p-2 rounded-md">
          Các CV của bạn
        </div>
        {cvs?.filter(c => c.id != cv_id).map(cv => {
          let sections = [];
          if (cv.sections == 'NONE') {
            sections = DEFAULT_SECTIONS_VI;
          } else {
            sections = JSON.parse(cv.sections);
          }
          return (
            <div
              key={cv.id}
              className="relative bg-white rounded-xl cursor-pointer"
              onClick={() => location.href = `/cv/${cv.id}`}
            >
              <CVCanvas
                projectName={cv.name}
                isSavable={false}
                isIcon
                imageState={INITIAL_IMAGE_STATE}
                setImageState={() => { }}
                defaultZoom={0.21}
                cvTitle={cv.title || ""}
                key={cv.id}
                primaryColor={cv.primary_color || "#0C6A4E"}
                sections={sections}
                onItemTextChange={handleItemTextChange}
              />

              <h3 className="font-medium text-gray-500 text-sm text-ellipsis w-40">
                {cv.name}
              </h3>
              <span className="text-[10px] font-light text-gray-500"> Cập nhật cuối: {new Date(cv?.updated_at).toLocaleString()}</span>

            </div>
          )
        })}
      </div>
    </div>
  );
}