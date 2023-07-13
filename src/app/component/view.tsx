import {DaggerImage, Tag} from "@/domain/data";
import {DismissRegular} from "@fluentui/react-icons";
import {useForm} from "react-hook-form";

interface ImageViewAreaProps {
  daggerImages: DaggerImage[]
  handleDeleteTagFromImage: (images: DaggerImage[]) => (tag: Tag) => void
  handleAddTagToImage: (images: DaggerImage[]) => (tag: string) => void
}

export default function ImageViewArea(props: ImageViewAreaProps) {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data: any) => {
    console.log(data)
    if (data.newTag) {
      if (data.newTag.includes(',')) {
        alert("Comma is not allowed in tags!");
        return;
      }

      props.handleAddTagToImage(images)(data.newTag);
      reset();
    }
  };

  if (props.daggerImages.length === 0) {
    return <Promotion></Promotion>
  }
  const isSingleImage = props.daggerImages.length === 1
  const images = props.daggerImages
  const image = props.daggerImages[0]
  const commonTags = images.map(i => i.caption.asTag()).reduce((prev, curr) => prev.filter(e => curr.some(f => f.value() === e.value())))

  const tagComponents = commonTags.map((tag, i) => (
    <TagSelector handleDeleteTagFromImage={props.handleDeleteTagFromImage(images)} selected={true} tag={tag} key={image.realPath + tag.value() + i} />
  ))

  const imageName = isSingleImage ? image.fileName : `${props.daggerImages.length} images selected`

  return (
    <div className="w-full h-full flex flex-col p-2 bg-neutral-800">
      <div className={"flex justify-center h-[380px] w-full shrink-0 " + (isSingleImage ? "" : "items-center")}>
        {
          props.daggerImages.map((image, i, l) => {
            const degrees = isSingleImage ? [0] : [9];
            const randomDegree = degrees[Math.floor(Math.random() * degrees.length)];
            const translateY = isSingleImage ? [0] : [Math.min(i * 5, 20) - 10];
            const translateX = isSingleImage ? [0] : [Math.min(i * 5, 20) - 10];
            if (i > 30 && i !== l.length - 1) {
              return null
            }
            return (
              <img className={isSingleImage ? "object-contain" : "rounded absolute max-w-[200px] max-h-[200px]"}
                   style={{transform: `rotate(${randomDegree}deg) translate(${translateY}px, ${translateX}px)`}}
                   src={isSingleImage ? image.url : image.thumbnailUrl} alt={image.caption.value}
                   key={image.fileName + i}
              />
            )
          }).filter(Boolean)
        }
      </div>

      <input className="mt-6 bg-neutral-900 border-neutral-950 rounded border p-2 text-sm cursor-text overflow-x-auto" value={imageName} disabled={true}></input>

      <div className="mt-6 rounded border bg-neutral-900 border-neutral-950 h-full flex-col overflow-hidden flex gap-2">
        <div className="w-full p-2 rounded-xl bg-neutral-900 h-full flex flex-col overflow-y-auto">
          <div className="flex flex-grow h-full flex-wrap content-start">
            {tagComponents}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="pt-4">
            <input
              {...register("newTag")}
              className="bg-neutral-700 rounded h-9 w-full pl-3"
              placeholder="add new tag..."
            />
            <input type="submit" style={{display: 'none'}} />
          </form>
        </div>
      </div>
    </div>
  )
}

export function TagSelector(props: { tag: Tag, selected: boolean, handleDeleteTagFromImage: (tag: Tag) => void }) {
  let className = "flex border bg-neutral-900 border-neutral-600 rounded-2xl p-1 pl-2 pr-2 m-1 select-none text-sm cursor-pointer hover:bg-neutral-800"
  if (props.selected) {
    className += " "
  }

  return(
    <div className={className}>
      {props.tag.value()}
      <div
        onClick={() => {
          props.handleDeleteTagFromImage(props.tag)
        }}
        className="relative left-1 flex w-5 justify-center items-center text-xs bg-neutral-800 rounded-full hover:bg-red-500"
      >
        <DismissRegular></DismissRegular>
      </div>
    </div>
  )
}

export function Promotion() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-10 bg-gradient-to-r w-full text-white rounded-md">
      <div className="text-3xl font-bold animate-pulse text-center">Dagger️</div>
      <div>🗡️</div>
      <div className="text-xl">
        <p>To get started, open an image and its corresponding caption file using the file icon. </p>
        <p>The caption file should have the same name as the image.</p>
      </div>
      <div className="text-lg">
        <p>Give us a star on GitHub!</p>
        <a href="https://github.com/kznrluk/dagger" target="_blank" className="underline text-yellow-300 hover:text-yellow-500 transition duration-300 ease-in-out">kznrluk/dagger</a>
      </div>
      <div className="text-lg">
        <p>We welcome your contributions and feedback. Please feel free to submit issues and pull requests on our GitHub repository.</p>
      </div>
      <div className="flex flex-col gap-2 text-center">
        <ShortcutIcon name="CTRL + Click" description="Select multiple" />
        <ShortcutIcon name="SHIFT + Click" description="Select in a row" />
        <ShortcutIcon name="CTRL + A" description="Select all" />
      </div>
    </div>
  )
}

export function ShortcutIcon(props: { name: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center border border-white rounded p-2">
      <p className="font-bold">{props.name}</p>
      <p>{props.description}</p>
    </div>
  )
}
