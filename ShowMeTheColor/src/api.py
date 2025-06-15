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

# Add parent directory to path to import personal_color_analysis
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from personal_color_analysis import personal_color

app = FastAPI(
    title="Personal Color Analysis API",
    description="AI-based personal color analysis service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://pca-hijab.vercel.app",
        "https://noor.ai",
        "https://www.noor.ai",
        "https://pca-hijab-*.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "x-api-key", "Accept", "Origin"],
    expose_headers=["Content-Length", "Content-Type"],
    max_age=3600
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

@app.options("/analyze")
async def options_analyze():
    """Handle preflight requests"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key"
        }
    )

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
        # Save uploaded file temporarily
        temp_filename = f"temp_{file.filename}"
        temp_path = os.path.join("/tmp", temp_filename)
        
        with open(temp_path, "wb") as f:
            f.write(contents)
        
        # Analyze personal color
        result = personal_color.analysis(temp_path)
        
        # Clean up temp file
        os.remove(temp_path)
        
        # Format response based on analysis result
        if result is None:
            raise HTTPException(
                status_code=400,
                detail="Face not detected in the image"
            )
        
        # Extract season and convert to response format
        season = result.get('season', 'unknown')
        
        # Map Korean seasons to English
        season_map = {
            '봄': 'spring',
            '여름': 'summer',
            '가을': 'autumn',
            '겨울': 'winter'
        }
        
        season_en = season_map.get(season, season)
        
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
        
        recommendation = color_recommendations.get(season_en, color_recommendations['spring'])
        
        response = {
            'personal_color': recommendation['personal_color'],
            'personal_color_en': recommendation['personal_color_en'],
            'confidence': 85.0,  # Placeholder confidence score
            'best_colors': recommendation['best_colors'],
            'worst_colors': recommendation['worst_colors']
        }
        
        if debug:
            response['debug'] = {
                'detected_season': season,
                'face_detected': True,
                'analysis_details': result
            }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = f"Analysis failed: {str(e)}\nTraceback: {traceback.format_exc()}"
        print(error_details)  # Log to console
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)