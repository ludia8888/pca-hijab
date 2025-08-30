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
        
        # TEMPORARY: Disable analysis logic and use 100% random results
        # This is for testing purposes only
        
        # Skip image analysis completely
        # img_array = np.array(image)
        # avg_r = np.mean(img_array[:, :, 0])
        # avg_g = np.mean(img_array[:, :, 1])
        # avg_b = np.mean(img_array[:, :, 2])
        # warmth = (avg_r - avg_b) / 255.0
        # brightness = (avg_r + avg_g + avg_b) / (3 * 255.0)
        
        # 100% random season selection for even distribution
        seasons = ['spring', 'summer', 'autumn', 'winter']
        season = random.choice(seasons)
        
        print(f"[DEBUG] Random season selected: {season}")
        
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
        
        # Generate random confidence score between 75% and 95%
        confidence = random.uniform(75.0, 95.0)
        
        response = {
            'personal_color': recommendation['personal_color'],
            'personal_color_en': recommendation['personal_color_en'],
            'confidence': round(confidence, 1),
            'best_colors': recommendation['best_colors'],
            'worst_colors': recommendation['worst_colors']
        }
        
        if debug:
            response['debug'] = {
                'mode': 'RANDOM_MODE',
                'detected_season': season,
                'note': 'Analysis logic is temporarily disabled. Using 100% random selection.'
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