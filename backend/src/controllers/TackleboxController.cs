using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace MyTacklebox.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // This automatically makes the route: api/tacklebox
    public class TackleboxController : ControllerBase
    {
        // This makes the final endpoint: api/tacklebox/analyze
        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeLure([FromForm] IFormFile file)
        {
            try
            {
                // 1. Verify the file actually arrived from the Android Emulator
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { error = "No image data received by the server." });
                }

                Console.WriteLine($"📸 Received image: {file.FileName}, Size: {file.Length} bytes");

                // 2. Read the file into a memory buffer to pass to your TypeScript agent
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);
                byte[] imageBytes = ms.ToArray();

                // -------------------------------------------------------------------
                // TODO: Call your TypeScript execution logic here!
                // This is where you pass imageBytes to your 'vision.ts' / 'agent.ts'
                // -------------------------------------------------------------------

                // Mock response for now so your Vue app gets data back and stops spinning
                var mockGearList = new[] {
                    new { name = "Classic Lure", category = "Lure", brand = "Unknown", quantity = 1, notes = "Detected via API bridge" }
                };

                return Ok(mockGearList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"🚨 Controller crashed: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
