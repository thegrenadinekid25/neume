"""
YouTube audio extraction service using yt-dlp
"""

import yt_dlp
import os
import asyncio
import logging
from typing import Dict


logger = logging.getLogger(__name__)


class YouTubeDownloaderError(Exception):
    """Custom exception for YouTube downloader errors."""

    def __init__(self, message: str, retryable: bool = True):
        self.message = message
        self.retryable = retryable
        super().__init__(self.message)


class YouTubeDownloader:
    def __init__(self, output_dir: str = "./temp"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def _download_audio_sync(self, video_id: str) -> Dict:
        """
        Synchronous download of audio from YouTube video.

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
            'socket_timeout': 30,
            'retries': 3,
            'fragment_retries': 3,
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

        except BrokenPipeError as e:
            logger.error(f"BrokenPipeError downloading {video_id}: {str(e)}")
            self.cleanup(video_id)
            raise YouTubeDownloaderError(
                f"Connection lost while downloading: {str(e)}",
                retryable=True
            )
        except yt_dlp.utils.DownloadError as e:
            logger.error(f"Download error for {video_id}: {str(e)}")
            self.cleanup(video_id)
            raise YouTubeDownloaderError(
                f"Failed to download video: {str(e)}",
                retryable=True
            )
        except Exception as e:
            logger.error(f"Unexpected error downloading {video_id}: {str(e)}")
            self.cleanup(video_id)
            raise YouTubeDownloaderError(
                f"Failed to download audio: {str(e)}",
                retryable=True
            )

    async def download_audio(self, video_id: str) -> Dict:
        """
        Asynchronously download audio from YouTube video.

        This runs the synchronous download in a thread pool to avoid
        blocking the async event loop, with a 300-second timeout.

        Args:
            video_id: YouTube video ID

        Returns:
            {
                "filepath": "/path/to/audio.wav",
                "title": "Video Title",
                "duration": 245.6
            }

        Raises:
            YouTubeDownloaderError: If download fails
            asyncio.TimeoutError: If download exceeds 300 seconds
        """
        try:
            result = await asyncio.wait_for(
                asyncio.to_thread(self._download_audio_sync, video_id),
                timeout=300.0
            )
            return result
        except asyncio.TimeoutError:
            logger.error(f"Download timeout for {video_id}")
            self.cleanup(video_id)
            raise
        except YouTubeDownloaderError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in async download for {video_id}: {str(e)}")
            self.cleanup(video_id)
            raise YouTubeDownloaderError(
                f"Failed to download audio: {str(e)}",
                retryable=True
            )

    def cleanup(self, video_id: str):
        """Remove downloaded file and any partial downloads"""
        filepath = os.path.join(self.output_dir, f"{video_id}.wav")
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
                logger.debug(f"Cleaned up {filepath}")
            except Exception as e:
                logger.warning(f"Failed to cleanup {filepath}: {str(e)}")

        # Also try to remove the base filename (before extension) in case ffmpeg left it
        base_path = os.path.join(self.output_dir, video_id)
        if os.path.exists(base_path):
            try:
                os.remove(base_path)
                logger.debug(f"Cleaned up {base_path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup {base_path}: {str(e)}")
