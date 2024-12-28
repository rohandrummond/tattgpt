using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using OpenAI.Images;
using System.Text.Json;

namespace TattGPT
{
    internal class API 
    {

        // Main function
        private static void Main (string[] args)
        {
            var app = ConfigureApp(args);        
            app.Run();
        }

        // Configure .NET Web API 
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
            MapRoutes(app);
            return app;
        }

        // Map API endpoints
        private static void MapRoutes (WebApplication app) 
        {
            var (chatClient, imageClient) = InitialiseOpenAI();
            if (chatClient == null)
            {
                return;
            }
            if (imageClient == null)
            {
                return;
            }
            app.MapGet("/", () =>
            {
                Console.WriteLine("GET endpoint being triggered");
            })
            .WithName("GET");
            app.MapPost("/generate-ideas", async (IdeaFormData ideaFormData) =>
            {
                try 
                {
                    if (ideaFormData == null)
                    {
                        return Results.BadRequest(new { message = "No form data submitted "});
                    }
                    JsonDocument ideas = await GenerateIdeas(chatClient, ideaFormData);
                    if (ideas == null)
                    {
                        return Results.BadRequest(new { message = "Problem receiving data from OpenAI API"});
                    }
                    return Results.Ok(ideas);
                } 
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred: {ex.Message}");
                    return Results.StatusCode(500);
                }
            })
            .WithName("GenerateIdeas");
            app.MapPost("/generate-image", async (ImageGenerationData imageGenerationData) => {
                try 
                {
                    string formattedJson = JsonSerializer.Serialize(imageGenerationData);
                    string base64 = await GenerateImage(imageClient, imageGenerationData);
                    return Results.Ok(base64);
                }
                catch (Exception ex) {
                    Console.WriteLine($"An error occurred: {ex.Message}");
                    return Results.StatusCode(500);
                }
            })
            .WithName("GenerateImage");        
        }

        // Initialise connection with OpenAI API 
        private static(ChatClient?, ImageClient?) InitialiseOpenAI ()
        {
            var apiKey = Environment.GetEnvironmentVariable("TATTGPT_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine("API key is missing. Please set the TATTGPT_API_KEY environment variable.");
                return (null, null);
            }
            ChatClient chatClient = new ChatClient(model: "gpt-4o-mini", apiKey: apiKey);
            ImageClient imageClient = new("dall-e-2", apiKey: apiKey);
            return (chatClient, imageClient);
        }

        // Idea generation prompt logic
        private static async Task<JsonDocument> GenerateIdeas (ChatClient client, IdeaFormData ideaFormData)
        {
            var prompt = new List<string>
            {
                "Generate 3 classic tattoo ideas "
            };
            var promptDetails = new Dictionary<string, string?>
            {
                { "for a ", ideaFormData.Style},
                { " style tattoo, in ", ideaFormData.Color },
                { ", suitable for a ", ideaFormData.Size },
                { " size placement on the ", ideaFormData.Area },
                { ". Incorporate the following theme or concept provided by the user: ", ideaFormData.Themes }
            };
            foreach (var  (label, value) in promptDetails)
            {
                if (!string.IsNullOrEmpty(value))
                {
                    prompt.Add($"{label}{value}");
                }
            }
            string formattedPrompt = string.Join("", prompt) + ". Keep the designs versatile and open to personal interpretation, avoiding overly specific details.";
            List<ChatMessage> messages =
            [
                new UserChatMessage(formattedPrompt),
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
                                        "description": { "type": "string" },
                                        "style": { "type": "string" },
                                        "size": { "type": "string" },
                                        "color": { "type": "string" },
                                        "placement": { "type": "string" }
                                    },
                                    "required": ["idea", "description", "style", "size", "color", "placement"],
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
            ChatCompletion completion = await client.CompleteChatAsync(messages, options);
            JsonDocument structuredJsonResponse = JsonDocument.Parse(completion.Content[0].Text);
            return structuredJsonResponse;
        }

        private static async Task<String> GenerateImage (ImageClient client, ImageGenerationData imageGenerationData)
        {
            var prompt = new List<string?>
            {
                imageGenerationData.Style
            };
            var promptDetails = new Dictionary<string, string?>
            {
                { " style tattoo design in ", imageGenerationData.Color},
                { ", suitable for a ", imageGenerationData.Size},
                { " placement on the ", imageGenerationData.Placement},
                { ". Here is a more detailed description of the tattoo: ", imageGenerationData.Description  }
            };
            foreach (var  (label, value) in promptDetails)
            {
                prompt.Add($"{label}{value}");
            }
            string formattedPrompt = string.Join("", prompt);
            ImageGenerationOptions options = new()
            {
                Size = GeneratedImageSize.W256xH256,
                ResponseFormat = GeneratedImageFormat.Bytes
            };
            GeneratedImage image = await client.GenerateImageAsync(formattedPrompt, options);
            BinaryData bytes = image.ImageBytes;
            string base64 = Convert.ToBase64String(bytes.ToArray());
            return base64;
        }

        // Define class for handling form data 
        public class IdeaFormData
        {
            public string? Style { get; set;}
            public string? Color { get; set;}
            public string? Area { get; set;}
            public string? Size { get; set;}
            public string? Themes { get; set;}

            public override string ToString()
            {
                return JsonSerializer.Serialize(this);
            }
        
        }

        // Define class for handling image generation data 
        public class ImageGenerationData
        {
            public string? Idea { get; set;}
            public string? Description { get; set;}
            public string? Style { get; set;}
            public string? Size { get; set;}
            public string? Color { get; set;}   
            public string? Placement { get; set;}        

            public override string ToString()
            {
                return JsonSerializer.Serialize(this);
            }
        }
    };

}                          