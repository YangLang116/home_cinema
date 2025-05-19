import { useState, useRef, useCallback } from 'react';
import ClipboardJS from 'clipboard';

export interface UseClipboardReturn {
  copyText: (text: string) => void;
  showMessage: (message: string, success?: boolean) => void;
  isSuccess: boolean;
  message: string;
  clearMessage: () => void;
}

export const useClipboard = (): UseClipboardReturn => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const clipboardRef = useRef<ClipboardJS | null>(null);

  // 封装复制逻辑
  const copyText = useCallback((text: string) => {
    if (!text) return;

    const fakeButton = document.createElement('button');
    clipboardRef.current = new ClipboardJS(fakeButton, {
      text: () => text
    });

    clipboardRef.current.on('success', () => {
      setIsSuccess(true);
      setMessage('下载链接已复制到剪贴板');
      // 销毁实例
      clipboardRef.current?.destroy();
    });

    clipboardRef.current.on('error', () => {
      setIsSuccess(false);
      setMessage('复制失败，请手动复制链接');
      // 销毁实例
      clipboardRef.current?.destroy();
    });

    // 触发复制操作
    fakeButton.click();
  }, []);

  // 显示消息
  const showMessage = useCallback((msg: string, success: boolean = true) => {
    setMessage(msg);
    setIsSuccess(success);
  }, []);

  // 清除消息
  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  return {
    copyText,
    showMessage,
    isSuccess,
    message,
    clearMessage
  };
}; 