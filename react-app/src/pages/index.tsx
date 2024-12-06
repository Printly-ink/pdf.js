import React from 'react';
import dynamic from 'next/dynamic';

// const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });
const UsingLib = dynamic(() => import("@/components/UsingLib"), { ssr: false });

export default function Home() {
  return (
    <>
      <UsingLib />
    </>
  );
}
