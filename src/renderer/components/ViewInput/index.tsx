import { Fragment, useRef } from 'react';
import { Input } from '@arco-design/web-react';

import { useEffect, useState } from 'react';

export type ViewInputProps = {
  value: string;
  prefix: string;
  addAfter?: React.ReactNode;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
};
const ViewInput = (props: ViewInputProps) => {
  const { value, onChange, prefix, addAfter, style = {} } = props;
  const inputRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (value: string) => {
    setInputValue(value);
  };

  const handlePressEnter = () => {
    inputRef.current.blur();
    if (value === inputValue) return;
    onChange(inputValue);
  };

  return (
    <Fragment>
      <Input
        ref={inputRef}
        addBefore={prefix}
        addAfter={addAfter}
        value={inputValue}
        onChange={handleChange}
        onPressEnter={handlePressEnter}
        onBlur={handlePressEnter}
      />
    </Fragment>
  );
};

export default ViewInput;
