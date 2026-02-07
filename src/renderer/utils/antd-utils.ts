import { MessageInstance } from 'antd/es/message/interface';
import { ModalStaticFunctions } from 'antd/es/modal/confirm';
import { NotificationInstance } from 'antd/es/notification/interface';

let message: MessageInstance;
let notification: NotificationInstance;
let modal: Omit<ModalStaticFunctions, 'warn'>;

export default {
  setMessage: (_message: MessageInstance) => {
    message = _message;
  },
  setNotification: (_notification: NotificationInstance) => {
    notification = _notification;
  },
  setModal: (_modal: Omit<ModalStaticFunctions, 'warn'>) => {
    modal = _modal;
  },
  get message() {
    return message;
  },
  get notification() {
    return notification;
  },
  get modal() {
    return modal;
  },
};
