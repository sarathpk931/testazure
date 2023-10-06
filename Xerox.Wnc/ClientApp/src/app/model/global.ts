export interface FileFormat {
    name : string;
    title : string;
    icon: string;
    options : FileFormatOption[];
    subFeatures?: FileFormatSubFeature[];
}

export interface FileFormatOption {
    value: string;
    title: string;
    icon?: string;
    isDefault?: boolean;
    glyph? : string;
}

export interface FileFormatSubFeature{
name: string;
title: string;
enabledIf: string;
type: string;
options: FileFeatureSubFeatureOption[];
}

export interface FileFeatureSubFeatureOption {
    value: boolean;
    isDefault?: boolean;
}

export interface selectedNote{
    fileFormat : FileFormatOption,
    size       : FileFormatOption,
    type       : FileFormatOption,
    email      : string,
    fileName   : string
}

export interface ScanFeatureOption {
    value: string;
    title: string;
    icon?: string;
    glyph?: string;
    isDefault?: boolean;
}

export interface ScanFeature {
    name: string;
    title: string;
    icon: string;
    options: ScanFeatureOption[];
}
  
export class Global {

    public static Email:string;
    public static Generation:string;
    public static isThirdGenBrowser:string;
    public static isVersaLink:string;
    public static isAltaLink:string;
    public static isEighthGen:string;
    public static Model:string
}

export class AppSetting {

    public static  url:'http://localhost';
    public static timout:5000;
    public static async:true;
    public static ldap:'';
   
}

export interface DialogData {
    title: string;
    message: string;
  }

  export interface DialogDataObject  {
    title: string,
    additionalInfo: string,
    additionalInfo2:string,
    button1Callback:any,
    button2Callback:any,
    button1Glyph?:string,
    button2Glyph?:string,
    button1Text? : string,
    button2Text? : string
  };

  export interface resourceString{
        [key:string]:string;
  }

  export interface Strings{
    strings: Strings
}
  
  export interface Strings {
    SDE_REQUIRED_FIELD1: string
    SDE_FMTSTRFMTSTR_XEROX_CORPORATION2: string
    SDE_11_X_173: string
    SDE_XEROX_SCAN: string
    SDE_WILL_RECEIVE_EMAIL2: string
    SDE_CHARACTERS_CANNOT_BE: string
    SDE_TO_USE_APP: string
    SDE_OK: string
    SDE_ORIGINAL_SIZE: string
    SDE_SCAN: string
    SDE_WRITTEN_NOTE_CONVERSION7: string
    SDE_WRITTEN_NOTE_CONVERSION6: string
    SDE_WRITTEN_NOTE_CONVERSION5: string
    SDE_WRITTEN_NOTE_CONVERSION4: string
    SDE_WRITTEN_NOTE_CONVERSION8: string
    SDE_ENTER_FILE_NAME1: string
    SDE_PLEASE_TRY_AGAIN1: string
    SDE_EMAIL_NOT_VALID: string
    SDE_FMTSTR_DATE_TIMEFMTSTR: string
    SDE_CHECK_DEVICES_NETWORK: string
    SDE_2SIDED_SCANNING: string
    SDE_FILE_NAME: string
    SDE_INPUT_SCAN_SIZE: string
    TWO_SIDED: string
    SDE_1SIDED: string
    SDE_2SIDED: string
    SDE_JOB_CANCELED1: string
    SDE_IF_PROBLEM_PERSISTS3: string
    SDE_SCANNING1: string
    SDE_CLOSE: string
    SDE_ENTER_EMAIL_RECEIVE1: string
    SDE_RESET: string
    SDE_SCAN_EXTENSION_SCAN1: string
    SDE_CANCEL: string
    ONE_SIDED: string
    SDE_PRIVACY_STATEMENT: string
    SDE_2SIDED_ROTATE_SIDE: string
    SDE_AUTO_DETECT: string
    SDE_DOCUMENT_SUCCESSFULLY_SCANNED: string
    SDE_CONTACT_DEVICE_ADMINISTRATOR: string
    SDE_XEROX_PRIVACY_STATEMENT : string 
  }
  