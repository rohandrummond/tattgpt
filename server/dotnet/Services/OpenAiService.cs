using System.Text.Json;
using OpenAI.Chat;
using OpenAI.Images;
using dotnet.Models;

namespace dotnet.Services;

public interface IOpenAiService
{
  Task<JsonDocument> GenerateIdeas(IdeaFormData form);
  Task<string> GenerateImage(IdeaData idea);
}

public class OpenAiService : IOpenAiService
{
  private readonly ChatClient chatClient;
  private readonly ImageClient imageClient;

  // Initialise connection with OpenAI API 
  public OpenAiService()
  {
    var apiKey = Environment.GetEnvironmentVariable("TATTGPT_API_KEY")
              ?? throw new InvalidOperationException("Missing TATTGPT_API_KEY");
    chatClient = new ChatClient("gpt-5-mini", apiKey: apiKey);
    imageClient = new ImageClient("dall-e-3", apiKey: apiKey);
  }

  // Idea generation
  public async Task<JsonDocument> GenerateIdeas(IdeaFormData ideaFormData)
  {
    var prompt = new List<string>
            {
                "Generate 3 unique tattoo design concepts "
            };
    var promptDetails = new Dictionary<string, string?>
            {
                { "for a ", ideaFormData.Style},
                { " style tattoo, in ", ideaFormData.Color },
                { ", suitable for a ", ideaFormData.Size },
                { " size placement on the ", ideaFormData.Area },
                { ". Incorporate the following context provided by the user: ", ideaFormData.Themes }
            };
    foreach (var (label, value) in promptDetails)
    {
      if (!string.IsNullOrEmpty(value))
      {
        prompt.Add($"{label}{value}");
      }
    }
    string formattedPrompt = string.Join("", prompt) + $". The concepts should be unique, but also play to the strengths of {ideaFormData.Style} tattooing. Each idea should be concise (1-3 words). The description should be a sentence between 60-80 characters, and provide just enough detail to inspire the design without being overly complex.";
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
    try
    {
      ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options);
      JsonDocument structuredJsonResponse = JsonDocument.Parse(completion.Content[0].Text);
      return structuredJsonResponse;
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Unexpected error: {ex.Message}");
      throw new InvalidOperationException($"Unexpected error: {ex.Message}");
    }
  }

  // Image generation
  public async Task<string> GenerateImage(IdeaData ideaData)
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
        { ". The design should look like a tattoo design, and adhere to the users chosen style. Here is a more detailed description of the tattoo: ", ideaData.Description  },
    };
    foreach (var (label, value) in promptDetails)
    {
      prompt.Add($"{label}{value}");
    }
    string formattedPrompt = string.Join("", prompt);
    ImageGenerationOptions options = new()
    {
      Size = GeneratedImageSize.W1024xH1024,
      ResponseFormat = GeneratedImageFormat.Bytes
    };
    try
    {
      GeneratedImage image = await imageClient.GenerateImageAsync(formattedPrompt, options);
      BinaryData bytes = image.ImageBytes;
      string base64 = Convert.ToBase64String(bytes.ToArray());
      return base64;
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Unexpected error: {ex.Message}");
      throw new InvalidOperationException($"Unexpected error: {ex.Message}");
    }
  }
}
