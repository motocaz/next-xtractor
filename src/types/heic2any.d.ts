declare module 'heic2any' {
  interface Heic2anyOptions {
    blob: Blob | File;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }

  type Heic2anyResult = Blob | Blob[];

  function heic2any(options: Heic2anyOptions): Promise<Heic2anyResult>;

  export default heic2any;
}

