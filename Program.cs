using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;
using Microsoft.AspNetCore.Http.Timeouts;


var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddResponseCompression(options => {
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.EnableForHttps = true;
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[] { "text/html", "text/plain", "text/css", "application/javascript", "application/json",  "application/xml", "image/svg+xml" }); }); 

builder.Services.Configure<BrotliCompressionProviderOptions>(options => options.Level = CompressionLevel.SmallestSize);
builder.Services.Configure<GzipCompressionProviderOptions>(options => options.Level = CompressionLevel.SmallestSize);

var S5TimeoutPolicy = "S5TimeoutPolicy";
builder.Services.AddRequestTimeouts(options => {
    options.DefaultPolicy = new RequestTimeoutPolicy { Timeout = TimeSpan.FromSeconds(10), TimeoutStatusCode = 503 };
    options.AddPolicy(S5TimeoutPolicy, TimeSpan.FromSeconds(5));
});

var HOutputCachePolicy = "HOutputCachePolicy";
builder.Services.AddOutputCache(options => {
    options.AddPolicy(HOutputCachePolicy, builder => builder.Expire(TimeSpan.FromSeconds(Test4App.Constants.HInSecForCache)));
});

var app = builder.Build();
var isDebug = true;

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment()) {
    app.UseExceptionHandler("/Error");
    app.UseHsts();
    isDebug = false;
} else {
    var config = builder.Configuration.GetSection("AlgaWwwcoreConfig").Get<Alga.wwwcore.Root.ConfigModel>();
    var logger = app.Services.GetRequiredService<ILogger<Alga.wwwcore.Root>>();
    if(config != null) await new Alga.wwwcore.Root(config, logger).Start();
}

app.UseHttpsRedirection();
app.UseRequestTimeouts();
app.UseResponseCompression();

app.UseStaticFiles(new StaticFileOptions {
    OnPrepareResponse = ctx => {
        string ext = Path.GetExtension(ctx.File.Name).ToLower();
        int maxAge = ext switch {
            ".png" or ".jpg" or ".jpeg" or ".gif" or ".webp" => Test4App.Constants.ThirtyDInSecForCache, // 30 дней
            ".css" or ".js" or ".html" => Test4App.Constants.HInSecForCache, // 1 час
            _ => Test4App.Constants.HInSecForCache // 1 часа по умолчанию
        };

        ctx.Context.Response.Headers["Cache-Control"] = $"public, max-age={maxAge}, immutable";
        if (ctx.File.Name == "manifest.json") ctx.Context.Response.ContentType = "application/manifest+json";
        else if (ext == ".sql") ctx.Context.Response.ContentType = "text/plain";
    }});

// -- endpoints: based on activities


AppMapGet("/", "i");
AppMapGet("/book/{id}", "book");
AppMapGet("/book-edit", "bookEdit");
AppMapGet("/book-edit/{id}", "bookEdit");
AppMapGet("/books", "books");
AppMapGet("/task/{number}", "task");

void AppMapGet(string route, string template) {
    app.MapGet(route, (HttpContext context) => {
        if(!isDebug) context.Response.Headers["Cache-Control"] = $"public, max-age={Test4App.Constants.HInSecForCache}, immutable";
        context.Response.ContentType = "text/html";
        var debug = isDebug ? ".debug" : "";
        return context.Response.SendFileAsync($"wwwroot/UISs/{template}/index{debug}.html");
    }).CacheOutput(HOutputCachePolicy);
}

// -- endpoints: other

app.MapGet("/code-test", async (HttpContext context) =>
{
    var filePath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "UISs", "i", "content", "code-test.docx");

    if (!System.IO.File.Exists(filePath))
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("File not found");
        return;
    }

    context.Response.ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    context.Response.Headers["Cache-Control"] = $"public, max-age={Test4App.Constants.HInSecForCache}, immutable";
    await context.Response.SendFileAsync(filePath);
});

app.MapGet("/sql/{filename}", async (HttpContext context, string filename) =>
{
    var filePath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "UISs", "task", "content", filename);

    if (!System.IO.File.Exists(filePath))
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("File not found");
        return;
    }

    context.Response.ContentType = "text/plain";
    context.Response.Headers["Cache-Control"] = $"public, max-age={Test4App.Constants.HInSecForCache}, immutable";
    await context.Response.SendFileAsync(filePath);
});

// --------------------

app.Run();