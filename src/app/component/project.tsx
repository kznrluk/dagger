import {DaggerImage} from "@/domain/data";

export interface ProjectFileProps {
  handleOpenImage: (daggerImage: DaggerImage|null) => void
  selectedImages: DaggerImage[]
  currentImages: DaggerImage[]
  searchTags: string[]
  ignoreTags: string[]

  images: DaggerImage[]
}

export default function ProjectFile(props: ProjectFileProps) {
  const imageCards = props.images.map((i, n) => {
    const shouldShow = props.currentImages.some(c => c.fileName === i.fileName)

    return (
      <ImageCard
        img={i}
        isCurrent={props.selectedImages.some(c => c.fileName === i.fileName)}
        handler={props.handleOpenImage}
        key={i.realPath + n}
        visible={shouldShow}
      />
    )
  })

  return (
    <div className="flex flex-col select-none w-auto p-5">
      <div className="flex flex-wrap gap-3" onMouseDown={() => props.handleOpenImage(null)}>
        {imageCards}
      </div>
    </div>
  )
}

export function ImageListCard({img, handler, isCurrent, visible}: {
  img: DaggerImage,
  isCurrent: boolean,
  handler: (img: DaggerImage) => void
  visible: boolean
}) {
  const clsBase = "flex flexcontent-center h-16 overflow-hidden"

  const cls = !visible ? "hidden" : clsBase +
    isCurrent
    ? "bg-slate-700"
    : "bg-slate-900 hover:bg-slate-800"

  return (
    <button onClick={() => handler(img)} className={cls}>
      <div className="flex justify-center w-16 h-32 p-1 overflow-hidden">
        <img className="w-16 object-center object-cover" src={img.url} alt={img.caption.value}></img>
      </div>
      <div className=" overflow-ellipsis text-left text-sm pt-1">
      </div>
    </button>
  )
}

export function ImageCard({img, handler, isCurrent, visible}: {
  img: DaggerImage,
  isCurrent: boolean,
  handler: (img: DaggerImage) => void
  visible: boolean
}) {
  const clsBase = "flex flex-col max-w-[256px] overflow-hidden mt-3 hover:bg-slate-800 shrink-0"
  const cls = clsBase +  (visible ? "" : " hidden")

  const imgCls = isCurrent ? "rounded object-contain border-sky-500 border-2" : "rounded object-contain"

  return (
    <div className={cls} onMouseDown={(e) => {e.stopPropagation(); handler(img)}}>
      <div className="flex h-[200px] justify-center p-1 overflow-hidden shrink-0">
        <img className={imgCls} src={img.thumbnailUrl} alt={img.caption.value}></img>
      </div>
      <div className="flex justify-center text-sm pt-2">
        <p className="overflow-ellipsis max-w-[128px] overflow-hidden whitespace-nowrap">{img.fileName}</p>
      </div>
    </div>
  )
}