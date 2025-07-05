import '../styles/ItemDetails.css';
import bigTemp from '../temp/big.jpg';
import mediumTemp from '../temp/medium.png';
import smallTemp from '../temp/small.jpg';

import { useState } from 'react';

function ItemDetails({ prop }) {
    const [currentImage, setCurrentImage] = useState(mediumTemp);
    const [content, setContent] = useState('Details about the item will be displayed here.');

    return(
        <div className='container'>
            <div className='picture-container'>
                <div className='picture-bar'>
                    <img src={bigTemp} alt="Item" onClick={() => setCurrentImage(bigTemp)} />
                    <img src={mediumTemp} alt="Item" onClick={() => setCurrentImage(mediumTemp)} />
                    <img src={smallTemp} alt="Item" onClick={() => setCurrentImage(smallTemp)} />
                </div>
                <div className='picture-area'>
                    <img src={currentImage} alt="Item" 
                    className='main-picture'/>
                </div>
            </div>
            <div className='details-container'>
                <div className='tab-bar'>
                    <span onClick={() => setContent('Details about the item will be displayed here.')}>Details</span>
                    <span onClick={() => setContent('Specifications of the item will be displayed here.')}>Specs</span>
                    <span onClick={() => setContent('Reviews of the item will be displayed here.')}>Reviews</span>
                </div>
                <div className='tab-content'>
                    <span>{content}</span>
                </div>
            </div>
        </div>
    )
}

export default ItemDetails;