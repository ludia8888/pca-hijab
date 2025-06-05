from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import cv2
import numpy as np
import tempfile
import os
import traceback

from personal_color_analysis.detect_face import DetectFace
from personal_color_analysis.color_extract import DominantColors
from personal_color_analysis import tone_analysis
from colormath.color_objects import LabColor, sRGBColor, HSVColor
from colormath.color_conversions import convert_color

app = FastAPI(
    title="Personal Color Analysis API",
    description="퍼스널 컬러 진단 AI 서비스 API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ColorInfo(BaseModel):
    rgb: List[int]
    lab: List[float]
    hsv: List[float]

class FacialFeatureColors(BaseModel):
    cheek: ColorInfo
    eyebrow: ColorInfo
    eye: ColorInfo

class AnalysisResult(BaseModel):
    personal_color: str
    personal_color_en: str
    tone: str
    tone_en: str
    details: Dict[str, float]
    facial_colors: FacialFeatureColors
    debug_info: Optional[Dict[str, List[float]]] = None

class ErrorResponse(BaseModel):
    error: str
    detail: str

@app.get("/")
async def root():
    return {
        "message": "Personal Color Analysis API",
        "endpoints": {
            "/analyze": "POST - 이미지를 업로드하여 퍼스널 컬러 분석",
            "/health": "GET - API 상태 확인"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Personal Color Analysis API"}

@app.post("/analyze", response_model=AnalysisResult, responses={
    400: {"model": ErrorResponse},
    500: {"model": ErrorResponse}
})
async def analyze_personal_color(
    file: UploadFile = File(...),
    debug: bool = False
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    try:
        # Read uploaded file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="이미지를 읽을 수 없습니다.")
        
        # Save image temporarily for DetectFace
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            cv2.imwrite(tmp_file.name, image)
            temp_image_path = tmp_file.name
        
        try:
            #######################################
            #           Face detection            #
            #######################################
            df = DetectFace(temp_image_path)
            face = [df.left_cheek, df.right_cheek,
                    df.left_eyebrow, df.right_eyebrow,
                    df.left_eye, df.right_eye]
            
            #######################################
            #         Get Dominant Colors         #
            #######################################
            temp = []
            clusters = 4
            for f in face:
                dc = DominantColors(f, clusters)
                face_part_color, _ = dc.getHistogram()
                if face_part_color:  # Check if colors were found
                    temp.append(np.array(face_part_color[0]))  # Get most dominant color
                else:
                    # If no color found, use a default
                    temp.append(np.array([0, 0, 0]))
            
            # Average left and right features
            cheek = np.mean([temp[0], temp[1]], axis=0)
            eyebrow = np.mean([temp[2], temp[3]], axis=0)
            eye = np.mean([temp[4], temp[5]], axis=0)
            
            #######################################
            #      Color Space Conversion         #
            #######################################
            Lab_b, hsv_s = [], []
            color = [cheek, eyebrow, eye]
            
            # Store color info for response
            color_info_list = []
            
            for i in range(3):
                rgb = sRGBColor(color[i][0], color[i][1], color[i][2], is_upscaled=True)
                lab = convert_color(rgb, LabColor, through_rgb_type=sRGBColor)
                hsv = convert_color(rgb, HSVColor, through_rgb_type=sRGBColor)
                
                lab_b_val = float(format(lab.lab_b, ".2f"))
                hsv_s_val = float(format(hsv.hsv_s, ".2f")) * 100
                
                Lab_b.append(lab_b_val)
                hsv_s.append(hsv_s_val)
                
                # Store color info
                color_info_list.append(ColorInfo(
                    rgb=[int(color[i][0]), int(color[i][1]), int(color[i][2])],
                    lab=[float(format(lab.lab_l, ".2f")), 
                         float(format(lab.lab_a, ".2f")), 
                         lab_b_val],
                    hsv=[float(format(hsv.hsv_h, ".2f")), 
                         hsv_s_val, 
                         float(format(hsv.hsv_v * 100, ".2f"))]
                ))
            
            #######################################
            #      Personal color Analysis        #
            #######################################
            Lab_weight = [30, 20, 5]
            hsv_weight = [10, 1, 1]
            
            # Warm/Cool analysis
            is_warm = tone_analysis.is_warm(Lab_b, Lab_weight)
            
            # Season analysis
            if is_warm:
                is_spring = tone_analysis.is_spr(hsv_s, hsv_weight)
                if is_spring:
                    tone = '봄웜톤(spring)'
                    tone_kr = '봄 웜톤'
                    tone_en = 'spring'
                else:
                    tone = '가을웜톤(fall)'
                    tone_kr = '가을 웜톤'
                    tone_en = 'fall'
            else:
                is_summer = tone_analysis.is_smr(hsv_s, hsv_weight)
                if is_summer:
                    tone = '여름쿨톤(summer)'
                    tone_kr = '여름 쿨톤'
                    tone_en = 'summer'
                else:
                    tone = '겨울쿨톤(winter)'
                    tone_kr = '겨울 쿨톤'
                    tone_en = 'winter'
            
            # Create response
            response = AnalysisResult(
                personal_color=tone_kr,
                personal_color_en=tone_en,
                tone="웜톤" if is_warm else "쿨톤",
                tone_en="warm" if is_warm else "cool",
                details={
                    "is_warm": float(is_warm),
                    "skin_lab_b": Lab_b[0],
                    "eyebrow_lab_b": Lab_b[1],
                    "eye_lab_b": Lab_b[2],
                    "skin_hsv_s": hsv_s[0],
                    "eyebrow_hsv_s": hsv_s[1],
                    "eye_hsv_s": hsv_s[2]
                },
                facial_colors=FacialFeatureColors(
                    cheek=color_info_list[0],
                    eyebrow=color_info_list[1],
                    eye=color_info_list[2]
                )
            )
            
            # Add debug info if requested
            if debug:
                response.debug_info = {
                    "Lab_b": Lab_b,
                    "hsv_s": hsv_s
                }
            
            return response
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_image_path):
                os.unlink(temp_image_path)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"분석 중 오류가 발생했습니다: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)