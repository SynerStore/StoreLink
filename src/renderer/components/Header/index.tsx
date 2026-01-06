import React, { useState, memo } from 'react';
import { IconMinus, IconClose } from '@arco-design/web-react/icon';

import { winClose, winFullScreen, winMinimize } from '@/renderer/utils';
import { IconFullScreen, IconUnFullScreen } from '@/renderer/components';
import logo from '@/renderer/assets/logo.png';
import './index.css';

// 顶部导航栏
export type HeaderProps = {
  icon?: React.ReactNode;
  title?: string;
};
const Header = (props: HeaderProps) => {
  const { icon, title } = props;
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
        {icon ? icon : <img className="logo-img" src={logo} alt="logo" />}
        <span className="logo-text">{title ? title : 'StoreLink'}</span>
      </div>
      {/* windows \linux 显示信号灯  */}
      {/* {isInMac() ? null : ( */}
      <div className="win-linux-traffic">
        <div className="traffic" onClick={winMinimize}>
          <IconMinus />
        </div>
        <div className="traffic" onClick={handleFullScreen}>
          {isFullScreen ? <IconUnFullScreen /> : <IconFullScreen />}
        </div>
        <div className="traffic traffic-close" onClick={winClose}>
          <IconClose />
        </div>
      </div>
      {/* )} */}
    </header>
  );
};

export default memo(Header);
