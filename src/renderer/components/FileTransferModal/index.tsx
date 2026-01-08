import React, { useState, useEffect } from 'react';
import { Modal, Select, Tree, Input, message, Form } from 'antd';
import { FolderOutlined, HddOutlined } from '@ant-design/icons';
import { useConfigStore } from '@/renderer/store';
import { storeRequest } from '@/renderer/utils';
import { TStoreObject } from '@/types';
import './index.css';

interface FileTransferModalProps {
  visible: boolean;
  mode: 'move' | 'copy';
  files: TStoreObject[];
  sourceConnectionId: string;
  onCancel: () => void;
  onOk: (targetConnectionId: string, targetPath: string) => void;
}

const FileTransferModal: React.FC<FileTransferModalProps> = ({
  visible,
  mode,
  files,
  sourceConnectionId,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const { connections } = useConfigStore();
  const [targetConnectionId, setTargetConnectionId] = useState<string>(sourceConnectionId);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // Initialize target connection when modal opens
  useEffect(() => {
    if (visible) {
      setTargetConnectionId(sourceConnectionId);
      setSelectedPath('');
      setTreeData([]);
      form.setFieldsValue({
        targetConnectionId: sourceConnectionId,
        targetPath: '',
      });
    }
  }, [visible, sourceConnectionId, form]);

  // Load root folders when target connection changes
  useEffect(() => {
    if (visible && targetConnectionId) {
      // Clear tree data before loading new connection (except initial load if handled above, but here ensures safety)
      // Actually if we clear here, we might flash empty.
      // But if we don't clear, we might show old tree.
      // We should check if treeData corresponds to current connection? Hard.
      // Better to clear if connectionId changed.
      // Since this effect runs on targetConnectionId change, we can clear here.
      // However, on mount (visible=true), targetConnectionId is set.
      // Let's rely on this effect for loading.
      setTreeData([]);
      loadFolders(targetConnectionId, '');
    }
  }, [visible, targetConnectionId]);

  const loadFolders = async (connectionId: string, prefix: string) => {
    setLoading(true);
    try {
      const res = await storeRequest({
        method: 'listDir',
        id: connectionId,
        params: { prefix },
      });
      if (res.success) {
        const folders = res.data;
        const nodes = folders.map((item: TStoreObject) => ({
          title: item.name,
          key: item.key,
          isLeaf: false,
          icon: <FolderOutlined />,
        }));

        if (prefix === '') {
           // Root level
           setTreeData(nodes);
        } else {
            // Update tree data for expanded node
            setTreeData((origin) => updateTreeData(origin, prefix, nodes));
        }
      } else {
        message.error(`加载目录失败: ${res.message || '未知错误'}`);
      }
    } catch (error: any) {
      message.error(`加载目录失败: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const updateTreeData = (list: any[], key: React.Key, children: any[]): any[] => {
    return list.map((node) => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, key, children) };
      }
      return node;
    });
  };

  const onLoadData = ({ key }: any) => {
    return loadFolders(targetConnectionId, key);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      await onOk(values.targetConnectionId, values.targetPath);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleConnectionChange = (value: string) => {
    setTargetConnectionId(value);
    form.setFieldsValue({ targetConnectionId: value });
  };

  return (
    <Modal
      title={`${mode === 'move' ? '移动' : '复制'} ${files.length} 项`}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={600}
    >
      <div className="transfer-modal-info">
        来源: {files.length > 0 ? files[0].key : ''} ...
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="targetConnectionId"
          label="目标存储"
          rules={[{ required: true, message: '请选择目标存储' }]}
        >
          <Select
            style={{ width: '100%' }}
            onChange={handleConnectionChange}
          >
            {connections.map((conn: any) => (
              <Select.Option key={conn.id} value={conn.id}>
                <HddOutlined /> {conn.name} ({conn.brand})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="targetPath"
          label="目标路径"
        >
          <Input readOnly placeholder="请在下方选择文件夹" />
        </Form.Item>
      </Form>

      <div className="transfer-modal-tree">
        <Tree
          loadData={onLoadData}
          treeData={treeData}
          onSelect={(keys, info) => {
            if (keys.length > 0) {
              const path = keys[0] as string;
              setSelectedPath(path);
              form.setFieldsValue({ targetPath: path });
            }
          }}
          showIcon
          blockNode
        />
      </div>
    </Modal>
  );
};

export default FileTransferModal;
