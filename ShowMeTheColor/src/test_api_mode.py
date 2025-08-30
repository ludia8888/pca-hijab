#!/usr/bin/env python3
"""
Test script to verify if the API is running in random mode or analysis mode
"""

import requests
import json
from pathlib import Path

def test_api_mode(api_url="http://localhost:8000", use_debug=True):
    """
    Test the API to check if it's in random mode
    """
    print(f"\n{'='*60}")
    print(f"Testing API at: {api_url}")
    print(f"{'='*60}\n")
    
    # First check health endpoint
    try:
        health_resp = requests.get(f"{api_url}/health")
        print(f"✓ Health check: {health_resp.json()}")
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return
    
    # Create a dummy image file for testing
    from PIL import Image
    import io
    
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    # Test the analyze endpoint
    files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
    
    # Add debug parameter to get additional info
    params = {'debug': 'true'} if use_debug else {}
    
    try:
        print("Sending test image to API...")
        response = requests.post(
            f"{api_url}/analyze",
            files=files,
            params=params
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✓ API Response received successfully!")
            print(f"\nResult:")
            print(f"  - Personal Color: {result.get('personal_color_en')}")
            print(f"  - Confidence: {result.get('confidence')}%")
            
            # Check debug info if available
            if 'debug' in result:
                debug_info = result['debug']
                print(f"\n📊 Debug Information:")
                print(f"  - Mode: {debug_info.get('mode', 'UNKNOWN')}")
                print(f"  - Season: {debug_info.get('detected_season')}")
                
                if debug_info.get('mode') == 'RANDOM_MODE':
                    print(f"\n🎲 CONFIRMED: API is running in RANDOM MODE")
                    print(f"  - {debug_info.get('note', '')}")
                elif 'avg_colors' in debug_info:
                    print(f"\n🔬 API is running in ANALYSIS MODE")
                    print(f"  - Colors: R={debug_info['avg_colors']['r']}, G={debug_info['avg_colors']['g']}, B={debug_info['avg_colors']['b']}")
                else:
                    print(f"\n❓ Mode unclear from debug info")
            else:
                print("\n⚠️  No debug information available (try with debug=true)")
                
        else:
            print(f"\n✗ API Error: {response.status_code}")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"\n✗ Request failed: {e}")

def test_multiple_times(api_url="http://localhost:8000", times=10):
    """
    Test multiple times to check distribution
    """
    print(f"\n{'='*60}")
    print(f"Testing distribution with {times} requests...")
    print(f"{'='*60}\n")
    
    results = {}
    
    from PIL import Image
    import io
    
    for i in range(times):
        # Create a test image
        img = Image.new('RGB', (100, 100), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
        
        try:
            response = requests.post(f"{api_url}/analyze", files=files)
            if response.status_code == 200:
                result = response.json()
                color = result.get('personal_color_en')
                results[color] = results.get(color, 0) + 1
                print(f"  Request {i+1}: {color}")
        except:
            print(f"  Request {i+1}: Failed")
    
    print(f"\n📊 Distribution Results:")
    for color, count in sorted(results.items()):
        percentage = (count / times) * 100
        print(f"  - {color}: {count}/{times} ({percentage:.1f}%)")
    
    if len(results) == 4 and all(count >= times * 0.1 for count in results.values()):
        print(f"\n✅ Good distribution! All 4 seasons appearing.")
    elif len(results) == 1:
        print(f"\n⚠️  Only one result appearing - might not be in random mode!")
    else:
        print(f"\n📝 Distribution shows {len(results)} different results.")

if __name__ == "__main__":
    import sys
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "prod":
            # Test production Render API
            print("\n🌐 Testing PRODUCTION API (Render)")
            test_api_mode("https://pca-hijab-api.onrender.com", use_debug=True)
            test_multiple_times("https://pca-hijab-api.onrender.com", times=5)
        elif sys.argv[1] == "dist":
            # Only test distribution
            api_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8000"
            test_multiple_times(api_url, times=20)
        else:
            # Use provided URL
            test_api_mode(sys.argv[1], use_debug=True)
    else:
        # Test local API
        print("\n🏠 Testing LOCAL API")
        test_api_mode("http://localhost:8000", use_debug=True)
        test_multiple_times("http://localhost:8000", times=10)