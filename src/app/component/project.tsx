import {DaggerImage} from "@/domain/data";
import React, {useState} from "react";
import {
  ControlButtonFilled, ControlButtonRegular,
  DismissRegular,
  KeyboardShiftFilled, KeyboardShiftRegular,
  WrenchFilled, WrenchRegular,
  ZoomInRegular,
  ZoomOutRegular
} from "@fluentui/react-icons";

export interface ProjectFileProps {
  handleOpenImage: (daggerImage: DaggerImage | null) => void
  selectedImages: DaggerImage[]
  currentImages: DaggerImage[]
  searchTags: string[]
  ignoreTags: string[]
  handleRemoveTagFromFilter: (tag: string) => void

  shiftMode: boolean
  ctrlMode: boolean
  setShiftMode: (bool: boolean) => void
  setCtrlMode: (bool: boolean) => void

  images: DaggerImage[]
}

export default function ProjectFile(props: ProjectFileProps) {
  const [size, setSize] = useState(256)

  const imageCards = props.images.map((i, n) => {
    const shouldShow = props.currentImages.some(c => c.fileName === i.fileName)

    return (
      <ImageCard
        img={i}
        isCurrent={props.selectedImages.some(c => c.fileName === i.fileName)}
        handler={props.handleOpenImage}
        key={i.realPath + n}
        visible={shouldShow}
        size={size}
      />
    )
  })

  return (
    <div className="flex flex-col h-full select-none w-auto overflow-hidden">
      <div className="flex justify-between h-[50px] border-b border-neutral-950">
        <div className="flex ml-3 pr-3 w-auto items-center text-2xl">
          <div onClick={() => props.setShiftMode(!props.shiftMode)}
               className="flex items-center justify-center w-8 p-1.5 h-8 rounded hover:bg-neutral-800">
            {props.shiftMode ? <KeyboardShiftFilled/> : <KeyboardShiftRegular/>}
          </div>
          <div onClick={() => props.setCtrlMode(!props.ctrlMode)}
               className="flex items-center justify-center w-10 p-1.5 h-8 rounded ml-0.5 hover:bg-neutral-800">
            {props.ctrlMode ? <ControlButtonFilled/> : <ControlButtonRegular/>}
          </div>
          <div
            className="flex min-w-[512px] max-w-[1024px] h-[34px] m-[8px]  rounded overflow-x-auto overflow-y-hidden">
            <FilterTagView handleRemoveTagFromFilter={props.handleRemoveTagFromFilter} tags={props.searchTags}
                           color="blue" join="and"/>
            <FilterTagView handleRemoveTagFromFilter={props.handleRemoveTagFromFilter} tags={props.ignoreTags}
                           color="red" join="or"/>
          </div>
        </div>
        <div className={"flex justify-end pb-3 pt-3 pr-3 text-2xl"}>
          <ZoomOutRegular/>
          <input type="range" className="h-[24px] ml-3 mr-3 w-[128px]" min={128} max={512} step={64} value={size}
                 onChange={(v) => setSize(Number(v.target.value))}/>
          <ZoomInRegular/>
        </div>
      </div>
      <div className="flex flex-wrap h-full p-5 pt-0 gap-3 overflow-y-scroll"
           onMouseDown={() => props.handleOpenImage(null)}>
        {imageCards}
      </div>
    </div>
  )
}

interface FilterTagView {
  handleRemoveTagFromFilter: (tag: string) => void
  tags: string[]
  color: "red" | "blue"
  join: string
}

function FilterTagView(props: FilterTagView) {
  const tagCloudElm = props.tags.map((t: string, i, l) => {
    let clsName = "flex box-border border rounded-2xl p-1 pl-2 pr-2 m-1 select-none text-sm cursor-pointer whitespace-nowrap hover:bg-neutral-800 "
    if (props.color === "blue") {
      clsName += "bg-neutral-900 border-blue-600"
    } else if (props.color === "red") {
      clsName += "bg-neutral-900 border-red-500"
    } else {
      clsName += "bg-neutral-900 border-neutral-600"
    }

    return (
      <div key={t} className="flex items-center">
        <div
          className={clsName}
          key={t}
          onClick={(e) => {
            e.stopPropagation()
            // props.handleTagDelete(t)
          }}
        >
          {t}
          <div
            onClick={() => {
              props.handleRemoveTagFromFilter(t)
            }}
            className="relative left-1 flex w-5 justify-center items-center text-xs bg-neutral-800 rounded-full hover:bg-red-500"
          >
            <DismissRegular></DismissRegular>
          </div>
        </div>
        {i !== l.length - 1 ? <p className="text-neutral-400 text-sm">{props.join}</p> : ""}
      </div>
    )
  })

  return (
    <div className="flex items-center">
      {tagCloudElm}
    </div>
  )
}

export function ImageCard({img, handler, isCurrent, visible, size}: {
  img: DaggerImage,
  isCurrent: boolean,
  handler: (img: DaggerImage) => void
  visible: boolean
  size: number
}) {
  let cls = `flex flex-col content-between overflow-hidden mt-3 hover:bg-neutral-800 shrink-0`
  if (!visible) cls += " hidden"

  return (
    <div className={cls} style={{width: `${size}px`, height: `${size + 40}px`}}
         onMouseDown={(e) => {
           e.stopPropagation();
           handler(img)
         }}
         onDoubleClick={(e) => {
           e.stopPropagation();
           window.open(img.url, '_blank')
         }}
    >
      <div
        className={`flex justify-center m-1 overflow-hidden shrink-0 items-center ` + (isCurrent ? "border-sky-500 border-2" : "")}
        style={{height: `${size}px`}}>
        <img className={"object-cover"} src={img.thumbnailUrl} alt={img.caption.value}></img>
      </div>
      <div className="flex justify-center text-sm pt-2">
        <p className="overflow-ellipsis max-w-[128px] overflow-hidden whitespace-nowrap">{img.fileName}</p>
      </div>
    </div>
  )
}
