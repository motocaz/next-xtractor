'use client';

import type { PDFDocument } from 'pdf-lib';
import { PDFName } from 'pdf-lib';
import { removeMetadataFromDoc } from '@/lib/pdf/metadata-utils';
import { removeAnnotationsFromDoc } from '@/features/remove-annotations/lib/remove-annotations-logic';
import { flattenPDF } from '@/features/pdf-flatten/lib/flatten-logic';
import {
  removeJavaScriptFromDoc,
  removeEmbeddedFilesFromDoc,
  removeLayersFromDoc,
  removeLinksFromDoc,
  removeStructureTreeFromDoc,
  removeMarkInfoFromDoc,
  removeFontsFromDoc,
} from '@/lib/pdf/sanitize-utils';
import type { SanitizeOptions } from '../types';

export const sanitizePDF = async (
  pdfDoc: PDFDocument,
  options: SanitizeOptions
): Promise<boolean> => {
  let changesMade = false;

  
  if (options.flattenForms) {
    try {
      await flattenPDF(pdfDoc);
      changesMade = true;
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.warn(`Could not flatten forms: ${error}`);
      
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const catalogDict = (pdfDoc.catalog as any).dict;
        if (catalogDict.has(PDFName.of('AcroForm'))) {
          catalogDict.delete(PDFName.of('AcroForm'));
          changesMade = true;
        }
      } catch (removeError) {
        const error =
          removeError instanceof Error ? removeError.message : String(removeError);
        console.warn('Could not remove AcroForm:', error);
      }
    }
  }

  
  if (options.removeMetadata) {
    removeMetadataFromDoc(pdfDoc);
    changesMade = true;
  }

  
  if (options.removeAnnotations) {
    removeAnnotationsFromDoc(pdfDoc, null, null);
    changesMade = true;
  }

  
  if (options.removeJavascript) {
    const jsChanged = removeJavaScriptFromDoc(pdfDoc);
    if (jsChanged) changesMade = true;
  }

  
  if (options.removeEmbeddedFiles) {
    const embeddedChanged = removeEmbeddedFilesFromDoc(pdfDoc);
    if (embeddedChanged) changesMade = true;
  }

  
  if (options.removeLayers) {
    const layersChanged = removeLayersFromDoc(pdfDoc);
    if (layersChanged) changesMade = true;
  }

  
  if (options.removeLinks) {
    const linksChanged = removeLinksFromDoc(pdfDoc);
    if (linksChanged) changesMade = true;
  }

  
  if (options.removeStructureTree) {
    const structureChanged = removeStructureTreeFromDoc(pdfDoc);
    if (structureChanged) changesMade = true;
  }

  
  if (options.removeMarkInfo) {
    const markInfoChanged = removeMarkInfoFromDoc(pdfDoc);
    if (markInfoChanged) changesMade = true;
  }

  
  if (options.removeFonts) {
    const fontsChanged = removeFontsFromDoc(pdfDoc);
    if (fontsChanged) changesMade = true;
  }

  return changesMade;
};

