import JSZip from 'jszip';
import {Exportable} from "@/domain/data";
export async function downloadAsZip(exportables: Exportable[]): Promise<void> {
  const zip = new JSZip();

  exportables.forEach((exportable, index) => {
    const { imageBlob, imageFileName, imageExt, caption } = exportable.export();
    const fileName = imageFileName || `image${index}`;

    zip.file(`${fileName}.${imageExt}`, imageBlob);
    zip.file(`${fileName}.txt`, caption);
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);

  const dateYYMMDDHHMM = new Date().toISOString().replace(/[-:]/g, '').substring(0, 12);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'archive-' + dateYYMMDDHHMM + '.zip';
  anchor.click();

  URL.revokeObjectURL(url);
}
