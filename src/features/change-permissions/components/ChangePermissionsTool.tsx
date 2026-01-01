'use client';

import Link from 'next/link';
import { useChangePermissions } from '../hooks/useChangePermissions';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

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

      <PDFUploadSection
        pdfFile={pdfFile}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing}
      />

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

