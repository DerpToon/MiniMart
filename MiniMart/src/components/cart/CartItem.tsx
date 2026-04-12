import type { CartItem as CartLineItem } from '../../types/cart'

type CartItemProps = {
  item: CartLineItem
  onRemove: () => void
}

export default function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow mb-4">
      <img
        src={item.image_url || 'https://via.placeholder.com/180x180?text=MiniMart'}
        alt={item.name}
        className="w-20"
      />
      <h2>{item.name}</h2>
      <p>${item.price}</p>
      <button className="text-red-500" onClick={onRemove}>
        Remove
      </button>
    </div>
  )
}
