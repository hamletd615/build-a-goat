param(
 [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$source = @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class TeamPlayerAssetCleaner
{
    private const int AlphaThreshold = 16;

    public static string Clean(string basePath, string assetPath)
    {
        string tempPath = assetPath + ".tmp";
        string result;
        using (var baseImage = new Bitmap(basePath))
        using (var sourceImage = new Bitmap(assetPath))
        using (var source = ToArgb(sourceImage))
        {
            var baseBox = AlphaBounds(baseImage);
            RemoveConnectedWhiteBackground(source);
            var playerBox = AlphaBounds(source);
            if (playerBox.Width <= 0 || playerBox.Height <= 0)
            {
                throw new InvalidOperationException("No visible player pixels found after background cleanup: " + assetPath);
            }

            using (var output = new Bitmap(baseImage.Width, baseImage.Height, PixelFormat.Format32bppArgb))
            using (var graphics = Graphics.FromImage(output))
            {
                graphics.Clear(Color.Transparent);
                graphics.CompositingMode = CompositingMode.SourceOver;
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
                graphics.SmoothingMode = SmoothingMode.HighQuality;

                double scale = Math.Min((double)baseBox.Width / playerBox.Width, (double)baseBox.Height / playerBox.Height);
                int drawWidth = Math.Max(1, (int)Math.Round(playerBox.Width * scale));
                int drawHeight = Math.Max(1, (int)Math.Round(playerBox.Height * scale));
                int baseCenterX = baseBox.Left + (baseBox.Width / 2);
                int drawX = baseCenterX - (drawWidth / 2);
                int drawY = baseBox.Bottom - drawHeight;

                var dest = new Rectangle(drawX, drawY, drawWidth, drawHeight);
                graphics.DrawImage(source, dest, playerBox, GraphicsUnit.Pixel);

                output.Save(tempPath, ImageFormat.Png);
                var resultBox = AlphaBounds(output);
                result = String.Format(
                    "{0}: {1}x{2} -> {3}x{4}, bbox {5},{6},{7},{8}",
                    Path.GetFileName(assetPath),
                    sourceImage.Width,
                    sourceImage.Height,
                    output.Width,
                    output.Height,
                    resultBox.Left,
                    resultBox.Top,
                    resultBox.Width,
                    resultBox.Height
                );
            }
        }

        File.Delete(assetPath);
        File.Move(tempPath, assetPath);
        return result;
    }

    private static Bitmap ToArgb(Bitmap image)
    {
        var copy = new Bitmap(image.Width, image.Height, PixelFormat.Format32bppArgb);
        using (var graphics = Graphics.FromImage(copy))
        {
            graphics.Clear(Color.Transparent);
            graphics.DrawImageUnscaled(image, 0, 0);
        }
        return copy;
    }

    private static Rectangle AlphaBounds(Bitmap image)
    {
        using (var argb = ToArgb(image))
        {
            var data = argb.LockBits(new Rectangle(0, 0, argb.Width, argb.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            try
            {
                int stride = data.Stride;
                int bytes = Math.Abs(stride) * argb.Height;
                byte[] pixels = new byte[bytes];
                Marshal.Copy(data.Scan0, pixels, 0, bytes);

                int left = argb.Width;
                int top = argb.Height;
                int right = -1;
                int bottom = -1;

                for (int y = 0; y < argb.Height; y++)
                {
                    int row = y * stride;
                    for (int x = 0; x < argb.Width; x++)
                    {
                        byte a = pixels[row + (x * 4) + 3];
                        if (a <= AlphaThreshold) continue;
                        if (x < left) left = x;
                        if (x > right) right = x;
                        if (y < top) top = y;
                        if (y > bottom) bottom = y;
                    }
                }

                if (right < left || bottom < top) return Rectangle.Empty;
                return Rectangle.FromLTRB(left, top, right + 1, bottom + 1);
            }
            finally
            {
                argb.UnlockBits(data);
            }
        }
    }

    private static void RemoveConnectedWhiteBackground(Bitmap image)
    {
        int width = image.Width;
        int height = image.Height;
        var rect = new Rectangle(0, 0, width, height);
        var data = image.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);

        try
        {
            int stride = data.Stride;
            int bytes = Math.Abs(stride) * height;
            byte[] pixels = new byte[bytes];
            Marshal.Copy(data.Scan0, pixels, 0, bytes);

            bool[] background = new bool[width * height];
            var queue = new Queue<int>();

            Action<int, int> trySeed = (x, y) =>
            {
                int idx = y * width + x;
                if (background[idx]) return;
                if (!IsNearWhiteCandidate(pixels, stride, x, y)) return;
                background[idx] = true;
                queue.Enqueue(idx);
            };

            for (int x = 0; x < width; x++)
            {
                trySeed(x, 0);
                trySeed(x, height - 1);
            }

            for (int y = 1; y < height - 1; y++)
            {
                trySeed(0, y);
                trySeed(width - 1, y);
            }

            int[] dx = new int[] { 1, -1, 0, 0 };
            int[] dy = new int[] { 0, 0, 1, -1 };

            while (queue.Count > 0)
            {
                int idx = queue.Dequeue();
                int x = idx % width;
                int y = idx / width;

                for (int i = 0; i < 4; i++)
                {
                    int nx = x + dx[i];
                    int ny = y + dy[i];
                    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                    int next = ny * width + nx;
                    if (background[next]) continue;
                    if (!IsNearWhiteCandidate(pixels, stride, nx, ny)) continue;
                    background[next] = true;
                    queue.Enqueue(next);
                }
            }

            for (int y = 0; y < height; y++)
            {
                int row = y * stride;
                for (int x = 0; x < width; x++)
                {
                    if (!background[y * width + x]) continue;
                    pixels[row + (x * 4) + 3] = 0;
                }
            }

            Marshal.Copy(pixels, 0, data.Scan0, bytes);
        }
        finally
        {
            image.UnlockBits(data);
        }
    }

    private static bool IsNearWhiteCandidate(byte[] pixels, int stride, int x, int y)
    {
        int offset = (y * stride) + (x * 4);
        int b = pixels[offset];
        int g = pixels[offset + 1];
        int r = pixels[offset + 2];
        int a = pixels[offset + 3];
        if (a <= AlphaThreshold) return true;

        int max = Math.Max(r, Math.Max(g, b));
        int min = Math.Min(r, Math.Min(g, b));
        int spread = max - min;
        int sum = r + g + b;

        return min >= 218 && spread <= 48 && sum >= 690;
    }
}
"@

Add-Type -TypeDefinition $source -ReferencedAssemblies "System.Drawing"

$basePath = Join-Path $Root "assets\player\base-player.png"
$assetDir = Join-Path $Root "assets\teamPlayers"
$teams = @(
 "ATL","BOS","BKN","CHA","CHI","CLE","DAL","DEN","DET","GSW",
 "HOU","IND","LAC","LAL","MEM","MIA","MIL","MIN","NOP","NYK",
 "OKC","ORL","PHI","PHX","POR","SAC","SAS","TOR","UTA","WAS"
)

foreach($team in $teams){
 $assetPath = Join-Path $assetDir "$team.png"
 if(!(Test-Path -LiteralPath $assetPath)){
  Write-Warning "Missing team player asset: $assetPath"
  continue
 }

 [TeamPlayerAssetCleaner]::Clean($basePath, $assetPath)
}
