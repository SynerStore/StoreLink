import { useEffect } from 'react';

import { events } from '../../utils';
import "./index.css"

const App = () => {
  useEffect(() => {
    // setTimeout(() => events.windowRenderReady(), 1000);
  });

  return (
    <div className='container'>
      <header className='header'>
        <div className='commands'> 标题 </div>
      </header>
      <img src="./logo.png" alt="logo" width="100" height={100} />
    </div>
  );
};

export default App;
