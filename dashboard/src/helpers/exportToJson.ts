export function exportToJson(data: any) {
    const jsonse = JSON.stringify(data, null, 2); // spacing level = 2
    const blob = new Blob([jsonse], { type: "application/json" });
    return blob;
}