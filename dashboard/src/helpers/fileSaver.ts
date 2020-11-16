export function saveBlob(blob: Blob, filename: string) {
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);

        link.setAttribute('visibility', 'hidden');
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}