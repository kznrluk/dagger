"use client"

import {open} from '@tauri-apps/api/dialog';
import ProjectFile from "@/app/component/project";
import ImageViewArea from "@/app/component/view";
import ToolBar from "@/app/component/tool";
import {DaggerImage, TagStatistics} from "@/domain/data";
import TagView from "@/app/component/tag";
import {useEffect, useState} from "react";
import {readImageWithCaptionFiles} from "@/util/util";

export default function Home() {
  const [imageList, setImageList] = useState<DaggerImage[]>([])
  const [currentImage, setCurrentImage] = useState<DaggerImage|null>(null)
  const [projectTags, setProjectTags] = useState<TagStatistics[]>([])
  const [loaded, setLoaded] = useState(0)

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


  return (
    <main className="flex font-mono h-screen min-w-screer text-slate-50">
      <div className="flex min-h-screen flex-col w-16 p-1 bg-slate-900 border-slate-800 border-r">
        <ToolBar handleOpenDirectory={handleOpenDirectory}></ToolBar>
      </div>
      <div className="flex min-h-screen flex-col bg-slate-900 w-96 border-r border-black overflow-x-hidden overflow-y-auto">
        <ProjectFile handleOpenImage={handleOpenImage} currentImage={currentImage} images={imageList}></ProjectFile>
      </div>
      <div className="flex min-h-screen flex-col w-full bg-slate-600 overflow-hidden">
        <div className="flex basis-3/5 flex-grow p-2 overflow-hidden">
          <ImageViewArea daggerImage={currentImage}></ImageViewArea>
        </div>
        <div className="flex basis-2/5 overflow-hidden">
          <TagView tagStatistics={projectTags}></TagView>
        </div>
      </div>
    </main>
  )
}

