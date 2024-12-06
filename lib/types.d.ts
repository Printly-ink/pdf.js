declare module "pdfjs-build-generic/build/pdf.mjs" {
  const pdfjsLib: any;
  export default pdfjsLib;
}
declare module "pdfjs-build-generic/build/pdf.worker.mjs" {
  export const WorkerMessageHandler: any;
}
declare module "pdfjs-build-generic/web/viewer.mjs" {
  export const PDFViewerApplication: any;
  export const PDFViewerApplicationOptions: any;
  export const PDFViewerApplicationConstants: any;
  export const getViewerConfiguration: any;
}
