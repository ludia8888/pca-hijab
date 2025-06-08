from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import os
from PIL import Image
import numpy as np
import cv2
import mediapipe as mp

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
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(contents))
        
        # Convert to OpenCV format
        image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Detect faces using MediaPipe
        results = face_detection.process(rgb_image)
        
        if not results.detections:
            raise HTTPException(
                status_code=400,
                detail="Face not detected in the image"
            )
        
        # Get face region
        h, w = image.shape[:2]
        detection = results.detections[0]
        bbox = detection.location_data.relative_bounding_box
        
        x = max(0, int(bbox.xmin * w))
        y = max(0, int(bbox.ymin * h))
        width = min(int(bbox.width * w), w - x)
        height = min(int(bbox.height * h), h - y)
        
        # Extract face region
        face_region = image[y:y+height, x:x+width]
        
        # Analyze skin tone from face region
        # Convert to HSV for better color analysis
        hsv_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
        
        # Calculate average values
        avg_h = np.mean(hsv_face[:, :, 0])  # Hue
        avg_s = np.mean(hsv_face[:, :, 1])  # Saturation
        avg_v = np.mean(hsv_face[:, :, 2])  # Value (brightness)
        
        # Also get RGB values
        avg_b, avg_g, avg_r = np.mean(face_region, axis=(0, 1))
        
        # Determine season based on color analysis
        # This is a simplified version - in production, use more sophisticated analysis
        warmth = (avg_r - avg_b) / 255.0
        brightness = avg_v / 255.0
        saturation = avg_s / 255.0
        
        # Season determination logic
        if warmth > 0.15 and brightness > 0.65 and saturation > 0.3:
            season = 'spring'  # Bright and warm
        elif warmth <= 0.05 and brightness > 0.6 and saturation < 0.4:
            season = 'summer'  # Cool and soft
        elif warmth > 0.1 and brightness < 0.65 and saturation > 0.35:
            season = 'autumn'    # Warm and deep
        else:
            season = 'winter'  # Cool and clear
        
        # Define color recommendations
        color_recommendations = {
            'spring': {
                'personal_color': '봄 웜톤',
                'personal_color_en': 'Spring Warm',
                'best_colors': ['#FFB3BA', '#FFCC99', '#FFFFCC', '#CCFFCC'],
                'worst_colors': ['#4A4A4A', '#000080', '#800080', '#2F4F4F'],
                'description': '밝고 화사한 따뜻한 색감이 어울리는 타입'
            },
            'summer': {
                'personal_color': '여름 쿨톤',
                'personal_color_en': 'Summer Cool',
                'best_colors': ['#E6E6FA', '#FFE4E1', '#F0E68C', '#DDA0DD'],
                'worst_colors': ['#FF4500', '#FF6347', '#DC143C', '#8B4513'],
                'description': '부드럽고 차분한 시원한 색감이 어울리는 타입'
            },
            'autumn': {
                'personal_color': '가을 웜톤',
                'personal_color_en': 'Autumn Warm',
                'best_colors': ['#CD853F', '#D2691E', '#B8860B', '#8B4513'],
                'worst_colors': ['#FF69B4', '#FF1493', '#C71585', '#DB7093'],
                'description': '깊고 풍부한 따뜻한 색감이 어울리는 타입'
            },
            'winter': {
                'personal_color': '겨울 쿨톤',
                'personal_color_en': 'Winter Cool',
                'best_colors': ['#4169E1', '#0000CD', '#191970', '#000080'],
                'worst_colors': ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50'],
                'description': '선명하고 대비가 강한 시원한 색감이 어울리는 타입'
            }
        }
        
        recommendation = color_recommendations[season]
        
        # Calculate confidence based on detection confidence and color values
        confidence = min(95.0, 70.0 + (detection.score[0] * 25.0))
        
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
                'face_detected': True,
                'detection_confidence': float(detection.score[0]),
                'color_values': {
                    'warmth': round(warmth, 3),
                    'brightness': round(brightness, 3),
                    'saturation': round(saturation, 3),
                    'hsv': {
                        'h': round(avg_h, 1),
                        's': round(avg_s, 1),
                        'v': round(avg_v, 1)
                    },
                    'rgb': {
                        'r': round(avg_r, 1),
                        'g': round(avg_g, 1),
                        'b': round(avg_b, 1)
                    }
                }
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