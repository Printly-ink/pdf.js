"use client"

import React, { useEffect } from "react";
import "pdfjs-build-generic/web/viewer.css";

declare global {
  interface Window {
    PDFViewerApplication: any;
    PDFViewerApplicationConstants: any;
    PDFViewerApplicationOptions: any;
    pdfjsLib: any
    getViewerConfiguration: any;
  }
}

// Hook
export function usePdfViewer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function loadScript() {
      try {
        const pdfjsLib = await import("pdfjs-build-generic/build/pdf.mjs");
        // await import("pdfjs-build-generic/web/locale/locale.json");
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
}

// Containers
export function PdfViewerRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <link rel="resource" type="application/l10n" href="pdfjs-build-generic/web/locale/locale.json" /> */}
      <div
        id="pdfRoot"
        tabIndex={0}
        className="fixed top-0 left-0 w-full h-full bg-white z-50"
      >
        <div id="outerContainer">
          {children}
          <div id="dialogContainer">
            <PasswordDialog />
            <DocumentPropertiesDialog />
            <AltTextDialog />
            <NewAltTextDialog />
            <AltTextSettingsDialog />
            <PrintServiceDialog />
          </div>
          <EditorUndoBar />
        </div>
        <div id="printContainer"></div>
      </div>
    </>
  );
}

export function SidebarContainer({ children }: { children: React.ReactNode }) {
  return (
    <div id="sidebarContainer">
      {children}
      <div id="sidebarResizer" />
    </div>
  )
}

export function MainContainer({ children }: { children: React.ReactNode }) {
  return (
    <div id="mainContainer">
      {children}
    </div>
  )
}

export function ToolbarContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="toolbar">
      <div id="toolbarContainer">
        { children }
      </div>
    </div>
  )
}
interface ToolbarHorizontalGroupProps {
  as?: "div" | "span",
  children: React.ReactNode,
  id?: string,
  className?: string,
  role?: string
  ariaLive?: string
}
export function ToolbarHorizontalGroup({
  as = "div",
  children,
  id,
  className,
  role,
  ariaLive
}: ToolbarHorizontalGroupProps) {
  return (
    React.createElement(
      as,
      { className: `toolbarHorizontalGroup ${className ?? ''}`, id, role, "aria-live": ariaLive },
      children
    )
  )
}

// Sidebar
export function ToolbarSidebar() {
  return (
    <ToolbarHorizontalGroup id="toolbarSidebar">
      <div id="toolbarSidebarLeft">
        <ToolbarHorizontalGroup id="sidebarViewButtons" className="toggled" role="radiogroup">
          <button id="viewThumbnail" className="toolbarButton toggled" type="button" title="Show Thumbnails" tabIndex={0} data-l10n-id="pdfjs-thumbs-button" role="radio" aria-checked="true" aria-controls="thumbnailView">
            <span data-l10n-id="pdfjs-thumbs-button-label">Thumbnails</span>
          </button>
          <button id="viewOutline" className="toolbarButton" type="button" title="Show Document Outline (double-click to expand/collapse all items)" tabIndex={0} data-l10n-id="pdfjs-document-outline-button" role="radio" aria-checked="false" aria-controls="outlineView">
            <span data-l10n-id="pdfjs-document-outline-button-label">Document Outline</span>
          </button>
          <button id="viewAttachments" className="toolbarButton" type="button" title="Show Attachments" tabIndex={0} data-l10n-id="pdfjs-attachments-button" role="radio" aria-checked="false" aria-controls="attachmentsView">
            <span data-l10n-id="pdfjs-attachments-button-label">Attachments</span>
          </button>
          <button id="viewLayers" className="toolbarButton" type="button" title="Show Layers (double-click to reset all layers to the default state)" tabIndex={0} data-l10n-id="pdfjs-layers-button" role="radio" aria-checked="false" aria-controls="layersView">
            <span data-l10n-id="pdfjs-layers-button-label">Layers</span>
          </button>
        </ToolbarHorizontalGroup>
      </div>

      <div id="toolbarSidebarRight">
        <ToolbarHorizontalGroup id="outlineOptionsContainer">
          <VerticalToolbarSeparator />
          <button id="currentOutlineItem" className="toolbarButton" type="button" disabled title="Find Current Outline Item" tabIndex={0} data-l10n-id="pdfjs-current-outline-item-button">
            <span data-l10n-id="pdfjs-current-outline-item-button-label">Current Outline Item</span>
          </button>
        </ToolbarHorizontalGroup>
      </div>
    </ToolbarHorizontalGroup>
  )
}

export function SidebarContent() {
  return (
    <div id="sidebarContent">
      <div id="thumbnailView">
      </div>
      <div id="outlineView" className="hidden">
      </div>
      <div id="attachmentsView" className="hidden">
      </div>
      <div id="layersView" className="hidden">
      </div>
    </div>
  )
}

// Toolbar
export function SidebarToggleButton() {
  return (
    <button id="sidebarToggleButton" className="toolbarButton" type="button" title="Toggle Sidebar" tabIndex={0} data-l10n-id="pdfjs-toggle-sidebar-button" aria-expanded="false" aria-haspopup="true" aria-controls="sidebarContainer">
      <span data-l10n-id="pdfjs-toggle-sidebar-button-label">Toggle Sidebar</span>
    </button>
  )
}

export function ViewFind() {
  return (
    <div id="viewFind" className="toolbarButtonWithContainer">
      <button id="viewFindButton" className="toolbarButton" type="button" title="Find in Document" tabIndex={0} data-l10n-id="pdfjs-findbar-button" aria-expanded="false" aria-controls="findbar">
        <span data-l10n-id="pdfjs-findbar-button-label">Find</span>
      </button>
      <ToolbarHorizontalGroup className="hidden doorHanger" id="findbar">
        <ToolbarHorizontalGroup id="findInputContainer">
          <ToolbarHorizontalGroup as="span" className="loadingInput end">
            <input id="findInput" className="toolbarField" title="Find" placeholder="Find in document…" tabIndex={0} data-l10n-id="pdfjs-find-input" aria-invalid="false" />
          </ToolbarHorizontalGroup>
          <ToolbarHorizontalGroup>
            <button id="findPreviousButton" className="toolbarButton" type="button" title="Find the previous occurrence of the phrase" tabIndex={0} data-l10n-id="pdfjs-find-previous-button">
              <span data-l10n-id="pdfjs-find-previous-button-label">Previous</span>
            </button>
            <SplitToolbarButtonSeparator />
            <button id="findNextButton" className="toolbarButton" type="button" title="Find the next occurrence of the phrase" tabIndex={0} data-l10n-id="pdfjs-find-next-button">
              <span data-l10n-id="pdfjs-find-next-button-label">Next</span>
            </button>
          </ToolbarHorizontalGroup>
        </ToolbarHorizontalGroup>
        <ToolbarHorizontalGroup id="findbarOptionsOneContainer">
          <div className="toggleButton toolbarLabel">
            <input type="checkbox" id="findHighlightAll" tabIndex={0} />
            <label htmlFor="findHighlightAll" data-l10n-id="pdfjs-find-highlight-checkbox">Highlight All</label>
          </div>
          <div className="toggleButton toolbarLabel">
            <input type="checkbox" id="findMatchCase" tabIndex={0} />
            <label htmlFor="findMatchCase" data-l10n-id="pdfjs-find-match-case-checkbox-label">Match Case</label>
          </div>
        </ToolbarHorizontalGroup>
        <ToolbarHorizontalGroup id="findbarOptionsTwoContainer">
          <div className="toggleButton toolbarLabel">
            <input type="checkbox" id="findMatchDiacritics" tabIndex={0} />
            <label htmlFor="findMatchDiacritics" data-l10n-id="pdfjs-find-match-diacritics-checkbox-label">Match Diacritics</label>
          </div>
          <div className="toggleButton toolbarLabel">
            <input type="checkbox" id="findEntireWord" tabIndex={0} />
            <label htmlFor="findEntireWord" data-l10n-id="pdfjs-find-entire-word-checkbox-label">Whole Words</label>
          </div>
        </ToolbarHorizontalGroup>
        <ToolbarHorizontalGroup id="findbarMessageContainer" ariaLive="polite">
          <span id="findResultsCount" className="toolbarLabel" />
          <span id="findMsg" className="toolbarLabel" />
        </ToolbarHorizontalGroup>
      </ToolbarHorizontalGroup>
    </div>
  )
}

export function PreviousButton() {
  return (
    <button className="toolbarButton" title="Previous Page" type="button" id="previous" tabIndex={0} data-l10n-id="pdfjs-previous-button">
      <span data-l10n-id="pdfjs-previous-button-label">Previous</span>
    </button>
  )
}

export function NextButton() {
  return (
    <button className="toolbarButton" type="button" title="Next Page" id="next" tabIndex={0} data-l10n-id="pdfjs-next-button">
      <span data-l10n-id="pdfjs-next-button-label">Next</span>
    </button>
  )
}

export function PageNumberGroup() {
  return (
    <ToolbarHorizontalGroup id="pageNumberGroup">
      <ToolbarHorizontalGroup as="span" className="loadingInput start">
        <input type="number" id="pageNumber" className="toolbarField" title="Page" defaultValue="1" min="1" tabIndex={0} data-l10n-id="pdfjs-page-input" autoComplete="off" />
      </ToolbarHorizontalGroup>
      <span id="numPages" className="toolbarLabel"></span>
    </ToolbarHorizontalGroup>
  )
}

export function ZoomButtonGroup() {
  return (
    <ToolbarHorizontalGroup id="zoomButtonGroup">
      <button id="zoomOutButton" className="toolbarButton" type="button" title="Zoom Out" tabIndex={0} data-l10n-id="pdfjs-zoom-out-button">
        <span data-l10n-id="pdfjs-zoom-out-button-label">Zoom Out</span>
      </button>
      <SplitToolbarButtonSeparator />
      <button id="zoomInButton" className="toolbarButton" type="button" title="Zoom In" tabIndex={0} data-l10n-id="pdfjs-zoom-in-button">
        <span data-l10n-id="pdfjs-zoom-in-button-label">Zoom In</span>
      </button>
    </ToolbarHorizontalGroup>
  )
}

export function ScaleSelectContainer() {
  return (
    <span id="scaleSelectContainer" className="dropdownToolbarButton">
      <select id="scaleSelect" title="Zoom" tabIndex={0} data-l10n-id="pdfjs-zoom-select" defaultValue="auto">
        <option id="pageAutoOption" title="" value="auto" data-l10n-id="pdfjs-page-scale-auto">Automatic Zoom</option>
        <option id="pageActualOption" title="" value="page-actual" data-l10n-id="pdfjs-page-scale-actual">Actual Size</option>
        <option id="pageFitOption" title="" value="page-fit" data-l10n-id="pdfjs-page-scale-fit">Page Fit</option>
        <option id="pageWidthOption" title="" value="page-width" data-l10n-id="pdfjs-page-scale-width">Page Width</option>
        <option id="customScaleOption" title="" value="custom" disabled hidden={true} data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 0 }'>0%</option>
        <option title="" value="0.5" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 50 }'>50%</option>
        <option title="" value="0.75" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 75 }'>75%</option>
        <option title="" value="1" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 100 }'>100%</option>
        <option title="" value="1.25" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 125 }'>125%</option>
        <option title="" value="1.5" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 150 }'>150%</option>
        <option title="" value="2" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 200 }'>200%</option>
        <option title="" value="3" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 300 }'>300%</option>
        <option title="" value="4" data-l10n-id="pdfjs-page-scale-percent" data-l10n-args='{ "scale": 400 }'>400%</option>
      </select>
    </span>
  )
}

export function EditorHighlight() {
  return (
    <div id="editorHighlight" className="toolbarButtonWithContainer">
      <button id="editorHighlightButton" className="toolbarButton" type="button" disabled title="Highlight" role="radio" aria-expanded="false" aria-haspopup="true" aria-controls="editorHighlightParamsToolbar" tabIndex={0} data-l10n-id="pdfjs-editor-highlight-button">
        <span data-l10n-id="pdfjs-editor-highlight-button-label">Highlight</span>
      </button>
      <div className="editorParamsToolbar hidden doorHangerRight" id="editorHighlightParamsToolbar">
        <div id="highlightParamsToolbarContainer" className="editorParamsToolbarContainer">
          <div id="editorHighlightColorPicker" className="colorPicker">
            <span id="highlightColorPickerLabel" className="editorParamsLabel" data-l10n-id="pdfjs-editor-highlight-colorpicker-label">Highlight color</span>
          </div>
          <div id="editorHighlightThickness">
            <label htmlFor="editorFreeHighlightThickness" className="editorParamsLabel" data-l10n-id="pdfjs-editor-free-highlight-thickness-input">Thickness</label>
            <div className="thicknessPicker">
              <input type="range" id="editorFreeHighlightThickness" className="editorParamsSlider" data-l10n-id="pdfjs-editor-free-highlight-thickness-title" defaultValue="12" min="8" max="24" step="1" tabIndex={0} />
            </div>
          </div>
          <div id="editorHighlightVisibility">
            <div className="divider"></div>
            <div className="toggler">
              <label htmlFor="editorHighlightShowAll" className="editorParamsLabel" data-l10n-id="pdfjs-editor-highlight-show-all-button-label">Show all</label>
              <button id="editorHighlightShowAll" className="toggle-button" type="button" data-l10n-id="pdfjs-editor-highlight-show-all-button" aria-pressed="true" tabIndex={0}></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EditorFreeText() {
  return (
    <div id="editorFreeText" className="toolbarButtonWithContainer">
      <button id="editorFreeTextButton" className="toolbarButton" type="button" disabled title="Text" role="radio" aria-expanded="false" aria-haspopup="true" aria-controls="editorFreeTextParamsToolbar" tabIndex={0} data-l10n-id="pdfjs-editor-free-text-button">
        <span data-l10n-id="pdfjs-editor-free-text-button-label">Text</span>
      </button>
      <div className="editorParamsToolbar hidden doorHangerRight" id="editorFreeTextParamsToolbar">
        <div className="editorParamsToolbarContainer">
          <div className="editorParamsSetter">
            <label htmlFor="editorFreeTextColor" className="editorParamsLabel" data-l10n-id="pdfjs-editor-free-text-color-input">Color</label>
            <input type="color" id="editorFreeTextColor" className="editorParamsColor" tabIndex={0} />
          </div>
          <div className="editorParamsSetter">
            <label htmlFor="editorFreeTextFontSize" className="editorParamsLabel" data-l10n-id="pdfjs-editor-free-text-size-input">Size</label>
            <input type="range" id="editorFreeTextFontSize" className="editorParamsSlider" defaultValue="10" min="5" max="100" step="1" tabIndex={0} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function EditorInk() {
  return (
    <div id="editorInk" className="toolbarButtonWithContainer">
      <button id="editorInkButton" className="toolbarButton" type="button" disabled title="Draw" role="radio" aria-expanded="false" aria-haspopup="true" aria-controls="editorInkParamsToolbar" tabIndex={0} data-l10n-id="pdfjs-editor-ink-button">
        <span data-l10n-id="pdfjs-editor-ink-button-label">Draw</span>
      </button>
      <div className="editorParamsToolbar hidden doorHangerRight" id="editorInkParamsToolbar">
        <div className="editorParamsToolbarContainer">
          <div className="editorParamsSetter">
            <label htmlFor="editorInkColor" className="editorParamsLabel" data-l10n-id="pdfjs-editor-ink-color-input">Color</label>
            <input type="color" id="editorInkColor" className="editorParamsColor" tabIndex={0} />
          </div>
          <div className="editorParamsSetter">
            <label htmlFor="editorInkThickness" className="editorParamsLabel" data-l10n-id="pdfjs-editor-ink-thickness-input">Thickness</label>
            <input type="range" id="editorInkThickness" className="editorParamsSlider" defaultValue="1" min="1" max="20" step="1" tabIndex={0} />
          </div>
          <div className="editorParamsSetter">
            <label htmlFor="editorInkOpacity" className="editorParamsLabel" data-l10n-id="pdfjs-editor-ink-opacity-input">Opacity</label>
            <input type="range" id="editorInkOpacity" className="editorParamsSlider" defaultValue="1" min="0.05" max="1" step="0.05" tabIndex={0} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function EditorStamp() {
  return (
    <div id="editorStamp" className="toolbarButtonWithContainer">
      <button id="editorStampButton" className="toolbarButton" type="button" disabled title="Add or edit images" role="radio" aria-expanded="false" aria-haspopup="true" aria-controls="editorStampParamsToolbar" tabIndex={0} data-l10n-id="pdfjs-editor-stamp-button">
        <span data-l10n-id="pdfjs-editor-stamp-button-label">Add or edit images</span>
      </button>
      <div className="editorParamsToolbar hidden doorHangerRight menu" id="editorStampParamsToolbar">
        <div className="menuContainer">
          <button id="editorStampAddImage" className="toolbarButton labeled" type="button" title="Add image" tabIndex={0} data-l10n-id="pdfjs-editor-stamp-add-image-button">
            <span className="editorParamsLabel" data-l10n-id="pdfjs-editor-stamp-add-image-button-label">Add image</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function PrintButton() {
  return (
    <button id="printButton" className="toolbarButton" type="button" title="Print" tabIndex={0} data-l10n-id="pdfjs-print-button">
      <span data-l10n-id="pdfjs-print-button-label">Print</span>
    </button>
  )
}

export function DownloadButton() {
  return (
    <button id="downloadButton" className="toolbarButton" type="button" title="Save" tabIndex={0} data-l10n-id="pdfjs-save-button">
      <span data-l10n-id="pdfjs-save-button-label">Save</span>
    </button>
  )
}

export function SecondaryOpenFile() {
  return (
    <button id="secondaryOpenFile" className="toolbarButton labeled" type="button" title="Open File" tabIndex={0} data-l10n-id="pdfjs-open-file-button">
      <span data-l10n-id="pdfjs-open-file-button-label">Open</span>
    </button>
  )
}

export function SecondaryPrint() {
  return (
    <button id="secondaryPrint" className="toolbarButton labeled" type="button" title="Print" tabIndex={0} data-l10n-id="pdfjs-print-button">
      <span data-l10n-id="pdfjs-print-button-label">Print</span>
    </button>
  )
}

export function SecondaryDownload() {
  return (
    <button id="secondaryDownload" className="toolbarButton labeled" type="button" title="Save" tabIndex={0} data-l10n-id="pdfjs-save-button">
      <span data-l10n-id="pdfjs-save-button-label">Save</span>
    </button>
  )
}

export function PresentationMode() {
  return (
    <button id="presentationMode" className="toolbarButton labeled" type="button" title="Switch to Presentation Mode" tabIndex={0} data-l10n-id="pdfjs-presentation-mode-button">
      <span data-l10n-id="pdfjs-presentation-mode-button-label">Presentation Mode</span>
    </button>
  )
}

export function ViewBookmark() {
  return (
    <a href="#" id="viewBookmark" className="toolbarButton labeled" title="Current Page (View URL from Current Page)" tabIndex={0} data-l10n-id="pdfjs-bookmark-button">
      <span data-l10n-id="pdfjs-bookmark-button-label">Current Page</span>
    </a>
  )
}

export function FirstPageButton() {
  return (
    <button id="firstPage" className="toolbarButton labeled" type="button" title="Go to First Page" tabIndex={0} data-l10n-id="pdfjs-first-page-button">
      <span data-l10n-id="pdfjs-first-page-button-label">Go to First Page</span>
    </button>
  )
}

export function LastPageButton() {
  return (
    <button id="lastPage" className="toolbarButton labeled" type="button" title="Go to Last Page" tabIndex={0} data-l10n-id="pdfjs-last-page-button">
      <span data-l10n-id="pdfjs-last-page-button-label">Go to Last Page</span>
    </button>
  )
}

export function PageRotateCwButton() {
  return (
    <button id="pageRotateCw" className="toolbarButton labeled" type="button" title="Rotate Clockwise" tabIndex={0} data-l10n-id="pdfjs-page-rotate-cw-button">
      <span data-l10n-id="pdfjs-page-rotate-cw-button-label">Rotate Clockwise</span>
    </button>
  )
}

export function PageRotateCcwButton() {
  return (
    <button id="pageRotateCcw" className="toolbarButton labeled" type="button" title="Rotate Counterclockwise" tabIndex={0} data-l10n-id="pdfjs-page-rotate-ccw-button">
      <span data-l10n-id="pdfjs-page-rotate-ccw-button-label">Rotate Counterclockwise</span>
    </button>
  )
}

export function CursorSelectToolButton() {
  return (
    <button id="cursorSelectTool" className="toolbarButton labeled toggled" type="button" title="Enable Text Selection Tool" tabIndex={0} data-l10n-id="pdfjs-cursor-text-select-tool-button" role="radio" aria-checked="true">
      <span data-l10n-id="pdfjs-cursor-text-select-tool-button-label">Text Selection Tool</span>
    </button>
  )
}

export function CursorHandToolButton() {
  return (
    <button id="cursorHandTool" className="toolbarButton labeled" type="button" title="Enable Hand Tool" tabIndex={0} data-l10n-id="pdfjs-cursor-hand-tool-button" role="radio" aria-checked="false">
      <span data-l10n-id="pdfjs-cursor-hand-tool-button-label">Hand Tool</span>
    </button>
  )
}

export function ScrollPageButton() {
  return (
    <button id="scrollPage" className="toolbarButton labeled" type="button" title="Use Page Scrolling" tabIndex={0} data-l10n-id="pdfjs-scroll-page-button" role="radio" aria-checked="false">
      <span data-l10n-id="pdfjs-scroll-page-button-label">Page Scrolling</span>
    </button>
  )
}

export function ScrollVerticalButton() {
  return (
    <button id="scrollVertical" className="toolbarButton labeled toggled" type="button" title="Use Vertical Scrolling" tabIndex={0} data-l10n-id="pdfjs-scroll-vertical-button" role="radio" aria-checked="true">
      <span data-l10n-id="pdfjs-scroll-vertical-button-label">Vertical Scrolling</span>
    </button>
  )
}

export function ScrollHorizontalButton() {
  return (
    <button id="scrollHorizontal" className="toolbarButton labeled" type="button" title="Use Horizontal Scrolling" tabIndex={0} data-l10n-id="pdfjs-scroll-horizontal-button" role="radio" aria-checked="false">
      <span data-l10n-id="pdfjs-scroll-horizontal-button-label">Horizontal Scrolling</span>
    </button>
  )
}

export function ScrollWrappedButton() {
  return (
    <button id="scrollWrapped" className="toolbarButton labeled" type="button" title="Use Wrapped Scrolling" tabIndex={0} data-l10n-id="pdfjs-scroll-wrapped-button" role="radio" aria-checked="false">
      <span data-l10n-id="pdfjs-scroll-wrapped-button-label">Wrapped Scrolling</span>
    </button>
  )
}

export function SpreadNoneButton() {
  return (
    <button id="spreadNone" className="toolbarButton labeled toggled" type="button" title="Do not join page spreads" tabIndex={0} data-l10n-id="pdfjs-spread-none-button" role="radio" aria-checked="true">
      <span data-l10n-id="pdfjs-spread-none-button-label">No Spreads</span>
    </button>
  )
}

export function SpreadOddButton() {
  return (
    <button id="spreadOdd" className="toolbarButton labeled" type="button" title="Join page spreads starting with odd-numbered pages" tabIndex={0} data-l10n-id="pdfjs-spread-odd-button" role="radio" aria-checked="false">
      <span data-l10n-id="pdfjs-spread-odd-button-label">Odd Spreads</span>
    </button>
  )
}

export function SpreadEvenButton() {
  return (
    <button id="spreadEven" className="toolbarButton labeled" type="button" title="Join page spreads starting with even-numbered pages" tabIndex={0} data-l10n-id="pdfjs-spread-even-button" role="radio" aria-checked="false">
      <span data-l10n-id="pdfjs-spread-even-button-label">Even Spreads</span>
    </button>
  )
}

export function ImageAltTextSettingsButton() {
  return (
    <button id="imageAltTextSettings" type="button" className="toolbarButton labeled hidden" title="Image alt text settings" tabIndex={0} data-l10n-id="pdfjs-image-alt-text-settings-button" aria-controls="altTextSettingsDialog">
      <span data-l10n-id="pdfjs-image-alt-text-settings-button-label">Image alt text settings</span>
    </button>
  )
}

export function DocumentPropertiesButton() {
  return (
    <button id="documentProperties" className="toolbarButton labeled" type="button" title="Document Properties…" tabIndex={0} data-l10n-id="pdfjs-document-properties-button" aria-controls="documentPropertiesDialog">
      <span data-l10n-id="pdfjs-document-properties-button-label">Document Properties…</span>
    </button>
  )
}

export function MenuDropdown({ children }: { children: React.ReactNode }) {
  return (
    <div id="secondaryToolbarToggle" className="toolbarButtonWithContainer">
      <button id="secondaryToolbarToggleButton" className="toolbarButton" type="button" title="Tools" tabIndex={0} data-l10n-id="pdfjs-tools-button" aria-expanded="false" aria-haspopup="true" aria-controls="secondaryToolbar">
        <span data-l10n-id="pdfjs-tools-button-label">Tools</span>
      </button>
      <div id="secondaryToolbar" className="hidden doorHangerRight menu">
        <div id="secondaryToolbarButtonContainer" className="menuContainer">
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoadingBar() {
  return (
    <div id="loadingBar">
      <div className="progress">
        <div className="glimmer">
        </div>
      </div>
    </div>
  )
}

// ViewerContainer
export function ViewerContainer() {
  return (
    <div id="viewerContainer" tabIndex={0}>
      <div id="viewer" className="pdfViewer" />
    </div>
  )
}

// Separators
export function SplitToolbarButtonSeparator() {
  return <div className="splitToolbarButtonSeparator" />
}

export function HorizontalToolbarSeparator({ id, clasName }: { id?: string, clasName?: string }) {
  return <div id={id} className={`horizontalToolbarSeparator ${clasName ?? ''}`} />
}

export function VerticalToolbarSeparator({ id, clasName }: { id?: string, clasName?: string }) {
  return <div id={id} className={`verticalToolbarSeparator ${clasName ?? ''}`} />
}

export function ToolbarButtonSpacer() {
  return <div className="toolbarButtonSpacer" />
}

// Dialogs
export function PasswordDialog() {
  return (
    <dialog id="passwordDialog">
      <div className="row">
        <label htmlFor="password" id="passwordText" data-l10n-id="pdfjs-password-label">Enter the password to open this PDF file:</label>
      </div>
      <div className="row">
        <input type="password" id="password" className="toolbarField" />
      </div>
      <div className="buttonRow">
        <button id="passwordCancel" className="dialogButton" type="button"><span data-l10n-id="pdfjs-password-cancel-button">Cancel</span></button>
        <button id="passwordSubmit" className="dialogButton" type="button"><span data-l10n-id="pdfjs-password-ok-button">OK</span></button>
      </div>
    </dialog>
  )
}

export function DocumentPropertiesDialog() {
  return (
    <dialog id="documentPropertiesDialog">
      <div className="row">
        <span id="fileNameLabel" data-l10n-id="pdfjs-document-properties-file-name">File name:</span>
        <p id="fileNameField" aria-labelledby="fileNameLabel">-</p>
      </div>
      <div className="row">
        <span id="fileSizeLabel" data-l10n-id="pdfjs-document-properties-file-size">File size:</span>
        <p id="fileSizeField" aria-labelledby="fileSizeLabel">-</p>
      </div>
      <div className="separator"></div>
      <div className="row">
        <span id="titleLabel" data-l10n-id="pdfjs-document-properties-title">Title:</span>
        <p id="titleField" aria-labelledby="titleLabel">-</p>
      </div>
      <div className="row">
        <span id="authorLabel" data-l10n-id="pdfjs-document-properties-author">Author:</span>
        <p id="authorField" aria-labelledby="authorLabel">-</p>
      </div>
      <div className="row">
        <span id="subjectLabel" data-l10n-id="pdfjs-document-properties-subject">Subject:</span>
        <p id="subjectField" aria-labelledby="subjectLabel">-</p>
      </div>
      <div className="row">
        <span id="keywordsLabel" data-l10n-id="pdfjs-document-properties-keywords">Keywords:</span>
        <p id="keywordsField" aria-labelledby="keywordsLabel">-</p>
      </div>
      <div className="row">
        <span id="creationDateLabel" data-l10n-id="pdfjs-document-properties-creation-date">Creation Date:</span>
        <p id="creationDateField" aria-labelledby="creationDateLabel">-</p>
      </div>
      <div className="row">
        <span id="modificationDateLabel" data-l10n-id="pdfjs-document-properties-modification-date">Modification Date:</span>
        <p id="modificationDateField" aria-labelledby="modificationDateLabel">-</p>
      </div>
      <div className="row">
        <span id="creatorLabel" data-l10n-id="pdfjs-document-properties-creator">Creator:</span>
        <p id="creatorField" aria-labelledby="creatorLabel">-</p>
      </div>
      <div className="separator"></div>
      <div className="row">
        <span id="producerLabel" data-l10n-id="pdfjs-document-properties-producer">PDF Producer:</span>
        <p id="producerField" aria-labelledby="producerLabel">-</p>
      </div>
      <div className="row">
        <span id="versionLabel" data-l10n-id="pdfjs-document-properties-version">PDF Version:</span>
        <p id="versionField" aria-labelledby="versionLabel">-</p>
      </div>
      <div className="row">
        <span id="pageCountLabel" data-l10n-id="pdfjs-document-properties-page-count">Page Count:</span>
        <p id="pageCountField" aria-labelledby="pageCountLabel">-</p>
      </div>
      <div className="row">
        <span id="pageSizeLabel" data-l10n-id="pdfjs-document-properties-page-size">Page Size:</span>
        <p id="pageSizeField" aria-labelledby="pageSizeLabel">-</p>
      </div>
      <div className="separator"></div>
      <div className="row">
        <span id="linearizedLabel" data-l10n-id="pdfjs-document-properties-linearized">Fast Web View:</span>
        <p id="linearizedField" aria-labelledby="linearizedLabel">-</p>
      </div>
      <div className="buttonRow">
        <button id="documentPropertiesClose" className="dialogButton" type="button"><span data-l10n-id="pdfjs-document-properties-close-button">Close</span></button>
      </div>
    </dialog>
  )
}

export function AltTextDialog() {
  return (
    <dialog className="dialog altText" id="altTextDialog" aria-labelledby="dialogLabel" aria-describedby="dialogDescription">
      <div id="altTextContainer" className="mainContainer">
        <div id="overallDescription">
          <span id="dialogLabel" data-l10n-id="pdfjs-editor-alt-text-dialog-label" className="title">Choose an option</span>
          <span id="dialogDescription" data-l10n-id="pdfjs-editor-alt-text-dialog-description">
            Alt text (alternative text) helps when people can’t see the image or when it doesn’t load.
          </span>
        </div>
        <div id="addDescription">
          <div className="radio">
            <div className="radioButton">
              <input type="radio" id="descriptionButton" name="altTextOption" tabIndex={0} aria-describedby="descriptionAreaLabel" defaultChecked />
              <label htmlFor="descriptionButton" data-l10n-id="pdfjs-editor-alt-text-add-description-label">Add a description</label>
            </div>
            <div className="radioLabel">
              <span id="descriptionAreaLabel" data-l10n-id="pdfjs-editor-alt-text-add-description-description">
                Aim for 1-2 sentences that describe the subject, setting, or actions.
              </span>
            </div>
          </div>
          <div className="descriptionArea">
            <textarea id="descriptionTextarea" placeholder="For example, “A young man sits down at a table to eat a meal”" aria-labelledby="descriptionAreaLabel" data-l10n-id="pdfjs-editor-alt-text-textarea" tabIndex={0}></textarea>
          </div>
        </div>
        <div id="markAsDecorative">
          <div className="radio">
            <div className="radioButton">
              <input type="radio" id="decorativeButton" name="altTextOption" aria-describedby="decorativeLabel" />
              <label htmlFor="decorativeButton" data-l10n-id="pdfjs-editor-alt-text-mark-decorative-label">Mark as decorative</label>
            </div>
            <div className="radioLabel">
              <span id="decorativeLabel" data-l10n-id="pdfjs-editor-alt-text-mark-decorative-description">
                This is used for ornamental images, like borders or watermarks.
              </span>
            </div>
          </div>
        </div>
        <div id="buttons">
          <button id="altTextCancel" className="secondaryButton" type="button" tabIndex={0}><span data-l10n-id="pdfjs-editor-alt-text-cancel-button">Cancel</span></button>
          <button id="altTextSave" className="primaryButton" type="button" tabIndex={0}><span data-l10n-id="pdfjs-editor-alt-text-save-button">Save</span></button>
        </div>
      </div>
    </dialog>
  )
}

export function NewAltTextDialog() {
  return (
    <dialog className="dialog newAltText" id="newAltTextDialog" aria-labelledby="newAltTextTitle" aria-describedby="newAltTextDescription" tabIndex={0}>
      <div id="newAltTextContainer" className="mainContainer">
        <div className="title">
          <span id="newAltTextTitle" data-l10n-id="pdfjs-editor-new-alt-text-dialog-edit-label" role="sectionhead" tabIndex={0}>Edit alt text (image description)</span>
        </div>
        <div id="mainContent">
          <div id="descriptionAndSettings">
            <div id="descriptionInstruction">
              <div id="newAltTextDescriptionContainer">
                <div className="altTextSpinner" role="status" aria-live="polite"></div>
                <textarea id="newAltTextDescriptionTextarea" placeholder="Write your description here…" aria-labelledby="descriptionAreaLabel" data-l10n-id="pdfjs-editor-new-alt-text-textarea" tabIndex={0}></textarea>
              </div>
              <span id="newAltTextDescription" role="note" data-l10n-id="pdfjs-editor-new-alt-text-description">Short description for people who can’t see the image or when the image doesn’t load.</span>
              <div id="newAltTextDisclaimer" role="note"><div><span data-l10n-id="pdfjs-editor-new-alt-text-disclaimer1">This alt text was created automatically and may be inaccurate.</span> <a href="https://support.mozilla.org/en-US/kb/pdf-alt-text" target="_blank" rel="noopener noreferrer" id="newAltTextLearnMore" data-l10n-id="pdfjs-editor-new-alt-text-disclaimer-learn-more-url" tabIndex={0}>Learn more</a></div></div>
            </div>
            <div id="newAltTextCreateAutomatically" className="toggler">
              <button id="newAltTextCreateAutomaticallyButton" className="toggle-button" type="button" aria-pressed="true" tabIndex={0}></button>
              <label htmlFor="newAltTextCreateAutomaticallyButton" className="togglerLabel" data-l10n-id="pdfjs-editor-new-alt-text-create-automatically-button-label">Create alt text automatically</label>
            </div>
            <div id="newAltTextDownloadModel" className="hidden">
              <span id="newAltTextDownloadModelDescription" data-l10n-id="pdfjs-editor-new-alt-text-ai-model-downloading-progress" aria-valuemin={0} data-l10n-args='{ "totalSize": 0, "downloadedSize": 0 }'>Downloading alt text AI model (0 of 0 MB)</span>
            </div>
          </div>
          <div id="newAltTextImagePreview"></div>
        </div>
        <div id="newAltTextError" className="messageBar">
          <div>
            <div>
              <span className="title" data-l10n-id="pdfjs-editor-new-alt-text-error-title">Couldn't create alt text automatically</span>
              <span  className="description" data-l10n-id="pdfjs-editor-new-alt-text-error-description">Please write your own alt text or try again later.</span>
            </div>
            <button id="newAltTextCloseButton" className="closeButton" type="button" tabIndex={0} title="Close"><span data-l10n-id="pdfjs-editor-new-alt-text-error-close-button">Close</span></button>
          </div>
        </div>
        <div id="newAltTextButtons" className="dialogButtonsGroup">
          <button id="newAltTextCancel" type="button" className="secondaryButton hidden" tabIndex={0}><span data-l10n-id="pdfjs-editor-alt-text-cancel-button">Cancel</span></button>
          <button id="newAltTextNotNow" type="button" className="secondaryButton" tabIndex={0}><span data-l10n-id="pdfjs-editor-new-alt-text-not-now-button">Not now</span></button>
          <button id="newAltTextSave" type="button" className="primaryButton" tabIndex={0}><span data-l10n-id="pdfjs-editor-alt-text-save-button">Save</span></button>
        </div>
      </div>
    </dialog>
  )
}

export function AltTextSettingsDialog() {
  return (
    <dialog className="dialog" id="altTextSettingsDialog" aria-labelledby="altTextSettingsTitle">
      <div id="altTextSettingsContainer" className="mainContainer">
        <div className="title">
          <span id="altTextSettingsTitle" data-l10n-id="pdfjs-editor-alt-text-settings-dialog-label" role="sectionhead" tabIndex={0} className="title">Image alt text settings</span>
        </div>
        <div id="automaticAltText">
          <span data-l10n-id="pdfjs-editor-alt-text-settings-automatic-title">Automatic alt text</span>
          <div id="automaticSettings">
            <div id="createModelSetting">
              <div className="toggler">
                <button id="createModelButton" type="button" className="toggle-button" aria-pressed="true" tabIndex={0}></button>
                <label htmlFor="createModelButton" className="togglerLabel" data-l10n-id="pdfjs-editor-alt-text-settings-create-model-button-label">Create alt text automatically</label>
              </div>
              <div id="createModelDescription" className="description">
                <span data-l10n-id="pdfjs-editor-alt-text-settings-create-model-description">Suggests descriptions to help people who can't see the image or when the image doesn't load.</span> <a href="https://support.mozilla.org/en-US/kb/pdf-alt-text" target="_blank" rel="noopener noreferrer" id="altTextSettingsLearnMore" data-l10n-id="pdfjs-editor-new-alt-text-disclaimer-learn-more-url" tabIndex={0}>Learn more</a>
              </div>
            </div>
            <div id="aiModelSettings">
              <div>
                <span data-l10n-id="pdfjs-editor-alt-text-settings-download-model-label" data-l10n-args='{ "totalSize": 180 }'>Alt text AI model (180MB)</span>
                <div id="aiModelDescription" className="description">
                  <span data-l10n-id="pdfjs-editor-alt-text-settings-ai-model-description">Runs locally on your device so your data stays private. Required for automatic alt text.</span>
                </div>
              </div>
              <button id="deleteModelButton" type="button" className="secondaryButton" tabIndex={0}><span data-l10n-id="pdfjs-editor-alt-text-settings-delete-model-button">Delete</span></button>
              <button id="downloadModelButton" type="button" className="secondaryButton" tabIndex={0}><span data-l10n-id="pdfjs-editor-alt-text-settings-download-model-button">Download</span></button>
            </div>
          </div>
        </div>
        <div className="dialogSeparator"></div>
        <div id="altTextEditor">
          <span data-l10n-id="pdfjs-editor-alt-text-settings-editor-title">Alt text editor</span>
          <div id="showAltTextEditor">
            <div className="toggler">
              <button id="showAltTextDialogButton" type="button" className="toggle-button" aria-pressed="true" tabIndex={0}></button>
              <label htmlFor="showAltTextDialogButton" className="togglerLabel" data-l10n-id="pdfjs-editor-alt-text-settings-show-dialog-button-label">Show alt text editor right away when adding an image</label>
            </div>
            <div id="showAltTextDialogDescription" className="description">
              <span data-l10n-id="pdfjs-editor-alt-text-settings-show-dialog-description">Helps you make sure all your images have alt text.</span>
            </div>
          </div>
        </div>
        <div id="buttons" className="dialogButtonsGroup">
          <button id="altTextSettingsCloseButton" type="button" className="primaryButton" tabIndex={0}><span data-l10n-id="pdfjs-editor-alt-text-settings-close-button">Close</span></button>
        </div>
      </div>
    </dialog>
  )
}

export function PrintServiceDialog() {
  return (
    <dialog id="printServiceDialog" style={{minWidth: '200px'}}>
      <div className="row">
        <span data-l10n-id="pdfjs-print-progress-message">Preparing document for printing…</span>
      </div>
      <div className="row">
        <progress defaultValue="0" max="100"></progress>
        <span data-l10n-id="pdfjs-print-progress-percent" data-l10n-args='{ "progress": 0 }' className="relative-progress">0%</span>
      </div>
      <div className="buttonRow">
        <button id="printCancel" className="dialogButton" type="button"><span data-l10n-id="pdfjs-print-progress-close-button">Cancel</span></button>
      </div>
    </dialog>
  )
}

export function EditorUndoBar() {
  return (
    <div id="editorUndoBar" className="messageBar" role="status" aria-labelledby="editorUndoBarMessage" tabIndex={-1} hidden>
      <div>
        <div>
          <span id="editorUndoBarMessage" className="description"></span>
        </div>
        <button id="editorUndoBarUndoButton" className="undoButton" type="button" tabIndex={0} title="Undo" data-l10n-id="pdfjs-editor-undo-bar-undo-button">
          <span data-l10n-id="pdfjs-editor-undo-bar-undo-button-label">Undo</span>
        </button>
        <button id="editorUndoBarCloseButton" className="closeButton" type="button" tabIndex={0} title="Close" data-l10n-id="pdfjs-editor-undo-bar-close-button">
          <span data-l10n-id="pdfjs-editor-undo-bar-close-button-label">Close</span>
        </button>
      </div>
    </div>
  )
}

export default function PdfViewer() {
  usePdfViewer();

  return (
    <PdfViewerRoot>
      <SidebarContainer>
        <ToolbarSidebar />
        <SidebarContent />
      </SidebarContainer>

      <MainContainer>
        <ToolbarContainer>
          <ToolbarHorizontalGroup id="toolbarViewer">
            <ToolbarHorizontalGroup id="toolbarViewerLeft">
              <SidebarToggleButton />
              <ToolbarButtonSpacer />
              <ViewFind />
              <ToolbarHorizontalGroup className="hiddenSmallView">
                <PreviousButton />
                <SplitToolbarButtonSeparator />
                <NextButton />
              </ToolbarHorizontalGroup>
              <PageNumberGroup />
            </ToolbarHorizontalGroup>

            <ToolbarHorizontalGroup id="toolbarViewerMiddle">
              <ZoomButtonGroup />
              <ScaleSelectContainer />
            </ToolbarHorizontalGroup>

            <ToolbarHorizontalGroup id="toolbarViewerRight">
              <ToolbarHorizontalGroup id="editorModeButtons" role="radiogroup">
                <EditorHighlight />
                <EditorFreeText />
                <EditorInk />
                <EditorStamp />
              </ToolbarHorizontalGroup>

              <VerticalToolbarSeparator id="editorModeSeparator" />

              <ToolbarHorizontalGroup className="hiddenMediumView">
                <PrintButton />
                <DownloadButton />
              </ToolbarHorizontalGroup>

              <VerticalToolbarSeparator clasName="hiddenMediumView" />

              <MenuDropdown>
                <SecondaryOpenFile />

                <div className="visibleMediumView">
                  <SecondaryPrint />
                  <SecondaryDownload />
                </div>

                <PresentationMode />

                <ViewBookmark />

                <HorizontalToolbarSeparator id="viewBookmarkSeparator" />

                <FirstPageButton />
                <LastPageButton />

                <HorizontalToolbarSeparator />

                <PageRotateCwButton />
                <PageRotateCcwButton />

                <HorizontalToolbarSeparator />

                <div id="cursorToolButtons" role="radiogroup">
                  <CursorSelectToolButton />
                  <CursorHandToolButton />
                </div>

                <HorizontalToolbarSeparator />

                <div id="scrollModeButtons" role="radiogroup">
                  <ScrollPageButton />
                  <ScrollVerticalButton />
                  <ScrollHorizontalButton />
                  <ScrollWrappedButton />
                </div>

                <HorizontalToolbarSeparator />

                <div id="spreadModeButtons" role="radiogroup">
                  <SpreadNoneButton />
                  <SpreadOddButton />
                  <SpreadEvenButton />
                </div>

                <HorizontalToolbarSeparator id="imageAltTextSettingsSeparator" clasName="hidden" />

                <ImageAltTextSettingsButton />

                <HorizontalToolbarSeparator />

                <DocumentPropertiesButton />
              </MenuDropdown>
            </ToolbarHorizontalGroup>
          </ToolbarHorizontalGroup>
          <LoadingBar />
        </ToolbarContainer>
        <ViewerContainer />
      </MainContainer>
    </PdfViewerRoot>
  );
}
