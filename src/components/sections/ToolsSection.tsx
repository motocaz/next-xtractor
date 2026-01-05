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
  FileText,
  Bookmark,
  Palette,
  Layers,
  GitCompare,
  FileScan,
  Maximize2,
  Camera,
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
  "file-text": FileText,
  bookmark: Bookmark,
  palette: Palette,
  layers: Layers,
  "git-compare": GitCompare,
  "file-scan": FileScan,
  "maximize-2": Maximize2,
  camera: Camera,
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
    href: "/extract-attachments",
    implemented: true,
  },
  {
    id: "edit-attachments",
    name: "Edit Attachments",
    subtitle: "View or remove attachments in your PDF.",
    href: "/edit-attachments",
    implemented: true,
  },
  {
    id: "merge",
    name: "Merge PDF",
    subtitle: "Combine multiple PDFs into one file.",
    href: "/merge",
    implemented: true,
  },
  {
    id: "alternate-merge",
    name: "Alternate Merge",
    subtitle: "Alternate and mix pages from multiple PDF files.",
    href: "/alternate-merge",
    implemented: true,
  },
  {
    id: "split-in-half",
    name: "Split Pages in Half",
    subtitle: "Choose a method to divide every page of your document into two separate pages.",
    href: "/split-in-half",
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
    href: "/compress",
    implemented: true,
  },
  {
    id: "linearize",
    name: "Linearize PDF",
    subtitle: "Optimize PDFs for fast web view.",
    href: "/linearize",
    implemented: true,
  },
  {
    id: "encrypt",
    name: "Encrypt PDF",
    subtitle: "Add password protection to your PDF.",
    href: "/encrypt",
    implemented: true,
  },
  {
    id: "decrypt",
    name: "Decrypt PDF",
    subtitle: "Remove password protection from your PDF.",
    href: "/decrypt",
    implemented: true,
  },
  {
    id: "remove-restrictions",
    name: "Remove Restrictions",
    subtitle: "Remove security restrictions and unlock PDF permissions for editing and printing.",
    href: "/remove-restrictions",
    implemented: true,
  },
  {
    id: "reverse-pages",
    name: "Reverse Pages",
    subtitle: "Reverse the page order of your PDF files.",
    href: "/reverse-pages",
    implemented: true,
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    subtitle: "Rotate pages in your PDF document.",
    href: "/rotate-pages",
    implemented: true,
  },
  {
    id: "organize",
    name: "Organize PDF",
    subtitle: "Reorder and organize pages in your PDF.",
    href: "/organize",
    implemented: true,
  },
  {
    id: "organize-pages",
    name: "Organize Pages",
    subtitle: "Reorder, duplicate, or delete pages with drag-and-drop.",
    href: "/organize-pages",
    implemented: true,
  },
  {
    id: "delete-pages",
    name: "Delete Pages",
    subtitle: "Remove specific pages from your document.",
    href: "/delete-pages",
    implemented: true,
  },
  {
    id: "remove-blank-pages",
    name: "Remove Blank Pages",
    subtitle: "Automatically detect and remove blank or nearly blank pages from your PDF.",
    href: "/remove-blank-pages",
    implemented: true,
  },
  {
    id: "extract-pages",
    name: "Extract Pages",
    subtitle: "Save a selection of pages as new files.",
    href: "/extract-pages",
    implemented: true,
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
    href: "/jpg-to-pdf",
    implemented: true,
  },
  {
    id: "png-to-pdf",
    name: "PNG to PDF",
    subtitle: "Create a PDF from one or more PNG images.",
    href: "/png-to-pdf",
    implemented: true,
  },
  {
    id: "bmp-to-pdf",
    name: "BMP to PDF",
    subtitle: "Create a PDF from one or more BMP images.",
    href: "/bmp-to-pdf",
    implemented: true,
  },
  {
    id: "heic-to-pdf",
    name: "HEIC to PDF",
    subtitle: "Convert one or more HEIC images from your iPhone or camera into a single PDF file.",
    href: "/heic-to-pdf",
    implemented: true,
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    subtitle: "Convert JPG, PNG, WebP, SVG, BMP, HEIC, and TIFF images to PDF.",
    href: "/image-to-pdf",
    implemented: true,
  },
  {
    id: "scan-to-pdf",
    name: "Scan to PDF",
    subtitle: "Use your device's camera to scan documents and save them as a PDF.",
    href: "/scan-to-pdf",
    implemented: true,
  },
  {
    id: "json-to-pdf",
    name: "JSON to PDF",
    subtitle: "Convert JSON files (from PDF-to-JSON) back to PDF format.",
    href: "/json-to-pdf",
    implemented: true,
  },
  {
    id: "pdf-to-json",
    name: "PDF to JSON",
    subtitle: "Convert PDF files to JSON format.",
    href: "/pdf-to-json",
    implemented: true,
  },
  {
    id: "md-to-pdf",
    name: "Markdown to PDF",
    subtitle: "Convert Markdown text to a high-quality PDF document.",
    href: "/md-to-pdf",
    implemented: true,
  },
  {
    id: "pdf-to-markdown",
    name: "PDF to Markdown",
    subtitle: "Convert a PDF's text content into a structured Markdown file.",
    href: "/pdf-to-markdown",
    implemented: true,
  },
  {
    id: "pdf-to-bmp",
    name: "PDF to BMP",
    subtitle: "Convert each page of a PDF file into a BMP image.",
    href: "/pdf-to-bmp",
    implemented: true,
  },
  {
    id: "pdf-to-greyscale",
    name: "PDF to Greyscale",
    subtitle: "Convert a color PDF into a black-and-white version.",
    href: "/pdf-to-greyscale",
    implemented: true,
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    subtitle: "Convert PDF pages to JPG images.",
    href: "/pdf-to-jpg",
    implemented: true,
  },
  {
    id: "pdf-to-png",
    name: "PDF to PNG",
    subtitle: "Convert PDF pages to PNG images.",
    href: "/pdf-to-png",
    implemented: true,
  },
  {
    id: "pdf-to-tiff",
    name: "PDF to TIFF",
    subtitle: "Convert each page of a PDF file into a TIFF image.",
    href: "/pdf-to-tiff",
    implemented: true,
  },
  {
    id: "pdf-to-webp",
    name: "PDF to WebP",
    subtitle: "Convert each page of a PDF file into a WebP image.",
    href: "/pdf-to-webp",
    implemented: true,
  },
  {
    id: "pdf-to-zip",
    name: "PDF to ZIP",
    subtitle: "Combine multiple PDF files into a single ZIP archive.",
    href: "/pdf-to-zip",
    implemented: true,
  },
  {
    id: "sign-pdf",
    name: "Sign PDF",
    subtitle: "Draw, type, or upload your signature.",
    href: "/sign-pdf",
    implemented: true,
  },
  {
    id: "cropper",
    name: "Crop PDF",
    subtitle: "Trim the margins of every page in your PDF.",
    href: "/crop",
    implemented: true,
  },
  {
    id: "redact",
    name: "Redact PDF",
    subtitle: "Permanently black out sensitive content from your PDFs.",
    href: "/redact",
    implemented: true,
  },
  {
    id: "remove-annotations",
    name: "Remove Annotations",
    subtitle: "Remove annotations (highlights, comments, drawings, etc.) from your PDF.",
    href: "/remove-annotations",
    implemented: true,
  },
  {
    id: "remove-metadata",
    name: "Remove Metadata",
    subtitle: "Completely remove identifying metadata from your PDF.",
    href: "/remove-metadata",
    implemented: true,
  },
  {
    id: "sanitize-pdf",
    name: "Sanitize PDF",
    subtitle: "Remove potentially sensitive or unnecessary information from your PDF before sharing.",
    href: "/sanitize",
    implemented: true,
  },
  {
    id: "change-permissions",
    name: "Change Permissions",
    subtitle: "Modify passwords and permissions on your PDF documents.",
    href: "/change-permissions",
    implemented: true,
  },
  {
    id: "edit-metadata",
    name: "Edit Metadata",
    subtitle: "View and modify PDF metadata (author, title, keywords, etc.).",
    href: "/edit-metadata",
    implemented: true,
  },
  {
    id: "change-background-color",
    name: "Change Background Color",
    subtitle: "Change the background color of every page in your PDF.",
    href: "/change-background-color",
    implemented: true,
  },
  {
    id: "change-text-color",
    name: "Change Text Color",
    subtitle: "Change the color of dark text in your PDF.",
    href: "/change-text-color",
    implemented: true,
  },
  {
    id: "invert-colors",
    name: "Invert Colors",
    subtitle: "Create a 'dark mode' version of your PDF.",
    href: "/invert-colors",
    implemented: true,
  },
  {
    id: "combine-single-page",
    name: "Combine to Single Page",
    subtitle: "Stitch all pages into one continuous scroll.",
    href: "/combine-single-page",
    implemented: true,
  },
  {
    id: "n-up",
    name: "N-Up PDF",
    subtitle: "Combine multiple pages onto a single sheet.",
    href: "/n-up",
    implemented: true,
  },
  {
    id: "posterize",
    name: "Posterize PDF",
    subtitle: "Split pages into multiple smaller sheets to print as a poster.",
    href: "/posterize",
    implemented: true,
  },
  {
    id: "compare-pdfs",
    name: "Compare PDFs",
    subtitle: "Compare two PDFs side by side or in overlay mode.",
    href: "/compare-pdfs",
    implemented: true,
  },
  {
    id: "fix-dimensions",
    name: "Fix Page Dimensions",
    subtitle: "Standardize all pages to a uniform size.",
    href: "/fix-dimensions",
    implemented: true,
  },
  {
    id: "page-dimensions",
    name: "Page Dimensions",
    subtitle: "Analyze the dimensions, standard size, and orientation of every page.",
    href: "/page-dimensions",
    implemented: true,
  },
  {
    id: "multi-tool",
    name: "PDF Multi-Tool",
    subtitle: "Advanced page management: rotate, duplicate, split, and organize pages from multiple PDFs.",
    href: "/multi-tool",
    implemented: true,
  },
  {
    id: "flatten",
    name: "Flatten PDF",
    subtitle: "Make form fields and annotations non-editable.",
    href: "/flatten",
    implemented: true,
  },
  {
    id: "form-filler",
    name: "PDF Form Filler",
    subtitle: "Fill in PDF forms directly in your browser with live preview.",
    href: "/form-filler",
    implemented: true,
  },
  {
    id: "ocr",
    name: "OCR PDF",
    subtitle: "Extract text from scanned PDFs and make them searchable.",
    href: "/ocr",
    implemented: true,
  },
];

const toolsWithIcons: Tool[] = allTools.map((tool) => {
  const iconNameMap: Record<string, string> = {
    "add-attachments": "paperclip",
    "extract-attachments": "download",
    "edit-attachments": "file-edit",
    merge: "combine",
    "alternate-merge": "combine",
    "split-in-half": "scissors",
    split: "scissors",
    compress: "zap",
    linearize: "zap",
    encrypt: "lock",
    decrypt: "unlock",
    "remove-restrictions": "unlock",
    "reverse-pages": "rotate-cw",
    rotate: "rotate-cw",
    organize: "files",
    "organize-pages": "files",
    "delete-pages": "trash-2",
    "remove-blank-pages": "trash-2",
    "extract-pages": "ungroup",
    "add-blank-page": "file-plus",
    "add-header-footer": "file-edit",
    "add-watermark": "water",
    "add-page-numbers": "hash",
    bookmarks: "bookmark",
    "jpg-to-pdf": "image-up",
    "png-to-pdf": "image-up",
    "bmp-to-pdf": "image-up",
    "heic-to-pdf": "image-up",
    "image-to-pdf": "image-up",
    "scan-to-pdf": "camera",
    "json-to-pdf": "file",
    "pdf-to-json": "file-text",
    "md-to-pdf": "file-text",
    "pdf-to-bmp": "file-image",
    "pdf-to-greyscale": "palette",
    "pdf-to-jpg": "file-image",
    "pdf-to-png": "file-image",
    "pdf-to-tiff": "file-image",
    "pdf-to-webp": "file-image",
    "pdf-to-zip": "file",
    "sign-pdf": "pen-tool",
    cropper: "crop",
    redact: "pen-tool",
    "remove-annotations": "pen-tool",
    "remove-metadata": "file-edit",
    "sanitize-pdf": "file-scan",
    "change-permissions": "lock",
    "edit-metadata": "file-edit",
    "change-background-color": "palette",
    "change-text-color": "palette",
    "invert-colors": "palette",
    "combine-single-page": "layers",
    "n-up": "layers",
    posterize: "maximize-2",
    "compare-pdfs": "git-compare",
    "fix-dimensions": "layers",
    "page-dimensions": "maximize-2",
    "multi-tool": "maximize-2",
    flatten: "layers",
    "form-filler": "file-edit",
    ocr: "file-scan",
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
