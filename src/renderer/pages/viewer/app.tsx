import qs from 'query-string';

import Header from '@/renderer/components/Header';
import FileViewer from '@/renderer/components/FileViewer';
import './index.css';

const App = () => {
  const query = qs.parse(window.location.search);

  return (
    <div className="container">
      <Header />
      <main className="main">
        <FileViewer id={query.id as string} mime={query.mime as string} />
      </main>
    </div>
  );
};

export default App;
