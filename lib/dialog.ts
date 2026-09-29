import { create } from "zustand";

/**
 * 应用内弹窗。
 *
 * 不用 react-native 的 Alert：它在 Web 上是空实现（`static alert() {}`），
 * 点了完全没反应。也不用浏览器的 window.confirm / alert：这类原生对话框在部分
 * 浏览器或内嵌 WebView 里会被抑制、甚至直接返回 true，导致"二次确认"形同虚设，
 * 按钮一点就直接执行。
 *
 * 因此统一走应用内渲染的弹层，行为在各端一致。
 */

export interface DialogRequest {
  title: string;
  message?: string;
  /** 确定按钮文案 */
  confirmText: string;
  /** 取消按钮文案；不传表示单按钮提示弹窗 */
  cancelText?: string;
  destructive?: boolean;
  onConfirm?: () => void;
  /** 弹窗关闭（无论确定还是取消）后触发 */
  onClose?: () => void;
}

interface DialogState {
  request: DialogRequest | null;
  open: (request: DialogRequest) => void;
  /** 点确定：执行 onConfirm 后关闭 */
  confirm: () => void;
  /** 点取消 / 点遮罩 / 返回键：直接关闭，不执行 onConfirm */
  dismiss: () => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  request: null,
  open: (request) => set({ request }),
  confirm: () => {
    const { request } = get();
    if (!request) return;
    set({ request: null });
    request.onConfirm?.();
    request.onClose?.();
  },
  dismiss: () => {
    const { request } = get();
    if (!request) return;
    set({ request: null });
    request.onClose?.();
  },
}));

interface AlertOptions {
  title: string;
  message?: string;
  okText: string;
  onClose?: () => void;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText: string;
  cancelText: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/** 单按钮提示弹窗 */
export function showAlert({ title, message, okText, onClose }: AlertOptions): void {
  useDialogStore.getState().open({ title, message, confirmText: okText, onClose });
}

/** 双按钮确认弹窗，只有点确定才会执行 onConfirm */
export function showConfirm({
  title,
  message,
  confirmText,
  cancelText,
  destructive,
  onConfirm,
}: ConfirmOptions): void {
  useDialogStore
    .getState()
    .open({ title, message, confirmText, cancelText, destructive, onConfirm });
}
