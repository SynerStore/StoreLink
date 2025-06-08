import qs from 'query-string';

import {Header,FileViewer,FileIcon} from '@/renderer/components';
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
