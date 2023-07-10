import {DaggerImage, Tag} from "@/domain/data";

interface ImageViewAreaProps {
  daggerImage: DaggerImage|null
}
export default function ImageViewArea(props: ImageViewAreaProps) {
  if (!props.daggerImage) {
    return <div className="p-5">😎</div>
  }
  const image = props.daggerImage
  const tags = image.caption.asTag()

  const tagElm = tags.map(tag=> (
    <TagSelector selected={true} tag={tag} key={tag.value()} />
  ))

  return (
    <div className="w-full h-full flex flex-col p-2 bg-slate-800">
      <div className="max-h-2/3 flex justify-center overflow-hidden">
        <img className="object-contain rounded" src={image.url} alt={image.caption.value} />
      </div>

      <input className="mt-6 bg-slate-900 border-slate-950 rounded border p-2 text-sm" placeholder={image.fileName} disabled={true}></input>

      <div className="mt-6 rounded border bg-slate-900 border-slate-950 h-full flex-col overflow-hidden flex gap-2">
        <div className="w-full p-2 rounded-xl bg-slate-900 h-full flex flex-col overflow-y-auto">
          <div className="flex flex-grow h-full flex-wrap content-start">
            {tagElm}
          </div>
          <div className="bg-slate-700 h-9 rounded overflow-hidden bottom-0">
            <input className="bg-slate-700 h-8 pl-4" placeholder="add new tag..." />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TagSelector(props: { tag: Tag, selected: boolean }) {
  let className = "flex border border-sky-800 bg-slate-900 rounded-2xl p-1 pl-2 pr-2 m-1 select-none text-sm cursor-pointer hover:bg-slate-800"
  if (props.selected) {
    className += " border border-sky-700"
  }
  return(
    <div className={className}>
      {props.tag.value()}
    </div>
  )
}