import { beforeEach, describe, expect, it, vi } from "vitest";
import { showAlert, showConfirm, useDialogStore } from "../dialog";

const reset = () => useDialogStore.setState({ request: null });

describe("dialog", () => {
  beforeEach(reset);

  it("打开确认弹窗时不会立即执行 onConfirm", () => {
    const onConfirm = vi.fn();

    showConfirm({
      title: "重新开始当前谜题？",
      message: "当前进度将被清空。",
      confirmText: "重来",
      cancelText: "取消",
      destructive: true,
      onConfirm,
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(useDialogStore.getState().request).toMatchObject({
      title: "重新开始当前谜题？",
      confirmText: "重来",
      cancelText: "取消",
      destructive: true,
    });
  });

  it("取消（dismiss）不会执行 onConfirm", () => {
    const onConfirm = vi.fn();

    showConfirm({
      title: "t",
      confirmText: "ok",
      cancelText: "cancel",
      onConfirm,
    });
    useDialogStore.getState().dismiss();

    expect(onConfirm).not.toHaveBeenCalled();
    expect(useDialogStore.getState().request).toBeNull();
  });

  it("点确定才执行 onConfirm，并且弹窗关闭", () => {
    const onConfirm = vi.fn();

    showConfirm({ title: "t", confirmText: "ok", cancelText: "cancel", onConfirm });
    useDialogStore.getState().confirm();

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(useDialogStore.getState().request).toBeNull();
  });

  it("连点确定也只执行一次", () => {
    const onConfirm = vi.fn();

    showConfirm({ title: "t", confirmText: "ok", cancelText: "cancel", onConfirm });
    const { confirm } = useDialogStore.getState();
    confirm();
    confirm();

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("单按钮提示弹窗确认后触发 onClose", () => {
    const onClose = vi.fn();

    showAlert({ title: "连胜 3 天！", okText: "知道了", onClose });
    expect(useDialogStore.getState().request?.cancelText).toBeUndefined();

    useDialogStore.getState().confirm();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
