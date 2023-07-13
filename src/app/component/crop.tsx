import {DaggerImage} from "@/domain/data";
import {PixelCrop, ReactCrop} from "react-image-crop";
import {useRef, useState} from "react";

interface CropViewAreaProps {
  daggerImage: DaggerImage
  handleCancelCrop: () => void
  handleSaveCrop: (image: DaggerImage, from: DaggerImage, asNew: boolean) => void
}

let croppedCount = 0

export default function CropViewArea(props: CropViewAreaProps) {
  const {daggerImage, handleCancelCrop, handleSaveCrop} = props
  const [crop, setCrop] = useState<PixelCrop>();
  const cropImageRef = useRef<HTMLImageElement>(null)

  const buttonCls = "rounded-full p-1 w-[128px] border "

  function handleSaveButtonClick(isNew: boolean) {
    if (cropImageRef.current && crop) {
      const canvas = createCanvas(cropImageRef.current, crop, 0)
      new Promise<Blob | null>((r) => canvas.toBlob(r))
        .then((data) => {
          if (data) {
            // this is a hack to make sure the cropped image has a different name.
            // we should check image have same name in project first. PR or issue is welcome.
            croppedCount++
            const fileName = isNew
              ? daggerImage.fileName.split('.')[0] + `-cropped${croppedCount}.` + daggerImage.fileName.split('.')[1]  // image.jpg -> image-cropped.jpg
              : daggerImage.fileName
            const newImage = DaggerImage.createWithBlob(data, fileName, daggerImage.caption.value)
            handleSaveCrop(newImage, daggerImage, isNew)
          } else {
            alert("Failed to crop image")
            handleCancelCrop()
          }
        })
    }
  }

  return (
    <div className="flex flex-col justify-between w-3/5 h-4/5 p-6 pt-5 rounded bg-neutral-700">
      <div className="flex justify-center items-center h-full w-full p-2 bg-neutral-950 rounded overflow-auto">
        <div className="max-w-[800px]">
          <ReactCrop crop={crop} onChange={setCrop}>
            <img src={daggerImage.url} ref={cropImageRef} alt={daggerImage.caption.value}/>
          </ReactCrop>
        </div>
      </div>
      <div className="flex w-full justify-between pt-3">
        <div>
          <button className={buttonCls + "hover:bg-neutral-800"} onClick={() => handleCancelCrop()}>Cancel</button>
        </div>
        <div className="flex gap-3">
          <button className={buttonCls + "hover:bg-sky-800 bg-sky-600"} onClick={() => handleSaveButtonClick(false)}>Save</button>
          <button className={buttonCls + "hover:bg-sky-800 bg-sky-600"} onClick={() => handleSaveButtonClick(true)}>Save as new</button>
        </div>
      </div>
    </div>
  )
}

const TO_RADIANS = Math.PI / 180

function createCanvas(
  image: HTMLImageElement,
  crop: PixelCrop,
  rotate = 0,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const pixelRatio = window.devicePixelRatio

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  const rotateRads = rotate * TO_RADIANS
  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2

  ctx.save()

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY)
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY)
  // 3) Rotate around the origin
  ctx.rotate(rotateRads)
  // 2) Scale the image
  ctx.scale(1, 1)
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  )

  ctx.restore()
  return canvas;
}