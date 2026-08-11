import { useAppStore } from '../stores/useAppStore';

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function Receipt() {
  const receipt = useAppStore((state) => state.receipt);

  return (
    <div className="receipt">
      {/* 제목 */}
      <div className="r-title">{receipt.title}</div>

      {/* 배달주소 */}
      <div className="r-addr-label">배달주소:</div>
      <div className="r-addr">{receipt.deliveryAddress}</div>

      {/* 고객요청 */}
      <div className="r-stars">*************** 고객요청 ***************</div>
      <div className="r-body">{receipt.customerRequest}</div>

      {/* 라이더요청 */}
      <div className="r-stars">*************** 라이더요청 ***************</div>
      <div className="r-body">{receipt.riderRequest}</div>

      {/* 메뉴 */}
      <div className="r-hr" />
      <div className="r-row r-menu-header">
        <span className="r-col-name">메뉴</span>
        <span className="r-col-qty">수량</span>
        <span className="r-col-price">금액</span>
      </div>
      <div className="r-hr-dash" />

      {receipt.menuItems.map((item) => (
        <div key={item.id}>
          {item.isPromo && item.name ? (
            <div className="r-body r-bold">{item.name}</div>
          ) : null}
          {item.isPromo && item.promoLabel ? (
            <div className="r-row">
              <span className="r-col-name">{item.promoLabel}</span>
              <span className="r-col-qty">{item.quantity}</span>
              <span className="r-col-price">{formatPrice(item.price)}</span>
            </div>
          ) : !item.isPromo ? (
            <div className="r-row">
              <span className="r-col-name">{item.name}</span>
              <span className="r-col-qty">{item.quantity}</span>
              <span className="r-col-price">{formatPrice(item.price)}</span>
            </div>
          ) : null}
        </div>
      ))}

      <div className="r-row">
        <span className="r-col-name">배달비</span>
        <span className="r-col-qty">1</span>
        <span className="r-col-price">{formatPrice(receipt.deliveryFee)}</span>
      </div>

      <div className="r-body r-bold">{receipt.discountLabel}</div>

      {/* 합계 */}
      <div className="r-hr-dash" />
      <div className="r-total-section">
        <TotalRow label="소계금액" amount={receipt.subtotal} />
        <TotalRow label="할인금액" amount={receipt.discount} />
        <TotalRow label="합계금액" amount={receipt.total} />
        <TotalRow label="청구금액" amount={receipt.chargedAmount} />
      </div>
    </div>
  );
}

function TotalRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="r-total-row">
      <span>{label}</span>
      <span>{formatPrice(amount)}</span>
    </div>
  );
}
