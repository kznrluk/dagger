/**
 * Although it is technically possible to handle text using Tokenizers, the current focus is primarily on training with tags.
 * Therefore, the implementation will be done in TagMode for now.
 */
import {getMimeTypeFromFileName} from "@/util/util";
import {readBinaryFile} from "@tauri-apps/api/fs";
import { v4 as uuidv4 } from 'uuid';

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
        return this.value.split(",").map(t => t.trim()).filter(Boolean).map(t => new Tag(t))
    }

    public deleteTag(tag: Tag) {
        this.value = this.value.split(",").filter(t => t.trim() !== tag.value()).join(",")
    }

    public addTag(str: string) {
        // add tag if it doesn't exist
        if (!this.value.split(",").map(t => t.trim()).includes(str)) {
            this.value = this.value + ", " + str
        }
    }
}

export class DaggerImage implements Exportable {
    public id: string = "";
    public realPath: string;
    public fileName: string = "";
    public blob: Blob | null = null;
    public url: string  = "";
    public thumbnailUrl: string = "";
    public caption = new Caption();
    public isLoaded = false;

    constructor(realPath: string, caption: string = "") {
        this.id = uuidv4();
        this.realPath = realPath;
        const parts = realPath.split(/[\\/]/);
        this.fileName = parts[parts.length - 1];
        this.caption = new Caption(caption);
    }

    static createWithBlob(blob: Blob, fileName: string, caption: string = ""): DaggerImage {
        const image = new DaggerImage("");
        image.blob = blob;
        image.fileName = fileName;
        image.caption = new Caption(caption);
        image.url = URL.createObjectURL(blob);
        return image;
    }

    async asyncLoad() {
        if (this.isLoaded) {
            return;
        }
        this.isLoaded = true;

        if (!this.blob) {
            const binary = await readBinaryFile(this.realPath);
            this.blob = new Blob([binary], {type: getMimeTypeFromFileName(this.fileName)});
            this.url = URL.createObjectURL(this.blob);
        }

        await this.createThumbnail();
    }

    async createThumbnail() {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');

                // Set the canvas size to the size of the thumbnail you want
                const maxSize = 512;
                let width, height;
                if (img.width > img.height) {
                    width = maxSize;
                    height = img.height * (maxSize / img.width);
                } else {
                    height = maxSize;
                    width = img.width * (maxSize / img.height);
                }
                canvas.width = width;
                canvas.height = height;

                // Draw the image onto the canvas, resizing it
                ctx!.drawImage(img, 0, 0, width, height);

                // Get the data URL of the thumbnail image
                this.thumbnailUrl = canvas.toDataURL();

                resolve(true);
            };
            img.onerror = reject;

            img.src = this.url;
        });
    }

    export(): ExportInfo {
        const parts = this.fileName.split('.');
        const ext = parts.length > 1 ? parts[parts.length - 1] : '';

        const name = this.fileName.substring(0, this.fileName.length - ext.length - 1);

        if (!this.blob) {
            throw new Error('Blob is null');
        }

        return {
            imageBlob: this.blob,
            imageFileName: name,
            imageExt: ext,
            caption: this.caption.value,
        };
    }
}

export interface ExportInfo {
    imageBlob: Blob;
    imageFileName: string;
    imageExt: string;
    caption: string;
}

export interface Exportable {
    export(): ExportInfo;
}

