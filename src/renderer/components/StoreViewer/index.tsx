import S3Viwer from './S3Viwer';

const StoreViewer = (props: any) => {
  const { data } = props;
  return <S3Viwer key={data.id} bucketName={data.name} connectionId={data.connectionId} />;
};

export default StoreViewer;
