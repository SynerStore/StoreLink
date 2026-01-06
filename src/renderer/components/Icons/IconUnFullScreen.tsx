import { IconProps } from './types';
export const IconUnFullScreen = (props: IconProps) => {
  const { className = '', style = {}, size = 18, onClick = () => {} } = props;
  return (
    <span className={`anticon ${className}`} onClick={onClick} style={{ display: 'flex', alignItems: 'center', ...style }}>
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        <path
          d="M832 96a96 96 0 0 1 95.552 86.784L928 192v512a96 96 0 0 1-86.784 95.552L832 800h-32v32a96 96 0 0 1-86.784 95.552L704 928H192A96 96 0 0 1 96 832V320A96 96 0 0 1 192 224h32V192a96 96 0 0 1 86.784-95.552L320 96h512z m-128 192H192a32 32 0 0 0-32 32v512a32 32 0 0 0 32 32h512a32 32 0 0 0 32-32V320a32 32 0 0 0-32-32z m128-128H320a32 32 0 0 0-31.488 26.24L288 192v32H704a96 96 0 0 1 95.552 86.784L800 320v416h32a32 32 0 0 0 31.488-26.24L864 704V192a32 32 0 0 0-26.24-31.488L832 160z"
        ></path>
      </svg>
    </span>
  );
};
