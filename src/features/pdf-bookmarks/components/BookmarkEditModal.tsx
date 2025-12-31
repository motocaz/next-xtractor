"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crosshair } from "lucide-react";
import type { BookmarkNode } from "../types";

interface BookmarkEditModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    title: string;
    color: string | null;
    style: string | null;
    destPage: number;
    destX: number | null;
    destY: number | null;
    zoom: string | null;
  }) => void;
  bookmark: BookmarkNode | null;
  maxPages: number;
  currentPage: number;
  onStartDestinationPicking: () => void;
  isPickingDestination: boolean;
}

export const BookmarkEditModal = ({
  open,
  onClose,
  onConfirm,
  bookmark,
  maxPages,
  currentPage,
  onStartDestinationPicking,
  isPickingDestination,
}: BookmarkEditModalProps) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [destPage, setDestPage] = useState(currentPage);
  const [destX, setDestX] = useState<number | null>(null);
  const [destY, setDestY] = useState<number | null>(null);
  const [zoom, setZoom] = useState<string>("");
  const [useDestination, setUseDestination] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setColor(bookmark.color || "none");
      setStyle(bookmark.style || "normal");
      setDestPage(bookmark.page);
      setDestX(bookmark.destX);
      setDestY(bookmark.destY);
      setZoom(bookmark.zoom || "inherit");
      setUseDestination(
        bookmark.destX !== null ||
          bookmark.destY !== null ||
          bookmark.zoom !== null
      );
      if (bookmark.color?.startsWith("#")) {
        setCustomColor(bookmark.color);
      }
    } else {
      setTitle("");
      setColor("none");
      setStyle("normal");
      setDestPage(currentPage);
      setDestX(null);
      setDestY(null);
      setZoom("inherit");
      setUseDestination(false);
      setCustomColor("#000000");
    }
  }, [bookmark, currentPage]);

  const handleConfirm = () => {
    let finalColor;
    if (!title.trim()) return;
    if (color === "custom") {
      finalColor = customColor;
    } else {
      finalColor = color === "none" ? null : color || null;
    }

    const finalStyle = style === "normal" ? null : style || null;
    const finalZoom = zoom === "inherit" ? null : zoom || null;

    onConfirm({
      title: title.trim(),
      color: finalColor,
      style: finalStyle,
      destPage: useDestination ? destPage : bookmark?.page || currentPage,
      destX: useDestination ? destX : null,
      destY: useDestination ? destY : null,
      zoom: useDestination ? finalZoom : null,
    });
    onClose();
  };

  const getPreviewStyle = () => {
    let styleObj: React.CSSProperties = {};
    if (color === "custom") {
      styleObj.color = customColor;
    } else if (color && color !== "none") {
      const colorMap: Record<string, string> = {
        red: "#dc2626",
        blue: "#2563eb",
        green: "#16a34a",
        yellow: "#ca8a04",
        purple: "#9333ea",
      };
      styleObj.color = colorMap[color] || "";
    }
    if (style === "bold" || style === "bold-italic") {
      styleObj.fontWeight = "bold";
    }
    if (style === "italic" || style === "bold-italic") {
      styleObj.fontStyle = "italic";
    }
    return styleObj;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bookmark ? "Edit Bookmark" : "Add Bookmark"}
          </DialogTitle>
          <DialogDescription>
            {bookmark
              ? "Edit the bookmark title, color, style, and destination."
              : "Create a new bookmark with a title, optional color, style, and destination."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter bookmark title"
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger id="color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {color === "custom" && (
              <Input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="mt-2 h-10 cursor-pointer"
              />
            )}
          </div>

          <div>
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="italic">Italic</SelectItem>
                <SelectItem value="bold-italic">Bold & Italic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useDestination}
                onChange={(e) => setUseDestination(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Set custom destination</span>
            </Label>

            {useDestination && (
              <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dest-page" className="text-xs">
                      Page
                    </Label>
                    <Input
                      id="dest-page"
                      type="number"
                      min={1}
                      max={maxPages}
                      value={destPage}
                      onChange={(e) =>
                        setDestPage(
                          Math.max(
                            1,
                            Math.min(maxPages, Number.parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dest-zoom" className="text-xs">
                      Zoom (%)
                    </Label>
                    <Select value={zoom} onValueChange={setZoom}>
                      <SelectTrigger id="dest-zoom" className="text-sm">
                        <SelectValue placeholder="Inherit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Inherit</SelectItem>
                        <SelectItem value="0">Fit Page</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                        <SelectItem value="125">125%</SelectItem>
                        <SelectItem value="150">150%</SelectItem>
                        <SelectItem value="200">200%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dest-x" className="text-xs">
                      X Position
                    </Label>
                    <Input
                      id="dest-x"
                      type="number"
                      value={destX ?? 0}
                      onChange={(e) =>
                        setDestX(
                          e.target.value ? Number.parseFloat(e.target.value) : null
                        )
                      }
                      step={10}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dest-y" className="text-xs">
                      Y Position
                    </Label>
                    <Input
                      id="dest-y"
                      type="number"
                      value={destY ?? 0}
                      onChange={(e) =>
                        setDestY(
                          e.target.value ? Number.parseFloat(e.target.value) : null
                        )
                      }
                      step={10}
                      className="text-sm"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onStartDestinationPicking}
                  disabled={isPickingDestination}
                  className="w-full text-xs"
                >
                  <Crosshair className="h-3 w-3 mr-1" />
                  Click on PDF to Pick Location
                </Button>
                <p className="text-xs text-muted-foreground italic">
                  Click the button above, then click on the PDF where you want
                  the bookmark to jump to
                </p>
              </div>
            )}
          </div>

          <div>
            <Label>Preview</Label>
            <div className="p-2 bg-muted rounded border border-border min-h-[2.5rem] flex items-center justify-center">
              <span style={getPreviewStyle()}>{title || "Preview Text"}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!title.trim()}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
