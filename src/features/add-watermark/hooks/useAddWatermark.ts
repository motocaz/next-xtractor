"use client";

import { useState, useCallback } from "react";
import { addWatermark } from "../lib/add-watermark-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import { usePDFLoader } from "@/hooks/usePDFLoader";
import type { UseAddWatermarkReturn, WatermarkType } from "../types";

export const useAddWatermark = (): UseAddWatermarkReturn => {
  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");

  const [text, setText] = useState<string>("");
  const [fontSize, setFontSize] = useState<string>("72");
  const [textColor, setTextColor] = useState<string>("#000000");
  const [opacityText, setOpacityText] = useState<string>("0.3");
  const [angleText, setAngleText] = useState<string>("0");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [opacityImage, setOpacityImage] = useState<string>("0.3");
  const [angleImage, setAngleImage] = useState<string>("0");

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    pdfDoc,
    pdfFile,
    isLoading: isLoadingPDF,
    error: pdfError,
    loadPDF,
    reset: resetPDF,
  } = usePDFLoader();

  const totalPages = pdfDoc ? pdfDoc.getPageCount() : 0;

  const processWatermark = useCallback(async () => {
    if (!pdfDoc) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Adding watermark...");

    try {
      if (watermarkType === "text") {
        if (!text.trim()) {
          setError("Please enter text for the watermark.");
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }

        const fontSizeNum = Number.parseInt(fontSize, 10);
        if (isNaN(fontSizeNum) || fontSizeNum <= 0) {
          setError("Please enter a valid font size (greater than 0).");
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }

        const opacityNum = Number.parseFloat(opacityText);
        if (isNaN(opacityNum) || opacityNum < 0 || opacityNum > 1) {
          setError("Please enter a valid opacity (0 to 1).");
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }

        const angleNum = Number.parseInt(angleText, 10);
        if (isNaN(angleNum)) {
          setError("Please enter a valid angle.");
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }

        const options = {
          type: "text" as const,
          text: text.trim(),
          fontSize: fontSizeNum,
          color: textColor,
          opacity: opacityNum,
          angle: angleNum,
        };

        const newPdf = await addWatermark(pdfDoc, options);
        const pdfBytes = await newPdf.save();
        const arrayBuffer = new ArrayBuffer(pdfBytes.length);
        new Uint8Array(arrayBuffer).set(pdfBytes);
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });

        downloadFile(blob, pdfFile?.name);
        setSuccess("Watermark added successfully!");
      } else {
        if (!imageFile) {
          setError("Please select an image file for the watermark.");
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }

        if (
          imageFile.type !== "image/png" &&
          imageFile.type !== "image/jpeg" &&
          imageFile.type !== "image/jpg"
        ) {
          setError(
            "Unsupported Image. Please use a PNG or JPG for the watermark."
          );
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }

        const opacityNum = Number.parseFloat(opacityImage);
        if (isNaN(opacityNum) || opacityNum < 0 || opacityNum > 1) {
          setError("Please enter a valid opacity (0 to 1).");
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }

        const angleNum = Number.parseInt(angleImage, 10);
        if (isNaN(angleNum)) {
          setError("Please enter a valid angle.");
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }

        const options = {
          type: "image" as const,
          imageFile,
          opacity: opacityNum,
          angle: angleNum,
        };

        const newPdf = await addWatermark(pdfDoc, options);
        const pdfBytes = await newPdf.save();
        const arrayBuffer = new ArrayBuffer(pdfBytes.length);
        new Uint8Array(arrayBuffer).set(pdfBytes);
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });

        downloadFile(blob, pdfFile?.name);
        setSuccess("Watermark added successfully!");
      }
    } catch (err) {
      console.error("Error adding watermark:", err);
      setError(
        err instanceof Error
          ? `Failed to add watermark: ${err.message}`
          : "Could not add the watermark. Please check your inputs."
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    watermarkType,
    text,
    fontSize,
    textColor,
    opacityText,
    angleText,
    imageFile,
    opacityImage,
    angleImage,
    pdfFile,
  ]);

  const reset = useCallback(() => {
    setWatermarkType("text");
    setText("");
    setFontSize("72");
    setTextColor("#000000");
    setOpacityText("0.3");
    setAngleText("0");
    setImageFile(null);
    setOpacityImage("0.3");
    setAngleImage("0");
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
    resetPDF();
  }, [resetPDF]);

  return {
    watermarkType,
    text,
    fontSize,
    textColor,
    opacityText,
    angleText,
    imageFile,
    opacityImage,
    angleImage,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setWatermarkType,
    setText,
    setFontSize,
    setTextColor,
    setOpacityText,
    setAngleText,
    setImageFile,
    setOpacityImage,
    setAngleImage,
    loadPDF,
    processWatermark,
    reset,
  };
};
