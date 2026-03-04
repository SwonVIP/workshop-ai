package ch.migrosonline.workshop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cart_item")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cart_id", nullable = false)
  private Cart cart;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @Setter
  @Column(nullable = false)
  private Integer quantity;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CartItem cartItem = (CartItem) o;
    if (cart == null || cart.getId() == null || product == null || product.getId() == null) {
      return false;
    }
    return cart.getId().equals(cartItem.cart != null ? cartItem.cart.getId() : null)
        && product.getId().equals(cartItem.product != null ? cartItem.product.getId() : null);
  }

  @Override
  public int hashCode() {
    int result = cart != null && cart.getId() != null ? cart.getId().hashCode() : 0;
    result =
        31 * result + (product != null && product.getId() != null ? product.getId().hashCode() : 0);
    return result;
  }
}
