#!/usr/bin/env python3
"""
Quick test script to verify the deconstruction endpoint works
Run this from the project root after starting the backend
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from services.deconstructor import ProgressionDeconstructor


async def test_deconstructor():
    """Test the deconstructor with a sample progression"""
    deconstructor = ProgressionDeconstructor()

    # Sample complex progression
    chords = [
        {"root": "C", "quality": "major", "extensions": {}},
        {"root": "F", "quality": "maj7", "extensions": {"7": True}},
        {"root": "G", "quality": "dom7", "extensions": {"7": True}},
        {"root": "C", "quality": "major", "extensions": {"add9": True}},
    ]

    print("Testing Deconstruction Algorithm")
    print("=" * 50)
    print("\nInput progression:")
    for i, chord in enumerate(chords):
        print(f"  {i+1}. {chord['root']}{chord['quality']}")

    try:
        steps = await deconstructor.deconstruct(chords, "C", "major")

        print("\n" + "=" * 50)
        print("Deconstruction Steps:")
        print("=" * 50)

        for step in steps:
            print(f"\nStep {step['stepNumber']}: {step['stepName']}")
            print(f"Description: {step['description'][:100]}...")
            print("Chords:", " → ".join(
                f"{c['root']}{c['quality']}" for c in step['chords']
            ))

        print("\n" + "=" * 50)
        print("SUCCESS: Deconstruction completed!")
        print(f"Generated {len(steps)} steps (max 6 allowed)")
        return True

    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(test_deconstructor())
    sys.exit(0 if success else 1)
