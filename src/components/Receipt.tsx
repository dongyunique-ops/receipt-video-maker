import { useAppStore } from '../stores/useAppStore';

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function Receipt() {
  const receipt = useAppStore((state) => state.receipt);

  return (
    <div className="thermal-paper">
      <div className="thermal-content">
        {/* 제목 */}
        <p className="tp-title">{receipt.title}</p>

        {/* 배달주소 */}
        <p className="tp-text">배달주소:</p>
        <p className="tp-address">{receipt.deliveryAddress}</p>

        {/* 고객요청 */}
        <p className="tp-stars">************** 고객요청 **************</p>
        <p className="tp-text">{receipt.customerRequest}</p>

        {/* 라이더요청 */}
        <p className="tp-stars">************** 라이더요청 **************</p>
        <p className="tp-text">{receipt.riderRequest}</p>

        {/* 메뉴 구분 */}
        <div className="tp-line" />
        <div className="tp-row tp-header">
          <span className="tp-name">메뉴</span>
          <span className="tp-qty">수량</span>
          <span className="tp-price">금액</span>
        </div>
        <div className="tp-line-dash" />

        {/* 메뉴 아이템 */}
        {receipt.menuItems.map((item) => (
          <div key={item.id}>
            {item.isPromo && item.name ? (
              <p className="tp-text tp-bold">{item.name}</p>
            ) : null}
            {item.isPromo && item.promoLabel ? (
              <div className="tp-row">
                <span className="tp-name">{item.promoLabel}</span>
                <span className="tp-qty">{item.quantity}</span>
                <span className="tp-price">{formatPrice(item.price)}</span>
              </div>
            ) : !item.isPromo ? (
              <div className="tp-row">
                <span className="tp-name">{item.name}</span>
                <span className="tp-qty">{item.quantity}</span>
                <span className="tp-price">{formatPrice(item.price)}</span>
              </div>
            ) : null}
          </div>
        ))}

        {/* 배달비 */}
        <div className="tp-row">
          <span className="tp-name">배달비</span>
          <span className="tp-qty">1</span>
          <span className="tp-price">{formatPrice(receipt.deliveryFee)}</span>
        </div>

        {/* 할인 라벨 */}
        <p className="tp-text tp-bold">{receipt.discountLabel}</p>

        {/* 합계 */}
        <div className="tp-line-dash" />
        <div className="tp-totals">
          <div className="tp-total-row">
            <span>소계금액</span><span>{formatPrice(receipt.subtotal)}</span>
          </div>
          <div className="tp-total-row">
            <span>할인금액</span><span>{formatPrice(receipt.discount)}</span>
          </div>
          <div className="tp-total-row">
            <span>합계금액</span><span>{formatPrice(receipt.total)}</span>
          </div>
          <div className="tp-total-row">
            <span>청구금액</span><span>{formatPrice(receipt.chargedAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
