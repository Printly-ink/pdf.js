import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

export default function Home() {
  return (
    <PdfViewer />
  );
}
