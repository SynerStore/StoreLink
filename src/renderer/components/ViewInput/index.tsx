import { Fragment, useRef } from 'react';
import { Input } from '@arco-design/web-react';
import { IconStar } from '@arco-design/web-react/icon';

import { useEffect, useState } from 'react';

export type ViewInputProps = {
  value: string;
  prefix: string;
  onChange: (value: string) => void;
};
const ViewInput = (props: any) => {
  const { value, onChange, prefix } = props;
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
        addAfter={<IconStar style={{ fontSize: 'large' }} />}
        value={inputValue}
        onChange={handleChange}
        onPressEnter={handlePressEnter}
        onBlur={handlePressEnter}
      />
    </Fragment>
  );
};

export default ViewInput;
