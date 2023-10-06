    export interface _scanSection {
        name: string;
        details: {
          AutoContrast: { type: string, value: string },
          AutoExposure: { type: string, value: string },
          CompressionQuality: { type: string, value: number },
          Darkness: { type: string, value: number },
          Contrast: { type: string, value: number },
          OriginalSubType: { type: string, value: string },
          InputEdgeErase: { type: string, value: string },
          InputMediaSize: { type: string, value: string },
          InputOrientation: { type: string, value: string },
          Magnification: { type: string, value: string },
          Sharpness: { type: string, value: number },
          Saturation: { type: string, value: number },
          ColorMode: { type: string, value: string },
          SidesToScan: { type: string, value: string },
          DocumentImageMode: { type: string, value: string },
          BlankPageRemoval: { type: string, value: string }
        }
      }
      
      export  interface _generalSection {
        name: string;
        details: {
          DCSDefinitionUsed: { type: string, value: string },
          JobTemplateCharacterEncoding: { type: string, value: string },
          ConfirmationStage: { type: string, value: string },
          JobTemplateCreator: { type: string, value: string },
          SuppressJobLog: { type: string, value: string },
          JobTemplateLanguageVersion: { type: string, value: string },
          JobTemplateName: { type: string, value: string },
          ConfirmationMethod: { type: string, value: string }
        }
      }
      
      export interface _destSec {
        name: string;
        details: {
          RepositoryAlias: { type: string, value: string },
          FilingProtocol: { type: string, value: string },
          RepositoryVolume: { type: string, value: string },
          RepositoryName: { type: string, value: string },
          DocumentPath: { type: string, value: string },
          ServerValidationReq: { type: string, value: string },
          DocumentFilingPolicy: { type: string, value: string },
          XrxHTTPScriptLocation: { type: string, value: string },
          UserNetworkFilingLoginName: { type: string, value: string },
          UserNetworkFilingLoginID: { type: string, value: string }
        }
      }
      
      export interface _docSec {
        name: string;
        details: {
          DocumentFormat: { type: string, value: string },
          DocumentObjectName: { type: string, value: string },
          CompressionsSupported: { type: string, value: string },
          MixedTypesSupported: { type: string, value: string },
          MixedCompressionsSupported: { type: string, value: string },
          Resolution: { type: string, value: string },
          OutputImageSize: { type: string, value: string },
          UserData: { type: string, value: string }
        }
      }

      export interface scanTemplate {
        docSec : _docSec,
        destSec : _destSec,
        generalSec : _generalSection,
        scanSec : _scanSection,
        name : string,
        sections : [_scanSection, _generalSection, _destSec, _docSec],
        checkSum? : string,
        jobId? : string,
        status? : status
      }

      export interface status{
        lastJobState : string,
        lastJobStateReason : string
      }
      
      export interface TemplateType {
        supportsSimpleValidation? : boolean;
        values? : string [];
        validate? : (v) => void;
        format? :(v) => void;
      }

      export interface TemplateTypes {
        [key: string]: TemplateType;
      }
      
      
