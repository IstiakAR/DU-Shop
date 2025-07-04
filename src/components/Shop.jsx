import '../styles/Shop.css';
import ItemCard from './ItemCard';

function Shop(){
    return(
        <div className='shop-container'>
            <div className='item-card-container'>
                <ItemCard prop={{name: "Hello", price: 50, image: "/DU-Shop.png"}} />
                <ItemCard prop={{name: "Hello", price: 50, image: "/DU-Shop.png"}} />
                <ItemCard prop={{name: "Hello", price: 50, image: "/DU-Shop.png"}} />
                <ItemCard prop={{name: "Hello", price: 50, image: "/DU-Shop.png"}} />
                <ItemCard prop={{name: "Hello", price: 50, image: "/DU-Shop.png"}} />
                <ItemCard prop={{name: "Hello", price: 50, image: "/DU-Shop.png"}} />
            </div>
        </div>
    )
}

export default Shop;
