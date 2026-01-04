'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useOCR } from '../hooks/useOCR';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardCopy, Check, Download, FileScan } from 'lucide-react';
import { tesseractLanguages } from '../lib/tesseract-languages';
import type { TesseractLanguageCode } from '../lib/tesseract-languages';

const whitelistPresets: Record<string, string> = {
  alphanumeric:
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-\'"',
  'numbers-currency': '0123456789$€£¥.,- ',
  'letters-only': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
  'numbers-only': '0123456789',
  invoice: '0123456789$.,/-#: ',
  forms:
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,()-_/@#:',
};

export const OCRTool = () => {
  const [langSearch, setLangSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    loadPDF,
    reset,
    selectedLanguages,
    resolution,
    binarize,
    whitelist,
    whitelistPreset,
    extractedText,
    searchablePdfBytes,
    isProcessing,
    loadingMessage,
    error,
    success,
    progressLog,
    setSelectedLanguages,
    setResolution,
    setBinarize,
    setWhitelist,
    setWhitelistPreset,
    runOCR,
    copyText,
    downloadText,
    downloadSearchablePDF,
  } = useOCR();

  const showOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;
  const showResults = extractedText || searchablePdfBytes;

  const filteredLanguages = useMemo(() => {
    const searchLower = langSearch.toLowerCase();
    return Object.entries(tesseractLanguages).filter(([code, name]) =>
      name.toLowerCase().includes(searchLower) || code.toLowerCase().includes(searchLower)
    );
  }, [langSearch]);

  const handleLanguageToggle = (code: TesseractLanguageCode) => {
    if (selectedLanguages.includes(code)) {
      setSelectedLanguages(selectedLanguages.filter((lang) => lang !== code));
    } else {
      setSelectedLanguages([...selectedLanguages, code]);
    }
  };

  const handleWhitelistPresetChange = (preset: string) => {
    if (preset === 'none') {
      setWhitelistPreset('');
      setWhitelist('');
    } else if (preset && preset !== 'custom') {
      setWhitelistPreset(preset as typeof whitelistPreset);
      setWhitelist(whitelistPresets[preset] || '');
    } else {
      setWhitelistPreset(preset === 'custom' ? 'custom' : '');
      if (preset === 'custom') {
        // Keep current whitelist value when switching to custom
      } else {
        setWhitelist('');
      }
    }
  };

  const handleCopy = async () => {
    await copyText();
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const selectedLanguagesNames = selectedLanguages
    .map((code) => tesseractLanguages[code as TesseractLanguageCode])
    .join(', ');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">OCR PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Extract text from scanned PDFs and make them searchable. Select the languages
        in your document and process it with OCR.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        pdfDoc={pdfDoc}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing}
      />

      {showOptions && (
        <div className="mt-6 space-y-4">
          <Card>
            <CardContent className="pt-6 pb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lang-search">Languages in Document</Label>
                <Input
                  id="lang-search"
                  type="text"
                  placeholder="Search for languages..."
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  disabled={isProcessing}
                />
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-2 bg-input">
                  {filteredLanguages.map(([code, name]) => (
                    <label
                      key={code}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedLanguages.includes(code)}
                        onCheckedChange={() => handleLanguageToggle(code as TesseractLanguageCode)}
                        disabled={isProcessing}
                      />
                      <span className="text-sm">{name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-semibold">{selectedLanguagesNames || 'None'}</span>
                </p>
              </div>

              <details
                className="bg-input border border-border rounded-lg p-3"
                open={showAdvanced}
                onToggle={(e) => setShowAdvanced(e.currentTarget.open)}
              >
                <summary className="text-sm font-medium text-foreground cursor-pointer flex items-center justify-between">
                  <span>Advanced Settings (Recommended to improve accuracy)</span>
                  <span
                    className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </span>
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="ocr-resolution" className="text-xs">
                      Resolution
                    </Label>
                    <Select
                      value={resolution}
                      onValueChange={(value) => setResolution(value as typeof resolution)}
                      disabled={isProcessing}
                    >
                      <SelectTrigger id="ocr-resolution" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2.0">Standard (192 DPI)</SelectItem>
                        <SelectItem value="3.0">High (288 DPI)</SelectItem>
                        <SelectItem value="4.0">Ultra (384 DPI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ocr-binarize"
                      checked={binarize}
                      onCheckedChange={(checked) => setBinarize(checked === true)}
                      disabled={isProcessing}
                    />
                    <Label
                      htmlFor="ocr-binarize"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Binarize Image (Enhance Contrast for Clean Scans)
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="whitelist-preset" className="text-xs">
                      Character Whitelist Preset
                    </Label>
                    <Select
                      value={whitelistPreset || 'none'}
                      onValueChange={handleWhitelistPresetChange}
                      disabled={isProcessing}
                    >
                      <SelectTrigger id="whitelist-preset" className="w-full">
                        <SelectValue placeholder="None (All characters)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (All characters)</SelectItem>
                        <SelectItem value="alphanumeric">
                          Alphanumeric + Basic Punctuation
                        </SelectItem>
                        <SelectItem value="numbers-currency">Numbers + Currency Symbols</SelectItem>
                        <SelectItem value="letters-only">Letters Only (A-Z, a-z)</SelectItem>
                        <SelectItem value="numbers-only">Numbers Only (0-9)</SelectItem>
                        <SelectItem value="invoice">Invoice/Receipt (Numbers, $, ., -, /)</SelectItem>
                        <SelectItem value="forms">
                          Forms (Alphanumeric + Common Symbols)
                        </SelectItem>
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Only these characters will be recognized. Leave empty for all characters.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="ocr-whitelist" className="text-xs">
                      Character Whitelist (Optional)
                    </Label>
                    <Input
                      id="ocr-whitelist"
                      type="text"
                      value={whitelist}
                      onChange={(e) => setWhitelist(e.target.value)}
                      placeholder="e.g., abcdefghijklmnopqrstuvwxyz0123456789$.,"
                      disabled={isProcessing || (whitelistPreset !== '' && whitelistPreset !== 'custom')}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only these characters will be recognized. Leave empty for all characters.
                    </p>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>

          <ProcessButton
            onClick={runOCR}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={selectedLanguages.length === 0}
          >
            Start OCR
          </ProcessButton>

          <ProcessMessages success={success} error={error} />

          {isProcessing && progressLog.length > 0 && (
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="space-y-2">
                  <Label>Progress Log</Label>
                  <div className="max-h-32 overflow-y-auto bg-background p-2 rounded-md border border-border text-xs font-mono">
                    {progressLog.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {showResults && !isProcessing && (
        <div className="mt-6 space-y-4">
          <Card>
            <CardContent className="pt-6 pb-6 space-y-4">
              <h3 className="text-xl font-bold text-foreground">OCR Complete</h3>
              <p className="text-muted-foreground">
                Your searchable PDF is ready. You can also copy or download the extracted text
                below.
              </p>

              <div className="relative">
                <Textarea
                  id="ocr-text-output"
                  rows={10}
                  value={extractedText}
                  readOnly
                  className="w-full font-sans"
                />
                <Button
                  id="copy-text-btn"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleCopy}
                  title="Copy to Clipboard"
                >
                  {copySuccess ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <ClipboardCopy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  id="download-txt-btn"
                  variant="outline"
                  className="w-full"
                  onClick={downloadText}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download as .txt
                </Button>
                <Button
                  id="download-searchable-pdf"
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={downloadSearchablePDF}
                >
                  <FileScan className="h-4 w-4 mr-2" />
                  Download Searchable PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ProcessLoadingModal isProcessing={isProcessing} loadingMessage={loadingMessage} />
    </div>
  );
};

