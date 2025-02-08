using System.Buffers;
using System.Text.Json;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using OpenAI.Chat;
using OpenAI.Images;
using Supabase;
using Supabase.Postgrest;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

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
            var supabaseClient = InitialiseSupabase();
            if (chatClient == null || imageClient == null)
            {
                Console.WriteLine("Error initialising Open AI Client");
                return;
            }
            if (supabaseClient == null)
            {
                Console.WriteLine("Error initialising Supabase Client");
                return;
            }

            // Generate Ideas 
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
            
            // Save Idea
            app.MapPost("/save-idea", async (IdeaData ideaData) => {
                try
                {
                    if (ideaData == null)
                    {
                        return Results.BadRequest(new { message = "No idea data submitted "});
                    }                
                    var response = await SaveIdea(await supabaseClient, ideaData);
                    if (response == null) 
                    {
                        return Results.StatusCode(500);
                    }
                    return Results.Ok(response);
                }
                catch (Supabase.Postgrest.Exceptions.PostgrestException ex)
                {
                    Console.WriteLine($"An error occurred: {ex.Message}");
                    if (ex.StatusCode == 409) 
                    {
                        return Results.StatusCode(409);
                    }
                    return Results.StatusCode(500);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred: {ex.Message}");
                    return Results.StatusCode(500);
                }
            });

            // Delete idea
            app.MapDelete("/delete-idea", /*async*/ ([FromBody] IdeaData ideaData) => {
                string jsonString = JsonSerializer.Serialize(ideaData.Id);
                Console.WriteLine("/delete-idea endpoint is being requested");
                Console.WriteLine("Data being passed to endpoint:");
                Console.WriteLine(jsonString);
                // try
                // {
                //     await DeleteIdea(await supabaseClient, ideaId);
                //     return Results.Ok();
                // }
                // catch(Exception ex)
                // {
                //     Console.WriteLine($"An error occurred: {ex.Message}");
                //     return Results.StatusCode(500);

                // }
            });

            // Generate Image
            app.MapPost("/generate-image", async (IdeaData ideaData) => {
                try 
                {
                    string base64 = await GenerateImage(imageClient, ideaData);
                    return Results.Ok(base64);
                }
                catch (Exception ex) 
                {
                    Console.WriteLine($"An error occurred: {ex.Message}");
                    return Results.StatusCode(500);
                }
            })
            .WithName("GenerateImage");   

            // Append Image
            app.MapPost("/append-image", async (AppendedImage appendedImage) => {
                try
                {
                    Boolean result = await AppendImage(await supabaseClient, appendedImage);
                    if (!result) {
                        return Results.StatusCode(500);
                    }
                    return Results.Ok();
                }
                catch 
                {
                    return Results.StatusCode(500);
                }
            })
            .WithName("AppendImage");
        }

        // Initialise connection with OpenAI API 
        private static(ChatClient, ImageClient) InitialiseOpenAI ()
        {
            var apiKey = Environment.GetEnvironmentVariable("TATTGPT_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                throw new InvalidOperationException("API key is missing. Please set the TATTGPT_API_KEY environment variable.");
            }
            ChatClient chatClient = new ChatClient(model: "gpt-4o-mini", apiKey: apiKey);
            ImageClient imageClient = new("dall-e-2", apiKey: apiKey);
            return (chatClient, imageClient);
        }

        // Initialise connection with Supabase API 
        private static async Task<Supabase.Client> InitialiseSupabase()
        {
            var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
            var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_SERVICE_KEY");
            if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
            {
                throw new InvalidOperationException("Supabase API URL or Key is missing. Please set the relevant environment variable.");
            }
            var supabase = new Supabase.Client(supabaseUrl, supabaseKey);
            await supabase.InitializeAsync();
            return supabase;
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

        // Image generation prompt logic
        private static async Task<String> GenerateImage (ImageClient client, IdeaData ideaData)
        {
            var prompt = new List<string?>
            {
                ideaData.Style
            };
            var promptDetails = new Dictionary<string, string?>
            {
                { " style tattoo design in ", ideaData.Color},
                { ", suitable for a ", ideaData.Size},
                { " placement on the ", ideaData.Placement},
                { ". Here is a more detailed description of the tattoo: ", ideaData.Description  }
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

        // Save idea in Supabase 
        private static async Task<int?> SaveIdea (Supabase.Client supabaseClient, IdeaData ideaData)
        {
            var supabaseIdea = new SupabaseIdeaModel
            {
                UserId = ideaData.UserId ?? throw new ArgumentNullException("ideaData.UserID is missing"),
                Idea = ideaData.Idea ?? throw new ArgumentNullException("ideaData.Idea is missing"),
                Description = ideaData.Description ?? throw new ArgumentNullException("ideaData.Description is missing"),
                Placement = ideaData.Placement ?? throw new ArgumentNullException("ideaData.Placement is missing"),
                Color = ideaData.Color ?? throw new ArgumentNullException("ideaData.Color is missing"),
                Size = ideaData.Size ?? throw new ArgumentNullException("ideaData.Size is missing"),
                Image = ideaData.Image
            };
            var response = await supabaseClient
                .From<SupabaseIdeaModel>()
                .Insert(supabaseIdea, new QueryOptions { Returning = QueryOptions.ReturnType.Representation });
            if (response.ResponseMessage?.IsSuccessStatusCode != true) 
            {
                Console.WriteLine("Failed to save idea to Supabase");
                return null;
            } 
            int insertedModelId = response.Models[0].Id;
            return insertedModelId;
        }

        // Delete idea in Supabase
        private static async Task DeleteIdea (Supabase.Client supabaseClient, String ideaId)
        {
            if (ideaId.IsNullOrEmpty() && Int32.TryParse(ideaId, out int convertedIdString))
            {
                await supabaseClient
                    .From<SupabaseIdeaModel>()
                    .Where(x => x.Id == convertedIdString)
                    .Delete();
                return;
            } 
            else
            {
                Console.WriteLine("Unable to convert ID string to int.");
                return;
            }
        }

        // Append image to idea in Supabase
        private static async Task<Boolean> AppendImage (Supabase.Client supabaseClient, AppendedImage appendedImage)
        {
            var response = await supabaseClient
                .From<SupabaseIdeaModel>()
                .Where(x => x.Id == appendedImage.IdeaId)
                .Set(x => x.Image, appendedImage.Image)
                .Update();
            if (response.ResponseMessage?.IsSuccessStatusCode != true) 
            {
                Console.WriteLine("Failed to save idea to Supabase");
                return false;
            }
            return true;
        }
        
        // Define class for handling form data 
        public class IdeaFormData
        {
            public string? Style { get; set; }
            public string? Color { get; set; }
            public string? Area { get; set; }
            public string? Size { get; set; }
            public string? Themes { get; set; }       
        }

        // Define class for handling idea data
        public class IdeaData
        {
            public string? Id { get; set; }
            public string? UserId { get; set; }
            public string? Idea { get; set; }
            public string? Description { get; set; }
            public string? Style { get; set; }
            public string? Size { get; set; }
            public string? Color { get; set; }   
            public string? Placement { get; set; }
            public string? Image { get; set; }
        }

        public class AppendedImage
        {
            public required int IdeaId { get; set; }
            public required string Image { get; set; }
        }

        [Table("ideas")]
        public class SupabaseIdeaModel : BaseModel
        {
            [PrimaryKey("id", false)]
            public int Id { get; set; }

            [Column("user_id")]
            public string? UserId { get; set; }

            [Column("idea")]
            public string? Idea { get; set; }

            [Column("description")]
            public string? Description { get; set; }

            [Column("placement")]
            public string? Placement { get; set; }

            [Column("color")]
            public string? Color { get; set; }

            [Column("size")]
            public string? Size { get; set; }

            [Column("image")]
            public string? Image { get; set; }
        }

    };

}                          