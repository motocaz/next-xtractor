"use client";

import { useState } from "react";

export interface MessageDialogState {
  open: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
}

export const useBookmarkDialogs = () => {
  const [messageDialog, setMessageDialog] = useState<MessageDialogState>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "default",
  });

  return {
    messageDialog,
    setMessageDialog,
    confirmDialog,
    setConfirmDialog,
  };
};
