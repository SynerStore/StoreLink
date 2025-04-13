import './index.css';

export type PdfViewerProps = {
  src: string;
  content?: string;
  mime?: string;
};

const PdfViewer = (props: PdfViewerProps) => {
  const { src } = props;
  return <iframe className="pdf-viewer" src={src} />;
};
export default PdfViewer;
