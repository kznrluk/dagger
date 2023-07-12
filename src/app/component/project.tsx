import {DaggerImage} from "@/domain/data";
import {useState} from "react";
import {ZoomInRegular, ZoomOutRegular} from "@fluentui/react-icons";

export interface ProjectFileProps {
  handleOpenImage: (daggerImage: DaggerImage|null) => void
  selectedImages: DaggerImage[]
  currentImages: DaggerImage[]
  searchTags: string[]
  ignoreTags: string[]

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
      <div className={"flex justify-end pt-3 pb-3 pr-3 text-2xl"}>
        <ZoomOutRegular />
        <input type="range" className="h-[24px] ml-3 mr-3 w-[128px]" min={128} max={512} step={64} value={size} onChange={(v) => setSize(Number(v.target.value))} />
        <ZoomInRegular />
      </div>
      <div className="flex flex-wrap h-full p-5 gap-3 overflow-y-scroll" onMouseDown={() => props.handleOpenImage(null)}>
        {imageCards}
      </div>
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
    <div className={cls} style={{ width: `${size}px`, height: `${size + 40}px` }}
         onMouseDown={(e) => {e.stopPropagation(); handler(img)}}
         onDoubleClick={(e) => {e.stopPropagation(); window.open(img.url, '_blank')}}
    >
      <div className={`flex justify-center m-1 overflow-hidden shrink-0 items-center ` + (isCurrent ? "border-sky-500 border-2" : "")} style={{ height: `${size}px` }}>
        <img className={"object-cover"} src={img.thumbnailUrl} alt={img.caption.value}></img>
      </div>
      <div className="flex justify-center text-sm pt-2">
        <p className="overflow-ellipsis max-w-[128px] overflow-hidden whitespace-nowrap">{img.fileName}</p>
      </div>
    </div>
  )
}
