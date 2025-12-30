import subprocess
import tempfile
from pathlib import Path


class OMRError(Exception):
    """Error during optical music recognition."""
    pass


class OMRService:
    """Service for optical music recognition using Audiveris."""

    def __init__(self, audiveris_jar: str = "/app/audiveris.jar"):
        """
        Initialize the OMR service.

        Args:
            audiveris_jar: Path to the Audiveris JAR file.
        """
        self.audiveris_jar = audiveris_jar

    async def process_pdf(self, pdf_bytes: bytes) -> bytes:
        """
        Process a PDF file and extract music notation to MusicXML format.

        Args:
            pdf_bytes: Raw bytes of the PDF file to process.

        Returns:
            bytes: MusicXML file content.

        Raises:
            OMRError: If processing fails or no music notation is detected.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Write PDF to temporary file
            pdf_input = temp_path / "input.pdf"
            try:
                pdf_input.write_bytes(pdf_bytes)
            except IOError as e:
                raise OMRError(f"Failed to write PDF file: {str(e)}")

            # Run Audiveris
            try:
                result = subprocess.run(
                    [
                        "java",
                        "-jar",
                        self.audiveris_jar,
                        "-batch",
                        "-export",
                        "-output",
                        str(temp_path),
                        str(pdf_input),
                    ],
                    capture_output=True,
                    text=True,
                    timeout=120,
                )

                if result.returncode != 0:
                    stderr = result.stderr.strip()
                    if not stderr:
                        stderr = result.stdout.strip()

                    # Provide user-friendly error messages
                    if "no sheet" in stderr.lower() or "no page" in stderr.lower():
                        raise OMRError("No music notation detected in the PDF")
                    elif "java" in stderr.lower() and "not found" in stderr.lower():
                        raise OMRError("Audiveris is not properly installed")
                    elif "memory" in stderr.lower():
                        raise OMRError("Insufficient memory to process PDF")
                    else:
                        raise OMRError(f"Music recognition failed: {stderr}")

            except subprocess.TimeoutExpired:
                raise OMRError(
                    "Music recognition timed out (processing took too long). "
                    "Try with a smaller or simpler PDF."
                )
            except FileNotFoundError as e:
                raise OMRError(
                    f"Audiveris not found at {self.audiveris_jar}. "
                    "Please ensure Audiveris is properly installed."
                )
            except Exception as e:
                raise OMRError(f"Unexpected error during music recognition: {str(e)}")

            # Look for generated MusicXML file
            musicxml_files = list(temp_path.glob("*.xml")) + list(
                temp_path.glob("*.musicxml")
            )

            if not musicxml_files:
                raise OMRError(
                    "No music notation could be extracted from the PDF. "
                    "Please ensure the PDF contains clear, readable sheet music."
                )

            # Use the first (or only) MusicXML file generated
            musicxml_file = musicxml_files[0]

            try:
                return musicxml_file.read_bytes()
            except IOError as e:
                raise OMRError(f"Failed to read generated music file: {str(e)}")
