import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from 'antd';
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
};

const maskText = (len: number) => '•'.repeat(Math.max(1, Math.min(len, 64)));

const calcStrength = (v: string) => {
  let score = 0;
  if (!v) return 0;
  if (v.length >= 8) score += 1;
  if (/[a-z]/.test(v)) score += 1;
  if (/[A-Z]/.test(v)) score += 1;
  if (/\d/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v)) score += 1;
  return Math.min(score, 5);
};

const strengthText = (s: number) => {
  if (s <= 1) return '弱';
  if (s <= 3) return '中';
  return '强';
};

const SecurePasswordInput = (props: SecurePasswordInputProps) => {
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
    placeholder: placeholder || (mode === 'edit' && initialHasValue ? '已设置，未修改将保留原值' : undefined),
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
  const strength = calcStrength(internal);
  const showStrength = !!internal && (visible || touchedRef.current);

  if (multiline) {
    return (
      <div>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 6 }}
          {...inputProps}
          value={visible ? internal : ''}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
          <span style={{ flex: 1, color: 'var(--text-color-secondary)' }}>{visible ? '' : shownText}</span>
          <span style={{ marginLeft: 8 }}>{suffix}</span>
        </div>
        {showStrength ? (
          <div style={{ marginTop: 4, fontSize: 12, color: strength >= 4 ? '#52c41a' : strength >= 2 ? '#faad14' : '#ff4d4f' }}>
            密码强度：{strengthText(strength)}
          </div>
        ) : null}
        {mode === 'edit' && initialHasValue ? (
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-color-secondary)' }}>编辑模式：未修改将保留原值</div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <Input
        type={visible ? 'text' : 'password'}
        {...inputProps}
        suffix={suffix}
      />
      {showStrength ? (
        <div style={{ marginTop: 4, fontSize: 12, color: strength >= 4 ? '#52c41a' : strength >= 2 ? '#faad14' : '#ff4d4f' }}>
          密码强度：{strengthText(strength)}
        </div>
      ) : null}
      {mode === 'edit' && initialHasValue ? (
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-color-secondary)' }}>编辑模式：未修改将保留原值</div>
      ) : null}
    </div>
  );
};

export default SecurePasswordInput;
