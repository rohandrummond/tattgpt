var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseHttpsRedirection();

app.MapGet("/helloworld", () => 
{
    string response = "hello world";
    return response;
})
.WithName("HelloWorld");

app.Run();