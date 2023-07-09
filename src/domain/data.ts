/**
 * Although it is technically possible to handle text using Tokenizers, the current focus is primarily on training with tags.
 * Therefore, the implementation will be done in TagMode for now.
 */
import {getMimeTypeFromFileName, searchCaptionFile} from "@/util/util";
import {readBinaryFile} from "@tauri-apps/api/fs";

export class TagStatistics {
    private tag: Tag
    private ct: number

    constructor(tag: Tag, count: number) {
        this.tag = tag
        this.ct = count
    }

    increment() {
        this.ct++
    }

    decrement() {
        this.ct--
    }

    count(): number {
        return this.ct
    }

    value() {
        return this.tag.value()
    }
}

export class Tag {
    constructor(private val :string) {
    }

    public value() {
        return this.val
    }
}

export class Caption {
    public value = ""

    constructor(text: string = "") {
        this.value = text
    }

    public asTag() {
        return this.value.split(",").map(t => new Tag(t.trim()))
    }
}

export class DaggerImage {
    public realPath: string
    public fileName: string = ""
    public blob: Blob | null = null
    public url: string  = ""
    public caption = new Caption()
    public isLoaded = false

    constructor(realPath: string) {
        this.realPath = realPath
        const parts = realPath.split(/[\\/]/);
        this.fileName = parts[parts.length - 1]
    }

    async asyncLoad() {
        if (this.isLoaded) {
            return
        }

        const binary = await readBinaryFile(this.realPath)
        this.blob = new Blob([binary], {type: getMimeTypeFromFileName(this.fileName)})
        this.url = URL.createObjectURL(this.blob)
        const caption = await searchCaptionFile(this.realPath)
        this.caption = new Caption(caption)
        this.isLoaded = true
    }
}
