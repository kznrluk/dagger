import {DaggerImage} from "@/domain/data";

export interface ProjectFileProps {
  handleOpenImage: (daggerImage: DaggerImage) => void
  currentImage: DaggerImage|null
  images: DaggerImage[]
}

export default function ProjectFile(props: ProjectFileProps) {
  const imageCards = props.images.map((i, n) => (
    <ImageCard img={i} isCurrent={i.url === props.currentImage?.url} handler={props.handleOpenImage} key={i.realPath + n}></ImageCard>
  ))

  return (
    <div className="flex flex-col select-none w-auto">
      <div>
        <input className="bg-slate-900 p-1" placeholder="filter..."></input>
      </div>
      <div className="flex flex-col">
        {imageCards}
      </div>
    </div>
  )
}

export function ImageCard({img, handler, isCurrent}: { img: DaggerImage, isCurrent: boolean, handler: (img: DaggerImage) => void }) {
  const cls = isCurrent ?
    "flex flexcontent-center h-16 bg-slate-700 overflow-hidden" : "flex flexcontent-center h-16 bg-slate-900 overflow-hidden hover:bg-slate-800"

  return (
    <button onClick={() => handler(img)} className={cls}>
      <div className="flex justify-center w-16 h-16 p-1 overflow-hidden">
        <img className="w-16 object-center object-cover" src={img.url} alt={img.caption.value}></img>
      </div>
      <div className=" overflow-ellipsis text-left text-sm pt-1">
        <p className="p-0.5 w-52 overflow-ellipsis overflow-hidden">{img.isLoaded ? img.fileName : "..."}</p>
      </div>
    </button>
  )
}