import React from 'react';
import BackgroundRemover from './BackgroundRemover';

/* Signature Maker is the signature-specific photo workflow:
   upload a handwritten signature, remove paper, scan-clean, compare and export. */
export default function SignatureMaker({hi=false,onBack}:{hi?:boolean;onBack:()=>void}) {
  return <BackgroundRemover hi={hi} onBack={onBack} variant="signature"/>;
}
