"use client"

import {open} from '@tauri-apps/api/dialog';
import ProjectFile from "@/app/component/project";
import ImageViewArea from "@/app/component/view";
import ToolBar from "@/app/component/tool";
import {DaggerImage, TagStatistics} from "@/domain/data";
import TagView from "@/app/component/tag";
import {useEffect, useState} from "react";
import {readImageWithCaptionFiles} from "@/util/util";
import {Simulate} from "react-dom/test-utils";

export default function Home() {
  const [imageList, setImageList] = useState<DaggerImage[]>([])
  const [currentImage, setCurrentImage] = useState<DaggerImage | null>(null)
  const [projectTags, setProjectTags] = useState<TagStatistics[]>([])
  const [loaded, setLoaded] = useState(0)
  const [pressingShift, setPressingShift] = useState(false)
  const [searchTags, setSearchTags] = useState<string[]>([])
  const [ignoreTags, setIgnoreTags] = useState<string[]>([])


  const enableTagCloud = true

  useEffect(() => {
    (async () => {
      for (const image of imageList) {
        await image.asyncLoad()
        setLoaded(prevLoaded => prevLoaded + 1)
      }
    })()
  }, [imageList])

  useEffect(() => {
    if (enableTagCloud) {
      const prev: TagStatistics[] = []
      for (const image of imageList) {
        if (!image.isLoaded) {
          continue
        }
        for (const tag of image.caption.asTag()) {
          const tagStat = prev.find(t => t.value() === tag.value())
          if (tagStat) {
            tagStat.increment()
          } else {
            prev.push(new TagStatistics(tag, 1))
          }
        }
        prev.sort((a, b) => b.count() - a.count())
        setProjectTags(prev)
      }
    }
  }, [loaded])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Shift") {
        setPressingShift(true)
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Shift") {
        setPressingShift(false)
      }
    }

    document.onkeyup = handleKeyUp
    document.onkeydown = handleKeyDown
  }, [pressingShift])

  function handleOpenDirectory() {
    open({multiple: true, directory: false})
      .then(str => {
        if (!str) {
          return
        }

        setImageList([])
        if (Array.isArray(str)) {
          readImageWithCaptionFiles(str).then(imageList => {
            setImageList(imageList)
          })
        }
      })
  }

  function handleOpenImage(image: DaggerImage) {
    setCurrentImage(image)
  }

  function handleTagSelect(tag: TagStatistics| null) {
    if (tag === null) {
      setSearchTags([])
      setIgnoreTags([])
      return
    }
    const isSearchTag = searchTags.find(t => t === tag.value())
    const isIgnoreTag = ignoreTags.find(t => t === tag.value())

    if (isSearchTag) {
      setSearchTags(searchTags.filter(t => t !== tag.value()))
      setIgnoreTags([...ignoreTags, tag.value()])
    } else if (isIgnoreTag) {
      setIgnoreTags(ignoreTags.filter(t => t !== tag.value()))
    } else {
      setSearchTags([...searchTags, tag.value()])
    }
  }


  return (
    <main className="flex font-mono h-screen min-w-screer text-slate-50">
      <div className="flex min-h-screen flex-col w-16 p-1 bg-slate-900 border-slate-950 border-r">
        <ToolBar handleOpenDirectory={handleOpenDirectory}></ToolBar>
      </div>
      <div
        className="flex  min-h-screen flex-col bg-slate-900 w-full border-r border-slate-950 overflow-x-hidden overflow-y-hidden">
        <div className="h-3/5 overflow-y-auto overflow-x-hidden">
          <ProjectFile
            handleOpenImage={handleOpenImage}
            currentImage={currentImage}
            images={imageList}
            searchTags={searchTags}
            ignoreTags={ignoreTags}
          ></ProjectFile>
        </div>
        <div className="flex h-2/5 overflow-hidden border-t border-slate-950">
          <TagView tagStatistics={projectTags} searchTags={searchTags} ignoreTags={ignoreTags} handleTagSelect={handleTagSelect}></TagView>
        </div>
      </div>
      <div className="flex min-h-screen w-96 flex-col bg-slate-600 overflow-hidden">
        <div className="flex flex-grow p-2 bg-slate-800 overflow-hidden">
          <ImageViewArea daggerImage={currentImage}></ImageViewArea>
        </div>
      </div>
    </main>
  )
}

