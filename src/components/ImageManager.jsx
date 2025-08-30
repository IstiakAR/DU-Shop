import addImage from '../assets/addImage.svg';

const ImageManager = ({
    image,
    currentImage,
    setCurrentImage,
    imageFiles,
    setImageFiles,
    setImage,
    existingImages,
    setExistingImages,
    imagesToDelete,
    setImagesToDelete,
    draggedIndex,
    setDraggedIndex,
    dragOverIndex,
    setDragOverIndex
}) => {
    
    const handleImagePick = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 10MB');
            return;
        }
        
        const url = URL.createObjectURL(file);
        setImage(prev => [...prev, url]);
        setImageFiles(prev => [...prev, file]);
        setCurrentImage(url);
    };

    const handleImageDelete = (indexToDelete) => {
        const imageToDelete = image[indexToDelete];
        
        // Check if it's an existing image
        const existingImageIndex = existingImages.findIndex(img => 
            imageToDelete.includes(img.filepath)
        );
        
        if (existingImageIndex !== -1) {
            // Mark existing image for deletion
            const imageToMark = existingImages[existingImageIndex];
            setImagesToDelete(prev => [...prev, imageToMark]);
            setExistingImages(prev => prev.filter((_, index) => index !== existingImageIndex));
        } else {
            // Remove new image from files
            const newFileIndex = indexToDelete - existingImages.length;
            if (newFileIndex >= 0) {
                setImageFiles(prev => prev.filter((_, index) => index !== newFileIndex));
            }
        }
        
        // Remove from display
        setImage(prev => {
            const newImages = prev.filter((_, index) => index !== indexToDelete);
            if (currentImage === prev[indexToDelete]) {
                const newCurrentIndex = indexToDelete > 0 ? indexToDelete - 1 : 0;
                setCurrentImage(newImages[newCurrentIndex] || null);
            }
            return newImages;
        });
    };

    const moveImage = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        
        setImage(prev => {
            const newImages = [...prev];
            const [movedImage] = newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, movedImage);
            return newImages;
        });
        
        setImageFiles(prev => {
            const newFiles = [...prev];
            const [movedFile] = newFiles.splice(fromIndex, 1);
            newFiles.splice(toIndex, 0, movedFile);
            return newFiles;
        });
    };

    return (
        <div className='picture-container'>
            <div className='picture-bar'>
                <div className='add-image-section'>
                    <label style={{ cursor: 'pointer' }}>
                        <img src={addImage} alt="Add" />
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImagePick} 
                            style={{ display: 'none' }} 
                        />
                    </label>
                </div>
                <div className='thumbnails-container'>
                    {image.map((img, index) => (
                        <div 
                            key={index} 
                            className={`thumbnail-container ${
                                draggedIndex === index ? 'dragging' : ''
                            } ${
                                dragOverIndex === index && draggedIndex !== index ? 'drag-over' : ''
                            }`}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', index.toString());
                                setDraggedIndex(index);
                            }}
                            onDragEnd={() => {
                                setDraggedIndex(null);
                                setDragOverIndex(null);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (draggedIndex !== index) {
                                    setDragOverIndex(index);
                                }
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                if (!isNaN(fromIndex) && fromIndex !== index) {
                                    moveImage(fromIndex, index);
                                }
                                setDraggedIndex(null);
                                setDragOverIndex(null);
                            }}
                        >
                            <img 
                                src={img} 
                                className={`thumbnail ${currentImage === img ? 'active' : ''}`}
                                onClick={() => setCurrentImage(img)} 
                                alt={`Product image ${index + 1}`}
                                draggable={false}
                            />
                            <button 
                                className='delete-thumbnail-btn'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageDelete(index);
                                }}
                                title="Delete image"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className='picture-area'>
                <img src={currentImage} className='main-picture'/>
            </div>
        </div>
    );
};

export default ImageManager;
