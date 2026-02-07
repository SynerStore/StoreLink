import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { withTranslation, WithTranslation } from 'react-i18next';
import { winReload } from '@/renderer/utils';

const { Paragraph, Text } = Typography;

interface Props extends WithTranslation {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title={t('common.errorTitle', 'Something went wrong')}
          subTitle={t('common.errorDesc', 'Sorry, an unexpected error has occurred.')}
          extra={[
            <Button
              type="primary"
              key="reload"
              icon={<ReloadOutlined />}
              onClick={() => winReload()}
            >
              {t('common.reloadApp', 'Reload Application')}
            </Button>,
          ]}
        >
          <div className="desc">
            <Paragraph>
              <Text strong style={{ fontSize: 16 }}>
                {t('common.errorDetails', 'Error Details:')}
              </Text>
            </Paragraph>
            <Paragraph>
              <Text type="danger">{this.state.error?.toString()}</Text>
            </Paragraph>
            {this.state.errorInfo && (
              <details style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo.componentStack}
              </details>
            )}
          </div>
        </Result>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
