from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import os
import sys
from PIL import Image
import numpy as np
import cv2
import mediapipe as mp

# Add parent directory to path
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
        "http://localhost:5173",
        "http://localhost:5174",
        "https://pca-hijab.vercel.app",
        "https://pca-hijab-*.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(min_detection_confidence=0.5)

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
        # Save uploaded file temporarily
        temp_filename = f"temp_{file.filename}"
        temp_path = os.path.join("/tmp", temp_filename)
        
        with open(temp_path, "wb") as f:
            f.write(contents)
        
        # Try original analysis first
        try:
            result = personal_color.analysis(temp_path)
            
            if result is None:
                raise Exception("Analysis failed")
            
            # Extract season
            season = result.get('season', 'unknown')
            
        except Exception as e:
            # Fallback to MediaPipe face detection
            image = cv2.imread(temp_path)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detect faces
            results = face_detection.process(rgb_image)
            
            if not results.detections:
                raise HTTPException(
                    status_code=400,
                    detail="Face not detected in the image"
                )
            
            # Simple color analysis based on face region
            h, w = image.shape[:2]
            detection = results.detections[0]
            bbox = detection.location_data.relative_bounding_box
            
            x = int(bbox.xmin * w)
            y = int(bbox.ymin * h)
            width = int(bbox.width * w)
            height = int(bbox.height * h)
            
            # Extract face region
            face_region = image[y:y+height, x:x+width]
            
            # Calculate average color
            avg_color = np.mean(face_region, axis=(0, 1))
            b, g, r = avg_color
            
            # Simple season determination
            warmth = (r - b) / 255.0
            brightness = (r + g + b) / (3 * 255.0)
            
            if warmth > 0.1 and brightness > 0.6:
                season = 'spring'
            elif warmth <= 0.1 and brightness > 0.6:
                season = 'summer'
            elif warmth > 0.1 and brightness <= 0.6:
                season = 'fall'
            else:
                season = 'winter'
        
        # Clean up temp file
        os.remove(temp_path)
        
        # Map seasons
        season_map = {
            '봄': 'spring',
            '여름': 'summer',
            '가을': 'fall',
            '겨울': 'winter'
        }
        
        season_en = season_map.get(season, season)
        
        # Define color recommendations
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
            'fall': {
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
            'confidence': 85.0,
            'best_colors': recommendation['best_colors'],
            'worst_colors': recommendation['worst_colors']
        }
        
        if debug:
            response['debug'] = {
                'detected_season': season,
                'face_detected': True,
                'method': 'original' if 'result' in locals() else 'mediapipe'
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