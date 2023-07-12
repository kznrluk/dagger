"use client"

import {open} from '@tauri-apps/api/dialog';
import ProjectFile from "@/app/component/project";
import ImageViewArea from "@/app/component/view";
import ToolBar from "@/app/component/tool";
import {DaggerImage, Tag, TagStatistics} from "@/domain/data";
import TagView from "@/app/component/tag";
import {useEffect, useState} from "react";
import {
  findCaptionFileByImageName,
  isCaptionFile,
  isImageFile,
  readImageWithCaptionFiles
} from "@/util/util";
import {downloadAsZip} from "@/util/zip";
import Split from "react-split";

export default function Home() {
  const [projectImages, setProjectImages] = useState<DaggerImage[]>([])
  const [currentImages, setCurrentImages] = useState<DaggerImage[]>([])
  const [selectedImages, setSelectedImages] = useState<DaggerImage[]>([])
  const [projectTags, setProjectTags] = useState<TagStatistics[]>([])
  const [loaded, setLoaded] = useState(0)
  const [shiftMode, setShiftMode] = useState(false)
  const [lastClickedImage, setLastClickedImage] = useState<DaggerImage | null>(null)
  const [ctrlMode, setCtrlMode] = useState(false)
  const [taggingMode, setTaggingMode] = useState(false)
  const [taggingTags, setTaggingTags] = useState<string[]>([])
  const [searchTags, setSearchTags] = useState<string[]>([])
  const [ignoreTags, setIgnoreTags] = useState<string[]>([])
  const [changed, setChanged] = useState(false)

  const enableTagCloud = true

  window.addEventListener('beforeunload', (event) => {
    if (changed) {
      event.preventDefault();
      event.returnValue = '';
    }
  })

  useEffect(() => {
    for (const image of projectImages) {
      if (!image.isLoaded) {
        image.asyncLoad().then(() => {
          setLoaded(prevLoaded => prevLoaded + 1)
        })
      }
    }
  }, [projectImages])

  useEffect(() => {
    if (!enableTagCloud || loaded !== projectImages.length) {
      return
    }

    const prev: TagStatistics[] = []
    for (const image of projectImages) {
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
  }, [loaded, projectImages])


  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Shift") {
        if (!lastClickedImage) {
          setLastClickedImage(selectedImages[selectedImages.length - 1])
        }
        setShiftMode(true)
      }
      if (e.key === "Control") {
        setCtrlMode(true)
      }
      if (e.key === "a" && ctrlMode) {
        e.stopPropagation()
        setSelectedImages(currentImages)
      }
      if (e.key === "Enter") {
        // e.stopPropagation()
        // if (inputRef.current) {
        //   inputRef.current.focus()
        // }
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Shift") {
        setShiftMode(false)
      }
      if (e.key === "Control") {
        setCtrlMode(false)
      }
    }

    document.onkeyup = handleKeyUp
    document.onkeydown = handleKeyDown
  }, [shiftMode, ctrlMode, selectedImages])

  useEffect(() => {
    const anySelectedTags = searchTags.length !== 0 || ignoreTags.length !== 0
    if (!anySelectedTags) {
      setCurrentImages(projectImages)
      return
    }

    const showImages: DaggerImage[] = []
    for (const image of projectImages) {
      const isSearchTarget = searchTags.every(t => image.caption.asTag().find(tag => tag.value() === t))
      const isIgnoreTarget = ignoreTags.some(t => image.caption.asTag().find(tag => tag.value() === t))
      const shouldShow = (isSearchTarget && !isIgnoreTarget)

      if (shouldShow) {
        showImages.push(image)
      }
    }
    setCurrentImages(showImages)
  }, [searchTags, ignoreTags, projectImages])

  function handleOpenDirectory() {
    if (changed) {
      if (!confirm("Changes are lost when a new folder is opened. Are you sure?")) {
        return
      }
    }

    // @ts-ignore
    if (window.__TAURI_IPC__) {
      open({multiple: true, directory: false})
        .then(str => {
          if (!str) return
          if (Array.isArray(str)) {
            readImageWithCaptionFiles(str).then(imageList => {
              setProjectImages(imageList)
            })
          }
        })
    } else {
      directoryOpen()
        .then(async (files) => {
            setProjectImages([])
            setSelectedImages([])
            setLoaded(0)
            const imageFiles = files.filter(f => isImageFile(f.name))
            const captionFiles = files.filter(f => isCaptionFile(f.name))

            const daggerImages: DaggerImage[] = []
            for (const imageFile of imageFiles) {
              const captionFile = findCaptionFileByImageName(imageFile.name, captionFiles)
              let caption = ""
              if (captionFile) {
                caption = await readFileAsText(captionFile)
              }

              daggerImages.push(DaggerImage.createWithBlob(imageFile, imageFile.name, caption))
            }

            setProjectImages(daggerImages)
          }
        )
    }
  }

  function handleOpenImage(image: DaggerImage | null) {
    if (!image) {
      setSelectedImages([])
      return
    }

    if (ctrlMode) {
      if (selectedImages.find(i => i === image)) {
        setSelectedImages(selectedImages.filter(i => i !== image))
      } else {
        setSelectedImages([...selectedImages, image])
      }
    } else {
      setSelectedImages([image])
    }

    if (lastClickedImage && shiftMode) {
      const startIndex = projectImages.findIndex(i => i === lastClickedImage)
      const endIndex = projectImages.findIndex(i => i === image)
      const newCurrentImages = projectImages.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
      setSelectedImages(newCurrentImages.filter(i => currentImages.find(s => s === i)))
    } else {
      setLastClickedImage(image)
    }
  }

  function handleTagSelect(tag: TagStatistics | null) {
    if (tag === null) {
      setSearchTags([])
      setIgnoreTags([])
      return
    }
    const isSearchTag = searchTags.find(t => t === tag.value())
    const isIgnoreTag = ignoreTags.find(t => t === tag.value())

    if (isSearchTag) {
      if (shiftMode) {
        setSearchTags(searchTags.filter(t => t !== tag.value()))
        return
      }
      setSearchTags(searchTags.filter(t => t !== tag.value()))
      setIgnoreTags([...ignoreTags, tag.value()])
    } else if (isIgnoreTag) {
      setIgnoreTags(ignoreTags.filter(t => t !== tag.value()))
    } else {
      if (shiftMode) {
        setIgnoreTags([...ignoreTags, tag.value()])
        return
      }
      setSearchTags([...searchTags, tag.value()])
    }
  }

  function handleRemoveTagFromFilter(tag: string) {
    const isSearchTag = searchTags.find(t => t === tag)
    const isIgnoreTag = ignoreTags.find(t => t === tag)

    if (isSearchTag) {
      setSearchTags(searchTags.filter(t => t !== tag))
    } else if (isIgnoreTag) {
      setIgnoreTags(ignoreTags.filter(t => t !== tag))
    }
  }

  function handleDeleteTagFromImage(images: DaggerImage[]) {
    return (tag: Tag) => {
      setProjectImages((prev) => {
        return prev.map(i => {
          if (images.find(img => img === i)) {
            i.caption.deleteTag(tag)
          }
          return i
        })
      })

      if (searchTags.includes(tag.value())) {
        setSearchTags(searchTags.filter(t => t !== tag.value()))
      }
    }
  }


  function handleAddTagToImage(images: DaggerImage[]) {
    return (tag: string) => {
      for (const image of images) {
        image.caption.addTag(tag)
      }
      setProjectImages([...projectImages])
      setChanged(true)
    }
  }

  function handleToggleTaggingMode(bool: boolean) {
    setTaggingMode(bool)
    // toggleFilterMode(!bool)
  }

  function handleToggleTaggingTags(tag: TagStatistics) {
    if (taggingTags.includes(tag.value())) {
      setTaggingTags(taggingTags.filter(t => t !== tag.value()))
    } else {
      setTaggingTags([...taggingTags, tag.value()])
    }
  }

  async function handleFileSaveAsZip() {
    await downloadAsZip(projectImages)
    setChanged(false)
  }

  return (
    <main className="flex font-mono h-screen min-w-screer text-neutral-50 select-none">
      <div
        className={"flex justify-center items-center absolute h-screen w-screen" + (loaded !== projectImages.length ? "" : " hidden")}>
        <div className="flex flex-col w-2/5 h-24 p-6 pt-5 rounded bg-neutral-800">
          <p>{loaded} / {projectImages.length}</p>
          <progress className="w-full h-3 rounded-full mt-2" max={projectImages.length} value={loaded}></progress>
        </div>
      </div>

      <div className="flex min-h-screen flex-col w-[48px] p-1 bg-neutral-800 border-neutral-950 border-r">
        <ToolBar handleOpenDirectory={handleOpenDirectory} handleSaveAsZip={handleFileSaveAsZip}></ToolBar>
      </div>

      <Split
        className={"flex min-h-screen bg-neutral-900 w-full"}
        direction={"horizontal"}
        sizes={[80, 20]}
        gutter={() => {
          const gutter = document.createElement("div")
          gutter.className = "h-full w-2 border-l border-neutral-900 bg-neutral-800 cursor-col-resize"
          return gutter
        }}
        gutterStyle={() => ({})}
      >
        <ul>
          <Split
            className={"flex h-screen flex-col bg-neutral-900 w-full border-r border-neutral-950 overflow-x-hidden overflow-y-hidden"}
            direction={"vertical"}
            sizes={[75, 35]}
            gutter={() => {
              const gutter = document.createElement("div")
              gutter.className = "w-full h-2 border-b border-neutral-950 cursor-row-resize"
              return gutter
            }}
            gutterStyle={() => ({})}
          >
            <ul className="overflow-y-auto overflow-x-hidden">
              <ProjectFile handleOpenImage={handleOpenImage}
                           selectedImages={selectedImages}
                           currentImages={currentImages}
                           images={projectImages}
                           searchTags={searchTags}
                           ignoreTags={ignoreTags}
                           handleRemoveTagFromFilter={handleRemoveTagFromFilter}
              />
            </ul>
            <ul className="flex overflow-hidden">
              <TagView tagStatistics={projectTags}
                       toggleFilterMode={() => setTaggingMode(false)}
                       handleToggleTaggingTags={handleToggleTaggingTags}
                       searchTags={searchTags}
                       ignoreTags={ignoreTags}
                       handleTagSelect={handleTagSelect}
                       toggleTaggingMode={handleToggleTaggingMode}
                       isTaggingMode={taggingMode}
                       taggingTags={taggingTags}
              />
            </ul>
          </Split>
        </ul>
        <ul>
          <div className="flex h-screen w-full flex-col bg-neutral-800 overflow-y-scroll">
            <ImageViewArea daggerImages={selectedImages}
                           handleDeleteTagFromImage={handleDeleteTagFromImage}
                           handleAddTagToImage={handleAddTagToImage}
            />
          </div>
        </ul>
      </Split>
    </main>
  )
}

function directoryOpen(): Promise<File[]> {
  return new Promise((resolve) => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.multiple = true;

    inputElement.addEventListener('change', () => {
      if (!inputElement.files) {
        resolve([])
        return
      }

      let files: File[] = []
      for (let i = 0; i < inputElement.files.length; i++) {
        const file = inputElement.files[i];
        files.push(file)
      }

      resolve(files)
    });

    inputElement.click();
  })
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => resolve(event.target!.result as string);
    reader.onerror = error => reject(error);

    reader.readAsText(file);
  });
}