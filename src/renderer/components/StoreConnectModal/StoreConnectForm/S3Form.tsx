import { Form, Input, Button } from '@arco-design/web-react';
const FormItem = Form.Item;

const S3Form = () => {
  return (
    <Form autoComplete="off">
      <FormItem label="Access Key">
        <Input />
      </FormItem>
      <FormItem label="Secret Key">
        <Input />
      </FormItem>
      <FormItem label="Bucket Name">
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

export default S3Form;
