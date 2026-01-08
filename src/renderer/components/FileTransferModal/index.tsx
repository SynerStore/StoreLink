import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Select, Tree, Input, message, Form, Spin } from 'antd';
import { HddOutlined } from '@ant-design/icons';
import { debounce } from 'lodash-es';
import { useConfigStore } from '@/renderer/store';
import { storeRequest } from '@/renderer/utils';
import { TStoreObject } from '@/types';
import FolderIcon from '@/renderer/assets/file-icons/folder.svg';
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
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // 初始化目标连接为源连接，当模态框打开时
  useEffect(() => {
    if (visible) {
      setTargetConnectionId(sourceConnectionId);
      setSelectedPath('/');
      setTreeData([]);
      setExpandedKeys([]);
      // 默认选中源连接根目录
      form.setFieldsValue({
        targetConnectionId: sourceConnectionId,
        targetPath: '/',
      });
    }
  }, [visible, sourceConnectionId, form]);

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
          icon: <img src={FolderIcon} style={{ width: 16, height: 16 }} alt="folder" />,
        }));

        if (prefix === '') {
          setTreeData(nodes);
        } else {
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

  /**
   * Handle tree node expand/collapse
   * 处理树节点展开/折叠
   */
  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
  };

  /**
   * 处理树节点选中，增加防抖以避免双击时触发选中
   */
  const handleSelect = useMemo(() => {
    return debounce((keys: React.Key[], info: any) => {
      if (keys.length > 0) {
        const path = keys[0] as string;
        setSelectedPath(path);
        form.setFieldsValue({ targetPath: path });
      }
    }, 200);
  }, [form]);

  /**
   * 处理树节点双击事件：双击触发展开/折叠，同时保持选中状态
   */
  const handleNodeDoubleClick = (e: React.MouseEvent, node: any) => {
    // 清除当前选中，防止双击时触发选中
    handleSelect.cancel();

    const key = node.key;
    const isExpanded = expandedKeys.includes(key);
    let newExpandedKeys;

    if (isExpanded) {
      newExpandedKeys = expandedKeys.filter((k) => k !== key);
    } else {
      newExpandedKeys = [...expandedKeys, key];
    }

    setExpandedKeys(newExpandedKeys);
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
    setSelectedPath('/');
    form.setFieldsValue({
      targetConnectionId: value,
      targetPath: '/',
    });
  };

  // 加载目标连接的根目录
  useEffect(() => {
    if (visible && targetConnectionId) {
      setTreeData([]);
      setExpandedKeys([]);
      loadFolders(targetConnectionId, '');
    }
  }, [visible, targetConnectionId]);

  // Cancel debounce on unmount
  useEffect(() => {
    return () => {
      handleSelect.cancel();
    };
  }, [handleSelect]);

  return (
    <Modal
      title={`${mode === 'move' ? '移动' : '复制'} ${files.length} 项`}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={600}
    >
      <div className="transfer-modal-info">来源: {files.length > 0 ? files[0].key : ''} ...</div>

      <Form form={form} layout="vertical">
        <Form.Item name="targetConnectionId" label="目标存储" rules={[{ required: true, message: '请选择目标存储' }]}>
          <Select style={{ width: '100%' }} onChange={handleConnectionChange}>
            {connections.map((conn: any) => (
              <Select.Option key={conn.id} value={conn.id}>
                <HddOutlined /> {conn.name} ({conn.brand})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="targetPath" label="目标路径">
          <Input readOnly placeholder="请在下方选择文件夹" />
        </Form.Item>
      </Form>

      <div className="transfer-modal-tree">
        <Spin spinning={loading}>
          <Tree
            loadData={onLoadData}
            treeData={treeData}
            expandedKeys={expandedKeys}
            selectedKeys={selectedPath ? [selectedPath] : []}
            onExpand={onExpand}
            onDoubleClick={handleNodeDoubleClick}
            onSelect={handleSelect}
            showIcon
            blockNode
          />
        </Spin>
      </div>
    </Modal>
  );
};

export default FileTransferModal;
