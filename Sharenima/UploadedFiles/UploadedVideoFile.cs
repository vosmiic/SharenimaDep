using System.Dynamic;
using System.Text;
using Sharenima.Models;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;
using Xabe.FFmpeg;
using Xabe.FFmpeg.Downloader;

namespace Sharenima.UploadedFiles;

public class UploadedVideoFile {
    public ITusFile File { get; set; }
    private string OriginalFileName { get; set; }
    private string OriginalFileLocation { get; set; }
    private Dictionary<string, Metadata> Metadata { get; set; }
    private string Codec { get; set; }

    public UploadedVideoFile(FileCompleteContext eventContext) {
        this.File = eventContext.GetFileAsync().Result;
        Metadata = File.GetMetadataAsync(eventContext.CancellationToken).Result;
        OriginalFileName = eventContext.FileId;
        OriginalFileLocation = Path.Combine(Startup.Configuration["VideoUploadStorageLocation"], eventContext.FileId);
        if (!Metadata.ContainsKey("filename")) throw new NullReferenceException("Filename not found");
    }

    public async Task<VideoQueue> ProcessUploadedVideoFile() {
        await VerifyFfmpegInstallation();
        IMediaInfo mediaInfo = await FFmpeg.GetMediaInfo(OriginalFileLocation);
        Codec = mediaInfo.VideoStreams.First().Codec;
        VideoQueue videoQueue = new VideoQueue {
            Title = Metadata["filename"].GetString(Encoding.UTF8)
        };
        if (await VideoNeedsReEncoding()) {
            string? newFileName = await ReEncodeVideo();
            if (newFileName != null) {
                videoQueue.Url = newFileName;
                string? videoThumbnail = await VideoThumbnail(newFileName);
                if (videoThumbnail != null) {
                    videoQueue.ThumbnailUrl = videoThumbnail;
                }
            }
        } else {
            AddVideoFileExtension();
            videoQueue.Url = OriginalFileName;
            string? videoThumbnail = await VideoThumbnail(OriginalFileLocation);
            if (videoThumbnail != null) {
                videoQueue.ThumbnailUrl = videoThumbnail;
            }
        }

        return videoQueue;
    }

    private async Task<string?> VideoThumbnail(string videoFileLocation) {
        string fileName = $"{Metadata["filename"]}Thumbnail.png";
        int videoLength;
        try {
            var probe = await Probe.New().Start($"-v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {videoFileLocation}");
            videoLength = Convert.ToInt32(Math.Round(Decimal.Parse(probe)));
        } catch (Exception e) {
            Console.WriteLine(e.Message);
            return null;
        }

        try {
            var snapshot = await FFmpeg.Conversions.FromSnippet.Snapshot(videoFileLocation, Path.Combine(Startup.Configuration["VideoUploadStorageLocation"], fileName), TimeSpan.FromSeconds(new Random().Next(0, videoLength)));
            await snapshot.Start();
        } catch (Exception e) {
            Console.WriteLine(e.Message);
            return null;
        }

        return fileName;
    }

    private async Task<string?> ReEncodeVideo() {
        int retryCounter = 0;
        while (retryCounter < 10) {
            string fileName = $"{Metadata["filename"].ToString()}Converted{retryCounter}.webm";

            try {
                await FFmpeg.Conversions.New()
                    .AddParameter($"-i {OriginalFileLocation} -c:v vp9 -row-mt 1")
                    .SetOverwriteOutput(false)
                    .SetOutput(Path.Combine(Startup.Configuration["VideoUploadStorageLocation"], fileName))
                    .Start();
            } catch (Exception e) {
                if (e.Message.Split('\n').Last().Contains("already exists")) {
                    // file already exists, change name and try again
                    retryCounter++;
                    continue;
                } else {
                    return null;
                }
            }

            return fileName;
        }

        return null;
    }

    private async Task<bool> VideoNeedsReEncoding() {
        if (Metadata.ContainsKey("filetype")) {
            string mimeType = Metadata["filetype"].GetString(Encoding.UTF8);
            string? codec;
            switch (mimeType) {
                case "video/webm":
                    codec = await GetVideoCodec();
                    return codec == null || !SupportedWebmCodecs.Contains(codec.Replace("\n", "".Replace("\r", "")));
                case "video/mp4":
                    codec = await GetVideoCodec();
                    return codec == null || !SupportedMp4Codecs.Contains(codec.Replace("\n", "".Replace("\r", "")));
                default:
                    return true;
            }
        }

        return true;
    }

    private void AddVideoFileExtension() {
        if (Metadata.ContainsKey("filetype")) {
            string mimeType = Metadata["filetype"].GetString(Encoding.UTF8);
            switch (mimeType) {
                case "video/webm":
                    if (OriginalFileLocation.EndsWith(".webm")) return;
                    System.IO.File.Move(OriginalFileLocation, $"{OriginalFileLocation}.webm");
                    OriginalFileName = $"{OriginalFileName}.webm";
                    OriginalFileLocation = $"{OriginalFileLocation}.webm";
                    return;
                case "video/mp4":
                    if (OriginalFileLocation.EndsWith(".mp4")) return;
                    System.IO.File.Move(OriginalFileLocation, $"{OriginalFileLocation}.mp4");
                    OriginalFileName = $"{OriginalFileName}.mp4";
                    OriginalFileLocation = $"{OriginalFileLocation}.mp4";
                    return;
                default:
                    return;
            }
        }
    }

    private async Task<string?> GetVideoCodec() {
        try {
            return await Probe.New().Start($"-v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 {OriginalFileLocation}");
        } catch (Exception e) {
            Console.WriteLine(e.Message);
            return null;
        }
    }

    private Task VerifyFfmpegInstallation() {
        if (FFmpeg.ExecutablesPath != null) return Task.CompletedTask;
        FFmpegDownloader.GetLatestVersion(FFmpegVersion.Official);
        return Task.CompletedTask;
    }

    private List<string> SupportedWebmCodecs = new() {
        "vorbis",
        "vp8",
        "vp8.0",
        "vp9",
        "vp9.0",
        "vp09.00.10.08",
    };

    private List<string> SupportedMp4Codecs = new() {
        "avc1.42E01E, mp4a.40.2",
        "avc1.58A01E, mp4a.40.2",
        "avc1.4D401E, mp4a.40.2",
        "avc1.64001E, mp4a.40.2",
        "avc1.64001E, mp4a.40.2",
        "av01.0.04M.08",
        "av01.0.04M.08, mp4a.40.2",
        "av01.0.04M.08, opus",
    };
}