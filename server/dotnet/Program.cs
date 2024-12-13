using OpenAI.Chat;
using System.Text.Json;

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
            var response = GetTattooIdeas(client);
            Console.WriteLine(response.RootElement.ToString());            
            app.Run();
        }
        private static WebApplication ConfigureApp (string[] args)
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
        private static JsonDocument GetTattooIdeas (ChatClient client)
        {
            List<ChatMessage> messages =
            [
                new UserChatMessage("Come up with 3 tattoo ideas"),
            ];
            ChatCompletionOptions options = new()
            {
                ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                    jsonSchemaFormatName: "tattoo_ideas",
                    jsonSchema: BinaryData.FromBytes("""
                    {
                        "type": "object",
                        "properties": {
                            "tattooIdeas": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "idea": { "type": "string" },
                                        "description": { "type": "string" }
                                    },
                                    "required": ["idea", "description"],
                                    "additionalProperties": false
                                }
                            }
                        },
                        "required": ["tattooIdeas"],
                        "additionalProperties": false
                    }
                    """u8.ToArray()),
                    jsonSchemaIsStrict: true                
                )
            };
            ChatCompletion completion = client.CompleteChat(messages, options);
            JsonDocument structuredJsonResponse = JsonDocument.Parse(completion.Content[0].Text);
            return structuredJsonResponse;
        }
    }
}