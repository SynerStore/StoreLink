import { Form, Input, Button } from '@arco-design/web-react';
const FormItem = Form.Item;

const LocalForm = () => {
  return (
    <Form style={{ width: 600 }} autoComplete="off">
         <FormItem label="连接名称">
        <Input />
      </FormItem>
      <FormItem label="本机目录">
        <Input />
      </FormItem>

      <FormItem wrapperCol={{ offset: 5 }}>
        <Button type="primary" size="small">
          重新选择
        </Button>
      </FormItem>
    </Form>
  );
};

export default LocalForm;
