import { useEffect, useMemo, useState } from 'react';
import { Button, Space, Input, Dropdown, Menu, Radio } from '@arco-design/web-react';
import { IconLeft, IconRight, IconDown, IconList, IconApps } from '@arco-design/web-react/icon';

import TableContent from './TableContent';
import CardContent from './CardContent';
import { FolderCreateWrap, ViewInput, FileDropWrap } from '@/renderer/components';
import { PathHistory, events, storeRequest, openViewer } from '@/renderer/utils';
import { createTask } from '@/renderer/utils/task';
import { ETaskType } from '@/types';
import { useLoading } from '@/renderer/hooks';
import { useTabsStore, Tab, ETabDisplay } from '@/renderer/store';
import './index.css';

const RadioGroup = Radio.Group;

export type S3ViwerProps = {
  connectionId: string;
  bucketName: string;
  data: Tab;
};
const S3Viewer = (props: S3ViwerProps) => {
  const { connectionId, bucketName, data } = props;
  const { updateTab } = useTabsStore();
  const [dataList, setDataList] = useState([]);
  const { loading, setLoading } = useLoading(false);
  const [curPrefix, setCurPrefix] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<PathHistory | null>(null);

  const display = useMemo(() => {
    return data?.display || ETabDisplay.LIST;
  }, [data?.display]);

  const [canBack, canForward] = useMemo(() => {
    return [pathHistory?.canBack(), pathHistory?.canForward()];
  }, [pathHistory, curPrefix]);

  const handlePathBack = () => {
    const prefix = pathHistory?.back() as string;
    setCurPrefix(prefix);
  };

  const handlePathForward = () => {
    const prefix = pathHistory?.forward() as string;
    setCurPrefix(prefix);
  };

  const handleGetObjects = async () => {
    setLoading(true);
    const res = await storeRequest({
      method: 'list',
      id: connectionId,
      params: {
        bucketName: bucketName,
        prefix: curPrefix,
      },
    });
    setLoading(false);
    if (res.success) {
      setDataList(res.data.objects);
      console.log(res.data);
    }
  };

  const handlePrefixChange = (value: string) => {
    const prefix = pathHistory?.go(value) as string;
    setCurPrefix(prefix);
  };

  const handleFileView = (data: any) => {
    console.log('查看文件：', data.name);
    openViewer(connectionId, {
      ...data,
      bucketName,
    });
  };

  const handleDownload = async (record: any) => {
    const localPath = await events.getSingleDirPath({});
    if (localPath) {
      createTask(
        ETaskType.DOWNLOAD,
        connectionId,
        'get',
        { bucketName: bucketName, prefix: curPrefix, key: record.key, localPath: localPath },
        record.size
      );
    }
  };

  // 上传文件
  const handleUpload = async () => {
    // 选择文件夹
    const localPaths = await events.getMultDirAndFilePath({});
    if (localPaths && localPaths.length) {
      handlePut(localPaths);
    }
  };

  const handlePut = async (paths: string[]) => {
    return createTask(ETaskType.UPLOAD, connectionId, 'put', {
      bucketName,
      prefix: curPrefix,
      localPaths: paths,
    });
  };

  const handlePutFolder = async (folderName: string) => {
    createTask(ETaskType.CREATE_DIR, connectionId, 'putFolder', {
      bucketName,
      prefix: curPrefix,
      localPath: folderName,
    });
  };

  const handleDelete = async (record: any) => {
    createTask(
      ETaskType.DELETE,
      connectionId,
      'delete',
      {
        bucketName,
        key: record.key,
      },
      record.size
    );
  };

  const handleRename = async (record: any, newName: string) => {
    createTask(ETaskType.RENAME, connectionId, 'rename', {
      bucketName,
      prefix: curPrefix,
      oldKey: record.key,
      newKey: newName,
    });
  };

  const handleDisplayChange = (value: ETabDisplay) => {
    updateTab({ ...data, display: value });
  };

  useEffect(() => {
    if (connectionId) {
      handleGetObjects();
    }
  }, [connectionId, curPrefix, data?.refreshTick]);

  useEffect(() => {
    const instance = new PathHistory({ path: curPrefix });
    setPathHistory(instance);
  }, []);

  return (
    <div className="viewer">
      <div className="viewer-path">
        <Space size={2}>
          <Button disabled={!canBack} icon={<IconLeft style={{ fontSize: 'large' }} />} onClick={handlePathBack} />
          <Button
            disabled={!canForward}
            icon={<IconRight style={{ fontSize: 'large' }} />}
            onClick={handlePathForward}
          />
        </Space>
        <div className="viewer-path-input">
          <ViewInput prefix={bucketName} value={curPrefix} onChange={handlePrefixChange} style={{ width: '100%' }} />
        </div>
      </div>
      <div className="viewer-actions">
        <Space size={4}>
          <Button type="primary" onClick={handleUpload} size="small">
            上传
          </Button>
          <FolderCreateWrap onCreateFolder={handlePutFolder}>
            <Button type="outline" size="small">
              新建目录
            </Button>
          </FolderCreateWrap>
          <Button type="outline" size="small">
            下载
          </Button>
          <Dropdown
            trigger="click"
            droplist={
              <Menu>
                <Menu.Item key="copy">复制到</Menu.Item>
                <Menu.Item key="move">移动到</Menu.Item>
                <Menu.Item key="remove">删除</Menu.Item>
              </Menu>
            }
          >
            <Button type="outline" size="small">
              更多 <IconDown style={{ fontSize: 'medium' }} />
            </Button>
          </Dropdown>
        </Space>
        <Space size={4}>
          <Input.Search style={{ width: '240px' }} />
          <Button onClick={handleGetObjects}> 刷新 </Button>
          <RadioGroup type="button" name="lang" value={display} onChange={handleDisplayChange}>
            <Radio value="list" style={{ fontSize: 'medium' }}>
              <IconList />
            </Radio>
            <Radio value="card" style={{ fontSize: 'medium' }}>
              <IconApps />
            </Radio>
          </RadioGroup>
        </Space>
      </div>
      <div className="viewer-content">
        <FileDropWrap onDrop={handlePut}>
          {display === ETabDisplay.LIST ? (
            <TableContent
              connectionId={connectionId}
              loading={loading}
              data={dataList}
              onPrefixChange={handlePrefixChange}
              onFileView={handleFileView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ) : null}
          {display === ETabDisplay.CARD ? (
            <CardContent
              connectionId={connectionId}
              loading={loading}
              data={dataList}
              onPrefixChange={handlePrefixChange}
              onFileView={handleFileView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ) : null}
        </FileDropWrap>
      </div>
      <div className="viewer-footer">
        <span>已选 0 项，已拉取 {dataList.length} 项 </span>
      </div>
    </div>
  );
};

export default S3Viewer;
