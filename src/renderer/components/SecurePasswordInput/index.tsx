import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

type SecurePasswordInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string | undefined) => void;
  mode?: 'create' | 'edit';
  placeholder?: string;
  allowPaste?: boolean;
  allowCopy?: boolean;
  multiline?: boolean;
  disabled?: boolean;
  maskedLength?: number;
  maskChar?: string;
};

const maskText = (len: number, ch: string = '*') => ch.repeat(Math.max(1, Math.min(len, 256)));

const SecurePasswordInput = (props: SecurePasswordInputProps) => {
  const { t } = useTranslation();
  const {
    value,
    defaultValue,
    onChange,
    mode = 'create',
    placeholder,
    allowPaste = false,
    allowCopy = false,
    multiline = false,
    disabled = false,
    maskedLength,
    maskChar = '*',
  } = props;

  const initialHasValue = useMemo(() => !!(value ?? defaultValue), [value, defaultValue]);
  const [visible, setVisible] = useState(false);
  const [internal, setInternal] = useState<string>(value ?? defaultValue ?? '');
  const touchedRef = useRef(false);

  useEffect(() => {
    setInternal(value ?? defaultValue ?? '');
  }, [value, defaultValue]);

  useEffect(() => {
    return () => {
      setInternal('');
    };
  }, []);

  const handleToggle = () => setVisible((v) => !v);

  const handleChange = (e: any) => {
    touchedRef.current = true;
    const next = e?.target?.value ?? '';
    setInternal(next);
    onChange?.(next);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!allowPaste) {
      e.preventDefault();
    }
  };

  const handleCopy = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!allowCopy) {
      e.preventDefault();
    }
  };

  const maskLen = typeof maskedLength === 'number' ? maskedLength : initialHasValue ? 8 : 0;
  const masked = maskText(maskLen, maskChar);

  const inputProps = {
    autoComplete: 'new-password',
    inputMode: 'text' as any,
    autoCapitalize: 'off' as any,
    autoCorrect: 'off' as any,
    spellCheck: false,
    onPaste: handlePaste,
    onCopy: handleCopy,
    onChange: handleChange,
    disabled,
    placeholder: (mode === 'edit' && initialHasValue && !touchedRef.current ? masked : undefined) || placeholder,
    value: visible ? internal : mode === 'edit' && initialHasValue && !touchedRef.current ? '' : internal,
  };

  const suffix = (
    <span
      onMouseDown={(e) => e.preventDefault()}
      onClick={handleToggle}
      style={{ cursor: 'pointer', color: 'var(--primary-color)' }}
      aria-label={visible ? '隐藏' : '显示'}
    >
      {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
    </span>
  );

  const shownText = visible ? internal : maskText(internal?.length || (initialHasValue ? 8 : 0));

  if (multiline) {
    return (
      <div>
        <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} {...inputProps} value={visible ? internal : ''} />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
          <span style={{ marginLeft: 8 }}>{suffix}</span>
        </div>
        {mode === 'edit' && initialHasValue ? (
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-color-secondary)' }}>
            编辑模式：未修改将保留原值
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <Input type={visible ? 'text' : 'password'} {...inputProps} suffix={suffix} />
      {mode === 'edit' && initialHasValue ? (
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-color-secondary)' }}>
          {t('common.editModePasswordHint')}
        </div>
      ) : null}
    </div>
  );
};

export default SecurePasswordInput;
