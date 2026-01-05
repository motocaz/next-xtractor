globalThis.importScripts('/coherentpdf.browser.min.js');

function convertPDFsToJSONInWorker(fileBuffers, fileNames) {
  try {
    const jsonFiles = [];
    const transferBuffers = [];

    for (let i = 0; i < fileBuffers.length; i++) {
      const buffer = fileBuffers[i];
      const fileName = fileNames[i];
      const uint8Array = new Uint8Array(buffer);
      const pdf = coherentpdf.fromMemory(uint8Array, '');

      const jsonData = coherentpdf.outputJSONMemory(true, false, false, pdf);

      const jsonBuffer = jsonData.buffer.slice(0);
      jsonFiles.push({
        name: fileName,
        data: jsonBuffer,
      });
      transferBuffers.push(jsonBuffer);

      coherentpdf.deletePdf(pdf);
    }

    globalThis.postMessage(
      {
        status: 'success',
        jsonFiles: jsonFiles,
      },
      transferBuffers
    );
  } catch (error) {
    globalThis.postMessage({
      status: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error during PDF to JSON conversion.',
    });
  }
}

globalThis.onmessage = (e) => {
  if (e.data.command === 'convert') {
    convertPDFsToJSONInWorker(e.data.fileBuffers, e.data.fileNames);
  }
};

