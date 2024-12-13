using OpenAI.Chat;

namespace TattGPT
{
    internal class API 
    {
        private static void Main (string[] args)
        {
            var app = ConfigureApp(args);
            var client = InitialiseOpenAI();
            if (client == null)
            {
                return;
            }
            ChatCompletion completion = client.CompleteChat("Say 'this is a test.'");
            Console.WriteLine($"[ASSISTANT]: {completion.Content[0].Text}");
            app.Run();
        }
        private static WebApplication ConfigureApp  (string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngularApp", policy =>
                {
                    policy.WithOrigins("http://localhost:4200")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });
            var app = builder.Build();
            app.UseCors("AllowAngularApp");
            app.UseHttpsRedirection();
            app.MapGet("/", () =>
            {
                string response = "hello world";
                return response;
            })
            .WithName("HelloWorld");
            return app;
        }
        private static ChatClient? InitialiseOpenAI ()
        {
            var apiKey = Environment.GetEnvironmentVariable("TATTGPT_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine("API key is missing. Please set the TATTGPT_API_KEY environment variable.");
                return null;
            }
            ChatClient client = new ChatClient(model: "gpt-4o-mini", apiKey: apiKey);
            return client;
        }
    }
}