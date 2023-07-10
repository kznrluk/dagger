import {TagStatistics} from "@/domain/data";

interface TagViewProps {
  tagStatistics: TagStatistics[]
  handleTagSelect: (tag: TagStatistics|null) => void
  searchTags: string[]
  ignoreTags: string[]
}

export default function TagView(props: TagViewProps) {
  return (
    <div className="flex flex-col pl-4 w-full pt-2 bg-slate-800 overflow-hidden select-none">
      <div className="flex pb-2">
        <div className="">
          <button className="border-b border-sky-500">FILTER BY TAGS</button>
        </div>
      </div>

      <div className="w-full overflow-y-auto">
        <TagCloud tagStatistics={props.tagStatistics} ignoreTags={props.ignoreTags} searchTags={props.searchTags} handleTagSelect={props.handleTagSelect}></TagCloud>
      </div>
    </div>
  )
}

interface TagCloudProps {
  tagStatistics: TagStatistics[]
  handleTagSelect: (tag: TagStatistics | null) => void,
  searchTags: string[]
  ignoreTags: string[]
}

function TagCloud(props: TagCloudProps) {
  const tagCloudElm = props.tagStatistics.map((t: TagStatistics) => {
    const isSearchTag = props.searchTags.includes(t.value())
    const isIgnoreTag = props.ignoreTags.includes(t.value())


    let clsName = "flex box-border border rounded-2xl p-1 pl-2 pr-2 m-1 select-none text-sm cursor-pointer hover:bg-slate-800 "
    if (isSearchTag) {
      clsName += "bg-slate-700 border-blue-600"
    } else if (isIgnoreTag) {
      clsName += "bg-slate-700 border-red-500"
    } else {
      clsName += "bg-slate-900 border-sky-800"
    }

    return (
      <div
        className={clsName}
        key={t.value()}
        onClick={(e) => {
          e.stopPropagation()
          props.handleTagSelect(t)
        }}
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