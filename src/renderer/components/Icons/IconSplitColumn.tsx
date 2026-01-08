import { IconProps } from './types';
export const IconSplitColumn = (props: IconProps) => {
  const { className = '', style = {}, size = 18, onClick = () => {} } = props;
  return (
    <span
      className={`anticon ${className}`}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', ...style }}
    >
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        <path d="M880 112c17.7 0 32 14.3 32 32v736c0 17.7-14.3 32-32 32H144c-17.7 0-32-14.3-32-32V144c0-17.7 14.3-32 32-32z m-404 72H184v656h292V184z m364 0H548v656h292V184z"></path>
      </svg>
    </span>
  );
};
