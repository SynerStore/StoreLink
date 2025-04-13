import qs from 'query-string';

import Header from '@/renderer/components/Header';
import FileViewer from '@/renderer/components/FileViewer';
import FileIcon from '@/renderer/components/FileIcon';
import './index.css';

const App = () => {
  const query = qs.parse(window.location.search);
  console.log('query', query);

  return (
    <div className="container">
      <Header icon={<FileIcon mime={query.mime as string} />} title={query.name as string} />
      <main className="main">
        <FileViewer id={query.id as string} mime={query.mime as string} />
      </main>
    </div>
  );
};

export default App;
