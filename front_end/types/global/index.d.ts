import * as XLSX_ from 'xlsx';

//xlsx is loaded with CDNJS, and thus available in global scope to modules that use it
declare global {
  const XLSX: typeof XLSX_;
}

