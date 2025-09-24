using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace dotnet.Models;

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