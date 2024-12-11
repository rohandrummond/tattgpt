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

app.MapGet("/helloworld", () => 
{
    string response = "hello world";
    return response;
})
.WithName("HelloWorld");

app.Run();