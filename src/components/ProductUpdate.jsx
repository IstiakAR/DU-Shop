import ReactMarkdown from 'react-markdown';

const ProductUpdate = ({
    currentContent,
    setCurrentContent,
    mode,
    setMode,
    productDesc,
    setProductDesc
}) => {

    const TabButton = ({ content, label, active, onClick }) => (
        <span 
            onClick={() => onClick(content)} 
            className={active ? 'active' : ''}
        >
            {label}
        </span>
    );

    const ModeButton = ({ targetMode, label, active, onClick }) => (
        <button 
            className={`edit-preview${active ? ' active' : ''}`} 
            onClick={() => onClick(targetMode)}
            type="button"
        >
            {label}
        </button>
    );

    return (
        <div className='add-product-details'>
            <div className='details-bar' style={{display: 'flex', justifyContent: 'space-between'}}>
                <div className='details-bar-side'>
                    <TabButton
                        content="details"
                        label="Details"
                        active={currentContent === 'details'}
                        onClick={setCurrentContent}
                    />
                    <TabButton
                        content="specs"
                        label="Specs"
                        active={currentContent === 'specs'}
                        onClick={setCurrentContent}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px'}}>
                    <ModeButton
                        targetMode="edit"
                        label="Edit"
                        active={mode === 'edit'}
                        onClick={setMode}
                    />
                    <ModeButton
                        targetMode="preview"
                        label="Preview"
                        active={mode === 'preview'}
                        onClick={setMode}
                    />
                </div>
            </div>
            
            <div className='details-content'>
                {mode === 'edit' ? (
                    currentContent === 'details' ? (
                        <textarea 
                            name="details" 
                            placeholder="Product Details" 
                            value={productDesc.details}
                            onChange={(e) => setProductDesc(prev => ({ ...prev, details: e.target.value }))} 
                            required
                        />
                    ) : (
                        <textarea 
                            name="specs" 
                            placeholder="Product Specs" 
                            value={productDesc.specs}
                            onChange={(e) => setProductDesc(prev => ({ ...prev, specs: e.target.value }))} 
                            required
                        />
                    )
                ) : (
                    <div className='markdown-preview'>
                        <ReactMarkdown>
                            {currentContent === 'details' ? productDesc.details : productDesc.specs}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductUpdate;
