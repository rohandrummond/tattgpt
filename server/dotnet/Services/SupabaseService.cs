using dotnet.Models;
using Microsoft.IdentityModel.Tokens;
using Supabase.Postgrest;

namespace dotnet.Services;

public interface ISupabaseService
{
  Task<int?> SaveIdea(IdeaData ideaData);
  Task DeleteIdea(string ideaId);
  Task<bool> AppendImage(AppendedImage appendedImage);
}

public class SupabaseService : ISupabaseService
{
  private readonly Supabase.Client supabaseClient;

  public SupabaseService()
  {
    var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
    var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY");
    if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
    {
      throw new InvalidOperationException("Supabase API URL or Key is missing. Please set the relevant environment variable.");
    }
    supabaseClient = new Supabase.Client(supabaseUrl, supabaseKey);
  }

  // Save idea in Supabase 
  public async Task<int?> SaveIdea(IdeaData ideaData)
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
      throw new InvalidOperationException("Failed to save idea to Supabase");
    }
    int insertedModelId = response.Models[0].Id;
    return insertedModelId;
  }

  // Delete idea in Supabase
  public async Task DeleteIdea(string ideaId)
  {
    if (!ideaId.IsNullOrEmpty() && Int32.TryParse(ideaId, out int convertedIdString))
    {
      try
      {
        await supabaseClient
            .From<SupabaseIdeaModel>()
            .Where(x => x.Id == convertedIdString)
            .Delete();
        return;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Unexpected error: {ex.Message}");
        throw new InvalidOperationException($"Unexpected error: {ex.Message}");
      }
    }
    else
    {
      Console.WriteLine("Unable to convert ID string to int.");
      throw new InvalidOperationException("Unable to convert ID string to int.");
    }
  }

      // Append image to idea in Supabase
    public async Task<bool> AppendImage(AppendedImage appendedImage)
    {
      #pragma warning disable CS8603
      var response = await supabaseClient
          .From<SupabaseIdeaModel>()
          .Where(x => x.Id == appendedImage.IdeaId)
          .Set(x => x.Image, appendedImage.Image)
          .Update();
      #pragma warning restore CS8603
      if (response.ResponseMessage?.IsSuccessStatusCode != true)
      {
        Console.WriteLine("Failed to append image to idea in Supabase");
        throw new InvalidOperationException("Failed to append image to idea in Supabase");
      }
      return true;
    }
    
    
}