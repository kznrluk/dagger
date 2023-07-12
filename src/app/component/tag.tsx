import {TagStatistics} from "@/domain/data";
import {useState} from "react";

interface TagViewProps {
  tagStatistics: TagStatistics[]
  handleTagSelect: (tag: TagStatistics | null) => void
  toggleTaggingMode: (bool: boolean) => void,
  toggleFilterMode: (bool: boolean) => void,
  handleToggleTaggingTags: (tag: TagStatistics) => void,
  isTaggingMode: boolean,
  taggingTags: string[]
  searchTags: string[]
  ignoreTags: string[]
}

export default function TagView(props: TagViewProps) {
  const [tagSearch, setTagSearch] = useState<string>("")
  const filterMode = !props.isTaggingMode

  return (
    <div className="flex flex-col pl-4 w-full pt-2 bg-neutral-800 overflow-hidden select-none">
      <div className="flex pb-2 justify-between">
        <div className="">
          <button className={"" + (filterMode && "border-b border-sky-500")}
                  onClick={() => props.toggleFilterMode(true)}>FILTER BY TAGS
          </button>
          {/*<button className={"ml-4 " + (taggingMode && "border-b border-sky-500")}*/}
          {/*        onClick={() => props.toggleTaggingMode(true)}>CLICK TAGGING*/}
          {/*</button>*/}
        </div>
        <div className="pr-4">
          <input placeholder={"Search"}
                 className={"bg-neutral-900 border-0 pl-1 rounded w-[256px]"}
                 onChange={(e) => setTagSearch(e.target.value)}
                 value={tagSearch}
          />
        </div>
      </div>

      <div className="w-full overflow-y-auto">
        {
          filterMode ?
            <TagCloud tagStatistics={props.tagStatistics.filter((t: TagStatistics) => t.value().includes(tagSearch))}
                      ignoreTags={props.ignoreTags}
                      searchTags={props.searchTags}
                      handleTagSelect={props.handleTagSelect}
            />
            :
            <></>
        }
      </div>

    </div>
  )
}

function TaggingMode(props: {
  tagStatistics: TagStatistics[]
  handleTagSelect: (tag: TagStatistics | null) => void,
}) {
  return (
    <div></div>
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

    let clsName = "flex box-border border rounded-2xl p-1 pl-2 pr-2 m-1 select-none text-sm cursor-pointer hover:bg-neutral-800 "
    if (isSearchTag) {
      clsName += "bg-neutral-700 border-blue-600"
    } else if (isIgnoreTag) {
      clsName += "bg-neutral-700 border-red-500"
    } else {
      clsName += "bg-neutral-900 border-neutral-600"
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
        <div className="relative left-1 flex w-8 justify-center items-center text-xs bg-neutral-800 rounded-full">
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