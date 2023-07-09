import {FolderOpenRegular, SaveRegular} from "@fluentui/react-icons";


export default function ToolBar(props: { handleOpenDirectory: () => void }) {
  return (
    <div className="flex flex-col items-center flex-grow pt-2 bg-slate-900 text-slate-300">
      <div className="flex flex-col justify-between">
        <div onClick={props.handleOpenDirectory} className="cursor-pointer pb-2">
          <FolderOpenRegular fontSize={40}/>
        </div>
        <div>
          <SaveRegular fontSize={40} className="cursor-pointer"/>
        </div>
      </div>
    </div>
  )
}