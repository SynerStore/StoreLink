import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type Connection = {
  id: string;
  type: string;
  brand: string;
  authInfo: Record<string, any>;
  createDate?: string;
  updateDate?: string;
  subStores?: any[];
};

// 账号连接的更新
export const useConfigStore = create((set,get) => ({
  connections: [
    {
      id: 'xxxxxx-xxxx-000',
      type: 'oss',
      brand: 'aliyun',
      name: 'ape-resume-hz-dev',
      config: {
        accessKeyId: 'LTAI5tNo1REGXhswci9MwnQv',
        accessKeySecret: 'q7YbuV77iHZE89C6u7eQtFaqJUjnAY',
        region: 'oss-cn-hangzhou',
        bucket: 'ape-resume-hz-dev',
      },
      createDate: '2023-05-05',
      updateDate: '2023-05-05',
    },
    {
      id: 'xxxxxx-xxxx-111',
      type: 'oss',
      brand: 'aliyun',
      name: 'chrissong-web-bucket',
      config: {
        accessKeyId: 'LTAI5tNo1REGXhswci9MwnQv',
        accessKeySecret: 'q7YbuV77iHZE89C6u7eQtFaqJUjnAY',
        region: 'oss-cn-hangzhou',
        bucket: 'chrissong-web-bucket',
      },
      createDate: '2023-05-05',
      updateDate: '2023-05-05',
    },
    {
      id: 'xxxxxx-xxxx-222',
      type: 'oss',
      brand: 'aliyun',
      name: 'ape-resume-hz-prod',
      config: {
        accessKeyId: 'LTAI5tNo1REGXhswci9MwnQv',
        accessKeySecret: 'q7YbuV77iHZE89C6u7eQtFaqJUjnAY',
        // region: 'oss-cn-hangzhou',
        bucket: 'ape-resume-hz-prod',
      },
      createDate: '2023-05-05',
      updateDate: '2023-05-05',
    },
    {
      id: 'xxxxxx-xxxx-333',
      type: 'cos',
      brand: 'tengxunyun',
      name: '91ape-1309020861',
      config: {
        accessKeyId: 'LTAI5tNo1REGXhswci9MwnQv',
        accessKeySecret: 'q7YbuV77iHZE89C6u7eQtFaqJUjnAY',
        // region: 'oss-cn-hangzhou',
        bucket: '91ape-1309020861',
      },

      createDate: '2023-05-05',
      updateDate: '2023-05-05',
    },
    {
      id: 'xxxxxx-xxxx-444',
      type: 'cos',
      brand: 'tengxunyun',
      name: '91ape-assets-1309020861',
      config: {
        accessKeyId: 'AKIDmPmtkLgla9TXMv73i7G9m9F3bstd6JFu',
        accessKeySecret: 'hFYcQxOgjV4OSVTE3iBPN8dsrb6LK2BA',
        // region: 'oss-cn-hangzhou',
        bucket: '91ape-assets-1309020861',
      },

      createDate: '2023-05-05',
      updateDate: '2023-05-05',
    },
    {
      id: 'xxxxxx-xxxx-555',
      type: 'cos',
      brand: 'tengxunyun',
      name: '91ape-dev-1309020861',
      config: {
        accessKeyId: 'AKIDmPmtkLgla9TXMv73i7G9m9F3bstd6JFu',
        accessKeySecret: 'hFYcQxOgjV4OSVTE3iBPN8dsrb6LK2BA',
        // region: 'oss-cn-hangzhou',
        bucket: '91ape-dev-1309020861',
      },
      createDate: '2023-05-05',
      updateDate: '2023-05-05',
    },
  ], // 连接
  addConnection: (connection: Connection) => {
    return set((state: any) => ({
      connections: [
        ...state.connections,
        { connection, id: uuidv4(), createDate: new Date().toLocaleString(), updateDate: new Date().toLocaleString() },
      ],
    }));
  },
  removeConnection: (connection: Connection) => {
    return set((state: any) => ({ connections: state.connections.filter((c: any) => c.id !== connection.id) }));
  },
  updateConnection: (connection: Connection) => {
    return set((state: any) => ({
      connections: state.connections.map((c: any) =>
        c.id === connection.id ? { ...connection, updateDate: new Date().toLocaleString() } : c,
      ),
    }));
  }
}));
