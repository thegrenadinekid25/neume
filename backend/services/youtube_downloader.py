"""
YouTube audio extraction service using yt-dlp
"""

import yt_dlp
import os
from typing import Dict


class YouTubeDownloader:
    def __init__(self, output_dir: str = "./temp"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def download_audio(self, video_id: str) -> Dict:
        """
        Download audio from YouTube video.

        Args:
            video_id: YouTube video ID

        Returns:
            {
                "filepath": "/path/to/audio.wav",
                "title": "Video Title",
                "duration": 245.6
            }
        """
        url = f"https://www.youtube.com/watch?v={video_id}"
        output_path = os.path.join(self.output_dir, f"{video_id}.wav")

        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
            }],
            'outtmpl': output_path.replace('.wav', ''),
            'quiet': True,
            'no_warnings': True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)

                return {
                    "filepath": output_path,
                    "title": info.get('title', 'Unknown'),
                    "duration": info.get('duration', 0),
                    "uploader": info.get('uploader', None)
                }

        except Exception as e:
            raise Exception(f"Failed to download audio: {str(e)}")

    def cleanup(self, video_id: str):
        """Remove downloaded file"""
        filepath = os.path.join(self.output_dir, f"{video_id}.wav")
        if os.path.exists(filepath):
            os.remove(filepath)
