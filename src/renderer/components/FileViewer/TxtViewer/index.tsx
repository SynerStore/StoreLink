import './index.css';

export type TxtViewerProps = {
  src: string;
};

const TxtViewer = (props: TxtViewerProps) => {
  const { src } = props;
  return <iframe className="txt-viewer" src={src} />;
};
export default TxtViewer;
