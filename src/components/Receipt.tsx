import { useAppStore } from '../stores/useAppStore';
import type { ReceiptData } from '../types';

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

function ReceiptContent({ data }: { data: ReceiptData }) {
  return (
    <div className="receipt" id="receipt-content">
      {/* 제목 */}
      <div className="receipt-title">{data.title}</div>

      {/* 배달주소 */}
      <div className="receipt-section">
        <span className="receipt-label">배달주소:</span>
        <div className="receipt-address">{data.deliveryAddress}</div>
      </div>

      {/* 고객요청 */}
      <div className="receipt-divider-stars">
        *************** 고객요청 ***************
      </div>
      <div className="receipt-request">{data.customerRequest}</div>

      {/* 라이더요청 */}
      <div className="receipt-divider-stars">
        *************** 라이더요청 ***************
      </div>
      <div className="receipt-request">{data.riderRequest}</div>

      {/* 메뉴 헤더 */}
      <div className="receipt-line" />
      <div className="receipt-menu-header">
        <span>메뉴</span>
        <span>수량</span>
        <span>금액</span>
      </div>
      <div className="receipt-line-dashed" />

      {/* 메뉴 아이템 */}
      <div className="receipt-menu-items">
        {data.menuItems.map((item) => (
          <div key={item.id} className="receipt-menu-item">
            {item.isPromo && item.promoLabel ? (
              <div className="receipt-promo-line">
                {item.name && <div className="receipt-promo-name">{item.name}</div>}
                <div className="receipt-promo-detail">
                  <span>{item.promoLabel}</span>
                  <span>{item.quantity}</span>
                  <span>{formatPrice(item.price)}</span>
                </div>
              </div>
            ) : (
              <div className="receipt-normal-item">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">{item.quantity}</span>
                <span className="item-price">{formatPrice(item.price)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 배달비 */}
      <div className="receipt-delivery-fee">
        <span>배달비</span>
        <span>1</span>
        <span>{formatPrice(data.deliveryFee)}</span>
      </div>

      {/* 할인 라벨 */}
      <div className="receipt-discount-label">{data.discountLabel}</div>

      {/* 합계 영역 */}
      <div className="receipt-line" />
      <div className="receipt-totals">
        <div className="receipt-total-row">
          <span>소계금액</span>
          <span>{formatPrice(data.subtotal)}</span>
        </div>
        <div className="receipt-total-row">
          <span>할인금액</span>
          <span>{formatPrice(data.discount)}</span>
        </div>
        <div className="receipt-total-row">
          <span>합계금액</span>
          <span>{formatPrice(data.total)}</span>
        </div>
        <div className="receipt-total-row">
          <span>청구금액</span>
          <span>{formatPrice(data.chargedAmount)}</span>
        </div>
      </div>
    </div>
  );
}

export function Receipt() {
  const receipt = useAppStore((state) => state.receipt);

  return (
    <div className="receipt-panel">
      <div className="panel-header">
        <h2>영수증</h2>
      </div>
      <div className="receipt-wrapper">
        <ReceiptContent data={receipt} />
      </div>
    </div>
  );
}
