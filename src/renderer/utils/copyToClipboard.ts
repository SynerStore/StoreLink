/**
 * 拷贝到剪贴板
 */

const copyByExecCommand = (text: string) => {
  return new Promise((resolve) => {
    const textArea = document.createElement('textarea');
    try {
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';

      document.body.prepend(textArea);
      textArea.select();

      document.execCommand('copy');
      textArea.remove();
      resolve(true);
    } catch (error: any) {
      console.error('copyByExecCommand error', error.message);
      resolve(false);
    } finally {
      textArea.remove();
    }
  });
};

async function copyByClipboard(text: string) {
  return new Promise((resolve, reject) => {
    try {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          console.error('copyByClipboard error', error.message);
          reject(false);
        });
    } catch (error:any) {
      console.error('copyByClipboard error', error.message);
      reject(false);
    }
  });
}

export async function copyToClipboard(text: string) {
  return new Promise((resolve, reject) => {
    copyByClipboard(text)
      .then((result) => resolve(result))
      .catch(async () => {
        const result = await copyByExecCommand(text);
        if (result) {
          resolve(result);
        } else {
          reject();
        }
      });
  });
}
