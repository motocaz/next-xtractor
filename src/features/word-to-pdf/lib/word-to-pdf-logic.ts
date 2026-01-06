'use client';

import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { convertMultipleColorValues, processInlineStyle } from '@/features/md-to-pdf/lib/color-converter';

export const convertWordToHtml = async (file: File): Promise<string> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  
  const mammothOptions = {
    convertImage: mammoth.images.imgElement((element) => {
      return element.read('base64').then((imageBuffer: string) => {
        return {
          src: `data:${element.contentType};base64,${imageBuffer}`,
        };
      });
    }),
  } as Parameters<typeof mammoth.convertToHtml>[1];

  const { value: html } = await mammoth.convertToHtml(
    { arrayBuffer },
    mammothOptions
  );

  return html;
};

export const htmlToPdf = async (
  htmlContent: string,
  originalFileName?: string
): Promise<void> => {
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'strong', 'em', 'b', 'i', 'u', 's',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'style',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
  });

  const processedHtml = convertMultipleColorValues(sanitizedHtml);
  
  const styledHtml = `
    <style>
      .pdf-content { 
        font-family: 'Times New Roman', Times, serif; 
        font-size: 12pt; 
        line-height: 1.5; 
        color: black; 
      }
      .pdf-content table { 
        border-collapse: collapse; 
        width: 100%; 
      }
      .pdf-content td, .pdf-content th { 
        border: 1px solid #dddddd; 
        text-align: left; 
        padding: 8px; 
      }
      .pdf-content img { 
        max-width: 100%; 
        height: auto; 
      }
      .pdf-content a { 
        color: #0000ee; 
        text-decoration: underline; 
      }
    </style>
    <div class="pdf-content">
      ${processedHtml}
    </div>
  `;

  const tempContainer = document.createElement('div');
  tempContainer.style.cssText =
    'position: absolute !important; top: -9999px !important; left: -9999px !important; width: 522pt !important; padding: 45pt !important; background-color: rgb(255, 255, 255) !important; color: rgb(0, 0, 0) !important; font-family: "Times New Roman", Times, serif !important; font-size: 12pt !important; line-height: 1.5 !important; border: none !important; outline: none !important;';
  
  tempContainer.innerHTML = styledHtml;
  
  const styleTags = tempContainer.querySelectorAll('style');
  styleTags.forEach((styleTag) => {
    styleTag.remove();
  });
  
  document.body.appendChild(tempContainer);
  
  await new Promise(resolve => setTimeout(resolve, 0));
  
  const previewContent = tempContainer;
  
  const containerComputedStyle = globalThis.getComputedStyle(previewContent);
  const containerColorProps = ['color', 'background-color', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color'];
  containerColorProps.forEach(prop => {
    const value = containerComputedStyle.getPropertyValue(prop);
    if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent' && value !== 'none') {
      const converted = convertMultipleColorValues(value);
      previewContent.style.setProperty(prop, converted, 'important');
    }
  });
  
  const processElementColors = (element: Element) => {
    if (element instanceof HTMLElement) {
      const computedStyle = globalThis.getComputedStyle(element);
      const colorProperties = [
        'color',
        'backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'outlineColor',
        'textDecorationColor',
        'columnRuleColor',
        'caretColor',
        'fill',
        'stroke',
      ];
      
      colorProperties.forEach(prop => {
        const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        const value = computedStyle.getPropertyValue(kebabProp);
        if (value && (value.includes('lab(') || value.includes('oklab(') || value.includes('lch(') || value.includes('oklch('))) {
          const converted = convertMultipleColorValues(value);
          if (converted !== value) {
            element.style.setProperty(kebabProp, converted, 'important');
          }
        }
      });
    }
    Array.from(element.children).forEach(processElementColors);
  };
  
  processElementColors(previewContent);
  
  const allElements = previewContent.querySelectorAll('*');
  allElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      if (el.hasAttribute('style')) {
        const styleAttr = el.getAttribute('style');
        if (styleAttr) {
          const processedStyle = processInlineStyle(styleAttr);
          if (processedStyle !== styleAttr) {
            el.setAttribute('style', processedStyle);
          }
        }
      }
      
      const computedStyle = globalThis.getComputedStyle(el);
      const colorProperties = [
        'color',
        'background-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'outline-color',
        'text-decoration-color',
        'column-rule-color',
        'caret-color',
        'fill',
        'stroke',
      ];
      
      colorProperties.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
          const converted = convertMultipleColorValues(value);
          if (converted !== value || value.includes('lab(') || value.includes('oklab(') || value.includes('lch(') || value.includes('oklch(')) {
            el.style.setProperty(prop, converted, 'important');
          }
        }
      });
    }
  });
  
  
  const allElementsForced = previewContent.querySelectorAll('*');
  
  allElementsForced.forEach((el) => {
    if (el instanceof HTMLElement) {
      const computedStyle = globalThis.getComputedStyle(el);
      const colorProperties = [
        'color',
        'background-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'outline-color',
        'text-decoration-color',
        'column-rule-color',
        'caret-color',
        'fill',
        'stroke',
      ];
      
      colorProperties.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent' && value !== 'none') {
          const converted = convertMultipleColorValues(value);
          el.style.setProperty(prop, converted, 'important');
        }
      });
    }
  });
  
  if (document.body) {
    const bodyComputedStyle = globalThis.getComputedStyle(document.body);
    const bodyBgColor = bodyComputedStyle.getPropertyValue('background-color');
    if (bodyBgColor && (bodyBgColor.includes('lab(') || bodyBgColor.includes('oklab(') || bodyBgColor.includes('lch(') || bodyBgColor.includes('oklch('))) {
      const converted = convertMultipleColorValues(bodyBgColor);
      if (converted !== bodyBgColor) {
        document.body.style.setProperty('background-color', converted, 'important');
      }
    }
  }
  
  const verifyNoLabColors = (element: Element): boolean => {
    if (element instanceof HTMLElement) {
      const computedStyle = globalThis.getComputedStyle(element);
      const allColorProps = [
        'color', 'background-color', 'border-color', 'border-top-color',
        'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color', 'text-decoration-color', 'column-rule-color',
        'caret-color', 'fill', 'stroke'
      ];
      
      for (const prop of allColorProps) {
        const value = computedStyle.getPropertyValue(prop);
        if (value && (value.includes('lab(') || value.includes('oklab(') || value.includes('lch(') || value.includes('oklch('))) {
          const converted = convertMultipleColorValues(value);
          element.style.setProperty(prop, converted, 'important');
          return false;
        }
      }
    }
    return Array.from(element.children).every(verifyNoLabColors);
  };
  
  verifyNoLabColors(previewContent);
  
  const images = previewContent.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    return new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  });
  await Promise.all(imagePromises);

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'letter',
  });

  const finalCheck = (element: Element): void => {
    if (element instanceof HTMLElement) {
      const computedStyle = globalThis.getComputedStyle(element);
      const allColorProps = [
        'color', 'background-color', 'border-color', 'border-top-color',
        'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color', 'text-decoration-color', 'column-rule-color',
        'caret-color', 'fill', 'stroke'
      ];
      
      allColorProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && (value.includes('lab(') || value.includes('oklab(') || value.includes('lch(') || value.includes('oklch('))) {
          const converted = convertMultipleColorValues(value);
          element.style.setProperty(prop, converted, 'important');
        }
      });
    }
    Array.from(element.children).forEach(finalCheck);
  };
  
  finalCheck(previewContent);

  try {
    const canvas = await html2canvas(previewContent, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    const imgData = canvas.toDataURL('image/png');
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    doc.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
    heightLeft -= contentHeight;

    while (heightLeft > 0) {
      position = position - pageHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
      heightLeft -= contentHeight;
    }

    const now = new Date().toISOString();
    const baseName = originalFileName
      ? originalFileName.replace(/\.[^/.]+$/, '')
      : 'document';
    const outputFileName = `${now}_${baseName}.pdf`;
    doc.save(outputFileName);
  } catch (error) {
    throw error;
  }
  
  if (document.body.contains(tempContainer)) {
    tempContainer.remove();
  }
};

