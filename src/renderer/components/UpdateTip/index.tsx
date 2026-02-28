import React, { useState, useEffect } from 'react';
import { Modal, Button, Progress, Typography, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { DownloadOutlined, CloudSyncOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useUpdate } from '@/renderer/hooks/useUpdate';
import { EUpdateStatus } from '@/types/update';
import './index.css';

const { Text, Title } = Typography;

interface UpdateTipProps {
  /** 是否在设置页面显示 */
  visible?: boolean;
  /** 是否以按钮形式显示（用于设置页面） */
  isButton?: boolean;
  /** 手动触发的回调 */
  onCheckUpdate?: () => void;
}

/**
 * 版本更新提示组件
 */
const UpdateTip: React.FC<UpdateTipProps> = ({ visible = false, isButton = false, onCheckUpdate }) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const {
    status,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    startDownload,
    installUpdate,
    hasUpdate,
    isChecking,
    isDownloading,
  } = useUpdate();

  const [modalVisible, setModalVisible] = useState(false);
  const [localVisible, setLocalVisible] = useState(visible);

  // 监听 visible 属性变化
  useEffect(() => {
    setLocalVisible(visible);
  }, [visible]);

  // 当检测到更新时自动弹出提示
  useEffect(() => {
    if (hasUpdate && !localVisible) {
      setModalVisible(true);
    }
  }, [hasUpdate, localVisible]);

  // 手动检查更新
  const handleCheckUpdate = async () => {
    onCheckUpdate?.();
    const result = await checkForUpdates(false);
    if (result.hasUpdate) {
      setModalVisible(true);
    } else {
      message.info(t('update.noUpdate', '当前已是最新版本'));
    }
  };

  // 开始下载
  const handleDownload = async () => {
    const result = await startDownload();
    if (!result.success) {
      message.error(result.error || t('update.downloadFailed', '下载失败'));
    }
  };

  // 安装更新
  const handleInstall = async () => {
    const result = await installUpdate();
    if (!result.success) {
      message.error(result.error || t('update.installFailed', '安装失败'));
    }
  };

  // 渲染状态内容
  const renderStatusContent = () => {
    switch (status) {
      case EUpdateStatus.CHECKING:
        return (
          <div className="update-status-content">
            <CloudSyncOutlined spin style={{ fontSize: 32, color: '#1890ff' }} />
            <Text>{t('update.checking', '正在检查更新...')}</Text>
          </div>
        );

      case EUpdateStatus.AVAILABLE:
        return (
          <div className="update-status-content">
            <div className="update-info">
              <Title level={4}>
                {t('update.newVersion', '发现新版本')}
                : {updateInfo?.version}
              </Title>
              <div className="update-notes">
                <Text type="secondary">{t('update.releaseNotes', '更新日志')}:</Text>
                <div className="update-notes-content">
                  {updateInfo?.releaseNotes || t('update.noReleaseNotes', '暂无更新日志')}
                </div>
              </div>
            </div>
          </div>
        );

      case EUpdateStatus.DOWNLOADING:
        return (
          <div className="update-status-content">
            <DownloadOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            <div className="download-progress">
              <Text>{t('update.downloading', '正在下载...')}</Text>
              <Progress
                percent={progress?.percent || 0}
                status="active"
                size="small"
                format={(percent) => `${percent}%`}
              />
              <Text type="secondary">
                {formatBytes(progress?.transferred || 0)} / {formatBytes(progress?.total || 0)}
              </Text>
            </div>
          </div>
        );

      case EUpdateStatus.DOWNLOADED:
        return (
          <div className="update-status-content">
            <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
            <Text>{t('update.downloaded', '下载完成，点击安装')}</Text>
          </div>
        );

      case EUpdateStatus.ERROR:
        return (
          <div className="update-status-content">
            <WarningOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
            <Text type="danger">{error || t('update.error', '更新出错')}</Text>
          </div>
        );

      default:
        return null;
    }
  };

  // 渲染底部按钮
  const renderFooter = () => {
    switch (status) {
      case EUpdateStatus.AVAILABLE:
        return [
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            {t('update.later', '稍后')}
          </Button>,
          <Button key="download" type="primary" onClick={handleDownload} loading={isDownloading}>
            <DownloadOutlined />
            {t('update.download', '下载更新')}
          </Button>,
        ];

      case EUpdateStatus.DOWNLOADED:
        return [
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            {t('update.later', '稍后')}
          </Button>,
          <Button key="install" type="primary" onClick={handleInstall}>
            {t('update.installNow', '立即安装')}
          </Button>,
        ];

      case EUpdateStatus.DOWNLOADING:
        return [
          <Button key="cancel" onClick={() => setModalVisible(false)} disabled>
            {t('update.downloading', '下载中...')}
          </Button>,
        ];

      case EUpdateStatus.ERROR:
        return [
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            {t('common.cancel', '取消')}
          </Button>,
          <Button key="retry" type="primary" onClick={handleCheckUpdate}>
            {t('update.retry', '重试')}
          </Button>,
        ];

      default:
        return [
          <Button key="close" onClick={() => setModalVisible(false)}>
            {t('common.close', '关闭')}
          </Button>,
        ];
    }
  };

  return (
    <>
      {/* 检查更新按钮（用于设置页面） */}
      {isButton ? (
        <Button
          icon={<CloudSyncOutlined />}
          onClick={handleCheckUpdate}
          loading={isChecking}
        >
          {t('settings.checkUpdate')}
        </Button>
      ) : (
        <Button
          icon={<CloudSyncOutlined />}
          onClick={handleCheckUpdate}
          loading={isChecking}
          size="small"
        >
          {t('update.checkUpdate', '检查更新')}
        </Button>
      )}

      {/* 更新提示弹窗 */}
      <Modal
        title={t('update.title', '版本更新')}
        open={modalVisible || localVisible}
        onCancel={() => setModalVisible(false)}
        footer={renderFooter()}
        width={500}
        centered
        maskClosable={status !== EUpdateStatus.DOWNLOADING}
      >
        {renderStatusContent()}
      </Modal>
    </>
  );
};

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default UpdateTip;
