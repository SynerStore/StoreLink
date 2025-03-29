import { IconMinus, IconExpand, IconShrink, IconClose } from '@arco-design/web-react/icon';

import { winClose, winFullScreen, winMinimize, isInMac } from '@/renderer/utils';
import logo from '@/assets/logo.png';
import './index.css';
import { useState } from 'react';

debugger;
const Header = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreen = () => {
    if (isFullScreen) {
      setIsFullScreen(false);
    } else {
      setIsFullScreen(true);
    }
    winFullScreen();
  };

  return (
    <header className="header">
      <div className="logo">
        <img className="logo-img" src={logo} alt="logo" />
        <span className="logo-text">SynerStore</span>
      </div>
      {/* windows \linux 显示信号灯  */}
      {isInMac() ? null : (
        <div className="win-linux-traffic">
          <div className="traffic" onClick={winMinimize}>
            <IconMinus />
          </div>
          <div className="traffic" onClick={handleFullScreen}>
            {isFullScreen ? <IconShrink /> : <IconExpand />}
          </div>
          <div className="traffic " onClick={winClose}>
            <IconClose />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
