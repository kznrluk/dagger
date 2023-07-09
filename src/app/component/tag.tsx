import {TagStatistics} from "@/domain/data";

interface TagViewProps {
  tagStatistics: TagStatistics[]
}

export default function TagView(props: TagViewProps) {
  return (
    <div className="flex flex-col pl-4 w-full p-2 border-t border-slate-600 bg-slate-800 overflow-hidden">
      <div className="pb-2">
        <button className="border-b border-sky-500">PROJECT TAGS</button>
      </div>
      <div className="w-full overflow-y-auto">
        <TagCloud tagStatistics={props.tagStatistics} selected={false}></TagCloud>
      </div>
    </div>
  )
}

interface TagCloudProps {
  tagStatistics: TagStatistics[]
  selected: boolean
}
function TagCloud(props: TagCloudProps) {
  const tagCloudElm = props.tagStatistics.map((t: TagStatistics) => {
    return (
      <div
        className="flex border border-sky-800 bg-slate-900 rounded-2xl p-1 pl-2 pr-2 m-1 select-none text-sm cursor-pointer hover:bg-slate-800"
        key={t.value()}
      >
        {t.value()}
        <div className="relative left-1 flex w-6 justify-center items-center text-xs bg-slate-800 rounded-full">
          {t.count()}
        </div>
      </div>
    )
  })

  return (
    <div className="flex flex-wrap">
      {tagCloudElm}
    </div>
  )
}