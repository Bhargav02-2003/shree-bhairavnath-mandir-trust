"""
IndicTrans2 Translation FastAPI Microservice
Provides English -> Marathi (eng_Latn -> mar_Deva) neural machine translation endpoint for the Mandir Trust API.
"""

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="IndicTrans2 Marathi Microservice", version="1.0.0")

class TranslationRequest(BaseModel):
    input: List[str]
    src_lang: Optional[str] = "eng_Latn"
    tgt_lang: Optional[str] = "mar_Deva"

class TranslationResponse(BaseModel):
    translations: List[str]
    engine: str

# Global model state
indictrans_model = None
indictrans_tokenizer = None
indictrans_ip = None

def init_indictrans2():
    global indictrans_model, indictrans_tokenizer, indictrans_ip
    try:
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        from IndicTransTokenizer.tokenizer import IndicProcessor

        print("Loading IndicTrans2 Model (ai4bharat/indictrans2-en-indic-1B)...")
        model_name = "ai4bharat/indictrans2-en-indic-1B"
        indictrans_tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        indictrans_model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True)
        indictrans_ip = IndicProcessor(inference=True)
        print("IndicTrans2 loaded successfully!")
    except Exception as e:
        print(f"IndicTrans2 local PyTorch model not available: {e}")
        print("Falling back to AI translation engine / rule dictionary.")

@app.on_event("startup")
async def startup_event():
    init_indictrans2()

@app.get("/")
def read_root():
    return {
        "service": "IndicTrans2 Marathi Service",
        "status": "online",
        "model_loaded": indictrans_model is not None
    }

@app.post("/translate", response_model=TranslationResponse)
def translate(req: TranslationRequest):
    if not req.input:
        return TranslationResponse(translations=[], engine="none")

    # If PyTorch IndicTrans2 model is loaded locally
    if indictrans_model and indictrans_tokenizer and indictrans_ip:
        try:
            import torch
            batch = indictrans_ip.preprocess_batch(req.input, src_lang=req.src_lang, tgt_lang=req.tgt_lang)
            inputs = indictrans_tokenizer(batch, truncate=True, padding="longest", return_tensors="pt")
            
            with torch.no_grad():
                generated_tokens = indictrans_model.generate(
                    **inputs,
                    use_cache=True,
                    min_length=0,
                    max_length=256,
                    num_beams=5,
                    num_return_sequences=1,
                )
            
            with indictrans_tokenizer.as_target_tokenizer():
                generated_tokens = indictrans_tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
                
            translations = indictrans_ip.postprocess_batch(generated_tokens, lang=req.tgt_lang)
            return TranslationResponse(translations=translations, engine="indictrans2-pytorch")
        except Exception as err:
            print(f"Error during IndicTrans2 inference: {err}")

    # Fallback / Mirror mode if PyTorch model is pending download
    translations = [f"[मराठी] {text}" if text else text for text in req.input]
    return TranslationResponse(translations=translations, engine="fallback-placeholder")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
