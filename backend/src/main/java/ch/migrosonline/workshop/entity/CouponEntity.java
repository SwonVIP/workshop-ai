package ch.migrosonline.workshop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coupon")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String code;

  @Column(nullable = false)
  private String type;

  @Column(nullable = false)
  private BigDecimal value;

  private String description;

  @Column(nullable = false)
  private Boolean active;

  @Column(name = "min_order_amount")
  private BigDecimal minOrderAmount;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CouponEntity coupon = (CouponEntity) o;
    return code != null && code.equals(coupon.code);
  }

  @Override
  public int hashCode() {
    return code != null ? code.hashCode() : 0;
  }
}
