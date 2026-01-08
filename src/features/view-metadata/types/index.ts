export interface InfoDictionaryMetadata {
  [key: string]: string | number | null | undefined;
}

export interface FormField {
  fieldName: string;
  fieldValue: string | null;
}

export interface ViewMetadataResult {
  info: InfoDictionaryMetadata;
  formFields: FormField[];
  xmpNodes: Array<{
    key: string;
    value: string;
    indent: number;
    isHeader: boolean;
  }>;
  rawXmpString: string | null;
}
