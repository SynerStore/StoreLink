import { useTranslation } from 'react-i18next';
const Empty = () => {
  const { t } = useTranslation();
  return <div>{t('storeViewer.emptyFolder')}</div>;
};

export default Empty;
