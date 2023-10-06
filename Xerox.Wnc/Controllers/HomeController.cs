using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Globalization;
using System.Collections;
using System.Collections.Generic;
using System.Resources;
using Xerox.Wnc.Resources.Resources;
using Microsoft.Extensions.Logging;

namespace Xerox.Wnc.Web.Controllers
{
  [Route("v1/api")]
  public class HomeController : Controller
  {
    private readonly IConfiguration _configuration;
    private readonly ILogger<HomeController> _logger;

        public HomeController(IConfiguration configuration, ILogger<HomeController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Returns the localization strings for all supported languages in JSON format for the app.
        /// </summary>
        /// <returns></returns>
        [Route("strings")]
        public IActionResult GetStrings(string lang = "")
        {
            try
            {
             
                if (!String.IsNullOrEmpty(lang))
                {
                    CultureInfo.CurrentUICulture = new CultureInfo(lang, false);

                }

                ResourceSet resources = AppsResource.ResourceManager.GetResourceSet(CultureInfo.CurrentUICulture, true, true);
                Dictionary<string, string> resourceDict = new Dictionary<string, string>();

                foreach (DictionaryEntry resource in resources)
                {
                    resourceDict.Add(resource.Key.ToString(), resource.Value.ToString());
                }

                return Json(new
                {
                    strings = resourceDict
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in GetStrings action method.");

                return StatusCode(500, "An error occurred while processing your request.");
            }
        }


        [HttpGet("/index.html")]
        public IActionResult Index()
        {
            try
            {
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in Index action.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
  }
}
