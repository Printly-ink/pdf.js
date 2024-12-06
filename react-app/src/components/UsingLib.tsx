"use client";

import { useEffect } from 'react';
import 'pdfjs-build-generic/web/viewer.css';
import 'pdfjs-build-generic/dist/style.css';
import PdfViewer from 'pdfjs-build-generic';

export default function UsingLib() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function loadScript() {
      try {
        const pdfjsLib = await import("pdfjs-build-generic/build/pdf.mjs");
        await import("pdfjs-build-generic/build/pdf.worker.mjs");

        window.pdfjsLib = pdfjsLib;

        const {
          PDFViewerApplication,
          PDFViewerApplicationOptions,
          PDFViewerApplicationConstants,
          getViewerConfiguration
        } = await import("pdfjs-build-generic/web/viewer.mjs");

        window.PDFViewerApplicationOptions = PDFViewerApplicationOptions;
        window.PDFViewerApplicationConstants = PDFViewerApplicationConstants;
        window.getViewerConfiguration = getViewerConfiguration;
        window.PDFViewerApplication = PDFViewerApplication;

        if (!window.PDFViewerApplication) return;

        if (!window.PDFViewerApplication.initialized) {
          const config = getViewerConfiguration();
          const event = new CustomEvent("webviewerloaded", {
            bubbles: true,
            cancelable: true,
            detail: {
              source: window
            }
          });
          try {
            parent.document.dispatchEvent(event);
          } catch (ex) {
            console.error(`webviewerloaded: ${ex}`);
            document.dispatchEvent(event);
          }
          window.PDFViewerApplication.run(config);
        } else {
          const searchParams = new URLSearchParams(window.location.search);
          window.PDFViewerApplication.open({ url: searchParams.get("file") });
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadScript();
  }, []);

  return <PdfViewer />;
}
