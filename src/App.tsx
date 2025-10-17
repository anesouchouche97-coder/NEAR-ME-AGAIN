import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GoogleGenAI, Modality } from "@google/genai";
import { useAuth } from './AuthContext';
import { AuthModal } from './AuthModal';
import { MemoryGallery } from './MemoryGallery';
import { saveMemory } from './memoryService';

const DEFAULT_USER_IMAGE_MIME_TYPE = 'image/jpeg';
const DEFAULT_USER_IMAGE_DATA = '/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIbGNtcwIQAABtbnRyUkdCIFhZWiAH4gADABQACQAOAB1hY3NwTVNGVAAAAABzYXdzY3RybAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWhhbmSdkQA9QICwPUB0LIGepS0o444sQ+9f+wAIBACH/-sAPwB6/8OAnP/7wDv8P2j/9oAjwB4/7YA+P/uAIv/7gCr/+4As//tANP/7gDb/+0A5P/uAPn/7wD//+8A/v//APz//wD5//8A+f//APr//wD8//8A/P//AP3//wD+//8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A//8A/gACAPMAAwD4AA8A/gATAP8AFgD/ABgA/wAbAP8AHgD/ACEA/wAjAP8AJgD/ACgA/wAqAP8ALQD/AC8A/wAyAP8ANQD/ADgA/wA7AP8APQD/AEAA/wBDAP8ARgD/AEkA/wBMAP8ATwD/AFIA/wBVAP8AWAD/AFsA/wBeAP8AYgD/AGUA/wBpAP8AbAD/AG8A/wByAP8AdgD/AHkA/wChAP8AiAD/AIkA/wCOAP8AkQD/AJQA/wCaAP8AnQD/AKAA/wCiAP8AowD/AKYA/wCoAP8AqwD/AK4A/wCtAP8AsQD/ALQA/wCyAP8AtQD/ALgA/wDAAP8AwwD/AMYA/wDJAP8AzAD/AM8A/wDQAP8A0gD/ANUA/wDXAP8A3AD/AN8A/wDiAP8A5QD/AOcA/wDoAP8A6gD/AOwA/wDtAP8A8AD/APMA/wD0AP8A9wD/APkA/wD8AP8BAAIBAgIFAQYCBwEIAQkBCgELAQwBDQEOAQ8BEAERARQBFQEWARYBFwEYARkBGgEbARwBHQEdAR8BJAEkASUBJwEnASgBKQEoASsBKwEtAS4BLwEwATEBMgEzATQBNQE3ATgBOQE6ATsBPgE/AUEBQQFDAUMBRQFHAUgBSQFKAUsBTAFNAVABUwFXAVgBWQFaAVsBXAFdAV4BYAFiAWQBZgFqAWsBbAFuAW8BcAFxAXMBdAF2AXcBeAF6AXsBfAF/AYMBhQGKAYoBjAGNAY8BkAGSAZQBlgGaAZwBnQGgAaIBpQGoAasBrAGtAbABswG5AbwBvQG/AcEBwwHHAsgCygLPAtAC0wLYAt8C4wLoAu8C9gMAAxEDFwMjAyYDMANNBE8EVwVQBVwFWAVbBVwFWwVaBV0GXAZlBm4GcgZ2BnoGfgaCBoYGiwaQBpgGoAaqBrAGsga4BsgG2AboBvQHDAcUBxwHJAcsBzAHPAdEB0wHWAdsB4AHjAeUB5wHoAegB6gHsAe4B8AHxAfMC9QL3AvkDAAMCAwMDBAMGAwYDBwMHAwgDCQMJBAkGCQYJBwkIDQgLCAwLDAwMDQwODA4MDw4NEA0QDRANEg0UDRUNDA0QDRUNEg0VDRYNFA0WDRcNGQ0bDRwNHQ0gDSUNIw0lDSYNJg0mDSgNKA0pDSsNLA0sDS0NLQ0uDS4NLw0wDTEPNA85DzsPPg9BD0QPRw9KD0wPTQ9RD1UPWw9hD2MPag9xD2kPaw9sD3QPdg95D3wPfw+CD4MPiQ+MD40Pkw+WD5gPmQ+dD58Ppw+qD6wPsQ+1D7cPuQ+7D78PwA/ED8cPyA/LD8wPzg/QD9EP1A/XD9gP2w/eD+AP4Q/jD+UP5w/qD+0P8A//AAD/AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//pdGNoASUVORKCYII=';
const DEFAULT_USER_IMAGE_URL = `data:${DEFAULT_USER_IMAGE_MIME_TYPE};base64,${DEFAULT_USER_IMAGE_DATA}`;
const DEFAULT_THEIR_IMAGE_MIME_TYPE = 'image/jpeg';
const DEFAULT_THEIR_IMAGE_DATA = '/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIbGNtcwIQAABtbnRyUkdCIFhZWiAH4gADABQACQAOAB1hY3NwTVNGVAAAAABzYXdzY3RybAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWhhbmSdkQA9QICwPUB0LIGepS0o444sQ+9f+wAIBACH/-sAPwB6/8OAnP/7wDv8P2j/9oAjwB4/7wA+P/uAIv/7gCr/+4As//tANP/7gDb/+0A5P/uAPn/7wD//+8A/v//APz//wD5//8A+f//APr//wD8//8A/P//AP3//wD+//8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A//8A/gACAPMAAwD4AA8A/gATAP8AFgD/ABgA/wAbAP8AHgD/ACEA/wAjAP8AJgD/ACgA/wAqAP8ALQD/AC8A/wAyAP8ANQD/ADgA/wA7AP8APQD/AEAA/wBDAP8ARgD/AEkA/wBMAP8ATwD/AFIA/wBVAP8AWAD/AFsA/wBeAP8AYgD/AGUA/wBpAP8AbAD/AG8A/wByAP8AdgD/AHkA/wChAP8AiAD/AIkA/wCOAP8AkQD/AJQA/wCaAP8AnQD/AKAA/wCiAP8AowD/AKYA/wCoAP8AqwD/AK4A/wCtAP8AsQD/ALQA/wCyAP8AtQD/ALgA/wDAAP8AwwD/AMYA/wDJAP8AzAD/AM8A/wDQAP8A0gD/ANUA/wDXAP8A3AD/AN8A/wDiAP8A5QD/AOcA/wDoAP8A6gD/AOwA/wDtAP8A8AD/APMA/wD0AP8A9wD/APkA/wD8AP8BAAIBAgIFAQYCBwEIAQkBCgELAQwBDQEOAQ8BEAERARQBFQEWARYBFwEYARkBGgEbARwBHQEdAR8BJAEkASUBJwEnASgBKQEoASsBKwEtAS4BLwEwATEBMgEzATQBNQE3ATgBOQE6ATsBPgE/AUEBQQFDAUMBRQFHAUgBSQFKAUsBTAFNAVABUwFXAVgBWQFaAVsBXAFdAV4BYAFiAWQBZgFqAWsBbAFuAW8BcAFxAXMBdAF2AXcBeAF6AXsBfAF/AYMBhQGKAYoBjAGNAY8BkAGSAZQBlgGaAZwBnQGgAaIBpQGoAasBrAGtAbABswG5AbwBvQG/AcEBwwHHAsgCygLPAtAC0wLYAt8C4wLoAu8C9gMAAxEDFwMjAyYDMANNBE8EVwVQBVwFWAVbBVwFWwVaBV0GXAZlBm4GcgZ2BnoGfgaCBoYGiwaQBpgGoAaqBrAGsga4BsgG2AboBvQHDAcUBxwHJAcsBzAHPAdEB0wHWAdsB4AHjAeUB5wHoAegB6gHsAe4B8AHxAfMC9QL3AvkDAAMCAwMDBAMGAwYDBwMHAwgDCQMJBAkGCQYJBwkIDQgLCAwLDAwMDQwODA4MDw4NEA0QDRANEg0UDRUNDA0QDRUNEg0VDRYNFA0WDRcNGQ0bDRwNHQ0gDSUNIw0lDSYNJg0mDSgNKA0pDSsNLA0sDS0NLQ0uDS4NLw0wDTEPNA85DzsPPg9BD0QPRw9KD0wPTQ9RD1UPWw9hD2MPag9xD2kPaw9sD3QPdg95D3wPfw+CD4MPiQ+MD40Pkw+WD5gPmQ+dD58Ppw+qD6wPsQ+1D7cPuQ+7D78PwA/ED8cPyA/LD8wPzg/QD9EP1A/XD9gP2w/eD+AP4Q/jD+UP5w/qD+0P8A//AAD/AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//AP//pdGNoASUVhJQAAAABJRU5ErkJggg==';
const DEFAULT_THEIR_IMAGE_URL = `data:${DEFAULT_THEIR_IMAGE_MIME_TYPE};base64,${DEFAULT_THEIR_IMAGE_DATA}`;

const promptSuggestions = {
    action: ['hugging warmly', 'holding hands', 'laughing together', 'sharing a look', 'walking side-by-side'],
    emotion: ['smiling softly', 'with joyful expressions', 'looking peaceful', 'with happy tears', 'full of love'],
    setting: ['in a sunlit garden', 'on a beach at sunset', 'under a starry night sky', 'in a cozy kitchen', 'on a park bench'],
};

const videoLoadingMessages = [
    "Animating your cherished moment. This can take a few minutes...",
    "Assembling the pixels of your past...",
    "Breathing life into your memory...",
    "This is a complex process, thank you for your patience.",
    "Just a little longer, the magic is happening...",
    "Finalizing the gentle movements of your living photograph..."
];

interface ImageState {
    url: string;
    data: string;
    mimeType: string;
}

interface ResultState {
    type: 'image' | 'video';
    url: string;
    originalUrl?: string;
}

interface EditState {
    filter: 'none' | 'sepia' | 'grayscale' | 'vintage';
    brightness: number;
    warmth: number;
    textOverlay: string;
}

interface FaceSelectionState {
    image: ImageState;
    faces: any[];
    setter: React.Dispatch<React.SetStateAction<ImageState | null>>;
    label: string;
}

const cropImageToFace = (
    image: HTMLImageElement,
    box: DOMRectReadOnly,
    mimeType: string,
    paddingFactor = 0.5
): Promise<ImageState> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const padX = box.width * paddingFactor;
        const padY = box.height * paddingFactor;
        const cropX = Math.max(0, box.x - padX);
        const cropY = Math.max(0, box.y - padY);
        const cropWidth = box.width + padX * 2;
        const cropHeight = box.height + padY * 2;
        const finalWidth = Math.min(cropWidth, image.width - cropX);
        const finalHeight = Math.min(cropHeight, image.height - cropY);

        canvas.width = finalWidth;
        canvas.height = finalHeight;
        ctx.drawImage(image, cropX, cropY, finalWidth, finalHeight, 0, 0, finalWidth, finalHeight);

        const url = canvas.toDataURL(mimeType);
        const data = url.split(',')[1];
        resolve({ url, data, mimeType });
    });
};

const FaceSelectionModal = ({ selectionState, onSelect, onCancel }: { selectionState: FaceSelectionState | null, onSelect: (box: DOMRectReadOnly) => void, onCancel: () => void }) => {
    if (!selectionState) return null;

    const { image, faces, label } = selectionState;
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (imgRef.current) {
            const handleLoad = () => {
                if(imgRef.current) {
                    setImgDimensions({
                        width: imgRef.current.offsetWidth,
                        height: imgRef.current.offsetHeight
                    });
                }
            };
            imgRef.current.addEventListener('load', handleLoad);
            if (imgRef.current.complete) {
                handleLoad();
            }
            return () => imgRef.current?.removeEventListener('load', handleLoad);
        }
    }, [image.url]);

    const getBoxStyle = (box: DOMRectReadOnly) => {
        if (!imgRef.current || !imgDimensions.width) return { display: 'none' };

        const nativeWidth = imgRef.current.naturalWidth;
        const nativeHeight = imgRef.current.naturalHeight;
        const scaleX = imgDimensions.width / nativeWidth;
        const scaleY = imgDimensions.height / nativeHeight;

        return {
            left: `${box.x * scaleX}px`,
            top: `${box.y * scaleY}px`,
            width: `${box.width * scaleX}px`,
            height: `${box.height * scaleY}px`,
        };
    };

    return createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content face-selection-modal" onClick={e => e.stopPropagation()}>
                <h2>Multiple Faces Detected</h2>
                <p>For the "<strong>{label}</strong>" image, please click to select the correct person.</p>
                <div className="face-selection-container">
                    <img ref={imgRef} src={image.url} alt="Select a face" />
                    {faces.map((face, index) => (
                        <div
                            key={index}
                            className="face-box"
                            style={getBoxStyle(face.boundingBox)}
                            onClick={() => onSelect(face.boundingBox)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Select face ${index + 1}`}
                        />
                    ))}
                </div>
                <button onClick={onCancel} className="modal-close-btn" style={{float: 'none', display: 'block', margin: '1rem auto 0'}}>Cancel Upload</button>
            </div>
        </div>,
        document.getElementById('modal-root')!
    );
};

export const MainApplication = () => {
    const { user, signOut } = useAuth();
    const [userImage, setUserImage] = useState<ImageState | null>({
        url: DEFAULT_USER_IMAGE_URL,
        data: DEFAULT_USER_IMAGE_DATA,
        mimeType: DEFAULT_USER_IMAGE_MIME_TYPE,
    });
    const [theirImage, setTheirImage] = useState<ImageState | null>({
        url: DEFAULT_THEIR_IMAGE_URL,
        data: DEFAULT_THEIR_IMAGE_DATA,
        mimeType: DEFAULT_THEIR_IMAGE_MIME_TYPE,
    });
    const [prompt, setPrompt] = useState('Sharing a warm hug in a beautiful, sunlit rose garden.');
    const [outputType, setOutputType] = useState<'image' | 'video'>('image');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResultState | null>(null);
    const [showTipsModal, setShowTipsModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [editState, setEditState] = useState<EditState>({
        filter: 'none',
        brightness: 100,
        warmth: 0,
        textOverlay: '',
    });
    const [faceSelection, setFaceSelection] = useState<FaceSelectionState | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loadingIntervalRef = useRef<number | null>(null);
    const [isApiBlocked, setIsApiBlocked] = useState(false);
    const apiCooldownRef = useRef<number | null>(null);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
            }
            if (apiCooldownRef.current) {
                clearTimeout(apiCooldownRef.current);
            }
        };
    }, []);

    const handleFileSelect = async (file: File, setter: React.Dispatch<React.SetStateAction<ImageState | null>>, label: string) => {
        setError(null);
        if (!('FaceDetector' in window)) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                const data = url.split(',')[1];
                setter({ url, data, mimeType: file.type });
            };
            reader.readAsDataURL(file);
            return;
        }

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;

        img.onload = async () => {
            try {
                const faceDetector = new (window as any).FaceDetector();
                const faces = await faceDetector.detect(img);

                const reader = new FileReader();
                reader.onloadend = async () => {
                    const dataUrl = reader.result as string;
                    const data = dataUrl.split(',')[1];
                    const mimeType = file.type;
                    const originalImageState = { url: dataUrl, data, mimeType };

                    if (faces.length === 0) {
                        setError(`No face was detected in the image for "${label}". Please upload a clearer, front-facing photo.`);
                        setter(originalImageState);
                        return;
                    }

                    if (faces.length > 1) {
                        setFaceSelection({
                            image: originalImageState,
                            faces,
                            setter,
                            label
                        });
                    } else {
                        const croppedImageState = await cropImageToFace(img, faces[0].boundingBox, mimeType);
                        setter(croppedImageState);
                    }
                };
                reader.readAsDataURL(file);

            } catch (e) {
                console.error("Face detection failed:", e);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const url = reader.result as string;
                    const data = url.split(',')[1];
                    setter({ url, data, mimeType: file.type });
                };
                reader.readAsDataURL(file);
            } finally {
                URL.revokeObjectURL(url);
            }
        };
        img.onerror = () => {
             URL.revokeObjectURL(url);
             setError("Could not load the selected image file.");
        }
    };

    const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0], setUserImage, "Your Picture");
        }
    };

    const handleTheirImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0], setTheirImage, "Their Picture");
        }
    };

    const handleSelectFace = async (box: DOMRectReadOnly) => {
        if (!faceSelection) return;

        const { image, setter } = faceSelection;
        const img = new Image();
        img.src = image.url;

        img.onload = async () => {
            const croppedImageState = await cropImageToFace(img, box, image.mimeType);
            setter(croppedImageState);
            setFaceSelection(null);
        };
    };

    const handleCancelFaceSelection = () => {
        setFaceSelection(null);
    };

    const resetEdits = () => {
        setEditState({
            filter: 'none',
            brightness: 100,
            warmth: 0,
            textOverlay: '',
        });
    }

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!userImage || !theirImage || !prompt) {
            setError("Please provide both images and a description.");
            return;
        }

        if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
        }

        setError(null);
        setIsLoading(true);
        setResult(null);
        resetEdits();
        setSaveStatus(null);

        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || process.env.API_KEY });
            const imageCompositionPrompt = `Combine the people from these two separate images into a single, cohesive new image. The first image contains one person and the primary scene. The second image contains another person. Place the person from the second image naturally with the person from the first image. The final scene should be based on this description: "${prompt}". Ensure the final result looks like a single, real photograph containing both individuals.`;

            if (outputType === 'image') {
                setLoadingMessage("Weaving your memory into a picture...");
                const model = 'gemini-2.5-flash-image';
                const parts = [
                    { inlineData: { data: userImage.data, mimeType: userImage.mimeType } },
                    { inlineData: { data: theirImage.data, mimeType: theirImage.mimeType } },
                    { text: imageCompositionPrompt }
                ];

                const response = await ai.models.generateContent({
                    model,
                    contents: { parts },
                    config: {
                        responseModalities: [Modality.IMAGE, Modality.TEXT],
                    },
                });

                const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
                if (imagePart?.inlineData) {
                    const { data, mimeType } = imagePart.inlineData;
                    const url = `data:${mimeType};base64,${data}`;
                    setResult({ type: 'image', url, originalUrl: url });
                } else {
                    throw new Error("The AI could not generate an image. Please try a different prompt.");
                }

            } else {
                setLoadingMessage("Step 1/2: Creating the perfect scene...");
                const imageModel = 'gemini-2.5-flash-image';
                const imageParts = [
                    { inlineData: { data: userImage.data, mimeType: userImage.mimeType } },
                    { inlineData: { data: theirImage.data, mimeType: theirImage.mimeType } },
                    { text: imageCompositionPrompt }
                ];

                const imageResponse = await ai.models.generateContent({
                    model: imageModel,
                    contents: { parts: imageParts },
                    config: {
                        responseModalities: [Modality.IMAGE, Modality.TEXT],
                    },
                });

                const imagePart = imageResponse.candidates?.[0]?.content.parts.find(p => p.inlineData);
                if (!imagePart?.inlineData) {
                    throw new Error("The AI could not create the initial scene for the video. Please try a different prompt.");
                }

                const combinedImageData = imagePart.inlineData.data;
                const combinedImageMimeType = imagePart.inlineData.mimeType;

                setLoadingMessage(videoLoadingMessages[0]);
                let messageIndex = 1;
                loadingIntervalRef.current = window.setInterval(() => {
                    setLoadingMessage(videoLoadingMessages[messageIndex % videoLoadingMessages.length]);
                    messageIndex++;
                }, 6000);

                const videoModel = 'veo-2.0-generate-001';
                const videoAnimationPrompt = `Create a 'living photograph' from this image. The animation must be extremely subtle, gentle, and natural. Focus on micro-movements: a slow, soft blink; a gentle, barely perceptible shift in expression; a strand of hair moving in a soft breeze. The background should have minimal, dreamlike motion, like soft light shifting or leaves rustling gently. Avoid any large, fast, or jerky movements. The overall feeling should be serene, poignant, and as if a frozen memory is gently breathing. Animate based on the original scene description: "${prompt}".`;

                let operation = await ai.models.generateVideos({
                    model: videoModel,
                    prompt: videoAnimationPrompt,
                    image: {
                        imageBytes: combinedImageData,
                        mimeType: combinedImageMimeType,
                    },
                    config: { numberOfVideos: 1 }
                });

                while (!operation.done) {
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    operation = await ai.operations.getVideosOperation({ operation });
                }

                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (downloadLink) {
                    const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;
                    const response = await fetch(`${downloadLink}&key=${apiKey}`);
                    const videoBlob = await response.blob();
                    const videoUrl = URL.createObjectURL(videoBlob);
                    setResult({ type: 'video', url: videoUrl });
                } else {
                    throw new Error("The AI could not generate a video from the scene. Please try again.");
                }
            }

        } catch (err) {
            console.error("Error during generation:", err);
            let userFriendlyMessage = "An unexpected error occurred. Please adjust your prompt or try again later.";
            let isQuotaError = false;

            let fullErrorString = '';
            if (err instanceof Error) {
                fullErrorString = err.message;
            } else {
                try {
                    fullErrorString = JSON.stringify(err);
                } catch {
                    fullErrorString = String(err);
                }
            }

            if (fullErrorString.includes("quota") || fullErrorString.includes("RESOURCE_EXHAUSTED")) {
                userFriendlyMessage = "The service is currently at capacity. To prevent further errors, please wait about a minute before trying again.";
                isQuotaError = true;
            } else if (fullErrorString.includes("API key not valid")) {
                userFriendlyMessage = "There seems to be a configuration issue with the service. Please contact support if the problem persists.";
            } else if (fullErrorString.includes("500") || fullErrorString.includes("Rpc failed") || fullErrorString.includes("xhr error")) {
                userFriendlyMessage = "A server-side error occurred while processing your request. This is likely a temporary issue. Please try again in a few moments.";
            } else if (fullErrorString.includes("SAFETY")) {
                 userFriendlyMessage = "The request was blocked due to safety policies. Please modify your prompt and try again.";
            }

            setError(userFriendlyMessage);

            if (isQuotaError) {
                setIsApiBlocked(true);
                if (apiCooldownRef.current) {
                    clearTimeout(apiCooldownRef.current);
                }
                apiCooldownRef.current = window.setTimeout(() => {
                    setIsApiBlocked(false);
                    setError(null);
                }, 60000);
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
                loadingIntervalRef.current = null;
            }
        }
    }, [userImage, theirImage, prompt, outputType]);

    useEffect(() => {
        if (result?.type === 'image' && result.originalUrl && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = result.originalUrl;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                let filterString = '';
                if (editState.filter === 'sepia' || editState.warmth > 0) {
                   filterString += `sepia(${editState.warmth / 100}) `;
                }
                if (editState.filter === 'grayscale') {
                    filterString += 'grayscale(100%) ';
                }
                 if (editState.filter === 'vintage') {
                    filterString += 'sepia(0.5) contrast(0.9) brightness(1.1) saturate(0.8) ';
                }
                filterString += `brightness(${editState.brightness}%)`;

                ctx.filter = filterString;
                ctx.drawImage(img, 0, 0);

                if (editState.textOverlay) {
                    ctx.filter = 'none';
                    const fontSize = Math.max(24, Math.min(img.width / 20, img.height / 15));
                    ctx.font = `bold ${fontSize}px 'Montserrat', sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                    ctx.shadowBlur = 5;
                    ctx.fillText(editState.textOverlay, canvas.width / 2, canvas.height - (fontSize * 0.8));
                }
            };
        }
    }, [result, editState]);

    const handleSaveMemory = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!result) return;

        setSaveStatus('Saving...');

        const { success, error } = await saveMemory(
            user.id,
            editState.textOverlay || 'Untitled Memory',
            prompt,
            result.type,
            result.url,
            editState
        );

        if (success) {
            setSaveStatus('Saved!');
            setTimeout(() => setSaveStatus(null), 3000);
        } else {
            setSaveStatus(`Error: ${error}`);
            setTimeout(() => setSaveStatus(null), 5000);
        }
    };

    const handleDownload = () => {
        if (result?.type === 'video') {
            const a = document.createElement('a');
            a.href = result.url;
            a.download = 'echo-of-connection-video.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else if (canvasRef.current) {
            const canvas = canvasRef.current;
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'echo-of-connection-image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const ImageUploader = ({ id, label, image, onChange }: { id: string, label: string, image: ImageState | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
        <label htmlFor={id} className="uploader">
            <input id={id} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
            {image && <img src={image.url} alt={`${label} preview`} className="preview" />}
            <div className="uploader-content" style={{ opacity: image ? 0 : 1 }}>
                <span>+</span>
                <span>{label}</span>
            </div>
        </label>
    );

    const PromptSuggestions = () => (
        <div className="prompt-suggestions">
             <div className="suggestions-container">
                {Object.entries(promptSuggestions).map(([category, suggestions]) => (
                    <React.Fragment key={category}>
                        {suggestions.map(suggestion => (
                            <button key={suggestion} type="button" className="suggestion-btn" onClick={() => setPrompt(p => `${p.trim()} ${suggestion}`.trim())}>
                                {suggestion}
                            </button>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    const TipsModal = ({ onClose }: { onClose: () => void }) => createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Tips for Creating the Best Memory</h2>
                <h3>Image Uploads</h3>
                <ul>
                    <li><strong>Clarity is Key:</strong> Use clear, well-lit photos where faces are visible.</li>
                    <li><strong>Front-Facing is Best:</strong> Photos where people are looking generally towards the camera yield the best results.</li>
                    <li><strong>Expression Matters:</strong> Neutral or gently smiling expressions are easiest for the AI to adapt.</li>
                </ul>
                <h3>Prompt Writing</h3>
                <ul>
                    <li><strong>Be Specific:</strong> Combine actions, emotions, and a setting.</li>
                    <li><strong>Good Example:</strong> "Us hugging warmly, both smiling softly, in a beautiful flower garden at sunset."</li>
                    <li><strong>Bad Example:</strong> "Make us happy."</li>
                </ul>
                <button onClick={onClose} className="modal-close-btn">Close</button>
            </div>
        </div>,
        document.getElementById('modal-root')!
    );

    const EditingPanel = () => (
        <div className="editing-panel">
            <h3>Edit & Refine Image</h3>
            <p style={{fontSize: '0.8rem', textAlign: 'center', color: '#666', marginBottom: '1rem'}}>Note: Editing tools are available for generated images only.</p>

            <div className="edit-section">
                <label>Filters</label>
                <div className="filter-buttons">
                    {['none', 'sepia', 'grayscale', 'vintage'].map(f => (
                       <button key={f}
                         className={`filter-btn ${editState.filter === f ? 'active' : ''}`}
                         onClick={() => setEditState(s => ({...s, filter: f as any}))}>
                         {f.charAt(0).toUpperCase() + f.slice(1)}
                       </button>
                    ))}
                </div>
            </div>

            <div className="edit-section">
                <label htmlFor="brightness">Brightness: {editState.brightness}%</label>
                <input type="range" id="brightness" min="50" max="150" value={editState.brightness} onChange={e => setEditState(s => ({...s, brightness: parseInt(e.target.value)}))} />
            </div>

            <div className="edit-section">
                <label htmlFor="warmth">Warmth: {editState.warmth}</label>
                <input type="range" id="warmth" min="0" max="100" value={editState.warmth} onChange={e => setEditState(s => ({...s, warmth: parseInt(e.target.value)}))} />
            </div>

            <div className="edit-section">
                <label htmlFor="textOverlay">Text Overlay</label>
                <input type="text" id="textOverlay" placeholder="e.g., Forever in my heart" value={editState.textOverlay} onChange={e => setEditState(s => ({...s, textOverlay: e.target.value}))} />
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Memory description"
              rows={3}
            />
             <button onClick={() => handleSubmit()} className="submit-btn" disabled={isLoading || isApiBlocked}>
                {isApiBlocked ? 'On Cooldown...' : isLoading ? 'Weaving...' : 'Regenerate'}
            </button>
        </div>
    );

    return (
        <div className="app-content">
            {showTipsModal && <TipsModal onClose={() => setShowTipsModal(false)} />}
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            {showGallery && <MemoryGallery onClose={() => setShowGallery(false)} />}
            {faceSelection && (
                <FaceSelectionModal
                    selectionState={faceSelection}
                    onSelect={handleSelectFace}
                    onCancel={handleCancelFaceSelection}
                />
            )}
            <header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Echoes of Connection</h1>
                        <p>Create, refine, and cherish poignant visual memories with a loved one.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {user ? (
                            <>
                                <button onClick={() => setShowGallery(true)} className="tips-btn">
                                    My Memories
                                </button>
                                <button onClick={signOut} className="tips-btn">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setShowAuthModal(true)} className="tips-btn">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>
            <main className="main-content">
                <div className="form-column">
                    <div className="image-uploaders">
                        <ImageUploader id="user-image" label="Your Picture" image={userImage} onChange={handleUserImageChange} />
                        <ImageUploader id="their-image" label="Their Picture" image={theirImage} onChange={handleTheirImageChange} />
                    </div>
                     {error && <p className="error" style={{textAlign: 'center'}}>{error}</p>}
                    <div className="prompt-section">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <label htmlFor="prompt-area" style={{fontWeight: 500}}>Describe the Memory</label>
                            <button className="tips-btn" onClick={() => setShowTipsModal(true)}>Tips</button>
                        </div>
                        <textarea
                            id="prompt-area"
                            placeholder="e.g., 'hugging on a sunny beach at sunset'."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            aria-label="Memory description"
                        />
                         <PromptSuggestions />
                    </div>
                    <div className="controls">
                        <div className="output-toggle">
                            <label><input type="radio" name="outputType" value="image" checked={outputType === 'image'} onChange={() => setOutputType('image')} /> Image</label>
                            <label><input type="radio" name="outputType" value="video" checked={outputType === 'video'} onChange={() => setOutputType('video')} /> Short Video</label>
                        </div>
                        <button onClick={handleSubmit} className="submit-btn" disabled={isLoading || !userImage || !theirImage || !prompt || isApiBlocked}>
                            {isApiBlocked ? 'On Cooldown...' : (isLoading ? 'Weaving...' : 'Weave Memory')}
                        </button>
                    </div>
                </div>
                <div className="results-column">
                    {isLoading && (
                        <div className="loader-container">
                            <div className="loader" role="status" aria-label="Loading"></div>
                            <p>{loadingMessage}</p>
                            {outputType === 'video' && <p>Video generation can take several minutes.</p>}
                        </div>
                    )}

                    {result && (
                        <div className="output-container">
                             <div className="output-content">
                                {result.type === 'image' ? (
                                    <canvas ref={canvasRef} />
                                ) : (
                                    <video src={result.url} controls autoPlay loop playsInline />
                                )}
                            </div>

                            {result.type === 'image' && <EditingPanel />}

                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                <button onClick={handleSaveMemory} className="download-btn" style={{ flex: 1 }}>
                                    {saveStatus || (user ? 'Save to Gallery' : 'Sign In to Save')}
                                </button>
                                <button onClick={handleDownload} className="download-btn" style={{ flex: 1 }}>
                                    Download {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                                </button>
                            </div>
                        </div>
                    )}
                    {!isLoading && !result && !error && <p>Your generated memory will appear here.</p>}
                </div>
            </main>
        </div>
    );
};
