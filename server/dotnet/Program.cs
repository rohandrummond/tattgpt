using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using dotnet.Models;
using dotnet.Services;

namespace dotnet
{
  internal class API
  {

    // Main function
    private static void Main(string[] args)
    {
      var app = ConfigureApp(args);
      app.Run();
    }

    // Configure .NET Web API 
    private static WebApplication ConfigureApp(string[] args)
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
      builder.Services.AddSingleton<IOpenAiService, OpenAiService>();
      builder.Services.AddSingleton<ISupabaseService, SupabaseService>();
      var app = builder.Build();
      app.UseCors("AllowAngularApp");
      app.UseHttpsRedirection();
      MapRoutes(app);
      return app;
    }

    // Map API endpoints
    private static void MapRoutes(WebApplication app)
    {
      
      // Generate Ideas 
      app.MapPost("/generate-ideas", async (IdeaFormData ideaFormData, IOpenAiService openAi) =>
      {
        try
        {
          if (ideaFormData == null)
          {
            return Results.BadRequest(new { message = "No form data submitted " });
          }
          JsonDocument ideas = await openAi.GenerateIdeas(ideaFormData);
          if (ideas == null)
          {
            return Results.BadRequest(new { message = "Problem receiving data from OpenAI API" });
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
      app.MapPost("/save-idea", async (IdeaData ideaData, ISupabaseService supabase) =>
      {
        try
        {
          if (ideaData == null)
          {
            return Results.BadRequest(new { message = "No idea data submitted " });
          }
          var response = await supabase.SaveIdea(ideaData);
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
      app.MapDelete("/delete-idea", async ([FromBody] IdeaData ideaData, ISupabaseService supabase) =>
      {
        if (ideaData.Id != null)
        {
          try
          {
            await supabase.DeleteIdea(ideaData.Id);
            return Results.Ok();
          }
          catch (Exception ex)
          {
            Console.WriteLine($"An error occurred: {ex.Message}");
            return Results.StatusCode(500);

          }
        }
        else
        {
          Console.WriteLine("No ID provided ");
          return Results.StatusCode(500);
        }
      })
      .WithName("DeleteIdea");

      // Generate Image
      app.MapPost("/generate-image", async (IdeaData ideaData, IOpenAiService openAi) =>
      {
        try
        {
          string base64 = await openAi.GenerateImage(ideaData);
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
      app.MapPost("/append-image", async (AppendedImage appendedImage, ISupabaseService supabase) =>
      {
        try
        {
          Boolean result = await supabase.AppendImage(appendedImage);
          if (!result)
          {
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

  };

}