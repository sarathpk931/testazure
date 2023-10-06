/**
 * This sevice contains functions used to initialize or hold several variable values 
 * used in scan functioanlity and pop up selection
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogService } from './log.service';
import { FileFormat,FileFormatOption,ScanFeature,selectedNote,Strings} from '../model/global';

@Injectable({
  providedIn: 'root'
})

export class ScanOptionsService {

  strings:Strings;
  const_fileFormat : string = "fileFormat";
  const_type : string = "type";
  const_size : string = 'size';

  fileName ='Xerox Scan';
  email ='';

  public fileFormat:FileFormat[]=[
  // Plex
  {
  name : "fileFormat",
  title: "SDE_FILE_FORMAT",
  icon: "file_name_and_format_48.png",
  options: [
    {
      value: 'docx',
      title: '.docx',
      icon: 'filetype_docx_48.png',
      isDefault: true
    }, 
    {
      value: 'txt',
      title: '.txt',
      icon:'filetype_txt_48.png'
    }
  ],
  subFeatures: [
    {
    name: 'archivalFormat',
    title: 'SDE_ARCHIVAL_PDFA',
    enabledIf: 'pdf',
    type: 'toggle',
    options: [
      {
        value: false,
        isDefault: true,
      }, 
        {
          value: true
        },
      ],
    },
  ],
  }];

  public scanFeatures: FileFormat[]= [
  // Plex
  {
    name: 'plex',
    title: 'SDE_2SIDED_SCANNING',
    icon: '2_sided_48.png',
    options: [
      {
        value: 'ONE_SIDED',
        title: 'SDE_1SIDED',
        icon: '2_sided_1_48.png',
        isDefault: true,
      }, 
      {
        value: 'TWO_SIDED',
        title: 'SDE_2SIDED',
        icon: '2_sided_2_48.png'
      }, 
      {
        value: 'SECOND_SIDE_ROTATION',
        title: 'SDE_2SIDED_ROTATE_SIDE',
        icon: '2_sided_rotate_48.png',
      },
    ],
  },
  // Original Size
  {
    name: 'originalSize',
    title: 'SDE_ORIGINAL_SIZE',
    icon: 'original_size_48.png',
    options: [
      {
        value: 'AUTO',
        title: 'SDE_AUTO_DETECT',
        isDefault: true

      },
      {
        value: '8_5_x_11_Portrait',
        title:'8.5 x 11"',
        glyph:'xrx-portrait'
    
     },
     {
      value: '8_5_x_11_Landscape',
      title:'8.5 x 11"',
      glyph:'xrx-landscape'
    },
    {
      value: '8_5_x_14_Landscape',
      title:'8.5 x 14"',
      glyph:'xrx-landscape'
    },
    {
      value: '11_x_17_Landscape',
      title:'11 x 17"',
      glyph:'xrx-landscape'
    },
    {
      value: 'A4_Portrait',
      title:'A4',
      glyph:'xrx-portrait'
    },{
      value: 'A4_Landscape',
      title:'A4',
      glyph:'xrx-landscape'
    },
    {
      value: 'A3_Landscape',
      title:'A3',
      glyph:'xrx-landscape'
    },
  ],
},    
  ];
  
  public selectedFileFormat : BehaviorSubject<FileFormatOption> = new BehaviorSubject(null);
  selectedFileFormatC = this.selectedFileFormat.asObservable();
  public selectedType : BehaviorSubject<FileFormatOption> = new BehaviorSubject(null);
  selectedTypeC = this.selectedType.asObservable();
  public selectedSize : BehaviorSubject<FileFormatOption> = new BehaviorSubject(null);
  selectedSizeC = this.selectedSize.asObservable();

  public archivalFormat : BehaviorSubject<FileFormatOption> = new BehaviorSubject(null);

  isPlaceholderVisible: boolean;
  tempTextValue: string;

  constructor(private logService: LogService)
  {
    this.setDefaults(this.fileFormat);
    this.scanFeatures.forEach((feature) => {
      this.setDefaults(feature);
    });
  }

  resetFeatureSettings(): void {
    this.scanFeatures.forEach(feature => {
      this.setDefaults(feature);
    });
    this.setDefaults(this.fileFormat);
  }

  
  // Set defaults for each of the features (and the fileformat). We want these to be actual
  // object references because of how we manipulate them
  setDefaults(feature: any) {
    if (feature && feature.subFeatures) {
      feature.subFeatures.forEach((subFeature: ScanFeature) => {
          this.setDefaults(subFeature);
      });
  }

  if (feature && feature.options) {
      feature.selectedOption = feature.options.find((option: any) => option.isDefault);
  }
    /* feature.subFeatures.forEach((subFeature:any) => {
      this.setDefaults(subFeature);

      if (feature.options) {
        feature.selectedOption = feature.options.find((option:any) => option.isDefault);
      }
    }); */
  }

  //return corresponding option based on the parameter passed
    getFileFormat(feature : any): FileFormat {
      if(feature.from == this.const_fileFormat)
      {
        return this.fileFormat[0];
      }
      else if (feature.from == this.const_type){
        return this.scanFeatures[0];
      }
      else if (feature.from == this.const_size){
        return this.scanFeatures[1];
      }
     return this.fileFormat[0];
    }

    setSelectedOption(option: FileFormatOption, param : any){
      
      let from : string = param.from;
      if(from == this.const_fileFormat)
      {
        this.selectedFileFormat.next(option);
      }
      else if (from == this.const_type){
        this.selectedType.next(option);
      }
      else if (from == this.const_size){
        this.selectedSize.next(option);
      }
    }
    //set selected value from pop up
    getSelectedOption( from : string){
      if(from == this.const_fileFormat)
      {
        return this.selectedFileFormat;
      }
      else if (from == this.const_type){
        return this.selectedType;
      }
      else if (from == this.const_size){
        return this.selectedSize;
      }
      return this.selectedFileFormat;
    }

    getParentFileFormat(fileFormat: FileFormat,option:FileFormatOption){
      for(const formatOption of fileFormat.options){
        if(formatOption.value === option.value){
          return fileFormat;
        }
      }
      return null;
    }

    getValues(selectedNote : selectedNote) {
      //const featuresList = this.scanFeatures;
  
       //const langStr = featuresList[0].selectedOption.value;// to do
      const sidedStr = selectedNote.type.value;//featuresList[0].options[0].value;    //selectedOption
      const originalSizeStr = selectedNote.size.value;//featuresList[0].options[0].value; //SelectedOption
  
      const values: any = {};
  
      switch (originalSizeStr) {
        case '8_5_x_11_Portrait':
          values.mediaSize = 'NA_8.5x11LEF';
          values.orientation = 'PORTRAIT';
          break;
        case '8_5_x_11_Landscape':
          values.mediaSize = 'NA_8.5x11SEF';
          values.orientation = 'LANDSCAPE';
          break;
        case '8_5_x_14_Landscape':
          values.mediaSize = 'NA_8.5x14SEF';
          values.orientation = 'LANDSCAPE';
          break;
        case '11_x_17_Landscape':
          values.mediaSize = 'NA_11x17SEF';
          values.orientation = 'LANDSCAPE';
          break;
        case 'A4_Portrait':
          values.mediaSize = 'ISO_A4LEF';
          values.orientation = 'PORTRAIT';
          break;
        case 'A4_Landscape':
          values.mediaSize = 'ISO_A4SEF';
          values.orientation = 'LANDSCAPE';
          break;
        case 'A3_Landscape':
          values.mediaSize = 'ISO_A3SEF';
          values.orientation = 'LANDSCAPE';
          break;
        default:
          values.mediaSize = 'AUTO';
          values.orientation = 'PORTRAIT';
          break;
      }
  
      values.fileFormat = selectedNote.fileFormat.value;//this.fileFormat[0].options;
      values.archivalFormat = true;//this.fileFormat[1].subFeatures[0].value;  //to do
      values.colorMode = 'AUTO';
      values.combineFiles = true;
      // values.language = langStr;
      values.originalType = 'MIXED';
      values.plex = sidedStr;
      values.quality = '128';
      values.resolution = 'RES_300X300';
      values.searchableText = 'SEARCHABLE_IMAGE';

      // To fix bug where the popover config menus do not appear (only dim the screen) when selecting non-latin-char-based languages.
      if (selectedNote.fileName != this.fileName) {
        values.fileName = window.btoa(unescape(encodeURIComponent(selectedNote.fileName)));
      }
      else {
        values.fileName = window.btoa(unescape(encodeURIComponent(this.fileName)));
      }
      
      values.email = selectedNote.email;
      return values;
    }
    
  }

