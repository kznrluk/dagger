import {FolderRegular, SaveRegular} from "@fluentui/react-icons";
import Image from "next/image";
import {Tooltip} from "react-tooltip";

export default function ToolBar(props: { handleOpenDirectory: () => void, handleSaveAsZip: () => void }) {
  return (
    <div className="flex flex-col items-center justify-between flex-grow pt-2 text-neutral-300">
      <Tooltip id="tooltip_tb" place="right"/>
      <div className="flex flex-col justify-between gap-3">
        <div
          data-tooltip-id="tooltip_tb"
          data-tooltip-content="Open Files"
          onClick={props.handleOpenDirectory}
          className="cursor-pointer rounded hover:bg-neutral-700"
        >
          <FolderRegular fontSize={34}/>
        </div>
        <div
          data-tooltip-id="tooltip_tb"
          data-tooltip-content="Save Selected Images"
          onClick={() => props.handleSaveAsZip()}
          className="cursor-pointer rounded hover:bg-neutral-700"
        >
          <SaveRegular fontSize={34}/>
        </div>
      </div>
      <div className="flex flex-col mb-2 text-neutral-300 items-center">
        <div
          data-tooltip-id="tooltip_tb"
          data-tooltip-content="Star Me!"
          className="cursor-pointer rounded p-1 hover:bg-neutral-700"
        >
          <Image src="github-mark-white.png" alt="github" width="32" height="32"
                 onClick={() => window.open("https://github.com/kznrluk/dagger", "_blank")}
          />
        </div>
      </div>
    </div>
  )
}
