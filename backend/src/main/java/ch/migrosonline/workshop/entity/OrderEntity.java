package ch.migrosonline.workshop.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "customer_order")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "order_number", nullable = false, unique = true)
  private String orderNumber;

  @Column(name = "session_id", nullable = false)
  private String sessionId;

  @Builder.Default
  @Column(nullable = false)
  private String status = "CONFIRMED";

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(nullable = false)
  private String email;

  @Column(nullable = false)
  private String phone;

  @Column(nullable = false)
  private String street;

  private String apartment;

  @Column(nullable = false)
  private String city;

  @Column(name = "postal_code", nullable = false)
  private String postalCode;

  @Column(name = "delivery_instructions")
  private String deliveryInstructions;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "delivery_slot_id", nullable = false)
  private DeliverySlotEntity deliverySlot;

  @Column(name = "coupon_code")
  private String couponCode;

  @Column(nullable = false)
  private BigDecimal subtotal;

  @Column(name = "delivery_fee", nullable = false)
  private BigDecimal deliveryFee;

  @Builder.Default
  @Column(nullable = false)
  private BigDecimal discount = BigDecimal.ZERO;

  @Column(nullable = false)
  private BigDecimal total;

  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  @Setter
  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<OrderItemEntity> items = new ArrayList<>();

  @PrePersist
  void prePersist() {
    if (createdAt == null) {
      createdAt = OffsetDateTime.now();
    }
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    OrderEntity that = (OrderEntity) o;
    return orderNumber != null && orderNumber.equals(that.orderNumber);
  }

  @Override
  public int hashCode() {
    return orderNumber != null ? orderNumber.hashCode() : 0;
  }
}
