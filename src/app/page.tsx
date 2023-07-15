"use client"

import {open} from '@tauri-apps/api/dialog';
import ProjectFile from "@/app/component/project";
import ImageViewArea from "@/app/component/view";
import ToolBar from "@/app/component/tool";
import {DaggerImage, Tag, TagStatistics} from "@/domain/data";
import 'react-image-crop/dist/ReactCrop.css';
import TagView from "@/app/component/tag";
import {useCallback, useEffect, useState} from "react";
import {
  findCaptionFileByImageName,
  isCaptionFile,
  isImageFile,
  readImageWithCaptionFiles
} from "@/util/util";
import {downloadAsZip} from "@/util/zip";
import Split from "react-split";
import CropViewArea from "@/app/component/crop";
import {useDropzone} from "react-dropzone";

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
  const [inCropMode, setInCropMode] = useState<DaggerImage | null>(null)
  const [lastLoadedImage, setLastLoadedImage] = useState<DaggerImage | null>(null)


  const enableTagCloud = true

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', (event) => {
        if (changed) {
          event.preventDefault();
          event.returnValue = '';
        }
      })
      window.addEventListener('blur', () => {
        setCtrlMode(false)
        setShiftMode(false)
      })
    }
  }, [changed]);

  useEffect(() => {
    const loadingImages = projectImages.filter(image => !image.isLoaded)
    const loadedImage = projectImages.filter(image => image.isLoaded)

    for (const image of loadingImages) {
      if (!image.isLoaded) {
        image.asyncLoad().then(() => {
          setLastLoadedImage(image)
        })
      }
    }

    setLoaded(() => loadedImage.length)
  }, [loaded, projectImages, lastLoadedImage])

  useEffect(() => {
    if (projectImages.length === 0) {
      setProjectTags([])
    }

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
      if (e.key === "Delete") {
        handleDeleteImageFromProject(selectedImages)
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
    if (showImages.length !== 0) {
      setSelectedImages([showImages[0]])
    }
  }, [searchTags, ignoreTags, projectImages])

  function handleOpenDirectory() {
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
          handleFileOpen(files)
        })
    }
  }

  async function handleFileOpen(files: File[]) {
    const imageFiles = files.filter(f => isImageFile(f.name))
    const captionFiles = files.filter(f => isCaptionFile(f.name))
    const isFileNameConflict = projectImages.filter(image => imageFiles.some(f => f.name === image.fileName))
    if (isFileNameConflict.length !== 0) {
      if (!confirm("Same file name exists in the project. Are you sure to overwrite?")) {
        return
      } else {
        setProjectImages(projectImages.filter(image => !isFileNameConflict.includes(image)))
      }
    }

    const daggerImages: DaggerImage[] = []
    for (const imageFile of imageFiles) {
      const captionFile = findCaptionFileByImageName(imageFile.name, captionFiles)
      let caption = ""
      if (captionFile) {
        caption = await readFileAsText(captionFile)
      }

      daggerImages.push(DaggerImage.createWithBlob(imageFile, imageFile.name, caption))
    }

    setProjectImages(prev => [...prev, ...daggerImages])
  }


  function handleOpenImage(image: DaggerImage | null) {
    if ((shiftMode || ctrlMode) && !image) {
      return;
    }

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
      setSearchTags(searchTags.filter(t => t !== tag.value()))
      if (ctrlMode) {
        setIgnoreTags([...ignoreTags, tag.value()])
        return
      }
    } else if (isIgnoreTag) {
      setIgnoreTags(ignoreTags.filter(t => t !== tag.value()))
    } else {
      if (ctrlMode) {
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

      setChanged(true)
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
    await downloadAsZip(selectedImages.length === 0 ? projectImages : selectedImages)
    setChanged(false)
  }

  function handleDeleteTagFromProject(tag: TagStatistics) {
    if (tag.count() >= 2) {
      if (!confirm(`Delete tag ` + `"${tag.value()}" from ${tag.count()} images ?`)) {
        return
      }
    }

    setProjectImages((prev) => {
      return prev.map(i => {
        i.caption.deleteTag(tag.getTag())
        return i
      })
    })
    setSearchTags(searchTags.filter(t => t !== tag.value()))
    setChanged(true)
  }

  function handleSaveCrop(image: DaggerImage, from: DaggerImage, asNew: boolean) {
    setInCropMode(null)
    setChanged(true)

    if (asNew) {
      // insert new image after current image
      const index = projectImages.findIndex(i => i.fileName === from.fileName)
      console.log(index)
      setProjectImages((prev) => {
        const newImages = [...prev]
        newImages.splice(index + 1, 0, image)
        return newImages
      })
    } else {
      // replace current image
      setProjectImages((prev) => {
        const newImages = [...prev]
        const index = prev.findIndex(i => i.fileName === from.fileName)
        newImages[index] = image
        return newImages
      })
      setLoaded((prev) => prev - 1)
    }

    setSelectedImages([image])
  }

  function handleDeleteImageFromProject(images: DaggerImage[]) {
    if (images.length > 1 && !confirm(`Remove ${images.length} images from project?`)) return
    setProjectImages((prev) => {
      return prev.filter(i => images.find(img => img.id === i.id) === undefined)
    })
    setLoaded(prevLoaded => prevLoaded - images.length)
    setSelectedImages([])
    setChanged(true)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileOpen(acceptedFiles)
  }, []);

  const {getRootProps, getInputProps} = useDropzone({onDrop, noClick: true});

  const overlayBaseCls = "flex justify-center items-center absolute h-screen w-screen bg-neutral-900 bg-opacity-70 z-10 p-10"
  return (
    <main className="flex font-mono h-screen min-w-screer text-neutral-50 select-none">
      <div
        className={overlayBaseCls + (loaded !== projectImages.length ? "" : " hidden")}>
        <div className="flex flex-col w-2/5 h-24 p-6 pt-5 rounded bg-neutral-800">
          <p>{loaded} / {projectImages.length}</p>
          <progress className="w-full h-3 rounded-full mt-2" max={projectImages.length} value={loaded}></progress>
        </div>
      </div>

      <div className={overlayBaseCls + (inCropMode ? "" : " hidden")}>
        {
          inCropMode &&
            <CropViewArea
                daggerImage={inCropMode}
                handleCancelCrop={() => setInCropMode(null)}
                handleSaveCrop={handleSaveCrop}
            />
        }
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
            <ul className="overflow-y-auto overflow-x-hidden" {...getRootProps()}>
              <input {...getInputProps()} />
              <ProjectFile handleOpenImage={handleOpenImage}
                           selectedImages={selectedImages}
                           currentImages={currentImages}
                           images={projectImages}
                           searchTags={searchTags}
                           ignoreTags={ignoreTags}
                           shiftMode={shiftMode}
                           ctrlMode={ctrlMode}
                           setCtrlMode={setCtrlMode}
                           setShiftMode={setShiftMode}
                           handleRemoveTagFromFilter={handleRemoveTagFromFilter}
              />
            </ul>
            <ul className="flex overflow-hidden">
              <TagView tagStatistics={projectTags}
                       toggleFilterMode={() => setTaggingMode(false)}
                       handleToggleTaggingTags={handleToggleTaggingTags}
                       searchTags={searchTags}
                       ignoreTags={ignoreTags}
                       ctrlMode={ctrlMode}
                       handleTagSelect={handleTagSelect}
                       toggleTaggingMode={handleToggleTaggingMode}
                       isTaggingMode={taggingMode}
                       taggingTags={taggingTags}
                       handleDeleteTagFromProject={handleDeleteTagFromProject}
              />
            </ul>
          </Split>
        </ul>
        <ul>
          <div className="flex h-screen w-full flex-col bg-neutral-800 overflow-y-auto">
            <ImageViewArea daggerImages={selectedImages}
                           handleDeleteTagFromImage={handleDeleteTagFromImage}
                           handleAddTagToImage={handleAddTagToImage}
                           setInCropMode={(img) => setInCropMode(img)}
                           handleDeleteImageFromProject={handleDeleteImageFromProject}
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