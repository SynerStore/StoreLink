import { Form, Input, Button } from '@arco-design/web-react';
const FormItem = Form.Item;

const FtpForm = () => {
  return (
    <Form style={{ width: 600 }} autoComplete="off">
      <FormItem label="主机">
        <Input />
      </FormItem>
      <FormItem label="端口">
        <Input />
      </FormItem>
      <FormItem label="账号">
        <Input />
      </FormItem>
      <FormItem label="密码">
        <Input />
      </FormItem>
      <FormItem label="加密">
        <Input />
      </FormItem>

      <FormItem wrapperCol={{ offset: 5 }}>
        <Button type="primary" size="small">
          链接测试
        </Button>
      </FormItem>
    </Form>
  );
};

export default FtpForm;
