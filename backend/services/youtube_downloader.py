"""
YouTube audio downloader using yt-dlp
"""
import subprocess
from pathlib import Path
from typing import Optional


async def download_youtube_audio(
    url: str,
    output_dir: Path,
    start_time: Optional[float] = None,
    end_time: Optional[float] = None
) -> Path:
    """
    Download audio from YouTube video

    Args:
        url: YouTube video URL
        output_dir: Directory to save audio file
        start_time: Start time in seconds (optional)
        end_time: End time in seconds (optional)

    Returns:
        Path to downloaded audio file
    """
    output_file = output_dir / "youtube_audio.wav"

    # Build yt-dlp command
    cmd = [
        "yt-dlp",
        "-x",  # Extract audio
        "--audio-format", "wav",  # Convert to WAV
        "--audio-quality", "0",  # Best quality
        "-o", str(output_file),  # Output file
        url
    ]

    # Add time range if specified
    if start_time is not None or end_time is not None:
        download_sections = []
        if start_time is not None:
            start_str = f"{int(start_time)}"
        else:
            start_str = "0"

        if end_time is not None:
            end_str = f"{int(end_time)}"
            download_sections = [f"*{start_str}-{end_str}"]
        else:
            download_sections = [f"*{start_str}-inf"]

        cmd.extend(["--download-sections", download_sections[0]])

    # Execute download
    try:
        result = subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True
        )
        print(f"YouTube download output: {result.stdout}")

        # Convert to mono 44.1kHz if needed
        converted_file = output_dir / "youtube_audio_converted.wav"
        subprocess.run([
            "ffmpeg",
            "-i", str(output_file),
            "-ar", "44100",  # 44.1kHz sample rate
            "-ac", "1",  # Mono
            "-y",  # Overwrite
            str(converted_file)
        ], check=True, capture_output=True)

        # Replace original with converted
        if converted_file.exists():
            output_file.unlink()
            converted_file.rename(output_file)

        return output_file

    except subprocess.CalledProcessError as e:
        raise Exception(f"Failed to download YouTube audio: {e.stderr}")
