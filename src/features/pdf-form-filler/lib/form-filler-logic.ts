"use client";

import {
  PDFDocument,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  PDFOptionList,
  PDFButton,
  PDFSignature,
  type PDFField,
} from "pdf-lib";
import type { FormField, FormFieldValue } from "../types";

export const extractFormFields = (pdfDoc: PDFDocument): FormField[] => {
  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const formFields: FormField[] = [];

    fields.forEach((field: PDFField) => {
      try {
        const name = field.getName();
        const isRequired = field.isRequired();
        const labelText = name.replace(/[_-]/g, " ");

        let formField: FormField | null = null;

        if (field instanceof PDFTextField) {
          const value = field.getText() || "";
          formField = {
            name,
            type: "text",
            required: isRequired,
            value,
            label: labelText,
          };
        } else if (field instanceof PDFCheckBox) {
          const value = field.isChecked() ? "on" : "off";
          formField = {
            name,
            type: "checkbox",
            required: isRequired,
            value,
            label: labelText,
          };
        } else if (field instanceof PDFRadioGroup) {
          const value = field.getSelected() || "";
          const options = field.getOptions();
          formField = {
            name,
            type: "radio",
            required: isRequired,
            value,
            options,
            label: labelText,
          };
        } else if (field instanceof PDFDropdown) {
          const selectedValues = field.getSelected();
          const value = Array.isArray(selectedValues)
            ? selectedValues[0] || ""
            : selectedValues || "";
          const options = field.getOptions();
          formField = {
            name,
            type: "dropdown",
            required: isRequired,
            value,
            options,
            label: labelText,
          };
        } else if (field instanceof PDFOptionList) {
          const selectedValues = field.getSelected();
          const value = Array.isArray(selectedValues) ? selectedValues : [];
          const options = field.getOptions();
          formField = {
            name,
            type: "option-list",
            required: isRequired,
            value,
            options,
            label: labelText,
          };
        } else if (
          field instanceof PDFButton ||
          field instanceof PDFSignature
        ) {
          formField = {
            name,
            type: "unsupported",
            required: false,
            value: "",
            label: labelText,
          };
        }

        if (formField) {
          formFields.push(formField);
        }
      } catch (error) {
        console.error(`Error processing field "${field.getName()}":`, error);
      }
    });

    return formFields;
  } catch (error) {
    console.error("Error extracting form fields:", error);
    return [];
  }
};

export const applyFormValues = (
  pdfDoc: PDFDocument,
  fieldValues: Record<string, FormFieldValue>
): void => {
  try {
    const form = pdfDoc.getForm();

    Object.keys(fieldValues).forEach((fieldName) => {
      try {
        const field = form.getField(fieldName);
        if (!field) return;

        const value = fieldValues[fieldName];

        if (field instanceof PDFTextField) {
          field.setText(String(value));
        } else if (field instanceof PDFCheckBox) {
          if (value === true || value === "on") {
            field.check();
          } else {
            field.uncheck();
          }
        } else if (field instanceof PDFRadioGroup) {
          field.select(String(value));
        } else if (field instanceof PDFDropdown) {
          field.select(String(value));
        } else if (field instanceof PDFOptionList) {
          if (Array.isArray(value)) {
            value.forEach((option) => {
              try {
                field.select(option);
              } catch {}
            });
          }
        }
      } catch (error) {
        console.error(`Error applying value to field "${fieldName}":`, error);
      }
    });
  } catch (error) {
    console.error("Error applying form values:", error);
    throw error;
  }
};

export const getFormFieldValue = (field: PDFField): FormFieldValue => {
  try {
    if (field instanceof PDFTextField) {
      return field.getText() || "";
    } else if (field instanceof PDFCheckBox) {
      return field.isChecked() ? "on" : "off";
    } else if (field instanceof PDFRadioGroup) {
      return field.getSelected() || "";
    } else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
      const selected = field.getSelected();
      return Array.isArray(selected) ? selected : selected || "";
    }
    return "";
  } catch (error) {
    console.error("Error getting form field value:", error);
    return "";
  }
};
