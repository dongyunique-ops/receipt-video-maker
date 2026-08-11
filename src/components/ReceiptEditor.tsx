import { useAppStore } from '../stores/useAppStore';
import type { MenuItem } from '../types';

export function ReceiptEditor() {
  const { receipt, updateReceipt, addMenuItem, updateMenuItem, removeMenuItem } = useAppStore();

  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      name: '새 메뉴',
      quantity: 1,
      price: 0,
    };
    addMenuItem(newItem);
  };

  return (
    <div className="receipt-editor">
      <h3>영수증 편집</h3>

      <div className="editor-section">
        <label>
          제목:
          <input
            type="text"
            value={receipt.title}
            onChange={(e) => updateReceipt({ title: e.target.value })}
          />
        </label>
      </div>

      <div className="editor-section">
        <label>
          배달주소:
          <input
            type="text"
            value={receipt.deliveryAddress}
            onChange={(e) => updateReceipt({ deliveryAddress: e.target.value })}
          />
        </label>
      </div>

      <div className="editor-section">
        <label>
          고객요청:
          <textarea
            value={receipt.customerRequest}
            onChange={(e) => updateReceipt({ customerRequest: e.target.value })}
          />
        </label>
      </div>

      <div className="editor-section">
        <label>
          라이더요청:
          <input
            type="text"
            value={receipt.riderRequest}
            onChange={(e) => updateReceipt({ riderRequest: e.target.value })}
          />
        </label>
      </div>

      <div className="editor-section">
        <h4>메뉴 항목</h4>
        {receipt.menuItems.map((item) => (
          <div key={item.id} className="menu-item-editor">
            <input
              type="text"
              placeholder="메뉴명"
              value={item.name}
              onChange={(e) => updateMenuItem(item.id, { name: e.target.value })}
            />
            <input
              type="number"
              placeholder="수량"
              value={item.quantity}
              onChange={(e) => updateMenuItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
              style={{ width: '60px' }}
            />
            <input
              type="number"
              placeholder="금액"
              value={item.price}
              onChange={(e) => updateMenuItem(item.id, { price: parseInt(e.target.value) || 0 })}
              style={{ width: '100px' }}
            />
            <label className="promo-check">
              <input
                type="checkbox"
                checked={item.isPromo ?? false}
                onChange={(e) => updateMenuItem(item.id, { isPromo: e.target.checked })}
              />
              프로모
            </label>
            {item.isPromo && (
              <input
                type="text"
                placeholder="프로모 라벨"
                value={item.promoLabel ?? ''}
                onChange={(e) => updateMenuItem(item.id, { promoLabel: e.target.value })}
              />
            )}
            <button className="btn-remove-item" onClick={() => removeMenuItem(item.id)}>
              ×
            </button>
          </div>
        ))}
        <button className="btn-add-item" onClick={handleAddItem}>
          + 메뉴 추가
        </button>
      </div>

      <div className="editor-section">
        <label>
          배달비:
          <input
            type="number"
            value={receipt.deliveryFee}
            onChange={(e) => updateReceipt({ deliveryFee: parseInt(e.target.value) || 0 })}
          />
        </label>
      </div>

      <div className="editor-section">
        <label>
          할인 라벨:
          <input
            type="text"
            value={receipt.discountLabel}
            onChange={(e) => updateReceipt({ discountLabel: e.target.value })}
          />
        </label>
      </div>

      <div className="editor-section editor-totals">
        <label>
          소계금액:
          <input
            type="number"
            value={receipt.subtotal}
            onChange={(e) => updateReceipt({ subtotal: parseInt(e.target.value) || 0 })}
          />
        </label>
        <label>
          할인금액:
          <input
            type="number"
            value={receipt.discount}
            onChange={(e) => updateReceipt({ discount: parseInt(e.target.value) || 0 })}
          />
        </label>
        <label>
          합계금액:
          <input
            type="number"
            value={receipt.total}
            onChange={(e) => updateReceipt({ total: parseInt(e.target.value) || 0 })}
          />
        </label>
        <label>
          청구금액:
          <input
            type="number"
            value={receipt.chargedAmount}
            onChange={(e) => updateReceipt({ chargedAmount: parseInt(e.target.value) || 0 })}
          />
        </label>
      </div>
    </div>
  );
}
