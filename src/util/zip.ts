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

  const dateYYMMDDHHMM = formatDate(new Date());

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'archive-' + dateYYMMDDHHMM + '.zip';
  anchor.click();

  URL.revokeObjectURL(url);
}


function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = ("00" + (date.getMonth() + 1)).slice(-2);
  const d = ("00" + date.getDate()).slice(-2);
  const hh = ("00" + date.getHours()).slice(-2);
  const mm = ("00" + date.getMinutes()).slice(-2);
  return '' + y + m + d + hh + mm;
}