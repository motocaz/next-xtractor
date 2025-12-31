import { MarkerSlanted } from "@/components/ui/marker-slanted";
import { ToolCard } from "@/components/ui/tool-card";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import {
  Paperclip,
  Download,
  FileEdit,
  Combine,
  Scissors,
  Zap,
  ImageUp,
  PenTool,
  Crop,
  Ungroup,
  Files,
  Trash2,
  Lock,
  Unlock,
  RotateCw,
  FilePlus,
  FileImage,
  Hash,
  Droplet,
  File,
  Bookmark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  icon: LucideIcon;
  subtitle: string;
  href: string;
  implemented: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  paperclip: Paperclip,
  download: Download,
  "file-edit": FileEdit,
  combine: Combine,
  scissors: Scissors,
  zap: Zap,
  "image-up": ImageUp,
  "pen-tool": PenTool,
  crop: Crop,
  ungroup: Ungroup,
  files: Files,
  "trash-2": Trash2,
  lock: Lock,
  unlock: Unlock,
  "rotate-cw": RotateCw,
  "file-plus": FilePlus,
  "file-image": FileImage,
  hash: Hash,
  water: Droplet,
  file: File,
  bookmark: Bookmark,
};

const allTools: Omit<Tool, "icon">[] = [
  {
    id: "add-attachments",
    name: "Add Attachments",
    subtitle: "Embed one or more files into your PDF.",
    href: "/add-attachments",
    implemented: true,
  },
  {
    id: "extract-attachments",
    name: "Extract Attachments",
    subtitle: "Extract all embedded files from PDF(s) as a ZIP.",
    href: "#",
    implemented: false,
  },
  {
    id: "edit-attachments",
    name: "Edit Attachments",
    subtitle: "View or remove attachments in your PDF.",
    href: "#",
    implemented: false,
  },
  {
    id: "merge",
    name: "Merge PDF",
    subtitle: "Combine multiple PDFs into one file.",
    href: "#",
    implemented: false,
  },
  {
    id: "alternate-merge",
    name: "Alternate Merge",
    subtitle: "Alternate and mix pages from multiple PDF files.",
    href: "/alternate-merge",
    implemented: true,
  },
  {
    id: "split",
    name: "Split PDF",
    subtitle: "Extract a range of pages into a new PDF.",
    href: "#",
    implemented: false,
  },
  {
    id: "compress",
    name: "Compress PDF",
    subtitle: "Reduce the file size of your PDF.",
    href: "#",
    implemented: false,
  },
  {
    id: "encrypt",
    name: "Encrypt PDF",
    subtitle: "Add password protection to your PDF.",
    href: "#",
    implemented: false,
  },
  {
    id: "decrypt",
    name: "Decrypt PDF",
    subtitle: "Remove password protection from your PDF.",
    href: "#",
    implemented: false,
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    subtitle: "Rotate pages in your PDF document.",
    href: "#",
    implemented: false,
  },
  {
    id: "organize",
    name: "Organize PDF",
    subtitle: "Reorder and organize pages in your PDF.",
    href: "#",
    implemented: false,
  },
  {
    id: "delete-pages",
    name: "Delete Pages",
    subtitle: "Remove specific pages from your document.",
    href: "#",
    implemented: false,
  },
  {
    id: "extract-pages",
    name: "Extract Pages",
    subtitle: "Save a selection of pages as new files.",
    href: "#",
    implemented: false,
  },
  {
    id: "add-blank-page",
    name: "Add Blank Page",
    subtitle: "Insert blank pages into your PDF.",
    href: "/add-blank-page",
    implemented: true,
  },
  {
    id: "add-watermark",
    name: "Add Watermark",
    subtitle: "Add text or image watermarks to your PDF.",
    href: "/add-watermark",
    implemented: true,
  },
  {
    id: "add-header-footer",
    name: "Add Header & Footer",
    subtitle: "Add custom text to the top and bottom margins of every page.",
    href: "/add-header-footer",
    implemented: true,
  },
  {
    id: "add-page-numbers",
    name: "Add Page Numbers",
    subtitle: "Add page numbers to your PDF.",
    href: "/add-page-numbers",
    implemented: true,
  },
  {
    id: "bookmarks",
    name: "Edit Bookmarks",
    subtitle: "Add, edit, and organize PDF bookmarks with custom destinations.",
    href: "/bookmarks",
    implemented: true,
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    subtitle: "Create a PDF from one or more JPG images.",
    href: "#",
    implemented: false,
  },
  {
    id: "png-to-pdf",
    name: "PNG to PDF",
    subtitle: "Create a PDF from one or more PNG images.",
    href: "#",
    implemented: false,
  },
  {
    id: "bmp-to-pdf",
    name: "BMP to PDF",
    subtitle: "Create a PDF from one or more BMP images.",
    href: "/bmp-to-pdf",
    implemented: true,
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    subtitle: "Convert PDF pages to JPG images.",
    href: "#",
    implemented: false,
  },
  {
    id: "pdf-to-png",
    name: "PDF to PNG",
    subtitle: "Convert PDF pages to PNG images.",
    href: "#",
    implemented: false,
  },
  {
    id: "sign-pdf",
    name: "Sign PDF",
    subtitle: "Draw, type, or upload your signature.",
    href: "#",
    implemented: false,
  },
  {
    id: "cropper",
    name: "Crop PDF",
    subtitle: "Trim the margins of every page in your PDF.",
    href: "#",
    implemented: false,
  },
];

const toolsWithIcons: Tool[] = allTools.map((tool) => {
  const iconNameMap: Record<string, string> = {
    "add-attachments": "paperclip",
    "extract-attachments": "download",
    "edit-attachments": "file-edit",
    merge: "combine",
    "alternate-merge": "combine",
    split: "scissors",
    compress: "zap",
    encrypt: "lock",
    decrypt: "unlock",
    rotate: "rotate-cw",
    organize: "files",
    "delete-pages": "trash-2",
    "extract-pages": "ungroup",
    "add-blank-page": "file-plus",
    "add-header-footer": "file-edit",
    "add-watermark": "water",
    "add-page-numbers": "hash",
    bookmarks: "bookmark",
    "jpg-to-pdf": "image-up",
    "png-to-pdf": "image-up",
    "bmp-to-pdf": "image-up",
    "pdf-to-jpg": "file-image",
    "pdf-to-png": "file-image",
    "sign-pdf": "pen-tool",
    cropper: "crop",
  };

  const iconName = iconNameMap[tool.id] || "file";
  const Icon = iconMap[iconName] || File;

  return {
    ...tool,
    icon: Icon,
  };
});

export function ToolsSection() {
  const implementedTools = toolsWithIcons.filter((tool) => tool.implemented);
  const comingSoonTools = toolsWithIcons.filter((tool) => !tool.implemented);

  return (
    <div id="tools-header" className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
        Get Started with <MarkerSlanted className="ml-2">Tools</MarkerSlanted>
      </h2>
      <p className="text-muted-foreground mb-8">
        Click a tool to open the file uploader
      </p>

      {implementedTools.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-left">
            Available Now
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {implementedTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} href={tool.href} scroll={false}>
                  <ToolCard className="cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-6 w-6 text-primary shrink-0" />
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        {tool.subtitle}
                      </CardDescription>
                    </CardHeader>
                  </ToolCard>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {comingSoonTools.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6 text-left">
            Coming Soon
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <ToolCard
                  key={tool.id}
                  className="opacity-60 cursor-not-allowed h-full"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-6 w-6 text-muted-foreground shrink-0" />
                      <CardTitle className="text-lg text-muted-foreground">
                        {tool.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {tool.subtitle}
                    </CardDescription>
                  </CardHeader>
                </ToolCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
