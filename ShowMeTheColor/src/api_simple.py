from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict, Any
import io
import os
import sys
from PIL import Image
import numpy as np
import random

app = FastAPI(
    title="Personal Color Analysis API",
    description="AI-based personal color analysis service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://pca-hijab.vercel.app",
        "https://pca-hijab-*.vercel.app",
        "*"  # For development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Personal Color Analysis API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "personal-color-analysis"
    }

@app.post("/analyze")
async def analyze_personal_color(
    file: UploadFile = File(...),
    debug: bool = False
):
    """
    Analyze uploaded image to determine personal color
    """
    # Check file format
    if not file.content_type in ["image/jpeg", "image/jpg", "image/png"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG formats are supported"
        )
    
    # Check file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 10MB"
        )
    
    try:
        # Open image with PIL
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Simple color analysis based on average color
        # This is a simplified version without face detection
        img_array = np.array(image)
        
        # Calculate average color values
        avg_r = np.mean(img_array[:, :, 0])
        avg_g = np.mean(img_array[:, :, 1])
        avg_b = np.mean(img_array[:, :, 2])
        
        # Simple logic to determine season
        # This is a placeholder - in production, use proper ML model
        warmth = (avg_r - avg_b) / 255.0
        brightness = (avg_r + avg_g + avg_b) / (3 * 255.0)
        
        if warmth > 0.1 and brightness > 0.6:
            season = 'spring'
        elif warmth <= 0.1 and brightness > 0.6:
            season = 'summer'
        elif warmth > 0.1 and brightness <= 0.6:
            season = 'autumn'
        else:
            season = 'winter'
        
        # Add some randomness for demo purposes
        seasons = ['spring', 'summer', 'autumn', 'winter']
        if random.random() < 0.3:  # 30% chance to pick random season
            season = random.choice(seasons)
        
        # Define best and worst colors for each season
        color_recommendations = {
            'spring': {
                'personal_color': '봄 웜톤',
                'personal_color_en': 'Spring Warm',
                'best_colors': ['#FFB3BA', '#FFCC99', '#FFFFCC', '#CCFFCC'],
                'worst_colors': ['#4A4A4A', '#000080', '#800080', '#2F4F4F']
            },
            'summer': {
                'personal_color': '여름 쿨톤',
                'personal_color_en': 'Summer Cool',
                'best_colors': ['#E6E6FA', '#FFE4E1', '#F0E68C', '#DDA0DD'],
                'worst_colors': ['#FF4500', '#FF6347', '#DC143C', '#8B4513']
            },
            'autumn': {
                'personal_color': '가을 웜톤',
                'personal_color_en': 'Autumn Warm',
                'best_colors': ['#CD853F', '#D2691E', '#B8860B', '#8B4513'],
                'worst_colors': ['#FF69B4', '#FF1493', '#C71585', '#DB7093']
            },
            'winter': {
                'personal_color': '겨울 쿨톤',
                'personal_color_en': 'Winter Cool',
                'best_colors': ['#4169E1', '#0000CD', '#191970', '#000080'],
                'worst_colors': ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50']
            }
        }
        
        recommendation = color_recommendations[season]
        
        # Calculate a fake confidence score based on color values
        confidence = 75.0 + (brightness * 20.0)
        confidence = min(95.0, max(75.0, confidence))
        
        response = {
            'personal_color': recommendation['personal_color'],
            'personal_color_en': recommendation['personal_color_en'],
            'confidence': round(confidence, 1),
            'best_colors': recommendation['best_colors'],
            'worst_colors': recommendation['worst_colors']
        }
        
        if debug:
            response['debug'] = {
                'detected_season': season,
                'avg_colors': {
                    'r': round(avg_r, 2),
                    'g': round(avg_g, 2),
                    'b': round(avg_b, 2)
                },
                'warmth': round(warmth, 3),
                'brightness': round(brightness, 3)
            }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)