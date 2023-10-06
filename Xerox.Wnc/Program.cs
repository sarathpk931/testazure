using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.AzureAppServices;
using System.Runtime.CompilerServices;


    var builder = WebApplication.CreateBuilder(args);

    // Access configuration and environment directly from HostBuilder

    var configuration = builder.Configuration;
    var environment = builder.Environment;
    var envName = environment.EnvironmentName;
    var Key = configuration["WNC:Key"];
    var origins = (configuration.GetSection($"WNC:{Key}:Cors:Origins" ?? string.Empty).Get<string[]>());
    string staticTokenKey = configuration["ApiKey"]!;

    var logger = LoggerFactory.Create(config =>
    {
        config.AddConsole();
        config.AddConfiguration(builder.Configuration.GetSection("Logging"));
        config.AddAzureWebAppDiagnostics();
    }).CreateLogger("Program");
    
    // Add services to the container.

    builder.Services.Configure<AzureFileLoggerOptions>(options =>
    {
        options.FileName = "azure-diagnostics-";
        options.FileSizeLimit = 50 * 1024;
        options.RetainedFileCountLimit = 5;
    });

    builder.Services.Configure<AzureBlobLoggerOptions>(options =>
    {
        options.BlobName = "log.txt";
    });

    builder.Services.AddControllersWithViews();

    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(builder =>
        {
            builder
                .WithOrigins(origins.ToArray())
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

    builder.Services.AddApplicationInsightsTelemetry(configuration);

    

    var app = builder.Build();

    app.Logger.LogInformation($"Note Converter Application Running....Environment: {envName}");

    if (origins != null && origins.Length > 0)
    {
        string originsString = string.Join(", ", origins);
        app.Logger.LogInformation($"Origins: {originsString}");
    }
    else
    {
       app.Logger.LogInformation("No origins found.");
    }



    // Configure the HTTP request pipeline.


    if (!app.Environment.IsDevelopment())
    {
       app.UseHsts();
    }
    else
    {
      app.UseDeveloperExceptionPage();
    }

    

    app.UseFileServer();

    app.UseStaticFiles();

    app.UseRouting();

    app.UseCors();

    //app.UseAuthentication();
    //app.UseAuthorization();

    app.Use(async (context, next) =>
    {
        string token = context.Request.Headers["Authorization"]!;
        string clientIpAddress = context.Connection.RemoteIpAddress!.ToString();
        string requestPath = $"{context.Request.Host}{context.Request.Path}";


        if (string.IsNullOrEmpty(token) || !token.StartsWith("Bearer ") || token.Substring(7) != staticTokenKey)
        {
            int statusCode = 401; // Unauthorized
            //logger.LogInformation($"Unauthorized request from {clientIpAddress} to {requestPath} - Status Code: {statusCode}");
            context.Response.StatusCode = statusCode;
            await context.Response.WriteAsync("Unauthorized");
        }
        else
        {
            await next();
            int statusCode = context.Response.StatusCode;
            //logger.LogInformation($"Request from {clientIpAddress} to {requestPath} - Status Code: {statusCode}");
        }

        if (context.Response.StatusCode == 404 && !Path.HasExtension(context.Request.Path.Value))
        {
            context.Request.Path = "/index";
            await next();
        }
    });

    app.MapControllerRoute(
        name: "default",
        pattern: "{controller}/{action=Index}/");


    app.MapFallbackToFile("/index");

    app.Run();
