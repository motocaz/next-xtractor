'use client';

import { marked } from 'marked';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import DOMPurify from 'dompurify';
import type { MdToPdfOptions } from '../types';
import { processCSS, processInlineStyle, convertMultipleColorValues } from './color-converter';

export const mdToPdf = async (
  markdownContent: string,
  options: MdToPdfOptions
): Promise<Blob> => {
  if (!markdownContent || !markdownContent.trim()) {
    throw new Error('Please enter some Markdown text.');
  }

  const htmlContent = marked.parse(markdownContent) as string;
  
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'strong', 'em', 'b', 'i', 'u', 's',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  });

  const tempContainer = document.createElement('div');
  tempContainer.style.cssText =
    'position: absolute; top: -9999px; left: -9999px; width: 800px; padding: 40px; background-color: rgb(255, 255, 255) !important; color: rgb(0, 0, 0) !important;';
  
  const rawCss = `
    body { font-family: Helvetica, Arial, sans-serif; line-height: 1.6; font-size: 12px; }
    h1, h2, h3 { margin: 20px 0 10px 0; font-weight: 600; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
    h1 { font-size: 2em; } 
    h2 { font-size: 1.5em; }
    p, blockquote, ul, ol, pre, table { margin: 0 0 16px 0; }
    blockquote { padding: 0 1em; color: #6a737d; border-left: .25em solid #dfe2e5; }
    pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 6px; }
    code { font-family: 'Courier New', monospace; background-color: rgba(27,31,35,.05); border-radius: 3px; padding: .2em .4em; }
    table { width: 100%; border-collapse: collapse; } 
    th, td { padding: 6px 13px; border: 1px solid #dfe2e5; }
    img { max-width: 100%; }
  `;
  
  const processedCss = processCSS(rawCss);
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = processedCss;
  
  tempContainer.appendChild(styleSheet);
  
  let processedHtml = sanitizedHtml.replace(/style\s*=\s*["']([^"']+)["']/gi, (match, styleValue) => {
    const processedStyle = processInlineStyle(styleValue);
    return `style="${processedStyle}"`;
  });
  
  processedHtml = convertMultipleColorValues(processedHtml);
  
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = processedHtml;
  
  const processElementStyles = (element: Element) => {
    if (element instanceof HTMLElement && element.style.cssText) {
      const originalStyle = element.style.cssText;
      const processedStyle = processInlineStyle(originalStyle);
      if (processedStyle !== originalStyle) {
        element.style.cssText = processedStyle;
      }
    }
    Array.from(element.children).forEach(processElementStyles);
  };
  
  processElementStyles(contentDiv);
  
  tempContainer.appendChild(contentDiv);
  document.body.appendChild(tempContainer);

  await new Promise(resolve => setTimeout(resolve, 0));
  
  const processComputedStyles = (element: Element) => {
    if (element instanceof HTMLElement) {
      const computedStyle = window.getComputedStyle(element);
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
      
      const stylesToUpdate: string[] = [];
      
      colorProperties.forEach(prop => {
        const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        const value = computedStyle.getPropertyValue(kebabProp);
        if (value && (value.includes('lab(') || value.includes('oklab(') || value.includes('lch(') || value.includes('oklch('))) {
          const converted = convertMultipleColorValues(value);
          if (converted !== value) {
            element.style.setProperty(kebabProp, converted, 'important');
            stylesToUpdate.push(`${kebabProp}: ${converted}`);
          }
        }
      });
    }
    Array.from(element.children).forEach(processComputedStyles);
  };
  
  processComputedStyles(tempContainer);
  
  if (document.body) {
    const bodyComputedStyle = window.getComputedStyle(document.body);
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
      const computedStyle = window.getComputedStyle(element);
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
  
  verifyNoLabColors(tempContainer);

  try {
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    document.body.removeChild(tempContainer);

    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.pageFormat,
    });

    const pageFormats: Record<string, [number, number]> = {
      a4: [210, 297],
      letter: [216, 279],
    };

    const format = pageFormats[options.pageFormat];
    const [pageWidth, pageHeight] =
      options.orientation === 'landscape' ? [format[1], format[0]] : format;

    const margins: Record<string, number> = {
      narrow: 10,
      normal: 20,
      wide: 30,
    };

    const margin = margins[options.marginSize];
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    const imgData = canvas.toDataURL('image/png');
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
    heightLeft -= contentHeight;

    while (heightLeft > 0) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
      heightLeft -= contentHeight;
    }

    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (error) {
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
    throw error;
  }
};

