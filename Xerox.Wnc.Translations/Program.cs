using ICSharpCode.Decompiler.Util;
using Newtonsoft.Json;
using System.Configuration;
using System.Data.SqlClient;
using System.Xml;

namespace Xerox.Wnc.Translations
{
    public class Program
    {
        public enum FormatTypes
        {
            resource = 0,
            json = 1,
            properties = 2
        }

        private const string ConfLanguageListKey = "LanguageList";
        private const string ConfApplicationNameKey = "ApplicationName";
        private const string ConfViewNameKey = "ViewName";
        private const string ConfDSNKey = "DSN";
        private const string ArgParseOutputName = "-out";
        private const string ArgParseFormatTypeName = "-t";
        private const string ArgParseFilterFile = "-filter";
        private const string ResourceFileName = "AppsResource";
        public static Dictionary<string, Dictionary<string, string>> translations = new Dictionary<string, Dictionary<string, string>>();
        private static string OutputFolder = string.Empty;
        private static readonly string JSON_WEBLET_FOLDER =
           @"..\..\..\..\Xerox.Wnc.Weblet\";

        private static string TranslationFile = "translations.json";
        private static string FilterFile = "UntranslatedStrings.txt";
        public static void Main(string[] args)
        {
            //Read App Settings
            Console.WriteLine("Read Application Settings....");
            var dsn = ConfigurationManager.AppSettings[ConfDSNKey];
            var viewName = ConfigurationManager.AppSettings[ConfViewNameKey];
            var applicationName = ConfigurationManager.AppSettings[ConfApplicationNameKey];
            var _languages = ConfigurationManager.AppSettings[ConfLanguageListKey].Split(',');
            translations = new Dictionary<string, Dictionary<string, string>>();

            for (var i = 0; i < args.Length; i++)
                if (args[i].Equals(ArgParseOutputName, StringComparison.CurrentCultureIgnoreCase))
                {
                    if (i < args.Length - 1)
                        OutputFolder = args[++i];
                }
                else if (args[i].Equals(ArgParseFormatTypeName, StringComparison.CurrentCultureIgnoreCase))
                {
                    if (i < args.Length - 1)
                    {
                        //parse to enum failed--set to default XML
                        FormatTypes formatType;
                        Enum.TryParse(args[++i].ToLower(), out formatType);
                    }
                }
                else if (args[i].Equals(ArgParseFilterFile, StringComparison.CurrentCultureIgnoreCase))
                {
                    if (i < args.Length - 1)
                        FilterFile = args[++i];
                }

            var _sqlCommand = $"SELECT * FROM dbo.{viewName} WHERE EN_{applicationName} = 'true' ORDER BY 'EN_EnumName'";
            ;

            try
            {
                Console.WriteLine("Get Translations from Database");
                using (var conn = new SqlConnection(dsn))
                {
                    conn.Open();
                    using (var command = new SqlCommand(_sqlCommand, conn))
                    {
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var enumName = reader.GetString(reader.GetOrdinal("EN_EnumName"));
                                foreach (var lang in _languages)
                                {
                                    if (!translations.ContainsKey(lang))
                                        translations.Add(lang, new Dictionary<string, string>());
                                    translations[lang].Add(reader.GetString(reader.GetOrdinal("EN_EnumName")),
                                        reader.GetString(reader.GetOrdinal(lang + "_String")));
                                }
                            }
                        }
                    }
                }
                Console.WriteLine("Done getting Translations from Database");

                if (string.IsNullOrEmpty(OutputFolder))
                {
                    var currentDirectory = Directory.GetCurrentDirectory();
                    OutputFolder =
                        Path.GetFullPath(Path.Combine(currentDirectory,
                            @"..\..\..\..\Xerox.Wnc.Resources\Resources"));
                    TranslationFile =
                        Path.GetFullPath(Path.Combine(currentDirectory, JSON_WEBLET_FOLDER + TranslationFile));
                }

                GenerateResourceFiles();
                GenerateJSONFiles();

                Console.WriteLine("Finished all translations!");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error generating translations. Exception : {0}", ex);
            }

            Console.ReadLine();
        }

        private static void GenerateResourceFiles()
        {
            Console.WriteLine("Start Resource File Generation");
            if (translations != null && translations.Count > 0)
            {
                foreach (var language in translations.Keys)
                {
                    string twoLetterLanguageCode;
                    switch (language.ToLower())
                    {
                        case "en":
                            twoLetterLanguageCode = "";
                            break;
                        case "en_gb":
                            twoLetterLanguageCode = "." + "en-gb";
                            break;
                        default:
                            twoLetterLanguageCode = "." + language.Substring(0, 2);
                            break;
                    }
                    var outputFile = Path.Combine(OutputFolder, ResourceFileName + twoLetterLanguageCode + ".resx");
                    using (var rw = new ResXResourceWriter(outputFile))
                    {
                        foreach (var translation in translations[language])
                        rw.AddResource(translation.Key, translation.Value);
                        rw.Generate();
                    }
                }
            }
            Console.WriteLine("Done Resource File Generation");
        }

        private static void GenerateJSONFiles()
        {
            if (!string.IsNullOrEmpty(FilterFile))
            {
                var lines = File.ReadAllLines(@"..\..\..\..\Xerox.Wnc.Translations\" + FilterFile);
                var filterStrings = lines.ToList();

                var filteredTranslatedStrings = new Dictionary<string, Dictionary<string, string>>();

                foreach (var language in translations.Keys)
                {
                    if (language == "fr_fi")
                    {
                        filteredTranslatedStrings.Add("fr", new Dictionary<string, string>());
                    }
                    else if (language == "no")
                    {
                        filteredTranslatedStrings.Add("no", new Dictionary<string, string>());
                        filteredTranslatedStrings.Add("nb", new Dictionary<string, string>());
                    }
                    else
                    {
                        filteredTranslatedStrings.Add(language, new Dictionary<string, string>());
                    }


                    foreach (var untranslatedString in filterStrings)
                        if (language == "fr_fi")
                        {
                            filteredTranslatedStrings["fr"].Add(untranslatedString,
                                translations[language][untranslatedString]);
                        }
                        else if (language == "no")
                        {
                            filteredTranslatedStrings["no"].Add(untranslatedString,
                                translations[language][untranslatedString]);
                            filteredTranslatedStrings["nb"].Add(untranslatedString,
                                translations[language][untranslatedString]);
                        }
                        else
                        {
                            filteredTranslatedStrings[language].Add(untranslatedString,
                                translations[language][untranslatedString]);
                        }
                }
                var mappedTranslationJson = JsonConvert.SerializeObject(filteredTranslatedStrings, Newtonsoft.Json.Formatting.Indented);
                if (string.IsNullOrEmpty(OutputFolder))
                    OutputFolder = "translations.json";
                File.WriteAllText(TranslationFile, mappedTranslationJson);
            }
        }
    }
}