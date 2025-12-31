'use client';

import Link from 'next/link';
import { useChangePermissions } from '../hooks/useChangePermissions';
import { FileUploader } from '@/components/FileUploader';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, AlertCircle, ArrowLeft, X } from 'lucide-react';

export const ChangePermissionsTool = () => {
  const {
    currentPassword,
    newUserPassword,
    newOwnerPassword,
    permissions,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    isLoadingPDF,
    pdfError,
    setCurrentPassword,
    setNewUserPassword,
    setNewOwnerPassword,
    setPermission,
    loadPDF,
    processPermissions,
    reset,
  } = useChangePermissions();

  const showOptions = pdfFile !== null && !isLoadingPDF && !pdfError;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">
        Change PDF Permissions
      </h2>
      <p className="mb-6 text-muted-foreground">
        Modify passwords and permissions without losing quality.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={false}
          onFilesSelected={async (files) => {
            if (files[0]) {
              await loadPDF(files[0]);
            }
          }}
          disabled={isLoadingPDF || isProcessing}
        />
      </div>

      <div id="file-display-area" className="mt-4 space-y-2">
        {isLoadingPDF && (
          <div className="flex items-center gap-2 p-2 bg-input rounded-md">
            <Spinner size="sm" />
            <span className="text-sm text-muted-foreground">
              Loading PDF...
            </span>
          </div>
        )}

        {pdfError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-destructive">{pdfError}</span>
          </div>
        )}

        {pdfFile && !pdfError && (
          <div className="flex items-center justify-between gap-2 p-2 bg-input rounded-md">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-foreground truncate">
                {pdfFile.name}
              </span>
            </div>
            <button
              onClick={reset}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
              aria-label="Remove PDF"
              title="Remove PDF"
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {showOptions && (
        <div id="permissions-options" className="mt-6 space-y-4">
          <div>
            <Label htmlFor="current-password">
              Current Password (if encrypted)
            </Label>
            <Input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Leave blank if PDF is not password-protected"
              className="mt-2"
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-user-password">
                New User Password (optional)
              </Label>
              <Input
                type="password"
                id="new-user-password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Password to open PDF"
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="new-owner-password">
                New Owner Password (optional)
              </Label>
              <Input
                type="password"
                id="new-owner-password"
                value={newOwnerPassword}
                onChange={(e) => setNewOwnerPassword(e.target.value)}
                placeholder="Password for full permissions"
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
          </div>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-base mb-2 text-foreground">
                How It Works
              </h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  <strong>User Password:</strong> Required to open the PDF
                </li>
                <li>
                  <strong>Owner Password:</strong> Required to enforce the
                  permissions below
                </li>
                <li>
                  Leave both blank to remove all encryption and restrictions
                </li>
                <li>
                  Check boxes below to ALLOW specific actions (unchecked =
                  disabled)
                </li>
              </ul>
            </CardContent>
          </Card>

          <fieldset className="border border-border p-4 rounded-lg">
            <legend className="px-2 text-sm font-medium text-foreground">
              Permissions (only enforced with Owner Password):
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <label className="flex items-center gap-2 text-foreground cursor-pointer hover:text-primary transition-colors">
                <Checkbox
                  id="allow-printing"
                  checked={permissions.allowPrinting}
                  onCheckedChange={(checked) =>
                    setPermission('allowPrinting', checked === true)
                  }
                  disabled={isProcessing}
                />
                Allow Printing
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer hover:text-primary transition-colors">
                <Checkbox
                  id="allow-copying"
                  checked={permissions.allowCopying}
                  onCheckedChange={(checked) =>
                    setPermission('allowCopying', checked === true)
                  }
                  disabled={isProcessing}
                />
                Allow Text/Image Extraction
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer hover:text-primary transition-colors">
                <Checkbox
                  id="allow-modifying"
                  checked={permissions.allowModifying}
                  onCheckedChange={(checked) =>
                    setPermission('allowModifying', checked === true)
                  }
                  disabled={isProcessing}
                />
                Allow Modifications
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer hover:text-primary transition-colors">
                <Checkbox
                  id="allow-annotating"
                  checked={permissions.allowAnnotating}
                  onCheckedChange={(checked) =>
                    setPermission('allowAnnotating', checked === true)
                  }
                  disabled={isProcessing}
                />
                Allow Annotations
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer hover:text-primary transition-colors">
                <Checkbox
                  id="allow-filling-forms"
                  checked={permissions.allowFillingForms}
                  onCheckedChange={(checked) =>
                    setPermission('allowFillingForms', checked === true)
                  }
                  disabled={isProcessing}
                />
                Allow Form Filling
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer hover:text-primary transition-colors">
                <Checkbox
                  id="allow-document-assembly"
                  checked={permissions.allowDocumentAssembly}
                  onCheckedChange={(checked) =>
                    setPermission('allowDocumentAssembly', checked === true)
                  }
                  disabled={isProcessing}
                />
                Allow Page Assembly
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer hover:text-primary transition-colors">
                <Checkbox
                  id="allow-page-extraction"
                  checked={permissions.allowPageExtraction}
                  onCheckedChange={(checked) =>
                    setPermission('allowPageExtraction', checked === true)
                  }
                  disabled={isProcessing}
                />
                Allow Page Extraction
              </label>
            </div>
          </fieldset>

          <ProcessButton
            onClick={processPermissions}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Apply Changes
          </ProcessButton>

          <ProcessMessages success={success} error={error} />
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

