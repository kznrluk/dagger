import {DaggerImage} from "@/domain/data";
import {readTextFile} from "@tauri-apps/api/fs";
import path from "path";

const IMAGE_FILE_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
const CAPTION_FILE_EXT = ['.txt', '.caption']

export function isImageFile(path: string): boolean {
  return IMAGE_FILE_EXT.some(ext => path.endsWith(ext) || path.endsWith(ext.toUpperCase()))
}

export function isCaptionFile(path: string): boolean {
  return CAPTION_FILE_EXT.some(ext => path.endsWith(ext) || path.endsWith(ext.toUpperCase()))
}

export function findCaptionFileByImageName(imageName: string, captionFileNames: File[]): File | undefined {
  const fileNameWithoutExt = imageName.substring(0, imageName.lastIndexOf('.'))
  return captionFileNames.find(file => file.name.startsWith(fileNameWithoutExt))
}

export async function readImageWithCaptionFiles(paths: string[]): Promise<DaggerImage[]> {
  const filteredPaths = paths.filter(path => IMAGE_FILE_EXT.some(ext => path.endsWith(ext)))

  const imageList: DaggerImage[] = []
  for (const imagePath of filteredPaths) {
    const caption = await searchCaptionFile(imagePath)
    imageList.push(new DaggerImage(imagePath, caption))
  }

  return imageList
}

export async function searchCaptionFile(imagePath: string): Promise<string> {
  const dir = path.dirname(imagePath)
  const fileName = path.basename(imagePath)
  const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))

  for (const ext of CAPTION_FILE_EXT) {
    const captionFilePath = path.join(dir, fileNameWithoutExt + ext)
    try {
      const text = await readTextFile(captionFilePath)
      if (text !== undefined) {
        return text
      }
    } catch (e) {
      // file not found
    }
  }

  return ""
}

export function getMimeTypeFromFileName(fileName: string): string {
  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  if (IMAGE_FILE_EXT.includes(fileExt)) {
    switch (fileExt) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      case '.bmp':
        return 'image/bmp';
      case '.svg':
        return 'image/svg+xml';
    }
  }

  return '';
}
