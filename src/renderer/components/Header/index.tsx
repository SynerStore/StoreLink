import logo from '@/assets/logo.png';
import './index.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <img className='logo-img' src={logo} alt="logo" />
        <span className="logo-text">SynerStore</span>
      </div>
      <div className="commands"></div>
    </header>
  );
};

export default Header;
